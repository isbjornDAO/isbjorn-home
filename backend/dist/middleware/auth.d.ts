declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}
export declare const authenticateToken: (req: Request, res: Response, next: NextFunction) => Promise<any>;
export declare const requireAdmin: (req: Request, res: Response, next: NextFunction) => any;
//# sourceMappingURL=auth.d.ts.map