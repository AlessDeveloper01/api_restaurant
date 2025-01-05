import { Router } from "express";
import { AuthController } from "../../controllers/auth/controller";
import { ValidatorAdapter } from "../../extends/validator";

export class AuthRouter {
    static getRoutes(): Router {
        const router = Router();

        router.post('/register', ValidatorAdapter.register, AuthController.register);
        router.post('/login', ValidatorAdapter.login, AuthController.login);
        router.post('/validate', ValidatorAdapter.validate, AuthController.validate);

        return router;
    }
}