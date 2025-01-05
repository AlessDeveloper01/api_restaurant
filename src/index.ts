import { envs } from "./extends/envs";
import { PostgresDatabase } from "./config/PostgresDatabase";
import { Server } from "./server";

(async () => {
    main();
})();

async function main() {
    const port = envs.PORT;

    PostgresDatabase.connect({
        databaseUrl: envs.DATABASE_URL,
        databaseName: envs.DATABASE_NAME,
    })

    new Server().start(port);
}