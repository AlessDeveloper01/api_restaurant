import express, { Application, Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { AuthRouter, UserRouter, ProductRouter, InventoryRouter, CategoryRouter } from './routes';
import colors from 'colors';
import cors from 'cors';
import { OrderRouter } from './routes/order/OrderRouter';
import { CajaRouter } from './routes/caja/CajaRouter';

export class Server {
    private app: Application;
    private server: any;
    private io: SocketServer;
    
    constructor() {
        this.app = express();
        this.server = createServer(this.app);
        this.io = new SocketServer(this.server, {
            cors: {
                origin: ['http://localhost:3000', 'https://frontend-restaurant-wine.vercel.app/'],
                methods: ['GET', 'POST', 'PUT', 'DELETE'],
            },
            connectTimeout: 5000,
            pingTimeout: 5000,
            pingInterval: 10000,
        });
    }
    
    public start(port: number) {
        this.app.use(cors({
            origin: ['http://localhost:3000', 'https://frontend-restaurant-wine.vercel.app/'],
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
        }));

        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));

        this.app.use((req: Request, _res: Response, next: NextFunction) => {
            (req as any).io = this.io;
            console.log(colors.cyan("Middleware executed: req.io configured"));
            next();
        });

        this.app.use('/auth/', AuthRouter.getRoutes());
        this.app.use('/user/', UserRouter.getRoutes());
        this.app.use('/inventory/', InventoryRouter.getRoutes());
        this.app.use('/category/', CategoryRouter.getRoutes());
        this.app.use('/product/', ProductRouter.getRoutes());
        this.app.use('/order/', OrderRouter.getRoutes());
        this.app.use('/box/', CajaRouter.getRoutes());

        this.server.listen(port, () => {
            console.log(colors.bgBlue.white.bold(`Server started at http://localhost:${port}`));
            console.log(colors.bgGreen.cyan.bold('Socket.IO server is ready for connections'));
        });
    }
}