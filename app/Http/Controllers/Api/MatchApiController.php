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
        Log::info("MatchZy próbuje pobrać config dla lobby ID: {$lobby->id}");

        $teamAPlayers = $lobby->players()->where('team', 'team_a')->with('user')->get();
        $playersA = [];
        $coachesA = [];
        foreach ($teamAPlayers as $p) {
            if ($p->user && !empty($p->user->steam_id)) {
                $steamId64 = trim($p->user->steam_id);
                if ($p->role === 'coach') {
                    $coachesA[$steamId64] = $p->user->nickname ?? 'Coach A';
                } else {
                    $playersA[$steamId64] = $p->user->nickname ?? 'Player A';
                }
            }
        }

        $teamBPlayers = $lobby->players()->where('team', 'team_b')->with('user')->get();
        $playersB = [];
        $coachesB = [];
        foreach ($teamBPlayers as $p) {
            if ($p->user && !empty($p->user->steam_id)) {
                $steamId64 = trim($p->user->steam_id);
                if ($p->role === 'coach') {
                    $coachesB[$steamId64] = $p->user->nickname ?? 'Coach B';
                } else {
                    $playersB[$steamId64] = $p->user->nickname ?? 'Player B';
                }
            }
        }

        $pickedMaps = $lobby->veto_state['picked_maps'] ?? ['de_mirage'];
        $matchPassword = $lobby->server_password ?? '';

        return response()->json([
            "matchid" => (string)$lobby->id,
            "num_maps" => count($pickedMaps),
            "maplist" => $pickedMaps,
            "skip_veto" => true,
            "knife_round" => true,
            "mr" => 12,
            "cvars" => [
                "sv_password" => $matchPassword
            ],
            "team1" => [
                "name" => $lobby->team_a_name ?? "Team A",
                "tag" => "TA",
                "players" => $playersA,
                "coaches" => $coachesA
            ],
            "team2" => [
                "name" => $lobby->team_b_name ?? "Team B",
                "tag" => "TB",
                "players" => $playersB,
                "coaches" => $coachesB
            ],
            "remote_log_url" => "{$this->ngrokUrl}/api/match/webhook"
        ]);
    }

    public function handleWebhook(Request $request)
    {
        Log::info("Otrzymano webhook z MatchZy:", $request->all());

        $data = $request->all();
        $matchId = $data['matchid'] ?? null;

        if (!$matchId) {
            return response()->json(['status' => 'ignored'], 200);
        }

        $lobby = Lobby::find($matchId);
        if (!$lobby) {
            return response()->json(['status' => 'lobby_not_found'], 404);
        }

        $eventType = $data['event'] ?? 'unknown';
        $liveData = $lobby->match_live_data ?? [
            'series_score_a' => 0,
            'series_score_b' => 0,
            'map_history' => [],
            'score_a' => 0,
            'score_b' => 0,
            'round' => 1,
            'phase' => 'live',
            'players' => []
        ];

        if ($eventType === 'round_end') {
            $liveData['score_a'] = $data['team1_score'] ?? $liveData['score_a'];
            $liveData['score_b'] = $data['team2_score'] ?? $liveData['score_b'];
            $liveData['round'] = ($data['round'] ?? $liveData['round']) + 1;
        }

        if ($eventType === 'map_result' || $eventType === 'series_end') {
            $mapName = $data['map'] ?? 'unknown';
            $mapScoreA = $data['team1_score'] ?? 0;
            $mapScoreB = $data['team2_score'] ?? 0;

            $liveData['map_history'][] = [
                'map' => $mapName,
                'score_a' => $mapScoreA,
                'score_b' => $mapScoreB
            ];

            if ($mapScoreA > $mapScoreB) {
                $liveData['series_score_a'] = ($liveData['series_score_a'] ?? 0) + 1;
            } else {
                $liveData['series_score_b'] = ($liveData['series_score_b'] ?? 0) + 1;
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
        }

        broadcast(new LobbyStateUpdated($lobby->id));

        return response()->json(['status' => 'success']);
    }
}