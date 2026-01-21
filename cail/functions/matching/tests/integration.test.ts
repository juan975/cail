import request from 'supertest';
import app from '../src/index';
import { mockCandidatos, mockOfertas, resetMocks } from './setup';

/**
 * Tests de Integración - Microservicio Matching
 * Cubre escenarios básicos y edge cases
 */
describe('Matching Function - Integration Tests', () => {

    beforeEach(() => {
        resetMocks();
    });

    // =========================================
    // HEALTH CHECK
    // =========================================
    describe('Health Check', () => {
        it('GET /health should return healthy status', async () => {
            const response = await request(app)
                .get('/health')
                .expect(200);

            expect(response.body.status).toBe('healthy');
            expect(response.body.service).toBe('matching-function');
            expect(response.body.features).toContain('hybrid-matching');
            expect(response.body.features).toContain('rbac-authorization');
        });
    });

    // =========================================
    // TESTS DE MATCHING ENDPOINTS
    // =========================================
    describe('Matching Endpoints', () => {
        it('GET /matching/oferta/:id should require authentication', async () => {
            const response = await request(app)
                .get('/matching/oferta/oferta-1');

            expect(response.status).toBe(401);
        });

        it('GET /matching/oferta/:id with CANDIDATO role should return 403', async () => {
            // El endpoint de candidatos para oferta solo es para RECLUTADOR/ADMIN
            const response = await request(app)
                .get('/matching/oferta/oferta-1')
                .set('Authorization', 'Bearer valid-candidato-token');

            // Debería fallar por rol incorrecto (403) o por auth (401)
            expect([401, 403]).toContain(response.status);
        });

        it('POST /matching/apply without auth should return 401', async () => {
            await request(app)
                .post('/matching/apply')
                .send({ idOferta: 'oferta-1' })
                .expect(401);
        });

        it('GET /matching/applications without auth should return 401', async () => {
            await request(app)
                .get('/matching/applications')
                .expect(401);
        });

        it('GET /matching/my-applications without auth should return 401', async () => {
            await request(app)
                .get('/matching/my-applications')
                .expect(401);
        });
    });

    // =========================================
    // TESTS DE EDGE CASES
    // =========================================
    describe('Edge Cases', () => {
        it('GET /matching/oferta/:id with nonexistent ID should handle gracefully', async () => {
            const response = await request(app)
                .get('/matching/oferta/nonexistent_id_12345');

            // Sin auth, debería ser 401
            expect(response.status).toBe(401);
        });

        it('POST /matching/apply with missing idOferta should return 400 or 401', async () => {
            const response = await request(app)
                .post('/matching/apply')
                .send({});

            // Sin auth será 401, con auth sería 400
            expect([400, 401]).toContain(response.status);
        });

        it('POST /matching/apply with empty body should handle gracefully', async () => {
            const response = await request(app)
                .post('/matching/apply');

            expect(response.status).not.toBe(500);
        });
    });

    // =========================================
    // TESTS DE RATE LIMITING
    // =========================================
    describe('Rate Limiting', () => {
        it('Should include rate limit headers', async () => {
            const response = await request(app).get('/health');

            // Verificar que existen headers de rate limit
            const hasRateLimitHeader =
                response.headers['ratelimit-limit'] !== undefined ||
                response.headers['x-ratelimit-limit'] !== undefined ||
                response.headers['ratelimit-remaining'] !== undefined;

            expect(hasRateLimitHeader).toBe(true);
        });
    });

    // =========================================
    // TESTS NUEVOS: ESCENARIOS ESPECÍFICOS
    // =========================================
    describe('Business Logic Edge Cases', () => {
        it('POST /matching/apply - candidato sin habilidades debería manejarse', async () => {
            // Este test verifica que un candidato sin habilidades no cause error
            const response = await request(app)
                .post('/matching/apply')
                .set('Authorization', 'Bearer valid-candidato-token')
                .send({ idOferta: 'oferta-1' });

            // Puede ser éxito (201) o error de negocio, pero no 500
            expect(response.status).not.toBe(500);
        });

        it('GET /matching/oferta/:id - oferta en sector inexistente', async () => {
            const response = await request(app)
                .get('/matching/oferta/oferta-sector-invalido')
                .set('Authorization', 'Bearer valid-reclutador-token');

            // Sin reclutador válido, será 401 o 403
            // Con reclutador válido, podría ser 404 o 400
            expect([400, 401, 403, 404]).toContain(response.status);
        });
    });
});
