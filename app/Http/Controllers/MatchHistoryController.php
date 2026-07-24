<?php

namespace App\Http\Controllers;

use App\Models\MatchHistory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MatchHistoryController extends Controller
{
    public function index(Request $request)
    {
        $limit = min((int) $request->get('limit', 25), 500);

        $query = MatchHistory::whereHas('players', function ($q) {
                $q->where('user_id', auth()->id());
            })
            ->latest();

        $totalCount = (clone $query)->count();
        $matches = $query->take($limit)->get();

        return Inertia::render('History/Index', [
            'matches' => $matches,
            'totalCount' => $totalCount,
            'currentLimit' => $limit
        ]);
    }

    public function show($id)
    {
        $match = MatchHistory::with(['players.user'])->findOrFail($id);

        return Inertia::render('History/Show', [
            'matchData' => $match
        ]);
    }
}