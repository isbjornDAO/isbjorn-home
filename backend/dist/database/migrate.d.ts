declare class DatabaseMigrator {
    private sequelize;
    constructor();
    migrate(): Promise<void>;
    close(): Promise<void>;
}
export default DatabaseMigrator;
//# sourceMappingURL=migrate.d.ts.map