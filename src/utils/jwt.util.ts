import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()
export class JWTUtil{
    private static secret: string = process.env.JWT_SECRET!;
    private static expiresIn: string = process.env.JWT_EXPIRES_IN || '7d';

    static generateToken(payload: {id:string, code:string, role: string}): string{
        return jwt.sign(payload, this.secret, {expiresIn: this.expiresIn} as any)
    }

    static verifyToken(token: string) : any{
        try {
            return jwt.verify(token, this.secret)
        } catch (error) {
            return null;
        }
    }
}