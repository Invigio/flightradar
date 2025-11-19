Clear Ryanair Cache Script
=========================

This folder contains a PowerShell script to clear backend cache entries for debugging/development purposes.

Usage:

1) Set the admin token (recommended to keep it in environment variable for security):

PowerShell:
```powershell
$env:CACHE_ADMIN_SECRET = 'dev-secret' # set to a secret in production
```

2) Run the script (defaults to localhost:8000 and prefix "ryanair_"):
```powershell
./clear_ryanair_cache.ps1
```

3) Alternatively pass parameters:
```powershell
./clear_ryanair_cache.ps1 'http://localhost:8000' 'ryanair_flight_cache_'
```

The script calls DELETE `/api/cache/prefix/{prefix}` with the header `X-Admin-Secret`.

Notes:
- Endpoint is protected by header `X-Admin-Secret` set to `CACHE_ADMIN_SECRET` in environment or `dev-secret` default.
- Use only for development and debugging.
