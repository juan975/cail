import request from 'supertest';
import app from '../src/index';

/**
 * Tests de Seguridad - Microservicio Usuarios
 * Responsable: Erick Gaona (Test & Security)
 */
describe('Usuarios - Security Tests', () => {

    describe('Auth Bypass Prevention', () => {

        it('GET /users/profile sin token debe retornar 401', async () => {
            const response = await request(app)
                .get('/users/profile');
            
            expect(response.status).toBe(401);
            expect(response.body.message).not.toContain('stack');
        });

        it('Token malformado debe retornar 401', async () => {
            const response = await request(app)
                .get('/users/profile')
                .set('Authorization', 'Bearer invalid-token-12345');
            
            expect(response.status).toBe(401);
        });

        it('Token sin Bearer prefix debe retornar 401', async () => {
            const response = await request(app)
                .get('/users/profile')
                .set('Authorization', 'some-token');
            
            expect(response.status).toBe(401);
        });

        it('Header Authorization vacío debe retornar 401', async () => {
            const response = await request(app)
                .get('/users/profile')
                .set('Authorization', '');
            
            expect(response.status).toBe(401);
        });
    });

    describe('Input Validation', () => {

        it('Registro con email inválido debe fallar', async () => {
            const response = await request(app)
                .post('/auth/register')
                .send({
                    email: 'not-an-email',
                    password: 'TestPassword123!',
                    nombreCompleto: 'Test User',
                    tipoUsuario: 'POSTULANTE'
                });
            
            expect([400, 422]).toContain(response.status);
        });

        it('Registro con password vacío debe fallar', async () => {
            const response = await request(app)
                .post('/auth/register')
                .send({
                    email: 'test@example.com',
                    password: '',
                    nombreCompleto: 'Test User',
                    tipoUsuario: 'POSTULANTE'
                });
            
            expect([400, 422]).toContain(response.status);
        });

        it('Login con campos vacíos debe fallar', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    email: '',
                    password: ''
                });
            
            expect([400, 401, 422]).toContain(response.status);
        });
    });

    describe('Injection Prevention', () => {

        const injectionPayloads = [
            "'; DROP TABLE users; --",
            '{"$gt": ""}',
            '<script>alert("xss")</script>',
            '{{7*7}}',
        ];

        injectionPayloads.forEach(payload => {
            it(`debe manejar payload: ${payload.substring(0, 20)}...`, async () => {
                const response = await request(app)
                    .post('/auth/register')
                    .send({
                        email: payload,
                        password: 'TestPassword123!',
                        nombreCompleto: payload
                    });
                
                // No debe causar error 500 (inyección exitosa)
                expect(response.status).not.toBe(500);
            });
        });
    });

    describe('Error Handling', () => {

        it('Errores no deben exponer stack trace', async () => {
            const response = await request(app)
                .get('/users/profile')
                .set('Authorization', 'Bearer invalid');
            
            expect(response.body.stack).toBeUndefined();
            expect(JSON.stringify(response.body)).not.toContain('at ');
        });

        it('Errores no deben exponer rutas internas', async () => {
            const response = await request(app)
                .get('/nonexistent-route');
            
            expect(JSON.stringify(response.body)).not.toContain('/src/');
            expect(JSON.stringify(response.body)).not.toContain('node_modules');
        });
    });
});

