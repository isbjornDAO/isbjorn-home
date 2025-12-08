import { Request, Response, NextFunction } from 'express';
import { IUser } from '../models/User.mongoose';
declare global {
    namespace Express {
        interface Request {
            user?: IUser;
        }
    }
}
export declare const authenticateToken: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare const requireAdmin: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
//# sourceMappingURL=auth.d.ts.map