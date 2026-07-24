<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Lobby;
use App\Models\MatchHistory;
use App\Models\MatchHistoryPlayer;
use App\Events\LobbyStateUpdated;
use Illuminate\Support\Facades\Log;

class MatchApiController extends Controller
{
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
            "knife_round" => true,
            "min_players_to_ready" => ($lobby->team_size * 2),
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

        // Fazy statusu meczu
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
                $k3 = $p['3k'] ?? 0; $k4 = $p['4k'] ?? 0; $k5 = $p['5k'] ?? 0;
                $k2 = max(0, (int)(($p['kills'] ?? 0) - (3*$k3) - (4*$k4) - (5*$k5)) / 2);

                $formattedPlayers[] = [
                    'steam_id' => $p['steamid'] ?? $p['accountid'] ?? '',
                    'name' => $p['name'] ?? 'Player',
                    'team' => $p['team'] ?? 'CT',
                    'kills' => $p['kills'] ?? 0,
                    'assists' => $p['assists'] ?? 0,
                    'deaths' => $p['deaths'] ?? 0,
                    'damage' => $p['dmg'] ?? 0,
                    'mvp' => $p['mvp'] ?? 0,
                    'ef' => $p['ef'] ?? 0,       // Effective flashes
                    'ud' => $p['ud'] ?? 0,       // Utility damage
                    'firstk' => $p['firstk'] ?? 0, // Opening duels
                    'clutchk' => $p['clutchk'] ?? 0,
                    'k2' => $k2,
                    'k3' => $k3,
                    'k4' => $k4,
                    'k5' => $k5,
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
            $totalRoundsPlayed = max(1, ($liveData['round'] ?? 2) - 1);

            $history = MatchHistory::create([
                'lobby_code' => $lobby->code,
                'format' => $lobby->format,
                'team_a_name' => $lobby->team_a_name,
                'team_b_name' => $lobby->team_b_name,
                'series_score_a' => $liveData['series_score_a'] ?? 0,
                'series_score_b' => $liveData['series_score_b'] ?? 0,
                'map_history' => $liveData['map_history'] ?? [],
                'demo_links' => $lobby->demo_links ?? [],
            ]);

            foreach ($liveData['players'] as $pStat) {
                $lobbyPlayer = $lobby->players()->whereHas('user', function($q) use ($pStat) {
                    $q->where('steam_id', $pStat['steam_id']);
                })->first();

                $user = $lobbyPlayer ? $lobbyPlayer->user : null;
                $teamAssigned = $lobbyPlayer ? $lobbyPlayer->team : ($pStat['team'] === 'CT' ? 'team_a' : 'team_b');
                $isWinner = $teamAssigned === $winnerTeam;

                // ---- ALGORYTM HLTV 2.0 APPROXIMATION ----
                $kpr = $pStat['kills'] / $totalRoundsPlayed;
                $dpr = max(1, $pStat['deaths']) / $totalRoundsPlayed;
                $apr = $pStat['assists'] / $totalRoundsPlayed;
                $adr = $pStat['damage'] / $totalRoundsPlayed;
                
                $impact = (2.13 * $kpr) + (0.42 * $apr) - 0.41;
                $baseRating = (0.0073 * $adr) + (0.3591 * $kpr) - (0.5329 * $dpr) + (0.2372 * $impact) + 0.1587;
                
                // ---- IEM SZTUM MODIFIERS ----
                // Bonusy za użyteczność, otwieranie rund i MVP
                $rating = $baseRating + ($pStat['ef'] * 0.005) + ($pStat['firstk'] * 0.015) + ($pStat['mvp'] * 0.02);
                $rating = round(max(0.1, $rating), 2);

                // ---- SZELO CALCULATION ----
                if ($isWinner) {
                    // Win: Minimum +10, Max teoretycznego nie ma (im lepszy rating pow. 1.0 tym wyższy bonus)
                    $eloChange = 10 + round(max(0, ($rating - 1.0) * 20));
                } else {
                    // Loss: Minimum -15.
                    if ($rating < 1.0) {
                        // Jeśli zagrał słabo, traci więcej (-15 i dodatkowy spadek)
                        $eloChange = -15 - round((1.0 - $rating) * 20);
                    } else {
                        // Jeśli zagrał bardzo dobrze (rating > 1.0) ale przegrał - amortyzujemy spadek (maksymalnie do -5)
                        $eloChange = -15 + round(min(10, ($rating - 1.0) * 15));
                    }
                }

                if ($user) {
                    $user->elo = max(0, $user->elo + $eloChange);
                    $user->matches_played += 1;
                    $user->save();
                }

                MatchHistoryPlayer::create([
                    'match_history_id' => $history->id,
                    'user_id' => $user ? $user->id : null,
                    'steam_id' => $pStat['steam_id'],
                    'nickname' => $pStat['name'],
                    'team' => $teamAssigned,
                    'rating' => $rating,
                    'elo_change' => $eloChange,
                    'kills' => $pStat['kills'],
                    'deaths' => $pStat['deaths'],
                    'assists' => $pStat['assists'],
                    'damage' => $pStat['damage'],
                    'mvp' => $pStat['mvp'],
                    'ef' => $pStat['ef'],
                    'ud' => $pStat['ud'],
                    'first_kills' => $pStat['firstk'],
                    'clutch_kills' => $pStat['clutchk'],
                    'k2' => $pStat['k2'],
                    'k3' => $pStat['k3'],
                    'k4' => $pStat['k4'],
                    'k5' => $pStat['k5'],
                ]);
            }

            $mvpRecord = MatchHistoryPlayer::where('match_history_id', $history->id)
                            ->orderByDesc('rating')
                            ->first();

            if ($mvpRecord && $mvpRecord->user_id) {
                $userMvp = User::find($mvpRecord->user_id);
                if ($userMvp) {
                    $userMvp->mvps += 1;
                    $userMvp->save();
                }
            }
        }

        broadcast(new LobbyStateUpdated($lobby->id));
        return response()->json(['status' => 'success']);
    }
}