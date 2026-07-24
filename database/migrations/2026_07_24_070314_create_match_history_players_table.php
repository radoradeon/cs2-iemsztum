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
        Schema::create('match_history_players', function (Blueprint $table) {
            $table->id();
            $table->foreignId('match_history_id')->constrained()->onDelete('cascade');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('steam_id');
            $table->string('nickname');
            $table->string('team');
            
            $table->float('rating', 8, 2)->default(1.00);
            $table->integer('elo_change')->default(0);
            
            $table->integer('kills')->default(0);
            $table->integer('assists')->default(0);
            $table->integer('deaths')->default(0);
            $table->integer('damage')->default(0);
            $table->integer('mvp')->default(0);
            $table->integer('ef')->default(0);
            $table->integer('ud')->default(0);
            $table->integer('first_kills')->default(0);
            $table->integer('clutch_kills')->default(0);
            $table->integer('k2')->default(0);
            $table->integer('k3')->default(0);
            $table->integer('k4')->default(0);
            $table->integer('k5')->default(0);
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('match_history_players');
    }
};
