@echo off
REM Script para configurar entorno virtual del ETL Service
REM Ejecutar desde el directorio etl-service

echo 🚀 Configurando entorno virtual para ETL Service...

REM Crear entorno virtual
python -m venv venv
if errorlevel 1 (
    echo ❌ Error creando entorno virtual
    exit /b 1
)

REM Activar entorno virtual
call venv\Scripts\activate

REM Actualizar pip
python -m pip install --upgrade pip

REM Instalar dependencias
pip install -r requirements.txt
if errorlevel 1 (
    echo ❌ Error instalando dependencias
    exit /b 1
)

REM Descargar modelo de spaCy para español
python -m spacy download es_core_news_sm
if errorlevel 1 (
    echo ❌ Error descargando modelo de spaCy
    exit /b 1
)

echo ✅ Entorno virtual configurado correctamente
echo.
echo Para activar el entorno: venv\Scripts\activate
echo Para probar localmente: functions-framework --target=etl --debug
