import { Request, Response, NextFunction } from 'express';
import { JWTUtil } from '../utils/jwt.util';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        code: string;
        role: string;
    };
}

export class AuthMiddleware {
    static verificarToken(req: AuthRequest, res: Response, next: NextFunction): void {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            res.status(401).json({ error: 'Token no proporcionado' });
            return;
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            res.status(401).json({ error: 'Formato de token inválido' });
            return;
        }

        const decoded = JWTUtil.verifyToken(token);
        if (!decoded) {
            res.status(401).json({ error: 'Token inválido o expirado' });
            return;
        }

        req.user = decoded;
        next();
    }

    static verificarRol(rolesPermitidos: string[]) {
        return (req: AuthRequest, res: Response, next: NextFunction): void => {
            if (!req.user) {
                res.status(401).json({ error: 'No autenticado' });
                return;
            }

            if (!rolesPermitidos.includes(req.user.role)) {
                res.status(403).json({ error: 'No tienes permiso para realizar esta acción' });
                return;
            }

            next();
        };
    }
}