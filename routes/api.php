<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\MatchApiController;
use App\Http\Middleware\CheckServerIp;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware([CheckServerIp::class])->group(function () {
    Route::get('/match/json-config/{lobby}', [MatchApiController::class, 'getMatchJsonConfig']);
    Route::post('/match/webhook', [MatchApiController::class, 'handleWebhook']);
    Route::post('/match/demo-upload/{lobby}', [MatchApiController::class, 'handleDemoUpload']);
});