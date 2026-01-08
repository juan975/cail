import request from 'supertest';
import app from '../src/index';

describe('Matching Function - Integration Tests', () => {

    describe('Health Check', () => {
        it('GET /health should return healthy status', async () => {
            const response = await request(app)
                .get('/health')
                .expect(200);

            expect(response.body.status).toBe('healthy');
            expect(response.body.service).toBe('matching-function');
        });
    });

    describe('Matching Endpoints', () => {
        it('GET /matching/oferta/:id should handle missing offer', async () => {
            const response = await request(app)
                .get('/matching/oferta/nonexistent_id');

            // Should return 404 when offer doesn't exist
            expect(response.status).toBe(404);
        });

        it('POST /matching/apply without auth should return 401', async () => {
            await request(app)
                .post('/matching/apply')
                .send({ idOferta: 'test_offer_id' })
                .expect(401);
        });

        it('GET /matching/applications without auth should return 401', async () => {
            await request(app)
                .get('/matching/applications')
                .expect(401);
        });
    });
});
