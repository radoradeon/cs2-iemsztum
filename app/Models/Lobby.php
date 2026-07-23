<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lobby extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'leader_id',
        'team_a_captain_id',
        'team_b_captain_id',
        'status',
        'format',
        'team_size',
        'allow_coaches',
        'team_assignment',
        'server_password',
        'map_pool',
        'team_a_name',
        'team_b_name',
        'voice_comm',
        'veto_state',
        'server_ip',
        'match_status',
        'score_a',
        'score_b',
        'match_live_data',
        'demo_links'
    ];

    protected $casts = [
        'allow_coaches' => 'boolean',
        'map_pool' => 'array',
        'veto_state' => 'array',
        'match_live_data' => 'array',
        'demo_links' => 'array'
    ];

    public function leader()
    {
        return $this->belongsTo(User::class, 'leader_id');
    }

    public function players()
    {
        return $this->hasMany(LobbyPlayer::class);
    }
}