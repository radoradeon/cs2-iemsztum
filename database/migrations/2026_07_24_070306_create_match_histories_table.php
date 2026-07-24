<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('match_histories', function (Blueprint $table) {
            $table->id();
            $table->string('lobby_code')->nullable();
            $table->string('format');
            $table->string('team_a_name');
            $table->string('team_b_name');
            $table->integer('series_score_a')->default(0);
            $table->integer('series_score_b')->default(0);
            $table->json('map_history')->nullable();
            $table->json('demo_links')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('match_histories');
    }
};
