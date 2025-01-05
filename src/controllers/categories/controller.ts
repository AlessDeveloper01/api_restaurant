import {RequestHandler, Request, Response} from "express";
import { Categories } from "../../config/models/Product";

export class CategoryController {

    static createCategory: RequestHandler = async (req: Request, res: Response): Promise<void> => {
      try {

        if(!req.body.user) {
          res.status(403).json({ msg: 'No tienes un token valido' });
          return;
        }

        const { permissions } = req.body.user;

        if(!permissions.includes('4') && !permissions.includes('6')) {
          res.status(403).json({ msg: 'No tienes permisos para realizar esta acción' });
          return;
        }

        const { name } = req.body;

        if(!name) {
          res.status(400).json({ msg: 'El nombre es requerido' });
          return;
        }

        const category = await Categories.create({ name, status: true });

        (req as any).io.emit('newCategory', category);

        res.status(201).json({ category, msg: 'Categoría creada correctamente' });

      } catch (e) {
          res.status(500).json({ msg: 'Error interno' })
      }
    };

    static getCategories: RequestHandler = async (req: Request, res: Response): Promise<void> => {
      try {
        const categories = await Categories.findAll();

        res.status(200).json({ categories });
      } catch (e) {
        res.status(500).json({ msg: 'Error interno' });
      }
    }

    static updateCategory: RequestHandler = async (req: Request, res: Response): Promise<void> => {
      try {

        const { id } = req.params;

        if(!req.body.user) {
          res.status(403).json({ msg: 'No tienes un token valido' });
          return;
        }

        const { permissions } = req.body.user;

        if(!permissions.includes('4') && !permissions.includes('6')) {
          res.status(403).json({ msg: 'No tienes permisos para realizar esta acción' });
          return;
        }

        if(!id) {
          res.status(400).json({ msg: 'El id es requerido' });
          return;
        }

        const { name, status } = req.body;

        if(!name && !status) {
          res.status(400).json({ msg: 'Debes enviar al menos un campo a actualizar' });
          return;
        }

        const category = await Categories.findByPk(id);

        if(!category) {
          res.status(404).json({ msg: 'Categoría no encontrada' });
          return;
        }

        if(status !== category.getDataValue('status')) {
          category.setDataValue('status', status);
        }
        
        category.setDataValue('name', name || category.getDataValue('name'));

        await category.save();

        (req as any).io.emit('updateCategory', category);

        res.status(200).json({ msg: 'Categoría actualizada correctamente' });

      } catch (e) {
        res.status(500).json({ msg: 'Error interno' });
      }
    }

    static deleteCategory: RequestHandler = async (req: Request, res: Response): Promise<void> => {
      try {

        if(!req.body.user) {
          res.status(403).json({ msg: 'No tienes un token valido' });
          return;
        }

        const { permissions } = req.body.user;

        if(!permissions.includes('4') && !permissions.includes('6')) {
          res.status(403).json({ msg: 'No tienes permisos para realizar esta acción' });
          return;
        }

        const { id } = req.params;

        if(!id) {
          res.status(400).json({ msg: 'El id es requerido' });
          return;
        }

        const category = await Categories.findByPk(id);

        if(!category) {
          res.status(404).json({ msg: 'Categoría no encontrada' });
          return;
        }

        await category.destroy();

        (req as any).io.emit('deleteCategory', category);

        res.status(200).json({ msg: 'Categoría eliminada correctamente' });

      } catch (e) {
        res.status(500).json({ msg: 'Error interno' });
      }
    }

    static getCategory: RequestHandler = async (req: Request, res: Response): Promise<void> => {
      try {

        const { id } = req.params;

        if(!id) {
          res.status(400).json({ msg: 'El id es requerido' });
          return;
        }

        const category = await Categories.findByPk(id);

        if(!category) {
          res.status(404).json({ msg: 'Categoría no encontrada' });
          return;
        }

        res.status(200).json({ category });

      } catch (e) {
        res.status(500).json({ msg: 'Error interno' });
      }
    }
}