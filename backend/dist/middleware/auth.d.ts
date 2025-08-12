import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.model';
declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}
export declare const authenticateToken: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare const requireAdmin: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
//# sourceMappingURL=auth.d.ts.map