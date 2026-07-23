<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lobbies', function (Blueprint $table) {
            $table->id();
            $table->string('code', 8)->unique();
            $table->foreignId('leader_id')->constrained('users')->onDelete('cascade');
            $table->enum('status', ['waiting', 'team_selection', 'map_veto', 'starting', 'in_progress', 'finished', 'cancelled'])->default('waiting');
            $table->enum('format', ['bo1', 'bo3', 'bo5'])->default('bo1');
            $table->integer('team_size')->default(5);
            $table->boolean('allow_coaches')->default(false);
            $table->enum('team_assignment', ['random', 'manual'])->default('random');
            $table->string('server_password')->nullable();
            $table->json('map_pool')->nullable();
            
            $table->string('team_a_name')->default('Drużyna A');
            $table->string('team_b_name')->default('Drużyna B');
            $table->string('voice_comm')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lobbies');
    }
};