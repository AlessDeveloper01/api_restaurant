import { RequestHandler, Request, Response } from "express";
import Box from "../../config/models/Box";
import { BoxProduct } from "../../config/models/Box";
import { Product } from "../../config/models/Product";
import { Order, OrderProducts } from "../../config/models/Product";
import { Ingredients } from "../../config/models/Product";
import { Op } from "sequelize";

export class CajaController {
    static closeBox: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        try {
            const { name } = req.body.user;
            const orders = await Order.findAll({
                include: [{
                    model: OrderProducts,
                    as: 'orderProducts',
                    include: [{
                        model: Product,
                        as: 'product'
                    }]
                }]
            });

            /*
            date: "2025-01-04T21:08:24.921Z"
            id: 5
            mesero: "AdministradorLowSolutions"
            orderProducts: [
                {
                    id: 16
                    orderId: 5
                    product: {
                        category: 7
                        id: 8
                        ingredients: [11]
                        name: "Pescado a la diabla"
                        price: 99
                        status: true
                    }
                    productId: 8 
                    quantity: 5
                }
            ]
            orderReadyAt: null
            status: true
            total: 495
            */

            const total = orders.reduce((acc, order) => acc + order.total, 0);

            const box = await Box.create({
                responsable: name,
                fecha: new Date(),
                total
            });

            const productQuantities: { [key: number]: number } = {};

            orders.forEach(order => {
                order.orderProducts!.forEach(orderProduct => {
                    if (productQuantities[orderProduct.productId]) {
                        productQuantities[orderProduct.productId] += orderProduct.quantity;
                    } else {
                        productQuantities[orderProduct.productId] = orderProduct.quantity;
                    }
                });
            });

            await Promise.all(Object.entries(productQuantities).map(async ([productId, quantity]) => {
                await BoxProduct.create({
                    boxId: box.id,
                    productId: Number(productId),
                    quantity
                });
            }));

            await Promise.all(Object.entries(productQuantities).map(async ([productId, quantity]) => {
                const product = await Product.findOne({ where: { id: Number(productId) }, include: [{model: Ingredients, 
                    as: 'ingredientDetails' }] });
                if (product && product.ingredients) {
                    await Promise.all(product.ingredients.map(async (ingredientId: number) => {
                        const updatedIngredient = await Ingredients.findOne({ where: { id: ingredientId } });
                        if (updatedIngredient) {
                            await updatedIngredient.update({
                                stock: updatedIngredient.stock - quantity
                            });
                        }
                    }));
                }
            }));

            await Order.destroy({ where: {} });

            res.status(200).json({ msg: 'Caja cerrada exitosamente' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: 'Internal server error' });
        }
    };

    static getBoxes: RequestHandler = async (_req: Request, res: Response): Promise<void> => { 
        try {
            const boxes = await Box.findAll({ include: [{ model: BoxProduct, as: 'boxProducts' }] });
            res.status(200).json({ boxes });
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: 'Internal server error' });
        }
    };
    
    static getBoxById: RequestHandler = async (req: Request, res: Response): Promise<void> => { 
        try {
            const { id } = req.params;
            const box = await Box.findOne({ where: { id }, include: 
                [{ model: BoxProduct, as: 'boxProducts', include: [{ model: Product, as: 'product' }] }]
             });
            res.status(200).json({ box });
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: 'Internal server error' });
        }
     };
}