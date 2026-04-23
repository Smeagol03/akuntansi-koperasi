<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class PromoteUserToAdmin extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'user:promote {email}';

    /**
     * The console command description.
     */
    protected $description = 'Ubah role user menjadi admin berdasarkan email';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        $user = User::where('email', $email)->first();

        if (!$user) {
            $this->error("User dengan email {$email} tidak ditemukan.");
            return;
        }

        $user->update(['role' => 'admin']);

        $this->info("Berhasil! User {$user->name} ({$email}) sekarang adalah Admin.");
    }
}
