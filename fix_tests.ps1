$p = 'tests\integration\ai-service.test.ts'
if (Test-Path $p) {
    $c = Get-Content -Raw -Path $p
    $c = $c -replace 'policyNumber', 'policeNumarasi'
    $c = $c -replace 'insuranceCompany', 'sigortaSirketi'
    $c = $c -replace 'startDate', 'baslangicTarihi'
    $c = $c -replace 'endDate', 'bitisTarihi'
    $c = $c -replace 'premium:', 'primBilgileri:'
    $c = $c -replace 'totalPremium', 'toplamPrim'
    $c = $c -replace 'netPremium', 'netPrim'
    $c = $c -replace 'policyType', 'policeTipi'
    $c = $c -replace 'coverages', 'teminatlar'
    $c = $c -replace 'currency', 'paraBirimi'
    $c = $c -replace 'paymentType: "cash"', 'odemeTipi: "pesin"'
    $c = $c -replace 'modelUsed:', '// modelUsed:'
    $c = $c -replace 'netPrim: 1200,', 'netPrim: 1200, bsmv: 0, thgf: 0,'
    $c = $c -replace 'netPrim: 2000,', 'netPrim: 2000, bsmv: 0, thgf: 0,'
    $c = $c -replace 'paraBirimi: "TRY"', 'paraBirimi: "TRY", bsmv: 0, thgf: 0'
    Set-Content -Path $p -Value $c
}

$p2 = 'tests\integration\api-policies-upload.test.ts'
if (Test-Path $p2) {
    $c2 = Get-Content -Raw -Path $p2
    $c2 = $c2 -replace 'resolve\(\{ policeTipi: "kasko", guvenScore: 0.95, modelUsed: "test-model" \}\)', 'resolve({ policeTipi: "kasko", guvenScore: 0.95, modelUsed: "test-model" } as any)'
    Set-Content -Path $p2 -Value $c2
}
