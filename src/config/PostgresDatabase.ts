import { Sequelize } from "sequelize";
import colors from 'colors';
import { User } from "./models/User";
import { Categories, Ingredients, Order, OrderProducts, Product } from "./models/Product";
import Box, { BoxProduct } from "./models/Box";

interface Options {
    databaseUrl: string;
    databaseName: string;
}

export class PostgresDatabase {

    static async connect(options: Options) {

        const { databaseUrl, databaseName } = options;
    
        try {
            const sequelize = new Sequelize(`${databaseUrl}/${databaseName}`)
            await sequelize.authenticate();
            await User.sync({ alter: true });
            await Categories.sync({ alter: true });
            await Product.sync({ alter: true });
            await Ingredients.sync({ alter: true });
            await Order.sync({ alter: true });
            await OrderProducts.sync({ alter: true });
            await Box.sync({ alter: true });
            await BoxProduct.sync({ alter: true });

            console.log(colors.bgGreen.white('Postgres Connected'));
        } catch (error) {
            console.log(colors.bgRed.white(`Error connecting to Postgres: ${error}`));
            throw error;
        }

    }

}