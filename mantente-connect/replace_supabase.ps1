$files = @(
    'src\App.jsx',
    'src\store\dataStore.js'
)

$log = @()
$log += "Script started at $(Get-Date)"

foreach ($file in $files) {
    $log += "Processing: $file"
    try {
        if (-not (Test-Path $file)) {
            $log += "  ERROR: File not found"
            continue
        }
        
        $content = Get-Content $file -Raw
        $log += "  Read $(($content | Measure-Object -Character).Characters) characters"
        
        $content = $content -replace 'loadDataFromSupabase', 'loadDataFromPocketBase'
        $content = $content -replace 'loadSupabaseData', 'loadPocketbaseData'
        $content = $content -replace 'de Supabase', 'de PocketBase'
        $content = $content -replace 'Obtener datos de Supabase', 'Obtener datos de PocketBase'
        
        Set-Content -Path $file -Value $content -Encoding UTF8
        $log += "  Updated successfully"
    } catch {
        $log += "  ERROR: $_"
    }
}

$log | Out-File -FilePath "replace_log.txt" -Encoding UTF8
$log
