<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LobbyStateUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $lobbyId;

    public function __construct($lobbyId)
    {
        $this->lobbyId = $lobbyId;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('lobby.' . $this->lobbyId),
        ];
    }
}