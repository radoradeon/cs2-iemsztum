<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Lobby;
use Symfony\Component\HttpFoundation\Response;

class CheckServerIp
{
    public function handle(Request $request, Closure $next): Response
    {
        // 1. próba pobraniaID lobby/meczu z parametru trasy (np. /api/match/json-config/{lobby})
        $lobbyParam = $request->route('lobby');
        
        // 2. czy jest przekazane w danych żądania (np. matchid w webhooku)
        $matchId = $lobbyParam instanceof Lobby 
            ? $lobbyParam->id 
            : ($lobbyParam ?? $request->input('matchid') ?? $request->input('match_id'));

        if (!$matchId) {
            abort(403, 'Brak dostępu: Brak identyfikatora meczu w żądaniu.');
        }

        // 3. czy lobby/mecz istnieje w bazie danych
        $lobby = Lobby::find($matchId);

        if (!$lobby) {
            abort(403, 'Brak dostępu: Podane lobby lub mecz nie istnieje.');
        }

        // 4. czy mecz trwa
        // if ($lobby->match_status === 'finished' && $lobby->status !== 'live') {
        // }

        return $next($request);
    }
}