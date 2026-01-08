# Script para deploy manual de las Cloud Functions
# Proyecto: cail-backend-prod
# Región: us-central1

param(
    [Parameter()]
    [ValidateSet("usuarios", "ofertas", "matching", "all")]
    [string]$Function = "all"
)

$PROJECT_ID = "cail-backend-prod"
$REGION = "us-central1"

Write-Host "🚀 Deploy de Microservicios CAIL" -ForegroundColor Cyan
gcloud config set project $PROJECT_ID

function Deploy-Function {
    param($name, $port)
    
    Write-Host "📦 Desplegando función: $name" -ForegroundColor Yellow
    $sourcePath = "functions/$name"
    
    # Build
    Write-Host "   Building..." -ForegroundColor Gray
    Push-Location $sourcePath
    npm run build
    Pop-Location
    
    # Deploy
    Write-Host "   Deploying to Cloud Functions..." -ForegroundColor Gray
    $secrets = "FIREBASE_PROJECT_ID=FIREBASE_PROJECT_ID:latest,FIREBASE_CLIENT_EMAIL=FIREBASE_CLIENT_EMAIL:latest,FIREBASE_PRIVATE_KEY=FIREBASE_PRIVATE_KEY:latest,JWT_SECRET=JWT_SECRET:latest"
    
    gcloud functions deploy $name --gen2 --runtime=nodejs20 --region=$REGION --source=$sourcePath --entry-point=$name --trigger-http --allow-unauthenticated --memory=256MB --timeout=60s --set-env-vars="NODE_ENV=production,PORT=$port" --set-secrets=$secrets
    
    if ($name -eq "usuarios") {
        Write-Host "   Updating Resend API Key..." -ForegroundColor Gray
        gcloud functions deploy $name --update-secrets="RESEND_API_KEY=RESEND_API_KEY:latest" --region=$REGION
    }
    
    $url = gcloud functions describe $name --region=$REGION --format='value(serviceConfig.uri)'
    Write-Host "   ✅ Desplegado: $url" -ForegroundColor Green
}

# Build shared library
Write-Host "📚 Building librería compartida..." -ForegroundColor Cyan
Push-Location "shared/cail-common"
npm ci
npm run build
Pop-Location

# Deploy logic
if ($Function -eq "all") {
    Deploy-Function "usuarios" 8080
    Deploy-Function "ofertas" 8083
    Deploy-Function "matching" 8084
} else {
    if ($Function -eq "usuarios") { Deploy-Function "usuarios" 8080 }
    if ($Function -eq "ofertas") { Deploy-Function "ofertas" 8083 }
    if ($Function -eq "matching") { Deploy-Function "matching" 8084 }
}

Write-Host "✅ Proceso terminado" -ForegroundColor Green
