<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('lobby.{id}', function ($user, $lobbyId) {
    return \App\Models\LobbyPlayer::where('lobby_id', $lobbyId)
        ->where('user_id', $user->id)
        ->exists();
});