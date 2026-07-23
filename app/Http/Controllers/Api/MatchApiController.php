<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Lobby;
use App\Events\LobbyStateUpdated;
use Illuminate\Support\Facades\Log;

class MatchApiController extends Controller
{
    // Twój stały adres ngrok na czas tej sesji
    private string $ngrokUrl = "https://badland-coming-germless.ngrok-free.dev";

    public function getMatchJsonConfig(Lobby $lobby)
    {
        Log::info("MatchZy pobiera config dla lobby ID: {$lobby->id}");

        $playersA = []; $coachesA = [];
        $teamAPlayers = $lobby->players()->where('team', 'team_a')->with('user')->get();
        foreach ($teamAPlayers as $p) {
            if ($p->user && !empty($p->user->steam_id)) {
                $steamId64 = trim($p->user->steam_id);
                $p->role === 'coach' ? $coachesA[$steamId64] = $p->user->nickname : $playersA[$steamId64] = $p->user->nickname;
            }
        }

        $playersB = []; $coachesB = [];
        $teamBPlayers = $lobby->players()->where('team', 'team_b')->with('user')->get();
        foreach ($teamBPlayers as $p) {
            if ($p->user && !empty($p->user->steam_id)) {
                $steamId64 = trim($p->user->steam_id);
                $p->role === 'coach' ? $coachesB[$steamId64] = $p->user->nickname : $playersB[$steamId64] = $p->user->nickname;
            }
        }

        $vetoState = $lobby->veto_state ?? [];
        $pickedMaps = (!empty($vetoState['picked_maps'])) ? $vetoState['picked_maps'] : ['de_mirage'];

        return response()->json([
            "matchid" => (string)$lobby->id,
            "num_maps" => count($pickedMaps),
            "maplist" => $pickedMaps,
            "skip_veto" => true,
            "knife_round" => true, // Zapewnia rundę nożową
            "min_players_to_ready" => ($lobby->team_size * 2), // Rozgrzewka trwa dopóki wszyscy nie wejdą
            "min_spectators_to_ready" => 0,
            "cvars" => [
                "sv_password" => $lobby->server_password ?? "",
                "matchzy_hostname_format" => "IEMSZTUM-" . $lobby->code . "@pukawka.pl",
                "matchzy_whitelist_enabled" => "true",
                "mp_warmuptime" => "86400",
                "matchzy_ready_warmup_time" => "20"
            ],
            "team1" => [
                "name" => $lobby->team_a_name ?? "Team A",
                "tag" => "TA",
                "players" => (object)$playersA,
                "coaches" => (object)$coachesA
            ],
            "team2" => [
                "name" => $lobby->team_b_name ?? "Team B",
                "tag" => "TB",
                "players" => (object)$playersB,
                "coaches" => (object)$coachesB
            ],
            "remote_log_url" => env('APP_URL') . "/api/match/webhook",
            "demo_upload_url" => env('APP_URL') . "/api/match/demo-upload/{$lobby->id}"
        ]);
    }

    public function handleDemoUpload(Request $request, Lobby $lobby)
    {
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $filename = "match_{$lobby->id}_" . time() . ".dem";
            $path = $file->storeAs("demos/lobby_{$lobby->id}", $filename, 'public');
            
            $links = $lobby->demo_links ?? [];
            $links[] = asset("storage/" . $path);
            
            $lobby->update(['demo_links' => $links]);
            return response()->json(['status' => 'success']);
        }
        return response()->json(['error' => 'No file provided'], 400);
    }

    public function handleWebhook(Request $request)
    {
        $data = $request->all();
        $matchId = $data['matchid'] ?? null;
        if (!$matchId) return response()->json(['status' => 'ignored'], 200);

        $lobby = Lobby::find($matchId);
        if (!$lobby) return response()->json(['status' => 'lobby_not_found'], 404);

        $eventType = $data['event'] ?? 'unknown';
        $liveData = $lobby->match_live_data ?? [
            'series_score_a' => 0, 'series_score_b' => 0, 'map_history' => [],
            'score_a' => 0, 'score_b' => 0, 'round' => 1, 'phase' => 'ROZGRZEWKA', 'players' => []
        ];

        // Fazy statusu meczu na żywo
        switch ($eventType) {
            case 'match_paused': $liveData['phase'] = 'PAUZA TECHNICZNA'; break;
            case 'match_unpaused': $liveData['phase'] = 'MECZ LIVE'; break;
            case 'knife_start': 
            case 'knife_round': $liveData['phase'] = 'RUNDA NOŻOWA'; break;
            case 'match_start':
            case 'map_start': $liveData['phase'] = 'MECZ LIVE'; break;
        }

        if ($eventType === 'round_end') {
            $liveData['score_a'] = $data['team1_score'] ?? $liveData['score_a'];
            $liveData['score_b'] = $data['team2_score'] ?? $liveData['score_b'];
            $liveData['round'] = ($data['round'] ?? $liveData['round']) + 1;
        }

        if ($eventType === 'map_result' || $eventType === 'series_end') {
            $liveData['map_history'][] = [
                'map' => $data['map'] ?? 'unknown',
                'score_a' => $data['team1_score'] ?? 0,
                'score_b' => $data['team2_score'] ?? 0
            ];

            if (($data['team1_score'] ?? 0) > ($data['team2_score'] ?? 0)) {
                $liveData['series_score_a']++;
            } else {
                $liveData['series_score_b']++;
            }
        }

        if (isset($data['players'])) {
            $formattedPlayers = [];
            foreach ($data['players'] as $p) {
                $formattedPlayers[] = [
                    'steam_id' => $p['steamid'] ?? '',
                    'name' => $p['name'] ?? 'Player',
                    'team' => $p['team'] ?? 'CT',
                    'kills' => $p['kills'] ?? 0,
                    'assists' => $p['assists'] ?? 0,
                    'deaths' => $p['deaths'] ?? 0,
                    'score' => $p['score'] ?? 0,
                ];
            }
            $liveData['players'] = $formattedPlayers;
        }

        $lobby->update(['match_live_data' => $liveData]);

        if ($eventType === 'series_end') {
            $lobby->update(['match_status' => 'finished']);
            $liveData['phase'] = 'ZAKOŃCZONY';
            
            $winnerTeam = $liveData['series_score_a'] > $liveData['series_score_b'] ? 'team_a' : 'team_b';
            
            foreach ($lobby->players as $lobbyPlayer) {
                $user = $lobbyPlayer->user;
                if ($user) {
                    $isWinner = $lobbyPlayer->team === $winnerTeam;
                    $user->elo = max(0, $user->elo + ($isWinner ? 25 : -20));
                    $user->save();
                }
            }
        }

        broadcast(new LobbyStateUpdated($lobby->id));
        return response()->json(['status' => 'success']);
    }
}