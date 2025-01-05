import { RequestHandler, Request, Response } from "express";
import { Ingredients } from "../../config/models/Product";

export class InventoryController {
    static createInventoryProduct: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        try {
            if(!req.body.user) {
                res.status(403).json({ msg: 'No tienes permisos para realizar esta acción' });
                return;
            }

            const { permissions } = req.body.user;

            if(!permissions.includes("4") && !permissions.includes("6")) {
                res.status(403).json({ msg: 'No tienes permisos para realizar esta acción' });
                return;
            }

            const { name, stock } = req.body;

            if(!name || !stock) {
                res.status(400).json({ msg: 'Todos los campos son obligatorios' });
                return;
            }

            const ingredient = await Ingredients.create({
                name,
                stock
            });

            res.status(201).json({ msg: 'Producto creado', ingredient });

            (req as any).io.emit('newProduct', ingredient);

        } catch (error) {
            res.status(500).json({ msg: 'Error interno' });
            console.log(error);
        }
    }

    static getAllProducts: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        try {

            if(!req.body.user) {
                res.status(403).json({ msg: 'No tienes permisos para realizar esta acción' });
                return;
            }

            const { permissions } = req.body.user;

            if(!permissions || (!permissions.includes("4") && !permissions.includes("6"))) {
                res.status(403).json({ msg: 'No tienes permisos para realizar esta acción' });
                return;
            }

            const ingredients = await Ingredients.findAll();

            res.status(200).json({ ingredients });
            
        } catch (error) {
            res.status(500).json({ msg: 'Error interno' });
        }
    }

    static deleteProduct: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;

            if(!req.body.user) {
                res.status(403).json({ msg: 'No tienes permisos para realizar esta acción' });
                return;
            }

            const { permissions } = req.body.user;

            if(!permissions || (!permissions.includes("4") && !permissions.includes("6"))) {
                res.status(403).json({ msg: 'No tienes permisos para realizar esta acción' });
                return;
            }

            const ingredient = await Ingredients.findOne({ where: { id } });

            if(!ingredient) {
                res.status(404).json({ msg: 'El ingrediente no existe' });
                return;
            }

            await Ingredients.destroy({ where: { id } });
            
            (req as any).io.emit('deleteProduct', { id: ingredient.getDataValue('id') });

            res.status(200).json({ msg: 'Ingrediente eliminado' });

        } catch (error) {
            res.status(500).json({ msg: 'Error interno' })
        }
    }

    static updateProduct: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;

            if(!req.body.user) {
                res.status(403).json({ msg: 'No tienes permisos para realizar esta acción' });
                return;
            }

            const { permissions } = req.body.user;

            if(!permissions || (!permissions.includes("4") && !permissions.includes("6"))) {
                res.status(403).json({ msg: 'No tienes permisos para realizar esta acción' });
                return;
            }

            const ingredient = await Ingredients.findOne({ where: { id } });

            if(!ingredient) {
                res.status(404).json({ msg: 'El ingrediente no existe' });
                return;
            }

            const { name, stock } = req.body;

            if(!name || !stock) {
                res.status(400).json({ msg: 'Todos los campos son obligatorios' });
                return;
            }

            ingredient.setDataValue('name', name);
            ingredient.setDataValue('stock', stock);
            
            (req as any).io.emit('updateProduct', ingredient);

            res.status(200).json({ msg: 'Ingrediente actualizado' });

        } catch (error) {
            res.status(500).json({ msg: 'Error interno' })
        }
    }

    static getIngredients: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        try {
            const ingredients = await Ingredients.findAll();

            res.status(200).json({ ingredients });
        } catch (error) {
            res.status(500).json({ msg: 'Error interno' });
        }
    }

    static getIngredient: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;

            const ingredient = await Ingredients.findOne({ where: { id } });

            if(!ingredient) {
                res.status(404).json({ msg: 'El ingrediente no existe' });
                return;
            }

            res.status(200).json({ ingredient });

        } catch (error) {
            res.status(500).json({ msg: 'Error interno' });
        }
    }

    static searchProduct: RequestHandler = async (req: Request, res: Response): Promise<void> => {
        try {
            const { name } = req.params;

            const ingredients = await Ingredients.findAll({ where: { name: { $like: `%${name}%` } } });

            res.status(200).json({ ingredients });
        } catch (error) {
            res.status(500).json({ msg: 'Error interno' });
        }
    }
}