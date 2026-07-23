<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lobbies', function (Blueprint $table) {
            $table->string('match_status')->default('configuring');
            $table->string('score_a')->default('0');
            $table->string('score_b')->default('0');
        });
    }

    public function down(): void
    {
        Schema::table('lobbies', function (Blueprint $table) {
            $table->dropColumn(['match_status', 'score_a', 'score_b']);
        });
    }
};