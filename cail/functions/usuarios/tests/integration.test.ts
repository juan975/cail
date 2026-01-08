import request from 'supertest';
import app from '../src/index';

describe('Usuarios Function - Integration Tests', () => {

    describe('Health Check', () => {
        it('GET /health should return healthy status', async () => {
            const response = await request(app)
                .get('/health')
                .expect(200);

            expect(response.body.status).toBe('healthy');
            expect(response.body.service).toBe('usuarios-function');
        });
    });

    describe('Auth Endpoints', () => {
        const testUser = {
            email: `test_${Date.now()}@example.com`,
            password: 'TestPassword123!',
            nombreCompleto: 'Test User',
            tipoUsuario: 'POSTULANTE',
            candidateData: {
                cedula: '1234567890',
                ciudad: 'Quito'
            }
        };

        let authToken: string;

        it('POST /auth/register should create a new user', async () => {
            const response = await request(app)
                .post('/auth/register')
                .send(testUser)
                .expect(201);

            expect(response.body.status).toBe('success');
            expect(response.body.data.email).toBe(testUser.email);
            expect(response.body.data.token).toBeDefined();
        });

        it('POST /auth/login should authenticate user', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                })
                .expect(200);

            expect(response.body.status).toBe('success');
            expect(response.body.data.token).toBeDefined();
            authToken = response.body.data.token;
        });

        it('POST /auth/login should reject invalid credentials', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    email: testUser.email,
                    password: 'wrongpassword'
                })
                .expect(401);

            expect(response.body.status).toBe('error');
        });
    });

    describe('User Profile Endpoints', () => {
        let authToken: string;
        const testUser = {
            email: `profile_test_${Date.now()}@example.com`,
            password: 'TestPassword123!',
            nombreCompleto: 'Profile Test User',
            tipoUsuario: 'POSTULANTE'
        };

        beforeAll(async () => {
            // Register and login to get token
            await request(app)
                .post('/auth/register')
                .send(testUser);

            const loginResponse = await request(app)
                .post('/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            authToken = loginResponse.body.data.token;
        });

        it('GET /users/profile should return user profile', async () => {
            const response = await request(app)
                .get('/users/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.status).toBe('success');
            expect(response.body.data.email).toBe(testUser.email);
        });

        it('GET /users/profile should reject without token', async () => {
            await request(app)
                .get('/users/profile')
                .expect(401);
        });

        it('PUT /users/profile should update profile', async () => {
            const response = await request(app)
                .put('/users/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    nombreCompleto: 'Updated Name',
                    telefono: '0991234567'
                })
                .expect(200);

            expect(response.body.status).toBe('success');
            expect(response.body.data.nombreCompleto).toBe('Updated Name');
        });
    });
});
