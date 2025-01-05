import 'dotenv/config';
import { get } from 'env-var';

export const envs = {
    PORT: get('PORT').required().asPortNumber(),
    DATABASE_URL: get('databaseUrl').required().asString(),
    DATABASE_NAME: get('databaseName').required().asString(),
    JWT_SEED: get('JWT_SEED').required().asString(),
}