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
        Schema::table('lobby_players', function (Blueprint $table) {
            if (!Schema::hasColumn('lobby_players', 'role')) {
                $table->string('role')->default('player');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lobby_players', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }
};
