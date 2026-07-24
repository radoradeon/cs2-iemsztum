<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminPanelUnlocked
{
    public function handle(Request $request, Closure $next)
    {
        if (!Auth::check()) {
            return abort(403, 'Zaloguj się, aby uzyskać dostęp.');
        }

        if ($request->routeIs('admin.locked') || $request->routeIs('admin.unlock')) {
            return $next($request);
        }

        if (!session('admin_unlocked')) {
            return redirect()->route('admin.locked');
        }

        return $next($request);
    }
}