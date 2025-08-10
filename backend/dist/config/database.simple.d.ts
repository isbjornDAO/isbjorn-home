declare const config: {
    dialect: "sqlite";
    storage: string;
    logging: boolean | ((message?: any, ...optionalParams: any[]) => void);
    define: {
        timestamps: boolean;
        underscored: boolean;
    };
};
export default config;
//# sourceMappingURL=database.simple.d.ts.map