<?php

namespace App\Http\Controllers;

use App\Models\Server;
use App\Models\Setting;
use App\Models\Lobby;
use App\Models\LobbyPlayer;
use App\Events\LobbyStateUpdated;
use App\Events\LobbyChatMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use App\Services\RconService;

class LobbyController extends Controller
{
    public function store(Request $request)
    {
        $existingParticipation = LobbyPlayer::with('lobby')->where('user_id', Auth::id())->first();
        if ($existingParticipation && $existingParticipation->lobby) {
            return redirect()->route('lobbies.show', $existingParticipation->lobby->code);
        }

        do {
            $code = strtoupper(Str::random(6));
        } while (Lobby::where('code', $code)->exists());

        // NOWY SYSTEM: Wyciągamy zajęte adresy (IP:PORT)
        $usedServerIps = Lobby::whereNotNull('server_ip')->pluck('server_ip')->toArray();

        $availableServer = Server::where('is_active', true)
            ->get()
            ->filter(function($server) use ($usedServerIps) {
                $serverIpString = $server->ip . ':' . $server->port;
                return !in_array($serverIpString, $usedServerIps);
            })->first();

        if (!$availableServer) {
            return back()->withErrors(['error' => 'Brak wolnych serwerów CS2! Wszystkie sloty są aktualnie zajęte.']);
        }

        $cleanIpPort = $availableServer->ip . ':' . $availableServer->port;

        $lobby = Lobby::create([
            'code' => $code,
            'leader_id' => Auth::id(),
            'format' => 'bo1',
            'team_size' => 5,
            'team_assignment' => 'random',
            'server_ip' => $cleanIpPort,
            'server_password' => strtolower($code),
            'map_pool' => explode(';', Setting::where('key', 'map_pool_standard')->value('value') ?? 'de_mirage;de_dust2;de_inferno;de_nuke;de_ancient;de_anubis;de_vertigo'),
        ]);

        LobbyPlayer::create([
            'lobby_id' => $lobby->id,
            'user_id' => Auth::id(),
            'team' => 'unassigned',
        ]);

        return redirect()->route('lobbies.show', $lobby->code);
    }

    public function join(Request $request)
    {
        $request->validate(['code' => 'required|string|size:6']);
        $lobby = Lobby::where('code', strtoupper($request->code))->first();

        if (!$lobby) return back()->withErrors(['code' => 'Nie znaleziono lobby o podanym kodzie.']);

        if ($lobby->leader_id === Auth::id() || $lobby->players()->where('user_id', Auth::id())->exists()) {
            return back()->withErrors(['code' => 'Jesteś już w tym lobby! Użyj przycisku "WRÓĆ DO LOBBY" z lewej strony.']);
        }

        if (now()->greaterThanOrEqualTo($lobby->created_at->addHours(5))) {
            Storage::delete('chats/lobby_' . $lobby->id . '.json');
            $lobby->delete();
            return back()->withErrors(['code' => 'To lobby wygasło.']);
        }

        if ($lobby->status !== 'waiting') return back()->withErrors(['code' => 'To lobby już wystartowało lub jest zamknięte.']);

        $maxPlayers = ($lobby->team_size * 2) + ($lobby->allow_coaches ? 2 : 0);
        if ($lobby->players()->count() >= $maxPlayers && !$lobby->players()->where('user_id', Auth::id())->exists()) {
            return back()->withErrors(['code' => 'Lobby jest pełne.']);
        }

        LobbyPlayer::firstOrCreate(['lobby_id' => $lobby->id, 'user_id' => Auth::id()], ['team' => 'unassigned']);
        return redirect()->route('lobbies.show', $lobby->code);
    }

