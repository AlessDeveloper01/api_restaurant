import { Router } from "express";
import { CategoryController } from "../../controllers/categories/controller";
import { UserAuthMiddleware } from "../../middlewares/UserAuth";

export class CategoryRouter {

    static getRoutes(): Router {

        const router = Router();

        router.post('/create', UserAuthMiddleware.validateJWT, CategoryController.createCategory);
        router.get('/get', UserAuthMiddleware.validateJWT, CategoryController.getCategories);
        router.get('/get/:id', UserAuthMiddleware.validateJWT, CategoryController.getCategory);
        router.put('/update/:id', UserAuthMiddleware.validateJWT, CategoryController.updateCategory);
        router.delete('/delete/:id', UserAuthMiddleware.validateJWT, CategoryController.deleteCategory);

        return router;

    }

}