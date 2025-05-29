export const isAuthorOrAdmin = (req, res, next) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'author') {
            return res.status(403).json({
                success: false,
                message: "Access Denied! Only Authors and Admins allowed"
            });
        }
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: "Authorization failed"
        });
    }
};