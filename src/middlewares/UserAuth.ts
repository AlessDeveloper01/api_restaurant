import { Request, Response, NextFunction } from "express";
import { JWTAdapter } from "../extends/jsonwebtoken";
import { envs } from "../extends/envs";

export class UserAuthMiddleware {
    static validateJWT = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const authorization = req.headers.authorization;
        if(!authorization) {
            res.status(401).json({ msg: 'Unauthorized' });
            return;
        }

        const token = authorization;

        try {
            const payload = await JWTAdapter.verify(token, envs.JWT_SEED);
            if(!payload) {
                res.status(401).json({ msg: 'Invalid Token' });
                return;
            }

            req.body.user = payload;
            next();
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: 'Internal server error' });
        }

    }
}