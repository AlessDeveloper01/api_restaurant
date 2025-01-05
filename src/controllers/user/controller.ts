import e, { RequestHandler, Request, Response } from "express";
import { User } from "../../config/models/User";
import { JWTAdapter } from "../../extends/jsonwebtoken";
import { envs } from "../../extends/envs";
import { Bcrypt } from "../../extends/bcrypt";

export class UserController {
    static getProfileUser: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                res.status(401).json({ msg: 'No estas autorizado' });
                return;
            }
            const decodeToken = JWTAdapter.verify(token!, envs.JWT_SEED);
            if (!decodeToken) {
                res.status(401).json({ msg: 'No estas autorizado' });
                return;
            }

            const user = await User.findOne({ where: { id: decodeToken.id } });
            if (!user) {
                res.status(404).json({ msg: 'Usuario no encontrado' });
                return;
            }

            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ msg: 'Error interno' });  
        }
    }

    static getUsers: RequestHandler = async (req: Request, res: Response): Promise<void> => {
       try {
            const users = await User.findAll();
            const newUsers = users.map(user => {
                return {
                    name: user.getDataValue('name'),
                    email: user.getDataValue('email'),
                    id: user.getDataValue('id'),
                    permissions: user.getDataValue('permissions')
                }
            });

            res.status(200).json(newUsers);
       } catch (error) {
            res.status(500).json({ msg: 'Error interno' });
       }
    }

    static deleteUser: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const { user: userProfile } = req.body;
            let authorized = false;
            if (userProfile.permissions.includes('2') || userProfile.permissions.includes('6')) {
                authorized = true;
                if(!id) {
                    res.status(400).json({ msg: 'Id es requerido' });
                    return;
                }
                const user = await User.findOne({ where: { id } });
                if (!user) {
                    res.status(404).json({ msg: 'Usuario no encontrado' });
                    return;
                }
                
                if(user.getDataValue('id') === userProfile.id) {
                    res.status(403).json({ msg: 'No puedes eliminar tu propio usuario' });
                    return;
                }

                await user.destroy();

                (req as any).io.emit('userDeleted', { id: user.getDataValue('id') });

                res.status(200).json({ msg: 'Usuario eliminado' });
                return;
            }
            if (!authorized) {
                res.status(401).json({ msg: 'No estas autorizado' });
            }
        } catch (error) {
            res.status(500).json({ msg: 'Error interno' });
        }
    }

    static updateUser: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;

        try {
            const user = await User.findOne({ where: { id } });
            if(!user) {
                res.status(404).json({ msg: 'Datos erróneos, comprueba de nuevo' });
                return;
            }

            const adminUser = await JWTAdapter.verify(req.headers.authorization!, envs.JWT_SEED);
           
            if (!adminUser.permissions.includes('2') && !adminUser.permissions.includes('6')) {
                res.status(401).json({ msg: 'No estas autorizado' });
                return;
            }

            const { name, email, password = '', permissions } = req.body;
            if (!name || !email || !permissions) {
                res.status(400).json({ msg: 'Datos incompletos' });
                return;
            }

            if (password !== user.getDataValue('password')) {
                const hashedPassword = await Bcrypt.hash(password);
                user.setDataValue('password', hashedPassword);
            }

            user.setDataValue('name', name);
            user.setDataValue('email', email);
            user.setDataValue('permissions', permissions);

            await user.save();

            res.status(200).json({ msg: 'Usuario actualizado' });

            (req as any).io.emit('userUpdated', user);
            
        } catch (error) {
            res.status(500).json({ msg: 'Error interno' });
            console.log(error);
        }

    }
}