    public function show($code)
    {
        $lobby = Lobby::with(['players.user', 'leader'])->where('code', $code)->firstOrFail();

        if (now()->greaterThanOrEqualTo($lobby->created_at->addHours(5))) {
            Storage::delete('chats/lobby_' . $lobby->id . '.json');
            $lobby->delete();
            return redirect()->route('dashboard');
        }

        $chatFile = 'chats/lobby_' . $lobby->id . '.json';
        $chatHistory = Storage::exists($chatFile) ? json_decode(Storage::get($chatFile), true) : [
            ['user' => 'System #IEM_SZTUM', 'text' => 'Utworzono lobby. Udanej rozgrywki!', 'time' => $lobby->created_at->format('H:i'), 'isSystem' => true]
        ];

        return Inertia::render('Lobby', [
            'lobby' => $lobby,
            'expiresAt' => $lobby->created_at->addHours(5)->toIso8601String(),
            'chatHistory' => $chatHistory,
            'vetoDevMode' => env('VETO_DEV_MODE', false) === true || env('VETO_DEV_MODE') === 'true'
        ]);
    }

    public function updateSettings(Request $request, Lobby $lobby)
    {
        if (Auth::id() !== $lobby->leader_id) return abort(403);

        $validated = $request->validate([
            'format' => 'sometimes|required|in:bo1,bo3,bo5',
            'team_size' => 'sometimes|required|integer|min:1|max:5',
            'team_assignment' => 'sometimes|required|in:random,manual',
            'allow_coaches' => 'sometimes|boolean',
            'team_a_name' => 'nullable|string|max:30',
            'team_b_name' => 'nullable|string|max:30',
            'voice_comm' => 'nullable|string|max:255',
            'server_password' => 'nullable|string|max:8|regex:/^[a-zA-Z0-9]+$/',
        ]);

        if (isset($validated['team_size']) && $validated['team_size'] !== $lobby->team_size) {
            if ($validated['team_size'] == 1) {
                $validated['map_pool'] = explode(';', Setting::where('key', 'map_pool_1v1')->value('value') ?? 'am_redline;am_mirage;am_dust2;am_inferno;am_banana');
            } elseif ($validated['team_size'] == 2) {
                $validated['map_pool'] = explode(';', Setting::where('key', 'map_pool_wingman')->value('value') ?? 'de_overpass;de_vertigo;de_inferno;de_nuke;de_cobblestone');
            } else {
                $validated['map_pool'] = explode(';', Setting::where('key', 'map_pool_standard')->value('value') ?? 'de_mirage;de_dust2;de_inferno;de_nuke;de_ancient;de_anubis;de_vertigo');
            }
        }

        $lobby->update($validated);
        broadcast(new LobbyStateUpdated($lobby->id));

        return back();
    }

    public function drawTeams(Lobby $lobby)
    {
        if (Auth::id() !== $lobby->leader_id) return abort(403);

        $players = $lobby->players()->get()->shuffle();
        $half = ceil($players->count() / 2);

        $i = 0;
        $captainA = null;
        $captainB = null;

        foreach ($players as $player) {
            $team = ($i < $half) ? 'team_a' : 'team_b';
            $player->update(['team' => $team, 'is_ready' => false]);
            
            if ($team === 'team_a' && !$captainA) $captainA = $player->user_id;
            if ($team === 'team_b' && !$captainB) $captainB = $player->user_id;
            
            $i++;
        }

        $lobby->update([
            'team_a_captain_id' => $captainA,
            'team_b_captain_id' => $captainB
        ]);

        broadcast(new LobbyStateUpdated($lobby->id));
        return back();
    }

