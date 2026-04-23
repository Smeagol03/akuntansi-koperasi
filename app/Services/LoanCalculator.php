<?php

namespace App\Services;

/**
 * Pusat perhitungan finansial pinjaman.
 * Semua kalkulasi angsuran dilakukan di sini agar konsisten.
 */
class LoanCalculator
{
    /**
     * Hitung angsuran bulanan dan rinciannya.
     */
    public static function calculate(float $principal, float $ratePercent, int $term, string $method): array
    {
        if ($method === 'flat') {
            return self::calculateFlat($principal, $ratePercent, $term);
        }

        return self::calculateEffective($principal, $ratePercent, $term);
    }

    public static function calculateFlat(float $principal, float $ratePercent, int $term): array
    {
        $monthlyPrincipal = $principal / $term;
        $monthlyInterest = $principal * ($ratePercent / 100);
        $monthlyTotal = $monthlyPrincipal + $monthlyInterest;

        return [
            'monthly_total' => (int) round($monthlyTotal),
            'monthly_principal' => (int) round($monthlyPrincipal),
            'monthly_interest' => (int) round($monthlyInterest),
        ];
    }

    public static function calculateEffective(float $principal, float $ratePercent, int $term): array
    {
        $i = $ratePercent / 100;

        if ($i == 0) {
            $monthly = (int) round($principal / $term);
            return [
                'monthly_total' => $monthly,
                'monthly_principal' => $monthly,
                'monthly_interest' => 0,
            ];
        }

        $annuity = $principal * ($i * pow(1 + $i, $term)) / (pow(1 + $i, $term) - 1);

        $firstMonthInterest = $principal * $i;
        $firstMonthPrincipal = $annuity - $firstMonthInterest;

        return [
            'monthly_total' => (int) round($annuity),
            'monthly_principal' => (int) round($firstMonthPrincipal),
            'monthly_interest' => (int) round($firstMonthInterest),
        ];
    }

    public static function generateScheduleRows(
        float $principal,
        float $ratePercent,
        int $term,
        int $monthlyInstallment,
        string $method,
        string $startDate
    ): array {
        $rows = [];
        $remainingPrincipal = $principal;
        $accumulatedPrincipal = 0;
        $rate = $ratePercent / 100;

        for ($n = 1; $n <= $term; $n++) {
            $dueDate = date('Y-m-d', strtotime("$startDate +$n month"));

            if ($n === $term) {
                // BARIS TERAKHIR: Lakukan Adjustment agar sisa pokok benar-benar 0
                $principalAmount = $principal - $accumulatedPrincipal;
                $interestAmount = ($method === 'flat') ? (int) round($principal * $rate) : (int) round($remainingPrincipal * $rate);
                $totalDue = $principalAmount + $interestAmount;
            } else {
                if ($method === 'flat') {
                    $interestAmount = (int) round($principal * $rate);
                    $principalAmount = (int) round($principal / $term);
                    $totalDue = $principalAmount + $interestAmount;
                } else {
                    $interestAmount = (int) round($remainingPrincipal * $rate);
                    $principalAmount = $monthlyInstallment - $interestAmount;
                    $totalDue = $monthlyInstallment;
                }
            }

            $rows[] = [
                'installment_number' => $n,
                'due_date' => $dueDate,
                'principal_amount' => $principalAmount,
                'interest_amount' => $interestAmount,
                'total_due' => $totalDue,
            ];

            $accumulatedPrincipal += $principalAmount;
            $remainingPrincipal -= $principalAmount;
        }

        return $rows;
    }
}
