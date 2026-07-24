<?php

namespace App\Http\Controllers;

use App\Models\Lobby;
use App\Models\Server;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LiveMatchController extends Controller
{
    public function index(Request $request)
    {
        $limit = $request->input('limit', 25);

        $query = Lobby::whereIn('status', ['starting', 'live'])
              ->whereNotNull('server_ip')
              ->latest();

        $totalCount = $query->count();
        $matches = $query->take($limit)->get();

        $formattedMatches = $matches->map(function ($lobby) {
            $liveData = $lobby->match_live_data ?? [];
            
            $parts = explode(':', $lobby->server_ip);
            $ip = $parts[0] ?? '127.0.0.1';
            $port = (int)($parts[1] ?? 27015);

            $server = Server::where('ip', $ip)->where('port', $port)->first();
            $serverId = $server ? $server->id : $lobby->id;

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
                'gotv_ip' => $ip,
                'gotv_port' => $port + 5,
                'gotv_password' => "iemsztum" . $lobby->id,
                // 'gotv_password' => "iemsztum" . $serverId,
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