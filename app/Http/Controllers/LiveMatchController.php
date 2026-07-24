<?php

namespace App\Http\Controllers;

use App\Models\Lobby;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LiveMatchController extends Controller
{
    public function index(Request $request)
    {
        $limit = $request->input('limit', 25);

        $query = Lobby::where('status', 'live')->latest();

        $totalCount = $query->count();
        $matches = $query->take($limit)->get();

        $formattedMatches = $matches->map(function ($lobby) {
            $liveData = $lobby->match_live_data ?? [];
            
            return [
                'id' => $lobby->id,
                'code' => $lobby->code,
                'format' => $lobby->format,
                'map' => $liveData['map'] ?? ($lobby->map_pool[0] ?? 'de_mirage'),
                'team_a_name' => $lobby->team_a_name ?? 'Team A',
                'team_b_name' => $lobby->team_b_name ?? 'Team B',
                'series_score_a' => $liveData['series_score_a'] ?? 0,
                'series_score_b' => $liveData['series_score_b'] ?? 0,
                'score_a' => $liveData['score_a'] ?? 0,
                'score_b' => $liveData['score_b'] ?? 0,
                'players_count' => count($liveData['players'] ?? $lobby->players),
                'gotv_enabled' => (bool)$lobby->gotv_enabled,
                'gotv_ip' => $lobby->server_ip ? explode(':', $lobby->server_ip)[0] : '127.0.0.1',
                'gotv_port' => $lobby->server_ip ? (int)(explode(':', $lobby->server_ip)[1] ?? 27015) + 5 : 27020, 
                'created_at' => $lobby->created_at,
            ];
        });

        return Inertia::render('LiveMatches', [
            'matches' => $formattedMatches,
            'totalCount' => $totalCount,
            'currentLimit' => (int)$limit,
        ]);
    }
}