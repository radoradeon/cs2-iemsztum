<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lobbies', function (Blueprint $table) {
            $table->json('match_live_data')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('lobbies', function (Blueprint $table) {
            $table->dropColumn('match_live_data');
        });
    }
};