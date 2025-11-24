# Simple Railway Environment Variables Setup
# Read Railway config and set environment variables

$configPath = "$env:USERPROFILE\.railway\config.json"
$config = Get-Content $configPath | ConvertFrom-Json
$token = $config.user.token

Write-Host "Railway Token found!" -ForegroundColor Green
Write-Host "Setting environment variables..." -ForegroundColor Cyan

# Railway GraphQL API
$apiUrl = "https://backboard.railway.app/graphql/v2"
$projectId = "389403df-96c8-4a8c-a411-6fd64f2a4f15"

# Headers
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type"  = "application/json"
}

# Get services
$getServicesQuery = @{
    query = "query { project(id: \`"$projectId\`") { services { edges { node { id name } } } } }"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri $apiUrl -Method Post -Headers $headers -Body $getServicesQuery
$services = $response.data.project.services.edges

# Find backend service (not postgres)
$backendService = $services | Where-Object { $_.node.name -notlike "*postgres*" -and $_.node.name -notlike "*Postgres*" } | Select-Object -First 1

if (-not $backendService) {
    Write-Host "ERROR: Could not find backend service" -ForegroundColor Red
    exit 1
}

$serviceId = $backendService.node.id
$serviceName = $backendService.node.name

Write-Host "Found service: $serviceName" -ForegroundColor Green

# Environment variables to set
$envVars = @{
    "FRONTEND_URL" = "https://isbjorn-home.vercel.app"
    "NODE_ENV"     = "production"
    "PORT"         = "5000"
    # Stripe keys should be set manually via Railway dashboard or passed as parameters
    # DO NOT commit actual keys to git
}

# Set each variable
foreach ($key in $envVars.Keys) {
    $value = $envVars[$key]
    Write-Host "Setting $key..." -ForegroundColor Yellow
    
    $mutation = @{
        query = "mutation { variableUpsert(input: { projectId: \`"$projectId\`", serviceId: \`"$serviceId\`", name: \`"$key\`", value: \`"$value\`" }) { id } }"
    } | ConvertTo-Json
    
    try {
        Invoke-RestMethod -Uri $apiUrl -Method Post -Headers $headers -Body $mutation | Out-Null
        Write-Host "  ✓ Set successfully" -ForegroundColor Green
    }
    catch {
        Write-Host "  ✗ Failed: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "✓ Done! Railway will redeploy automatically." -ForegroundColor Green
