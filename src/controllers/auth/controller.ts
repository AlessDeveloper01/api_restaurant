import { Request, Response } from 'express';
import { User } from '../../config/models/User';
import { RequestHandler } from 'express';
import { Bcrypt } from '../../extends/bcrypt';
import { validationResult } from 'express-validator';
import { JWTAdapter } from '../../extends/jsonwebtoken';
import { envs } from '../../extends/envs';

export class AuthController {
    static register: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
                return;
            }

            const { email, password } = req.body;
            const userExists = await User.findOne({ where: { email } });
            if (userExists) {
                res.status(400).json({
                    msg: "El correo ya está en uso"
                });
                return;
            }

            const hashedPassword = await Bcrypt.hash(password);
            req.body.password = hashedPassword;

            const user = await User.create(req.body);
            res.status(200).json({
                user,
                msg: "Usuario creado correctamente"
            });

            (req as any).io.emit('userNew', user);
        } catch (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        }
    };

    static login: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
                return;
            }

            const { email, password } = req.body;
            const user = await User.findOne({ where: { email } });
            if (!user) {
                res.status(400).json({
                    msg: "Las credenciales son incorrectas"
                });
                return;
            }

            const isValidPassword = await Bcrypt.compare(password, user.dataValues.password);
            if (!isValidPassword) {
                res.status(400).json({
                    msg: "Las credenciales son incorrectas"
                });
                return;
            }

            const jwtSecret = envs.JWT_SEED;
            if (!jwtSecret) {
                res.status(500).json({ msg: "JWT secret is not defined" });
                return;
            }
            const token = JWTAdapter.sign({ id: user.dataValues.id, name: user.dataValues.name, permissions: user.dataValues.permissions, email: user.dataValues.email }, jwtSecret, '30d');

            res.status(200).json({
                token,
                msg: "Inicio de sesión correcto"
            });
        } catch (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        }
    };

    static validate: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        try {
            const token = req.headers.authorization;
            if (!token) {
                res.status(400).json({ msg: "Token is required" });
                return;
            }

            const jwtSecret = envs.JWT_SEED;
            if (!jwtSecret) {
                res.status(500).json({ msg: "JWT secret is not defined" });
                return;
            }

            const decoded = JWTAdapter.verify(token, jwtSecret);
            res.status(200).json({
                user: decoded,
                msg: "Aun tienes acceso"
            });
        } catch (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        }
    }
}