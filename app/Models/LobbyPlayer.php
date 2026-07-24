<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LobbyPlayer extends Model
{
    use HasFactory;

    protected $fillable = [
        'lobby_id',
        'user_id',
        'team',
        'is_ready',
        'role'
    ];

    protected $casts = [
        'is_ready' => 'boolean',
    ];

    public function lobby()
    {
        return $this->belongsTo(Lobby::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}