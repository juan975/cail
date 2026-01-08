# Script para configurar secrets en Google Cloud Secret Manager
# Ejecutar una sola vez antes del primer deploy
# Requiere: gcloud CLI instalado y autenticado

param(
    [switch]$DryRun
)

$PROJECT_ID = "cail-backend-prod"

# Verificar autenticación
Write-Host "🔐 Verificando autenticación en GCP..." -ForegroundColor Cyan
$currentProject = gcloud config get-value project 2>$null
if ($currentProject -ne $PROJECT_ID) {
    Write-Host "Configurando proyecto: $PROJECT_ID" -ForegroundColor Yellow
    gcloud config set project $PROJECT_ID
}

# Lista de secrets a crear
$secrets = @{
    "FIREBASE_PROJECT_ID" = "cail-backend-prod"
    "FIREBASE_CLIENT_EMAIL" = "firebase-adminsdk-fbsvc@cail-backend-prod.iam.gserviceaccount.com"
    "JWT_SECRET" = "REEMPLAZAR_CON_TU_JWT_SECRET"
    "JWT_EXPIRES_IN" = "7d"
    "RESEND_API_KEY" = "REEMPLAZAR_CON_TU_RESEND_API_KEY"
}

# El FIREBASE_PRIVATE_KEY es especial - debe cargarse desde archivo
$privateKeySecret = "FIREBASE_PRIVATE_KEY"

Write-Host ""
Write-Host "📋 Secrets a configurar:" -ForegroundColor Cyan
$secrets.Keys | ForEach-Object { Write-Host "   - $_" }
Write-Host "   - $privateKeySecret (desde archivo)"
Write-Host ""

if ($DryRun) {
    Write-Host "🔍 Modo DryRun - No se crearán secrets" -ForegroundColor Yellow
    exit 0
}

# Habilitar Secret Manager API
Write-Host "📦 Habilitando Secret Manager API..." -ForegroundColor Cyan
gcloud services enable secretmanager.googleapis.com

# Crear cada secret
foreach ($key in $secrets.Keys) {
    $value = $secrets[$key]
    
    Write-Host "Creating secret: $key" -ForegroundColor Yellow
    
    # Verificar si existe
    $exists = gcloud secrets describe $key 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   Secret $key ya existe, actualizando versión..." -ForegroundColor Gray
        echo $value | gcloud secrets versions add $key --data-file=-
    } else {
        echo $value | gcloud secrets create $key --data-file=- --replication-policy="automatic"
    }
}

# Instrucciones para FIREBASE_PRIVATE_KEY
Write-Host ""
Write-Host "⚠️  IMPORTANTE: El secret FIREBASE_PRIVATE_KEY debe crearse manualmente:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   1. Crea el archivo private_key.txt con tu private key (sin comillas)" -ForegroundColor White
Write-Host "   2. Ejecuta:" -ForegroundColor White
Write-Host "      gcloud secrets create FIREBASE_PRIVATE_KEY --data-file=private_key.txt" -ForegroundColor Green
Write-Host ""
Write-Host "   O puedes ejecutar este comando (reemplaza la ruta):" -ForegroundColor White
Write-Host "      gcloud secrets create FIREBASE_PRIVATE_KEY --data-file=path/to/serviceAccountKey.json" -ForegroundColor Green
Write-Host ""

# Dar permisos a Cloud Build
Write-Host "🔑 Configurando permisos para Cloud Build..." -ForegroundColor Cyan
$projectNumber = gcloud projects describe $PROJECT_ID --format='value(projectNumber)'
$cloudBuildSA = "${projectNumber}@cloudbuild.gserviceaccount.com"

$secrets.Keys | ForEach-Object {
    gcloud secrets add-iam-policy-binding $_ `
        --member="serviceAccount:${cloudBuildSA}" `
        --role="roles/secretmanager.secretAccessor" 2>$null
}

Write-Host ""
Write-Host "✅ Configuración completada!" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Cyan
Write-Host "   1. Actualiza los valores de JWT_SECRET y RESEND_API_KEY con valores reales" -ForegroundColor White
Write-Host "   2. Crea el secret FIREBASE_PRIVATE_KEY" -ForegroundColor White
Write-Host "   3. Ejecuta: gcloud builds submit --config=cloudbuild.yaml" -ForegroundColor White
