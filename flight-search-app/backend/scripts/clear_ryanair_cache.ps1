$Host = $args[0]
$Prefix = $args[1]
$AdminToken = $env:CACHE_ADMIN_SECRET

if (-not $Host) { $Host = 'http://localhost:8000' }
if (-not $Prefix) { $Prefix = 'ryanair_' }
if (-not $AdminToken) { $AdminToken = 'dev-secret' }

$uri = "$Host/api/cache/prefix/$Prefix"
Write-Host "Sending DELETE to $uri with admin token..."
try {
  $resp = Invoke-RestMethod -Uri $uri -Method DELETE -Headers @{ 'X-Admin-Secret' = $AdminToken }
  Write-Host "Deleted: $($resp.deleted_count) entries" -ForegroundColor Green
} catch {
  Write-Host "Error deleting cache: $_" -ForegroundColor Red
  exit 1
}

Write-Host "Done"
