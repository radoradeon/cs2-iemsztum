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
        return Inertia::render('Admin/Dashboard', [
            'servers' => $servers
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
}