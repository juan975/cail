# ETL Preprocessing Service

Servicio de preprocesamiento de texto para el sistema de matching CAIL.

## Descripción

Este servicio preprocesa texto de candidatos y ofertas laborales antes de enviarlos a Vertex AI para generar embeddings. El preprocesamiento mejora la calidad de los embeddings al:

- Normalizar texto (minúsculas, acentos, whitespace)
- Limpiar HTML y caracteres especiales
- Mapear aliases de skills a nombres estándar
- Agregar contexto semántico a las habilidades

## Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/preprocess/candidate` | Preprocesa datos de candidato |
| POST | `/preprocess/offer` | Preprocesa datos de oferta |

## Despliegue

```bash
./deploy.sh cail-backend-prod
```

## Ejemplo de uso

```bash
curl -X POST https://us-central1-cail-backend-prod.cloudfunctions.net/etl/preprocess/candidate \
  -H "Content-Type: application/json" \
  -d '{
    "habilidadesTecnicas": ["React", "Node.js"],
    "softSkills": ["Trabajo en equipo"],
    "resumenProfesional": "Desarrollador con 5 años de experiencia"
  }'
```

## Desarrollo local

```bash
pip install -r requirements.txt
functions-framework --target=etl --debug
```
