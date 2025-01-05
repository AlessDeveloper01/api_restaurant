import { Router } from "express";
import { UserAuthMiddleware } from "../../middlewares/UserAuth";
import { OrderController } from "../../controllers/order/controller";

export class OrderRouter {
    static getRoutes(): Router {
        const router = Router();

        router.post('/create', UserAuthMiddleware.validateJWT, OrderController.createOrder);
        router.get('/get/:status', UserAuthMiddleware.validateJWT, OrderController.getOrders);
        router.get('/get-one/:id', UserAuthMiddleware.validateJWT, OrderController.getOrderById);
        router.put('/update/:id', UserAuthMiddleware.validateJWT, OrderController.updateOrder);
        router.delete('/delete/:id', UserAuthMiddleware.validateJWT, OrderController.deleteOrder);

        return router;
    }
}