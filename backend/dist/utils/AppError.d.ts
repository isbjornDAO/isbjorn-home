export declare class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    constructor(message: string, statusCode?: number, isOperational?: boolean);
}
export declare const createError: {
    badRequest: (message?: string) => AppError;
    unauthorized: (message?: string) => AppError;
    forbidden: (message?: string) => AppError;
    notFound: (message?: string) => AppError;
    conflict: (message?: string) => AppError;
    unprocessableEntity: (message?: string) => AppError;
    internalServer: (message?: string) => AppError;
};
//# sourceMappingURL=AppError.d.ts.map