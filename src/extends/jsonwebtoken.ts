import Jwt from 'jsonwebtoken';

export class JWTAdapter {

    static sign(payload: any, secret: string, expiresIn: string): string {
        return Jwt.sign(payload, secret, { expiresIn });
    }

    static verify(token: string, secret: string): any {
        return Jwt.verify(token, secret);
    }
}