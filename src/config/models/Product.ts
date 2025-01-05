import { DataTypes, Model, Sequelize } from "sequelize";
import { envs } from "../../extends/envs";

const sequelize = new Sequelize(`${envs.DATABASE_URL}/${envs.DATABASE_NAME}`);

class Product extends Model {
    public id!: number;
    public name!: string;
    public price!: number;
    public category!: number;
    public status!: boolean;
    public ingredients!: number[];
}

class Ingredients extends Model {
    public id!: number;
    public name!: string;
    public stock!: number;
}

interface OrderAttributes {
    id?: number;
    mesero: string;
    total: number;
    date: Date;
    status: boolean;
    orderReadyAt?: Date;
    orderProducts?: OrderProductsAttributes[];
}

interface OrderProductsAttributes {
    id?: number;
    orderId: number;
    productId: number;
    quantity: number;
    product?: Product;
}

interface OrderInstance extends Model<OrderAttributes>, OrderAttributes {}

interface OrderProductsInstance extends Model<OrderProductsAttributes>, OrderProductsAttributes {}

Product.init({
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    category: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    status: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    ingredients: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        allowNull: true
    }
    }, {
    tableName: 'Products',
    timestamps: false,
    sequelize: sequelize
});

const Categories = sequelize.define('Categories', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    }
}, {
    tableName: 'Categories',
    timestamps: false
});

Ingredients.init({
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
}, {
    tableName: 'Ingredients',
    timestamps: false,
    sequelize: sequelize
});
 

const Order = sequelize.define<OrderInstance>('Order', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
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

const OrderProducts = sequelize.define<OrderProductsInstance>('OrderProducts', {
    orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Order,
            key: 'id'
        }
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Product,
            key: 'id'
        }
    },
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


Product.belongsTo(Categories, { foreignKey: 'category', as: 'categoryDetails' });
Categories.hasMany(Product, { foreignKey: 'category', as: 'products' });

Product.hasMany(Ingredients, { foreignKey: 'ingredients', as: 'ingredientDetails' });
Ingredients.belongsTo(Product, { foreignKey: 'ingredients', as: 'productDetails' });

export { Product, Categories, Ingredients, Order, OrderProducts };
