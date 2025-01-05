import { Router, Request, Response } from "express";
import { JWTAdapter } from "../../extends/jsonwebtoken";
import { envs } from "../../extends/envs";
import { UserController } from "../../controllers/user/controller";
import { UserAuthMiddleware } from "../../middlewares/UserAuth";

export class UserRouter {
    
    static getRoutes(): Router {
        const router = Router();
        
        router.get('/', [UserAuthMiddleware.validateJWT], UserController.getUsers);
        router.get('/profile', UserController.getProfileUser);
        router.delete('/:id', [UserAuthMiddleware.validateJWT], UserController.deleteUser);
        router.put('/:id', [UserAuthMiddleware.validateJWT], UserController.updateUser);
        
        return router;
    }

}