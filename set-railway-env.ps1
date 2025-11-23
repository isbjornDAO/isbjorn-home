# Railway Environment Variables Setup Script
# This script uses Railway's GraphQL API to set environment variables

# First, we need to get your Railway API token
# You can get it from: https://railway.app/account/tokens

$RAILWAY_TOKEN = $env:RAILWAY_TOKEN

if (-not $RAILWAY_TOKEN) {
    Write-Host "ERROR: RAILWAY_TOKEN environment variable not set" -ForegroundColor Red
    Write-Host ""
    Write-Host "To get your Railway API token:" -ForegroundColor Yellow
    Write-Host "1. Go to https://railway.app/account/tokens"
    Write-Host "2. Click 'Create New Token'"
    Write-Host "3. Copy the token"
    Write-Host "4. Run: `$env:RAILWAY_TOKEN='your-token-here'"
    Write-Host "5. Then run this script again"
    exit 1
}

# Railway GraphQL API endpoint
$API_URL = "https://backboard.railway.app/graphql/v2"

# Project ID (from your Railway URL)
$PROJECT_ID = "389403df-96c8-4a8c-a411-6fd64f2a4f15"

# Environment variables to set
$ENV_VARS = @{
    "FRONTEND_URL" = "https://isbjorn-home.vercel.app"
    "NODE_ENV" = "production"
    "PORT" = "5000"
}

Write-Host "Setting Railway environment variables..." -ForegroundColor Cyan

# First, get the service ID
$query = @"
{
  "query": "query { project(id: \"$PROJECT_ID\") { services { edges { node { id name } } } } }"
}
"@

try {
    $headers = @{
        "Authorization" = "Bearer $RAILWAY_TOKEN"
        "Content-Type" = "application/json"
    }
    
    $response = Invoke-RestMethod -Uri $API_URL -Method Post -Headers $headers -Body $query
    
    # Find the backend service (not Postgres)
    $services = $response.data.project.services.edges
    $backendService = $services | Where-Object { $_.node.name -notlike "*postgres*" } | Select-Object -First 1
    
    if (-not $backendService) {
        Write-Host "ERROR: Could not find backend service" -ForegroundColor Red
        exit 1
    }
    
    $SERVICE_ID = $backendService.node.id
    $SERVICE_NAME = $backendService.node.name
    
    Write-Host "Found service: $SERVICE_NAME (ID: $SERVICE_ID)" -ForegroundColor Green
    
    # Set each environment variable
    foreach ($key in $ENV_VARS.Keys) {
        $value = $ENV_VARS[$key]
        Write-Host "Setting $key = $value..." -ForegroundColor Yellow
        
        $mutation = @"
{
  "query": "mutation { variableUpsert(input: { projectId: \"$PROJECT_ID\", serviceId: \"$SERVICE_ID\", name: \"$key\", value: \"$value\" }) { id } }"
}
"@
        
        $result = Invoke-RestMethod -Uri $API_URL -Method Post -Headers $headers -Body $mutation
        
        if ($result.data.variableUpsert) {
            Write-Host "  ✓ Set successfully" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Failed to set" -ForegroundColor Red
            Write-Host "  Error: $($result.errors)" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "✓ All environment variables set!" -ForegroundColor Green
    Write-Host "Railway will automatically redeploy the service." -ForegroundColor Cyan
    Write-Host "Wait ~2 minutes for the redeploy to complete." -ForegroundColor Cyan
    
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Full error: $_" -ForegroundColor Red
}
