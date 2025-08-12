import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
export declare const errorHandler: (error: Error | AppError, req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
//# sourceMappingURL=errorHandler.d.ts.map