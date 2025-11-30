"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.authenticateToken = void 0;
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        // For demo tokens, create a mock user object
        if (decoded.id.startsWith('demo-user')) {
            req.user = {
                id: decoded.id,
                email: decoded.email,
                role: decoded.role,
                companyName: 'Demo Company Ltd',
                isActive: true
            };
            return next();
        }
        // For real tokens, check database
        logger.info(`Verifying token for user ID: ${decoded.id}`);
        const user = await User.findByPk(decoded.id);
        logger.info(`User found: ${user ? user.id : 'null'}`);
        if (!user || !user.isActive) {
            logger.warn('User not found or inactive');
            return res.status(401).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    }
    catch (error) {
        logger.error('Auth error:', error);
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};
exports.authenticateToken = authenticateToken;
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    if (req.user.role !== UserRole.ADMIN) {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};
exports.requireAdmin = requireAdmin;
//# sourceMappingURL=auth.js.map