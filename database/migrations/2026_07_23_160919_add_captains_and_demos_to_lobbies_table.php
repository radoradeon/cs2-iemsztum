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
        Schema::table('lobbies', function (Blueprint $table) {
            $table->foreignId('team_a_captain_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('team_b_captain_id')->nullable()->constrained('users')->nullOnDelete();
            
            $table->json('demo_links')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lobbies', function (Blueprint $table) {
            $table->dropForeign(['team_a_captain_id']);
            $table->dropForeign(['team_b_captain_id']);
            $table->dropColumn(['team_a_captain_id', 'team_b_captain_id', 'demo_links']);
        });
    }
};