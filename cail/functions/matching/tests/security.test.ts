import request from 'supertest';
import app from '../src/index';

/**
 * Tests de Seguridad - Microservicio Matching
 * Responsable: Erick Gaona (Test & Security)
 * Actualizado: 15/01/2026 - Actualizado para reflejar RBAC
 */
describe('Matching - Security Tests', () => {

    // =========================================
    // TESTS DE HELMET (Security Headers)
    // =========================================
    describe('Security Headers (Helmet)', () => {

        it('Debe incluir X-Content-Type-Options: nosniff', async () => {
            const response = await request(app).get('/health');
            expect(response.headers['x-content-type-options']).toBe('nosniff');
        });

        it('Debe incluir Content-Security-Policy', async () => {
            const response = await request(app).get('/health');
            expect(response.headers['content-security-policy']).toBeDefined();
        });

        it('NO debe exponer X-Powered-By', async () => {
            const response = await request(app).get('/health');
            expect(response.headers['x-powered-by']).toBeUndefined();
        });
    });

    // =========================================
    // TESTS DE RATE LIMITING
    // =========================================
    describe('Rate Limiting', () => {

        it('Debe incluir headers de Rate Limit', async () => {
            const response = await request(app).get('/health');
            expect(response.headers['ratelimit-limit'] || response.headers['x-ratelimit-limit']).toBeDefined();
        });
    });

    // =========================================
    // TESTS DE AUTH PROTECTION
    // =========================================
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

        it('GET /matching/oferta/:id sin token debe retornar 401', async () => {
            const response = await request(app)
                .get('/matching/oferta/test-offer-id');

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

        it('Ruta inexistente debe retornar 404', async () => {
            const response = await request(app)
                .get('/matching/nonexistent-route');

            expect(response.status).toBe(404);
        });
    });

    // =========================================
    // TESTS DE RBAC (Nuevos)
    // =========================================
    describe('RBAC - Role Based Access Control', () => {

        it('Todas las rutas de matching requieren autenticación', async () => {
            const routes = [
                { method: 'get', path: '/matching/oferta/test-id' },
                { method: 'get', path: '/matching/oferta/test-id/applications' },
                { method: 'post', path: '/matching/apply' },
                { method: 'get', path: '/matching/my-applications' },
                { method: 'get', path: '/matching/applications' }
            ];

            for (const route of routes) {
                const response = route.method === 'get'
                    ? await request(app).get(route.path)
                    : await request(app).post(route.path).send({});

                expect(response.status).toBe(401);
            }
        });
    });
});
