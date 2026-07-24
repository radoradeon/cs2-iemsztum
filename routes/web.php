<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Models\Lobby;
use App\Models\LobbyPlayer;
use App\Models\MatchHistory;
use App\Http\Controllers\Auth\SteamLoginController;
use App\Http\Controllers\LobbyController;
use App\Http\Controllers\MatchHistoryController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// Trasy PUBLICZNE (Dla gości)
Route::middleware('guest')->group(function () {
    Route::get('login/steam', [SteamLoginController::class, 'redirectToSteam'])->name('login.steam');
    Route::get('login/steam/callback', [SteamLoginController::class, 'handleSteamCallback']);
});

// Trasy ZABEZPIECZONE (Dla zalogowanych)
Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        $playerRecord = LobbyPlayer::with('lobby')->where('user_id', \Illuminate\Support\Facades\Auth::id())->first();
        $activeLobby = $playerRecord ? $playerRecord->lobby : null;

        $serverPool = array_filter(explode(';', env('CS2_SERVERS', '')));
        $totalServers = count($serverPool);
        $usedServers = Lobby::whereNotNull('server_ip')->count();
        $availableServers = max(0, $totalServers - $usedServers);

        $recentMatches = MatchHistory::whereHas('players', function ($query) {
            $query->where('user_id', \Illuminate\Support\Facades\Auth::id());
        })->latest()->take(5)->get();

        return Inertia::render('dashboard', [
            'active_lobby' => $activeLobby,
            'server_stats' => [
                'available' => $availableServers,
                'total' => $totalServers
            ],
            'recent_matches' => $recentMatches
        ]);
    })->name('dashboard');
    

    Route::post('/lobbies', [LobbyController::class, 'store'])->name('lobbies.store');
    Route::post('/lobbies/join', [LobbyController::class, 'join'])->name('lobbies.join');
    Route::get('/lobbies/{code}', [LobbyController::class, 'show'])->name('lobbies.show');
    
    Route::put('/lobbies/{lobby}/settings', [LobbyController::class, 'updateSettings'])->name('lobbies.settings');
    Route::post('/lobbies/{lobby}/draw', [LobbyController::class, 'drawTeams'])->name('lobbies.draw');
    Route::post('/lobbies/{lobby}/move', [LobbyController::class, 'movePlayer'])->name('lobbies.move');
    Route::post('/lobbies/{lobby}/ready', [LobbyController::class, 'toggleReady'])->name('lobbies.ready');
    Route::post('/lobbies/{lobby}/chat', [LobbyController::class, 'sendMessage'])->name('lobbies.chat');
    Route::post('/lobbies/{lobby}/captain', [LobbyController::class, 'setCaptain'])->name('lobbies.captain');
    
    Route::delete('/lobbies/{lobby}', [LobbyController::class, 'destroy'])->name('lobbies.destroy');

    Route::post('/lobbies/{lobby}/veto/start', [LobbyController::class, 'startVeto'])->name('lobbies.veto.start');
    Route::post('/lobbies/{lobby}/veto/vote', [LobbyController::class, 'vetoVote'])->name('lobbies.veto.vote');
    Route::post('/lobbies/{lobby}/veto/finalize', [LobbyController::class, 'vetoFinalize'])->name('lobbies.veto.finalize');

    Route::post('/lobbies/{lobby}/match/start', [LobbyController::class, 'startMatch'])->name('lobbies.match.start');
    Route::post('/lobbies/{lobby}/match/pause', [LobbyController::class, 'togglePause'])->name('lobbies.match.pause');
    Route::post('/lobbies/{lobby}/match/stop', [LobbyController::class, 'stopMatch'])->name('lobbies.match.stop');
    Route::post('/lobbies/{lobby}/match/action', [LobbyController::class, 'leaderAction'])->name('lobbies.match.action');

    Route::get('/history', [MatchHistoryController::class, 'index'])->name('history.index');
    Route::get('/history/{id}', [MatchHistoryController::class, 'show'])->name('history.show');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';