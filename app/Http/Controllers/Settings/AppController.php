<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AppController extends Controller
{
    /**
     * Tampilkan halaman pengaturan aplikasi
     */
    public function edit()
    {
        $settings = AppSetting::all()->pluck('value', 'key');

        return Inertia::render('settings/app', [
            'settings' => $settings,
        ]);
    }

    /**
     * Perbarui pengaturan aplikasi
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'app_name' => 'required|string|max:255',
            'app_address' => 'required|string',
            'default_interest_method' => 'required|string|in:flat,effective',
            'default_penalty_rate' => 'required|numeric|min:0',
        ]);

        foreach ($validated as $key => $value) {
            AppSetting::where('key', $key)->update(['value' => $value]);
        }

        return redirect()->back();
    }
}
