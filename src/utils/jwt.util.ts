import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();
export class JWTUtil {
	private static secret: string = process.env.JWT_SECRET!;
	private static expiresIn: string = process.env.JWT_EXPIRES_IN || "7d";

	static generateToken(payload: {
		id: string;
		code: string;
		role: string;
		shiftId: string | null;
	}): string {
		return jwt.sign(payload, JWTUtil.secret, {
			expiresIn: JWTUtil.expiresIn,
		} as any);
	}

	static verifyToken(token: string): any {
		try {
			return jwt.verify(token, JWTUtil.secret);
		} catch (_error) {
			return null;
		}
	}
}
