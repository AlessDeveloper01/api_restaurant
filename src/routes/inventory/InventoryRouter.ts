import { Router } from "express";
import { UserAuthMiddleware } from "../../middlewares/UserAuth";
import { InventoryController } from "../../controllers/inventory/controller";

export class InventoryRouter {
    static getRoutes(): Router {
        const router = Router();

        router.post('/create', UserAuthMiddleware.validateJWT, InventoryController.createInventoryProduct);
        router.get('/all', UserAuthMiddleware.validateJWT, InventoryController.getAllProducts);
        router.delete('/:id', UserAuthMiddleware.validateJWT, InventoryController.deleteProduct);
        router.put('/:id', UserAuthMiddleware.validateJWT, InventoryController.updateProduct);
        router.get('/ingredients', UserAuthMiddleware.validateJWT, InventoryController.getIngredients);
        router.get('/:id', UserAuthMiddleware.validateJWT, InventoryController.getIngredient);
        router.get('/search/:name', UserAuthMiddleware.validateJWT, InventoryController.searchProduct);

        return router;
    }
}