<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\SavingController;
use App\Http\Controllers\LoanController;
use App\Http\Controllers\ReportController;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified', 'admin'])->group(function () {
    Route::get('/dashboard', [ReportController::class, 'dashboardView'])->name('dashboard');

    // Member Routes
    Route::get('/members', [MemberController::class, 'indexView'])->name('web_members_index');
    Route::post('/members', [MemberController::class, 'store'])->name('web_members_store');
    Route::patch('/members/{member}', [MemberController::class, 'updateFromWeb'])->name('web_members_update');
    Route::delete('/members/{member}', [MemberController::class, 'destroyFromWeb'])->name('web_members_destroy');

    // Savings Routes
    Route::get('/savings', [SavingController::class, 'indexView'])->name('web_savings_index');
    Route::post('/savings', [SavingController::class, 'storeFromWeb'])->name('web_savings_store');
    Route::post('/savings/withdraw', [SavingController::class, 'withdrawFromWeb'])->name('web_savings_withdraw');

    // Loans Routes
    Route::get('/loans', [LoanController::class, 'indexView'])->name('web_loans_index');
    Route::post('/loans', [LoanController::class, 'storeFromWeb'])->name('web_loans_store');
    Route::patch('/loans/{loan}/status', [LoanController::class, 'updateStatus'])->name('web_loans_update_status');
    Route::post('/loans/{loan}/repay', [LoanController::class, 'repayFromWeb'])->name('web_loans_repay');

    // Reports Route
    Route::get('/reports', [ReportController::class, 'reportView'])->name('web_reports_index');
});

require __DIR__.'/settings.php';
