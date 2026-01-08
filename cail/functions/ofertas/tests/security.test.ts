import request from 'supertest';
import app from '../src/index';

/**
 * Tests de Seguridad - Microservicio Ofertas
 * Responsable: Erick Gaona (Test & Security)
 */
describe('Ofertas - Security Tests', () => {

    describe('Auth & Authorization', () => {

        it('POST /offers sin token debe retornar 401', async () => {
            const response = await request(app)
                .post('/offers')
                .send({
                    titulo: 'Test Offer',
                    descripcion: 'Descripción de prueba'
                });
            
            expect(response.status).toBe(401);
        });

        it('PUT /offers/:id sin token debe retornar 401', async () => {
            const response = await request(app)
                .put('/offers/test-id')
                .send({ titulo: 'Updated' });
            
            expect(response.status).toBe(401);
        });

        it('DELETE /offers/:id sin token debe retornar 401', async () => {
            const response = await request(app)
                .delete('/offers/test-id');
            
            expect(response.status).toBe(401);
        });

        it('GET /offers/my-offers sin token debe retornar 401', async () => {
            const response = await request(app)
                .get('/offers/my-offers');
            
            expect(response.status).toBe(401);
        });

        it('Token inválido debe retornar 401', async () => {
            const response = await request(app)
                .post('/offers')
                .set('Authorization', 'Bearer invalid-token')
                .send({ titulo: 'Test' });
            
            expect(response.status).toBe(401);
        });
    });

    describe('Input Validation', () => {

        it('GET /offers con limit negativo debe manejarse', async () => {
            const response = await request(app)
                .get('/offers?limit=-1');
            
            // Debe manejar el caso (ya sea ignorando o validando)
            expect([200, 400, 422]).toContain(response.status);
        });

        it('GET /offers/:id con id muy largo debe manejarse', async () => {
            const longId = 'a'.repeat(1000);
            const response = await request(app)
                .get(`/offers/${longId}`);
            
            expect([400, 404]).toContain(response.status);
        });
    });

    describe('Injection Prevention', () => {

        it('Query params con inyección NoSQL deben manejarse', async () => {
            const response = await request(app)
                .get('/offers?ciudad={"$gt":""}');
            
            // No debe causar error 500
            expect(response.status).not.toBe(500);
        });

        it('Query params con script deben manejarse', async () => {
            const response = await request(app)
                .get('/offers?ciudad=<script>alert(1)</script>');
            
            expect(response.status).not.toBe(500);
        });
    });

    describe('Error Handling', () => {

        it('Oferta inexistente debe retornar 404', async () => {
            const response = await request(app)
                .get('/offers/nonexistent_offer_id_12345');
            
            expect(response.status).toBe(404);
        });

        it('Errores no deben exponer información sensible', async () => {
            const response = await request(app)
                .post('/offers')
                .set('Authorization', 'Bearer invalid')
                .send({});
            
            expect(response.body.stack).toBeUndefined();
        });
    });

    describe('Public vs Protected Routes', () => {

        it('GET /offers (público) debe funcionar sin auth', async () => {
            const response = await request(app)
                .get('/offers');
            
            expect(response.status).toBe(200);
        });

        it('GET /offers/:id (público) debe funcionar sin auth', async () => {
            // Aunque retorne 404, no debe ser 401
            const response = await request(app)
                .get('/offers/some-id');
            
            expect(response.status).not.toBe(401);
        });
    });
});

