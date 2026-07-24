<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;

class SteamLoginController extends Controller
{
    private $steamLoginUrl = 'https://steamcommunity.com/openid/login';
    private $steamApiUrl = 'http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/';

    public function redirectToSteam(Request $request)
    {
        $returnTo = url('/login/steam/callback');

        $params = [
            'openid.ns'         => 'http://specs.openid.net/auth/2.0',
            'openid.mode'       => 'checkid_setup',
            'openid.return_to'  => $returnTo,
            'openid.realm'      => url('/'),
            'openid.identity'   => 'http://specs.openid.net/auth/2.0/identifier_select',
            'openid.claimed_id' => 'http://specs.openid.net/auth/2.0/identifier_select',
        ];

        return redirect($this->steamLoginUrl . '?' . http_build_query($params));
    }

    public function handleSteamCallback(Request $request)
    {
        if (!$request->has('openid_sig')) {
            return redirect('/login')->with('error', 'Brak parametru openid_sig w adresie URL.');
        }

        $params = $request->all();
        $openIdParams = [];
        
        foreach ($params as $key => $value) {
            if (strpos($key, 'openid') === 0) {
                $originalKey = preg_replace('/^openid_/', 'openid.', $key);
                $openIdParams[$originalKey] = $value;
            }
        }

        $openIdParams['openid.mode'] = 'check_authentication';
        
        $response = Http::asForm()->post($this->steamLoginUrl, $openIdParams);

        if (strpos($response->body(), 'is_valid:true') === false) {
            return redirect('/login')->with('error', 'Błąd walidacji OpenID.');
        }

        preg_match('#^https?://steamcommunity\.com/openid/id/([0-9]{17,25})#', $request->input('openid_claimed_id'), $matches);
        $steamId = $matches[1] ?? null;

        if (!$steamId) {
            return redirect('/login')->with('error', 'Nie potrafię wyciągnąć SteamID64 z odpowiedzi.');
        }

        $apiKey = env('STEAM_AUTH_API_KEY');
        
        if (empty($apiKey)) {
            return redirect('/login')->with('error', 'Brak klucza API Steam w konfiguracji serwera.');
        }

        $profileResponse = Http::get($this->steamApiUrl, [
            'key' => $apiKey,
            'steamids' => $steamId
        ]);

        $playerData = $profileResponse->json('response.players.0');

        if (!$playerData) {
            return redirect('/login')->with('error', 'API Steama nie zwróciło danych gracza.');
        }

        try {
            $role = ($steamId === 'TWOJE_STEAM_ID') ? 'admin' : 'user';

            $user = User::updateOrCreate(
                ['steam_id' => $steamId],
                [
                    'nickname' => $playerData['personaname'],
                    'avatar_url' => $playerData['avatarfull'],
                    'role' => $role,
                ]
            );
        } catch (\Exception $e) {
            return redirect('/login')->with('error', 'Błąd bazy danych podczas zapisu użytkownika.');
        }

        Auth::login($user, true);

        return redirect()->intended('/dashboard');
    }

    public function logout(Request $request)
    {
        Auth::logout();
        
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/login')->with('success', 'Zostałeś poprawnie wylogowany.');
    }
}