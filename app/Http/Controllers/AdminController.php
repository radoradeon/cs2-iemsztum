<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Setting;
use App\Models\Server;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function showLockScreen()
    {
        return Inertia::render('Admin/LockScreen');
    }

    public function unlock(Request $request)
    {
        $request->validate(['password' => 'required']);
        
        $adminPasswordSetting = Setting::firstOrCreate(
            ['key' => 'admin_password'],
            ['value' => Hash::make('iemsztum123#2027')]
        );

        if (Hash::check($request->password, $adminPasswordSetting->value)) {
            session(['admin_unlocked' => true]);
            return redirect()->route('admin.dashboard');
        }

        return back()->withErrors(['password' => 'Nieprawidłowe hasło administratora.']);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'new_password' => 'required|min:6'
        ]);

        Setting::updateOrCreate(
            ['key' => 'admin_password'],
            ['value' => Hash::make($request->new_password)]
        );

        return back()->with('success', 'Hasło administratora zostało zmienione!');
    }

    public function dashboard()
    {
        $servers = Server::all();
        
        $mapStandard = Setting::firstOrCreate(['key' => 'map_pool_standard'], ['value' => 'de_mirage;de_dust2;de_inferno;de_nuke;de_ancient;de_anubis;de_vertigo']);
        $mapWingman = Setting::firstOrCreate(['key' => 'map_pool_wingman'], ['value' => 'de_overpass;de_vertigo;de_inferno;de_nuke;de_cobblestone']);
        $map1v1 = Setting::firstOrCreate(['key' => 'map_pool_1v1'], ['value' => 'am_redline;am_mirage;am_dust2;am_inferno;am_banana']);

        return Inertia::render('Admin/Dashboard', [
            'servers' => $servers,
            'mapSettings' => [
                'standard' => $mapStandard->value,
                'wingman' => $mapWingman->value,
                '1v1' => $map1v1->value,
            ]
        ]);
    }

    public function storeServer(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'ip' => 'required|string',
            'port' => 'required|integer',
            'rcon_password' => 'required|string',
            'ftp_host' => 'nullable|string',
            'ftp_port' => 'nullable|integer',
            'ftp_user' => 'nullable|string',
            'ftp_password' => 'nullable|string',
        ]);

        Server::create($data);
        return back()->with('success', 'Serwer dodany.');
    }

    public function updateServer(Request $request, Server $server)
    {
        $data = $request->except(['_token']);
        
        if (empty($data['rcon_password'])) unset($data['rcon_password']);
        if (empty($data['ftp_password'])) unset($data['ftp_password']);

        $server->update($data);
        return back()->with('success', 'Serwer zaktualizowany.');
    }

    public function destroyServer(Server $server)
    {
        $server->delete();
        return back()->with('success', 'Serwer usunięty.');
    }

    public function updateMapSettings(Request $request)
    {
        $request->validate([
            'standard' => 'required|string',
            'wingman' => 'required|string',
            '1v1' => 'required|string',
        ]);

        Setting::updateOrCreate(['key' => 'map_pool_standard'], ['value' => $request->standard]);
        Setting::updateOrCreate(['key' => 'map_pool_wingman'], ['value' => $request->wingman]);
        Setting::updateOrCreate(['key' => 'map_pool_1v1'], ['value' => $request->input('1v1')]);

        return back()->with('success', 'Pule map zostały pomyślnie zaktualizowane!');
    }
}