<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Server;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Cache;

class CheckServerIp
{
    public function handle(Request $request, Closure $next): Response
    {
        $clientIp = $request->ip();

        $allowedIps = Cache::remember('server_ips_whitelist', 300, function () {
            return Server::pluck('ip')->toArray();
        });

        if (!in_array($clientIp, $allowedIps)) {
            abort(403, 'Brak dostępu: Nieautoryzowany adres IP serwera.');
        }

        return $next($request);
    }
}