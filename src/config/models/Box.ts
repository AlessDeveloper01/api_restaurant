import { DataTypes, Model, Sequelize } from "sequelize";
import { envs } from "../../extends/envs";
import { Product } from "./Product";

const sequelize = new Sequelize(`${envs.DATABASE_URL}/${envs.DATABASE_NAME}`);

interface BoxProductsAttributes {
    boxId?: number;
    quantity: number;
    productId?: number;
}

interface BoxAttributes {
    id?: number;
    responsable: string;
    fecha: Date;
    total: number;
}

interface BoxProductInstance extends Model<BoxProductsAttributes>, BoxProductsAttributes {}
interface BoxInstance extends Model<BoxAttributes>, BoxAttributes {}

const Box = sequelize.define<BoxInstance>('Box', {
    responsable: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fecha: {
        type: DataTypes.DATE,
        allowNull: false
    },
    total: {
        type: DataTypes.FLOAT,
        allowNull: false
    }
}, {
    tableName: 'Box',
    timestamps: false
});

const BoxProduct = sequelize.define<BoxProductInstance>('BoxProduct', {
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

BoxProduct.belongsTo(Product, { as: 'product', foreignKey: 'productId' });
Product.hasMany(BoxProduct, { as: 'boxProducts', foreignKey: 'productId' });

Box.hasMany(BoxProduct, { as: 'boxProducts', foreignKey: 'boxId' });
BoxProduct.belongsTo(Box, { as: 'box', foreignKey: 'boxId' });

export { BoxProduct };
export default Box;