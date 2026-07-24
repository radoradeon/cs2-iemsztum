<?php

namespace App\Http\Controllers;

use App\Models\MatchHistory;
use Inertia\Inertia;

class MatchHistoryController extends Controller
{
    public function index()
    {
        $matches = MatchHistory::whereHas('players', function ($query) {
            $query->where('user_id', auth()->id());
        })->latest()->paginate(15);
        
        return Inertia::render('History/Index', [
            'matches' => $matches
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