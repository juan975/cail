import functions_framework
from flask import jsonify, request
import time
from preprocessing.pipeline import PreprocessingPipeline

# Inicializar pipeline
pipeline = PreprocessingPipeline()

@functions_framework.http
def etl(request):
    """
    Cloud Function entry point para el servicio ETL.
    Preprocesa texto de candidatos y ofertas antes de vectorización.
    """
    path = request.path
    method = request.method
    
    # Health check
    if method == 'GET' and (path == '/health' or path == '/' or path == ''):
        return jsonify({
            "status": "ok",
            "service": "etl-preprocessing",
            "version": "1.0.0"
        })
    
    # Solo POST para preprocessing
    if method != 'POST':
        return jsonify({"error": "Method not allowed"}), 405
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
        
        start_time = time.time()
        
        # Rutas de preprocesamiento
        if '/candidate' in path or path == '/preprocess/candidate':
            result = pipeline.process_candidate(data)
        elif '/offer' in path or path == '/preprocess/offer':
            result = pipeline.process_offer(data)
        else:
            return jsonify({"error": f"Unknown endpoint: {path}"}), 404
        
        processing_time = round((time.time() - start_time) * 1000, 2)
        result['processingTimeMs'] = processing_time
        
        return jsonify({
            "success": True,
            "data": result
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
