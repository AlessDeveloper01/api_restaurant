import { RequestHandler, Request, Response } from "express";
import { Order, OrderProducts, Product } from "../../config/models/Product";

/*
const Order = sequelize.define('Order', {
    mesero: {
        type: DataTypes.STRING,
        allowNull: false
    },
    total: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    orderReadyAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'Order',
    timestamps: false
});

const OrderProducts = sequelize.define('OrderProducts', {
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'OrderProducts',
    timestamps: false
});

Order.hasMany(OrderProducts, { foreignKey: 'orderId', as: 'orderProducts' });
OrderProducts.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
OrderProducts.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(OrderProducts, { foreignKey: 'productId', as: 'orderProducts' });
 */

export class OrderController {

    static createOrder: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        try {
            if(!req.body.user) {
                res.status(400).json({ msg: 'No te encuentras conectado' });
                return;
            }

            const { user } = req.body;

            if(!user.permissions.includes("1") && !user.permissions.includes("6")) {
                res.status(403).json({ msg: 'No tienes permisos para realizar esta acción' });
                return;
            }

            const { total, date, products } = req.body;

            const order = await Order.create({
                mesero: user.name,
                total,
                date,
                status: false
            });

            for (const product of products) {
                await OrderProducts.create({
                    orderId: order.id!,
                    productId: product.productId,
                    quantity: product.quantity,
                });
            }

            res.status(201).json({ msg: 'Orden creada' });
        } catch (error) {
            res.status(500).json({ msg: 'Error interno' });
        }
    }

    static getOrders: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        try {
            if(!req.body.user) {
                res.status(400).json({ msg: 'No te encuentras conectado' });
                return;
            }

            const { status } = req.params;
            const { user } = req.body;

            if(!user.permissions.includes("1") && !user.permissions.includes("6")) {
                res.status(403).json({ msg: 'No tienes permisos para realizar esta acción' });
                return;
            }

            const orders = await Order.findAll({
                where: {
                    status: status === 'true' ? true : false
                },
                include: [{
                    model: OrderProducts,
                    as: 'orderProducts',
                    include: [{
                        model: Product,
                        as: 'product'
                    }]
                }]
            });

            res.status(200).json(orders);
        } catch (error) {
            res.status(500).json({ msg: 'Error interno' });
        }
    }
    
    static getOrderById: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        try {
            if(!req.body.user) {
                res.status(400).json({ msg: 'No te encuentras conectado' });
                return;
            }

            const { user } = req.body;

            if(!user.permissions.includes("1") && !user.permissions.includes("6")) {
                res.status(403).json({ msg: 'No tienes permisos para realizar esta acción' });
                return;
            }

            const { id } = req.params;

            const order = await Order.findOne({
                where: { id },
                include: [{
                    model: OrderProducts,
                    as: 'orderProducts',
                    include: [{
                        model: Product,
                        as: 'product'
                    }]
                }]
            });

            if(!order) {
                res.status(404).json({ msg: 'Orden no encontrada' });
                return;
            }

            res.status(200).json(order);
        } catch (error) {
            res.status(500).json({ msg: 'Error interno' });
        }
    }

    static updateOrder: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        try {
            if(!req.body.user) {
                res.status(400).json({ msg: 'No te encuentras conectado' });
                return;
            }

            const { user } = req.body;

            if(!user.permissions.includes("1") && !user.permissions.includes("6")) {
                res.status(403).json({ msg: 'No tienes permisos para realizar esta acción' });
                return;
            }

            const { id } = req.params;

            const order = await Order.findByPk(id);

            if(!order) {
                res.status(404).json({ msg: 'Orden no encontrada' });
                return;
            }

            if(req.body.products && req.body.products.length > 0) {
                await OrderProducts.destroy({ where: { orderId: order.id } });

                for (const product of req.body.products) {
                    await OrderProducts.create({
                        orderId: order.id!,
                        productId: product.productId,
                        quantity: product.quantity,
                    });
                }
            }

            if(req.body.total !== undefined) {
                order.setDataValue('total', req.body.total);
            }

            if(req.body.status !== undefined) {
                order.setDataValue('status', req.body.status);
            }

            if(req.body.orderReadyAt !== undefined) {
                order.setDataValue('orderReadyAt', req.body.orderReadyAt);
            }

            if(req.body.date !== undefined) {
                order.setDataValue('date', req.body.date);
            }

            await order.save();

            res.status(200).json({ msg: 'Orden actualizada' });

            (req as any).io.emit('updateOrders');
        } catch (error) {
            res.status(500).json({ msg: 'Error interno' });
        }
    }

    static deleteOrder: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        try {
            if(!req.body.user) {
                res.status(400).json({ msg: 'No te encuentras conectado' });
                return;
            }

            const { user } = req.body;

            // Si no incluye el permiso 6 (eliminar ordenes) 
            if(!user.permissions.includes("6")) {
                res.status(403).json({ msg: 'No tienes permisos para realizar esta acción' });
                return;
            }

            const { id } = req.params;

            const order = await Order.findByPk(id);

            if(!order) {
                res.status(404).json({ msg: 'Orden no encontrada' });
                return;
            }

            await OrderProducts.destroy({ where: { orderId: order.id } });
            await order.destroy();

            res.status(200).json({ msg: 'Orden eliminada' });
        } catch (error) {
            res.status(500).json({ msg: 'Error interno' });
        }
    }
}