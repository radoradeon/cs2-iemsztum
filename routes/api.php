<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\MatchApiController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/match/json-config/{lobby}', [MatchApiController::class, 'getMatchJsonConfig']);
Route::post('/match/webhook', [MatchApiController::class, 'handleWebhook']);
Route::post('/match/demo-upload/{lobby}', [MatchApiController::class, 'handleDemoUpload']);