    public function setCaptain(Request $request, Lobby $lobby)
    {
        if (Auth::id() !== $lobby->leader_id) return abort(403);

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'team' => 'required|in:team_a,team_b',
        ]);

        if ($validated['team'] === 'team_a') {
            $lobby->update(['team_a_captain_id' => $validated['user_id']]);
        } else {
            $lobby->update(['team_b_captain_id' => $validated['user_id']]);
        }

        broadcast(new LobbyStateUpdated($lobby->id));
        return back();
    }

    public function movePlayer(Request $request, Lobby $lobby)
    {
        if (Auth::id() !== $lobby->leader_id) return abort(403);

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'team' => 'required|in:unassigned,team_a,team_b',
        ]);

        $player = $lobby->players()->where('user_id', $validated['user_id'])->firstOrFail();
        if ($player->is_ready) return back();

        $player->update(['team' => $validated['team']]);
        broadcast(new LobbyStateUpdated($lobby->id));

        return back();
    }

    public function toggleReady(Lobby $lobby)
    {
        $player = $lobby->players()->where('user_id', Auth::id())->firstOrFail();
        if ($player->team === 'unassigned') return back();

        $player->update(['is_ready' => !$player->is_ready]);
        broadcast(new LobbyStateUpdated($lobby->id));

        return back();
    }

    public function startVeto(Lobby $lobby)
    {
        if (Auth::id() !== $lobby->leader_id) return abort(403);

        $startingTeam = rand(0, 1) ? 'team_a' : 'team_b';
        $otherTeam = $startingTeam === 'team_a' ? 'team_b' : 'team_a';
        
        $totalMaps = count($lobby->map_pool);
        $targetMaps = $lobby->format === 'bo5' ? 5 : ($lobby->format === 'bo3' ? 3 : 1);
        $mapsToBan = max(0, $totalMaps - $targetMaps);

        $steps = [];
        
        if ($totalMaps == 7 && $targetMaps == 1) {
            $steps = [
                ['team' => $startingTeam, 'action' => 'ban', 'count' => 2],
                ['team' => $otherTeam, 'action' => 'ban', 'count' => 3],
                ['team' => $startingTeam, 'action' => 'ban', 'count' => 1],
                ['team' => 'system', 'action' => 'pick', 'count' => 1]
            ];
        } else {
            $currentTeam = $startingTeam;
            for ($i = 0; $i < $mapsToBan; $i++) {
                $steps[] = ['team' => $currentTeam, 'action' => 'ban', 'count' => 1];
                $currentTeam = $currentTeam === 'team_a' ? 'team_b' : 'team_a';
            }
            $steps[] = ['team' => 'system', 'action' => 'pick', 'count' => $targetMaps];
        }

        $lobby->update([
            'status' => 'map_veto',
            'veto_state' => [
                'current_step_index' => 0,
                'steps' => $steps,
                'banned_maps' => [],
                'picked_maps' => [],
                'votes' => [],
                'history' => [],
                'ends_at' => now()->addSeconds(20)->timestamp * 1000
            ]
        ]);

        broadcast(new LobbyStateUpdated($lobby->id));
        return back();
    }

    public function vetoVote(Request $request, Lobby $lobby)
    {
        $player = $lobby->players()->where('user_id', Auth::id())->first();
        $state = $lobby->veto_state;
        $currentStep = $state['steps'][$state['current_step_index']];

        if ($player->team !== $currentStep['team']) return back();

        $map = $request->input('map');
        $userId = Auth::id();

        if (!isset($state['votes'][$userId])) {
            $state['votes'][$userId] = [];
        }

        $userVotes = $state['votes'][$userId];

        if (in_array($map, $userVotes)) {
            $userVotes = array_values(array_diff($userVotes, [$map]));
        } else {
            if (count($userVotes) < $currentStep['count']) {
                $userVotes[] = $map;
            } else {
                array_shift($userVotes);
                $userVotes[] = $map;
            }
        }

        $state['votes'][$userId] = $userVotes;
        
        $lobby->update(['veto_state' => $state]);
        broadcast(new LobbyStateUpdated($lobby->id));

        return back();
    }

    protected function getRconForLobby($lobby)
    {
        $parts = explode(':', $lobby->server_ip);
        $ip = $parts[0];
        $port = $parts[1] ?? 27015;

        $server = \App\Models\Server::where('ip', $ip)->where('port', $port)->first();

        if (!$server) {
            throw new \Exception("Nie znaleziono w bazie serwera dla adresu: {$lobby->server_ip}");
        }

        $rconString = $server->ip . ':' . $server->port . ':' . $server->rcon_password;
        
        return new RconService($rconString);
    }

    public function vetoFinalize(Lobby $lobby)
    {
        $state = $lobby->veto_state;
        $currentStep = $state['steps'][$state['current_step_index']];

        if ($currentStep['team'] === 'system') return back();

        $allVotes = [];
        foreach (($state['votes'] ?? []) as $userId => $userVotes) {
            foreach ($userVotes as $v) { $allVotes[] = $v; }
        }
        
        $votesCount = array_count_values($allVotes);
        arsort($votesCount);
        
        $mapsToBan = array_slice(array_keys($votesCount), 0, $currentStep['count']);
        
        if (count($mapsToBan) < $currentStep['count']) {
            $available = array_diff($lobby->map_pool, $state['banned_maps'] ?? [], $state['picked_maps'] ?? [], $mapsToBan);
            shuffle($available);
            $mapsToBan = array_merge($mapsToBan, array_slice($available, 0, $currentStep['count'] - count($mapsToBan)));
        }

        $state['banned_maps'] = array_merge($state['banned_maps'] ?? [], $mapsToBan);
        
        if (!isset($state['history'])) $state['history'] = [];
        $state['history'][] = [
            'phase' => $state['current_step_index'] + 1,
            'team' => $currentStep['team'],
            'action' => $currentStep['action'],
            'maps' => $mapsToBan
        ];

        $state['votes'] = [];
        $state['current_step_index']++;
        
        $nextStep = $state['steps'][$state['current_step_index']];
        if ($nextStep['team'] === 'system') {
            $remaining = array_diff($lobby->map_pool, $state['banned_maps']);
            $state['picked_maps'] = array_values($remaining);
            
            $state['history'][] = [
                'phase' => 'FINAŁ',
                'team' => 'system',
                'action' => 'pick',
                'maps' => $state['picked_maps']
            ];

            $lobby->update([
                'status' => 'starting',
                'match_status' => 'live',
                'veto_state' => $state
            ]);

            try {
                $rcon = $this->getRconForLobby($lobby);
                $matchPassword = $lobby->server_password ?? '';

                $rcon->sendCommand("sv_password " . ($matchPassword ? '"' . $matchPassword . '"' : '""'));
                
                $configUrl = env('APP_URL') . "/api/match/json-config/{$lobby->id}";
                $rcon->sendCommand("matchzy_loadmatch_url \"{$configUrl}\"");

            } catch (\Exception $e) {
                // Awaryjne pominięcie błędu socketu
            }
        } else {
            $state['ends_at'] = now()->addSeconds(20)->timestamp * 1000;
            $lobby->update(['veto_state' => $state]);
        }

        broadcast(new LobbyStateUpdated($lobby->id));
        return back();
    }

    public function sendMessage(Request $request, Lobby $lobby)
    {
        $userId = Auth::id();
        $cacheKey = "chat_lobby_{$lobby->id}_user_{$userId}";

        if (Cache::has($cacheKey)) {
            return response()->json(['error' => 'Zwolnij! Możesz wysłać wiadomość co 3 sekundy.'], 429);
        }

        $request->validate([
            'message' => [
                'required', 'string', 'max:250',
                function ($attribute, $value, $fail) {
                    if (preg_match('/(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9\-\.]+\.(com|pl|net|org|eu|gg|io|info|biz|tv)\b)/i', $value)) {
                        $fail('Wysyłanie linków jest zabronione.');
                    }
                },
            ]
        ]);

        $sanitizedMessage = strip_tags($request->message);
        Cache::put($cacheKey, true, 3);

        $time = now()->format('H:i');
        
        $msgData = [
            'user' => Auth::user()->nickname,
            'text' => $sanitizedMessage,
            'time' => $time,
            'isSystem' => false
        ];

        $chatFile = 'chats/lobby_' . $lobby->id . '.json';
        $history = Storage::exists($chatFile) ? json_decode(Storage::get($chatFile), true) : [
            ['user' => 'System', 'text' => 'Utworzono lobby. Połączenie szyfrowane.', 'time' => $lobby->created_at->format('H:i'), 'isSystem' => true]
        ];
        
        $history[] = $msgData;
        Storage::put($chatFile, json_encode($history));

        broadcast(new LobbyChatMessage($lobby->id, Auth::user()->nickname, $sanitizedMessage, $time))->toOthers();

        return response()->json(['status' => 'ok']);
    }

    public function destroy(Lobby $lobby)
    {
        if (Auth::id() !== $lobby->leader_id) return abort(403);

        try {
            if (!empty($lobby->server_ip)) {
                $rcon = $this->getRconForLobby($lobby);
                
                $rcon->sendCommand("css_forceend");
                
                $rcon->sendCommand("kickall");
                
                $rcon->sendCommand("sv_password \"iemsztum2027\"");
                
                $rcon->sendCommand("map de_mirage"); 
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("RCON Error in destroy: " . $e->getMessage());
        }

        Storage::delete('chats/lobby_' . $lobby->id . '.json');
        $lobby->delete();
        
        return redirect()->route('dashboard');
    }

    public function startMatch(Request $request, Lobby $lobby)
    {
        if (Auth::id() !== $lobby->leader_id) return abort(403);

        try {
            $rcon = $this->getRconForLobby($lobby);
            $matchPassword = $lobby->server_password ?? '';

            $parts = explode(':', $lobby->server_ip);
            $ip = $parts[0];
            $port = $parts[1] ?? 27015;
            $server = Server::where('ip', $ip)->where('port', $port)->first();

            if ($server && !empty($server->ftp_host)) {
                $this->updateServerCfgViaFtp($server, $lobby->code, $matchPassword);
            }
            // ---------------------------------------------

            if (!empty($matchPassword)) {
                $rcon->sendCommand("sv_password \"{$matchPassword}\"");
            } else {
                $rcon->sendCommand("sv_password \"\"");
            }

            $rcon->sendCommand("css_forceend");
            $rcon->sendCommand("css_endmatch");

            $configUrl = env('APP_URL') . "/api/match/json-config/{$lobby->id}";
            $rcon->sendCommand("matchzy_loadmatch_url \"{$configUrl}\"");

            $rcon->sendCommand("exec server.cfg");

            $lobby->update([
                'status' => 'starting',
                'match_status' => 'live'
            ]);
            
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Error in startMatch: " . $e->getMessage());
        }

        broadcast(new LobbyStateUpdated($lobby->id));
        return back();
    }

    /**
     * Prywatna metoda pomocnicza do edycji server.cfg przez FTP
     */
    private function updateServerCfgViaFtp($server, $lobbyCode, $matchPassword)
    {
        $conn = @ftp_connect($server->ftp_host, $server->ftp_port ?? 21, 15);
        if (!$conn) {
            throw new \Exception("Nie można połączyć się z FTP: {$server->ftp_host}");
        }

        $login = @ftp_login($conn, $server->ftp_user, $server->ftp_password);
        if (!$login) {
            ftp_close($conn);
            throw new \Exception("Błąd logowania FTP dla użytkownika: {$server->ftp_user}");
        }

        ftp_pasv($conn, true);

        $remotePath = 'csgo/cfg/server.cfg';
        $tempFile = tempnam(sys_get_temp_dir(), 'cfg');

        $downloaded = @ftp_get($conn, $tempFile, $remotePath, FTP_ASCII);
        
        $content = '';
        if ($downloaded && file_exists($tempFile)) {
            $content = file_get_contents($tempFile);
        }

        $newHostname = "IEMSZ-{$lobbyCode}@pukawka.pl";

        if (preg_match('/^(\s*hostname\s+)/mi', $content)) {
            $content = preg_replace('/^(\s*hostname\s+).*/mi', '$1 "' . $newHostname . '"', $content);
        } else {
            $content .= "\nhostname \"" . $newHostname . "\"\n";
        }

        if (preg_match('/^(\s*sv_password\s+)/mi', $content)) {
            $content = preg_replace('/^(\s*sv_password\s+).*/mi', '$1 "' . $matchPassword . '"', $content);
        } else {
            $content .= "sv_password \"" . $matchPassword . "\"\n";
        }

        file_put_contents($tempFile, $content);

        $uploaded = @ftp_put($conn, $remotePath, $tempFile, FTP_ASCII);

        @unlink($tempFile);
        ftp_close($conn);

        if (!$uploaded) {
            throw new \Exception("Nie udało się przesłać zmodyfikowanego pliku server.cfg przez FTP.");
        }
    }

    public function leaderAction(Request $request, Lobby $lobby)
    {
        if (Auth::id() !== $lobby->leader_id) return abort(403);

        $action = $request->input('action');
        $rcon = $this->getRconForLobby($lobby);

        switch ($action) {
            case 'restart_match':
                $rcon->sendCommand("mp_restartgame 1");
                break;

            case 'restart_round':
                $rcon->sendCommand("mp_restartgame 1");
                break;

            case 'end_warmup':
                $rcon->sendCommand("mp_warmup_end");
                $rcon->sendCommand("mp_restartgame 10");
                break;

            case 'say':
                $msg = trim($request->input('message', ''));
                if (!empty($msg)) {
                    $safeMsg = preg_replace('/[^\w\s\-\.\?!]/u', '', $msg);
                    $rcon->sendCommand("say \"[IEM SZTUM ADMIN]: {$safeMsg}\"");
                }
                break;

            case 'change_map':
                $map = $request->input('map');
                $pickedMaps = $lobby->veto_state['picked_maps'] ?? [];
                if (in_array($map, $pickedMaps)) {
                    $rcon->sendCommand("map " . $map);
                }
                break;

            case 'tactical_timeout_a':
                $rcon->sendCommand("mp_timeout_length_tactical 60");
                break;
        }

        broadcast(new LobbyStateUpdated($lobby->id));
        return back();
    }

    public function togglePause(Request $request, Lobby $lobby)
    {
        if (Auth::id() !== $lobby->leader_id) return abort(403);

        $parts = explode(':', $lobby->server_ip);
        $ip = $parts[0];
        $port = $parts[1] ?? 27015;

        $server = Server::where('ip', $ip)->where('port', $port)->first();

        if (!$server) {
            return back()->withErrors(['error' => 'Nie znaleziono konfiguracji tego serwera w bazie danych.']);
        }

        $rconString = $server->ip . ':' . $server->port . ':' . $server->rcon_password;
        $rcon = new RconService($rconString);

        if ($lobby->match_status === 'live') {
            $rcon->sendCommand("mp_pause_match");
            $lobby->update(['match_status' => 'paused']);
        } else {
            $rcon->sendCommand("mp_unpause_match");
            $lobby->update(['match_status' => 'live']);
        }

        broadcast(new LobbyStateUpdated($lobby->id));
        return back();
    }

    public function stopMatch(Request $request, Lobby $lobby)
    {
        if (Auth::id() !== $lobby->leader_id) return abort(403);

        try {
            if (!empty($lobby->server_ip)) {
                $rcon = $this->getRconForLobby($lobby);
                
                $rcon->sendCommand("css_forceend");
                $rcon->sendCommand("css_endmatch");
                
                $rcon->sendCommand("kickall");
                $rcon->sendCommand("sv_password \"iemsztum2027\"");
                $rcon->sendCommand("map de_mirage"); 
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("RCON Error in stopMatch: " . $e->getMessage());
        }

        $lobby->update(['match_status' => 'finished']);
        broadcast(new LobbyStateUpdated($lobby->id));

        return back();
    }
}