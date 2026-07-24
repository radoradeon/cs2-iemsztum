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
        Schema::create('servers', function (Blueprint $table) {
            $table->id();
            $table->string('name')->default('Serwer CS2');
            $table->string('ip');
            $table->integer('port')->default(27015);
            $table->text('rcon_password');
            
            $table->string('ftp_host')->nullable();
            $table->integer('ftp_port')->default(21)->nullable();
            $table->string('ftp_user')->nullable();
            $table->text('ftp_password')->nullable();
            
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('servers');
    }
};
