import request from 'supertest';
import app from '../src/index';

describe('Ofertas Function - Integration Tests', () => {

    describe('Health Check', () => {
        it('GET /health should return healthy status', async () => {
            const response = await request(app)
                .get('/health')
                .expect(200);

            expect(response.body.status).toBe('healthy');
            expect(response.body.service).toBe('ofertas-function');
        });
    });

    describe('Offers Endpoints', () => {
        it('GET /offers should return list of offers', async () => {
            const response = await request(app)
                .get('/offers')
                .expect(200);

            expect(response.body.status).toBe('success');
            expect(Array.isArray(response.body.data)).toBe(true);
        });

        it('GET /offers with filters should work', async () => {
            const response = await request(app)
                .get('/offers?estado=ACTIVA&ciudad=Quito')
                .expect(200);

            expect(response.body.status).toBe('success');
        });

        it('GET /offers/:id with invalid id should return 404', async () => {
            const response = await request(app)
                .get('/offers/nonexistent_id')
                .expect(404);

            expect(response.body.status).toBe('error');
        });

        it('POST /offers without auth should return 401', async () => {
            await request(app)
                .post('/offers')
                .send({
                    titulo: 'Test Offer',
                    descripcion: 'Test Description'
                })
                .expect(401);
        });
    });
});
