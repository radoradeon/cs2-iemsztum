<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use App\Models\Lobby;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');


Schedule::call(function () {
    $lobbies = Lobby::where('created_at', '<=', now()->subHours(5))->get();
    
    foreach ($lobbies as $lobby) {
        Storage::delete('chats/lobby_' . $lobby->id . '.json');
        $lobby->delete();
    }
})->everyMinute();