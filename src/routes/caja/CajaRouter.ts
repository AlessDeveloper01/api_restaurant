import { Router } from "express";
import { UserAuthMiddleware } from "../../middlewares/UserAuth";
import { CajaController } from "../../controllers/caja/controller";

export class CajaRouter {
    static getRoutes(): Router {
        const router = Router();

        router.post("/close", UserAuthMiddleware.validateJWT, CajaController.closeBox);
        router.get("/list", UserAuthMiddleware.validateJWT, CajaController.getBoxes);
        router.get("/resume/:id", UserAuthMiddleware.validateJWT, CajaController.getBoxById);

        return router;
    }
}