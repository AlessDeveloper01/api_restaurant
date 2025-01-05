import { body } from 'express-validator';

export class ValidatorAdapter {

    static register = [
        body('name').notEmpty().withMessage('El nombre es requerido'),
        body('email').isEmail().withMessage('Correo inválido'),
        body('password').notEmpty().withMessage('La contraseña es requerida').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
    ];

    static login = [
        body('email').isEmail().withMessage('Correo inválido'),
        body('password').notEmpty().withMessage('La contraseña es requerida')
    ];

    static validate = [
        body('token').notEmpty().withMessage('El token es requerido')
    ];

    static createProduct = [
        body('name').notEmpty().withMessage('El nombre es requerido'),
        body('price').notEmpty().withMessage('El precio es requerido'),
        body('category').notEmpty().withMessage('La categoría es requerida'),
        body('status').notEmpty().withMessage('El estado es requerido'),
        body('ingredients').notEmpty().withMessage('Los ingredientes son requeridos')
    ];
}