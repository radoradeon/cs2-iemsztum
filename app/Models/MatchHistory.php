<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MatchHistory extends Model
{
    use HasFactory;
    
    protected $guarded = [];
    protected $casts = [
        'map_history' => 'array',
        'demo_links' => 'array'
    ];

    public function players()
    {
        return $this->hasMany(MatchHistoryPlayer::class);
    }
}
