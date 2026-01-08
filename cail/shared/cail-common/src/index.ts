/**
 * @cail/common - Librería compartida para microservicios CAIL
 * 
 * Esta librería contiene código reutilizable entre las Cloud Functions:
 * - Value Objects (Email, UserId)
 * - Middleware (Auth, Error handling)
 * - Utilidades (JWT, API Response)
 * - Tipos comunes
 */

// Domain - Value Objects
export { Email } from './domain/value-objects/Email';
export { UserId } from './domain/value-objects/UserId';

// Infrastructure - Middleware
export {
    AppError,
    errorHandler,
    asyncHandler
} from './infrastructure/middleware/error.middleware';

export {
    authenticate,
    authorize,
    AuthRequest
} from './infrastructure/middleware/auth.middleware';

// Infrastructure - Utils
export { JwtUtil, JwtPayload } from './infrastructure/utils/jwt.util';
export { ApiResponse } from './infrastructure/utils/response.util';

// Types
export * from './types';
