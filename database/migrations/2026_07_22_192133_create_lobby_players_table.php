<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lobby_players', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lobby_id')->constrained('lobbies')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('team', ['unassigned', 'team_a', 'team_b', 'coach_a', 'coach_b'])->default('unassigned');
            
            $table->boolean('is_ready')->default(false);
            $table->timestamps();
            $table->unique(['lobby_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lobby_players');
    }
};