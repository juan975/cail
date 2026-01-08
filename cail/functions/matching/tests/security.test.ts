import request from 'supertest';
import app from '../src/index';

/**
 * Tests de Seguridad - Microservicio Matching
 * Responsable: Erick Gaona (Test & Security)
 */
describe('Matching - Security Tests', () => {

    describe('Auth Protection', () => {

        it('POST /matching/apply sin token debe retornar 401', async () => {
            const response = await request(app)
                .post('/matching/apply')
                .send({ idOferta: 'test-offer-id' });
            
            expect(response.status).toBe(401);
        });

        it('GET /matching/applications sin token debe retornar 401', async () => {
            const response = await request(app)
                .get('/matching/applications');
            
            expect(response.status).toBe(401);
        });

        it('GET /matching/my-applications sin token debe retornar 401', async () => {
            const response = await request(app)
                .get('/matching/my-applications');
            
            expect(response.status).toBe(401);
        });

        it('Token inválido debe retornar 401', async () => {
            const response = await request(app)
                .post('/matching/apply')
                .set('Authorization', 'Bearer invalid-token-here')
                .send({ idOferta: 'test' });
            
            expect(response.status).toBe(401);
        });

        it('Token expirado formato debe retornar 401', async () => {
            // Token con formato válido pero expirado
            const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIxMjMiLCJleHAiOjE1MDAwMDAwMDB9.xxx';
            const response = await request(app)
                .post('/matching/apply')
                .set('Authorization', `Bearer ${expiredToken}`)
                .send({ idOferta: 'test' });
            
            expect(response.status).toBe(401);
        });
    });

    describe('Input Validation', () => {

        it('POST /matching/apply sin idOferta debe manejarse', async () => {
            const response = await request(app)
                .post('/matching/apply')
                .send({});
            
            // Debe ser error de auth o validación, no 500
            expect([400, 401, 422]).toContain(response.status);
        });

        it('GET /matching/oferta/:id con id vacío debe manejarse', async () => {
            const response = await request(app)
                .get('/matching/oferta/');
            
            // Puede ser 404 por ruta no encontrada
            expect(response.status).not.toBe(500);
        });
    });

    describe('Injection Prevention', () => {

        it('idOferta con inyección NoSQL debe manejarse', async () => {
            const response = await request(app)
                .post('/matching/apply')
                .send({ idOferta: '{"$gt":""}' });
            
            // Sin auth será 401, pero no debe ser 500
            expect(response.status).not.toBe(500);
        });

        it('Parámetros con caracteres especiales deben manejarse', async () => {
            const response = await request(app)
                .get('/matching/oferta/<script>alert(1)</script>');
            
            expect(response.status).not.toBe(500);
        });
    });

    describe('Error Handling', () => {

        it('Errores no deben exponer stack trace', async () => {
            const response = await request(app)
                .post('/matching/apply')
                .set('Authorization', 'Bearer invalid')
                .send({});
            
            expect(response.body.stack).toBeUndefined();
            expect(JSON.stringify(response.body)).not.toContain('Error:');
        });

        it('Oferta inexistente debe retornar 404', async () => {
            const response = await request(app)
                .get('/matching/oferta/nonexistent_id_12345');
            
            expect(response.status).toBe(404);
        });
    });
});

