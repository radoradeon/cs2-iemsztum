<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LobbyChatMessage implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $lobbyId;
    public $user;
    public $message;
    public $time;

    public function __construct($lobbyId, $user, $message, $time)
    {
        $this->lobbyId = $lobbyId;
        $this->user = $user;
        $this->message = $message;
        $this->time = $time;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('lobby.' . $this->lobbyId),
        ];
    }
}