<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (auth()->check() && auth()->user()->role === 'admin') {
            return $next($request);
        }

        if ($request->expectsJson()) {
            return response()->json(['message' => 'Forbidden: Akses hanya untuk Pengurus.'], 403);
        }

        return redirect()->route('home')->with('error', 'Akses Terbatas: Akun Anda sedang dalam proses verifikasi oleh pengurus.');
    }
}
