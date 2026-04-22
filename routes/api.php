<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\SavingController;
use App\Http\Controllers\LoanController;
use App\Http\Controllers\ReportController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Protected Routes for Admin/Pengurus
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    
    Route::apiResource('members', MemberController::class);
    
    // Statistics and Reports
    Route::get('dashboard', [ReportController::class, 'dashboard']);

    // Savings management
    Route::get('members/{member}/savings', [SavingController::class, 'index']);
    Route::post('members/{member}/savings', [SavingController::class, 'store']);

    // Loans management
    Route::get('members/{member}/loans', [LoanController::class, 'index']);
    Route::post('members/{member}/loans', [LoanController::class, 'store']);
    Route::patch('loans/{loan}/status', [LoanController::class, 'updateStatus']);
    Route::post('loans/{loan}/repay', [LoanController::class, 'repay']);
    
});
