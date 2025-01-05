import { Router } from "express";
import { ProductsController } from "../../controllers/products/controller";
import { UserAuthMiddleware } from "../../middlewares/UserAuth";
import { ValidatorAdapter } from "../../extends/validator";

export class ProductRouter {

    static getRoutes(): Router {
        const router = Router();

        router.post('/create', UserAuthMiddleware.validateJWT, ...ValidatorAdapter.createProduct, ProductsController.createProduct);
        router.get('/all', UserAuthMiddleware.validateJWT, ProductsController.getProducts);
        router.get('/get/:category', UserAuthMiddleware.validateJWT, ProductsController.getProductsByCategory);
        router.get('/get/:id', UserAuthMiddleware.validateJWT, ProductsController.getProduct);
        router.put('/update/:id', UserAuthMiddleware.validateJWT, ProductsController.updateProduct);
        router.delete('/delete/:id', UserAuthMiddleware.validateJWT, ProductsController.deleteProduct);
        router.get('/search/:name', UserAuthMiddleware.validateJWT, ProductsController.searchProduct);


        return router;
    }

}