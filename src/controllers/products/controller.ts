import { RequestHandler, Request, Response } from "express";
import { Product, Categories, Ingredients } from "../../config/models/Product";
import { Op } from "sequelize";
import { validationResult } from "express-validator";

export class ProductsController {

    static createProduct: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
                return;
            }

            if(!req.body.user) {
                res.status(403).json({ msg: "No tienes los permisos suficientes para realizar esta acción" });
                return;
            }

            const { permissions } = req.body.user;

            if(!permissions.includes("3") && !permissions.includes("6")) {
                res.status(403).json({ msg: "No tienes los permisos suficientes para realizar esta acción" });
                return;
            }

            const { name, price, category, status, ingredients } = req.body;

            const categoryExists = await Categories.findByPk(category);
            if (!categoryExists) {
                res.status(404).json({ msg: "Categoría no encontrada" });
                return;
            }

            const product = await Product.create({
                name,
                price,
                category,
                status,
                ingredients
            });

            res.status(200).json({
                product,
                msg: "Producto creado correctamente"
            });

            (req as any).io.emit('newProduct', product);
        } catch (error) {
            console.log(error);
            res.status(500).json({ msg: "Error al crear el producto" });
        }
    }

    static getProducts: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        try {
            const products = await Product.findAll({
                include: [
                    {
                        model: Categories,
                        as: "categoryDetails"
                    },
                    {
                        model: Ingredients,
                        as: "ingredientDetails"
                    }
                ]
            });

            res.status(200).json(products);
        } catch (error) {
            console.log(error);
            res.status(500).json({ msg: "Error al obtener los productos" });
        }
    }

    static getProductsByCategory: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        // category
        try {
            const { category } = req.params;

            const categoryDetails = await Categories.findOne({
                where: { name: { [Op.iLike]: category } }
            });

            if (!categoryDetails) {
                res.status(404).json({ msg: "Categoría no encontrada" });
                return;
            }

            const products = await Product.findAll({
                where: {
                    category: (categoryDetails as any).id,
                    status: true
                },
                include: [
                    {
                        model: Categories,
                        as: "categoryDetails"
                    },
                    {
                        model: Ingredients,
                        as: "ingredientDetails"
                    }
                ]
            });

            res.status(200).json(products);
        } catch (error) {
            res.status(500).json({ msg: "Error al obtener los productos" });
        }
    }

    static getProduct: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        // id
        try {
            const { id } = req.params;

            const product = await Product.findByPk(id, {
                include: [
                    {
                        model: Categories,
                        as: "category"
                    },
                    {
                        model: Ingredients,
                        as: "ingredients"
                    }
                ]
            });

            if (!product) {
                res.status(404).json({ msg: "Producto no encontrado" });
                return;
            }

            res.status(200).json(product);
        } catch (error) {
            res.status(500).json({ msg: "Error al obtener el producto" });
        }
    }

    static updateProduct: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        //id
        try {
            if(!req.body.user) {
                res.status(403).json({ msg: "No tienes los permisos suficientes para realizar esta acción" });
                return;
            }

            const { permissions } = req.body.user;

            if(!permissions.includes("3") && !permissions.includes("6")) {
                res.status(403).json({ msg: "No tienes los permisos suficientes para realizar esta acción" });
                return;
            }

            const { id } = req.params;
            const { name, price, category, status, ingredients } = req.body;

            const product = await Product.findByPk(id);
            if (!product) {
                res.status(404).json({ msg: "Producto no encontrado" });
                return;
            }

            const categoryExists = await Categories.findByPk(category);
            if (!categoryExists) {
                res.status(404).json({ msg: "Categoría no encontrada" });
                return;
            }

            if(ingredients.length > 0) {
                product.setDataValue('ingredients', ingredients);
            }

            product.setDataValue('name', name);
            product.setDataValue('price', price);
            product.setDataValue('category', category);
            product.setDataValue('status', status);

            await product.save();

            res.status(200).json({
                product,
                msg: "Producto actualizado correctamente"
            });

            (req as any).io.emit('updateProduct', product);
        } catch (error) {
            res.status(500).json({ msg: "Error al actualizar el producto" });
        }
    }

    static deleteProduct: RequestHandler = async (req: Request, res: Response): Promise<void> => {
 // id
        try {
            if(!req.body.user) {
                res.status(403).json({ msg: "No tienes los permisos suficientes para realizar esta acción" });
                return;
            }

            const { permissions } = req.body.user;

            if(!permissions.includes("3") && !permissions.includes("6")) {
                res.status(403).json({ msg: "No tienes los permisos suficientes para realizar esta acción" });
                return;
            }

            const { id } = req.params;

            const product = await Product.findByPk(id);
            if (!product) {
                res.status(404).json({ msg: "Producto no encontrado" });
                return;
            }

            await product.destroy();
            
            (req as any).io.emit('deleteProduct', id);
            res.status(200).json({ msg: "Producto eliminado correctamente" });

        } catch (error) {
            res.status(500).json({ msg: "Error al eliminar el producto" });
        }
    }

    static searchProduct: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        try {
            const { name } = req.params;  
            const products = await Product.findAll({
                where: {
                    name: {
                        [Op.iLike]: `%${name}%`
                    },
                    status: true
                },
                include: [
                    {
                        model: Categories,
                        as: "categoryDetails"
                    },
                    {
                        model: Ingredients,
                        as: "ingredientDetails"
                    }
                ]
            });

            res.status(200).json(products);
        } catch (error) {
            res.status(500).json({ msg: "Error al buscar los productos" });
        }
    }

}