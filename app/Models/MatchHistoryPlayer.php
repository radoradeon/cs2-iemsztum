<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MatchHistoryPlayer extends Model
{
    use HasFactory;
    
    protected $guarded = [];

    public function matchHistory()
    {
        return $this->belongsTo(MatchHistory::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
