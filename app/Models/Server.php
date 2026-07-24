<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Server extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'rcon_password' => 'encrypted',
        'ftp_password' => 'encrypted',
        'is_active' => 'boolean'
    ];
}