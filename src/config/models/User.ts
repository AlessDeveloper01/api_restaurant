import { Sequelize, DataTypes } from 'sequelize';
import { envs } from '../../extends/envs';

const sequelize = new Sequelize(`${envs.DATABASE_URL}/${envs.DATABASE_NAME}`)

export const User = sequelize.define('User', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    permissions: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false
    }
})
