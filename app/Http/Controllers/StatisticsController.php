<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class StatisticsController extends Controller
{
    public function index(Request $request)
    {
        $limit = min((int) $request->get('limit', 25), 500);

        // 1. ELO malejąco
        // 2. Średni rating z tabeli match_history_players malejąco
        // 3. Łączna liczba MVP malejąco
        // 4. Łączna liczba zabójств (Kills) malejąco
        $players = User::query()
            ->select('users.*')
            ->selectSub(function ($query) {
                $query->from('match_history_players')
                      ->selectRaw('COALESCE(AVG(rating), 1.00)')
                      ->whereColumn('match_history_players.user_id', 'users.id');
            }, 'avg_rating')
            ->orderBy('users.elo', 'desc')
            ->orderBy('avg_rating', 'desc')
            ->orderBy('users.mvps', 'desc')
            ->take(500)
            ->get();

        $paginatedPlayers = $players->take($limit);

        return Inertia::render('Statistics/Index', [
            'players' => $paginatedPlayers,
            'totalCount' => $players->count(),
            'currentLimit' => $limit
        ]);
    }
}