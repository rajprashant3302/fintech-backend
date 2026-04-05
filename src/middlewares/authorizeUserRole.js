const authorizeRole = (...allowedRoles) => {

    return (req, res, next) => {
        try {
            if (!req.user || !req.user.role) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized: No user data found."
                });
            }

            if (allowedRoles.includes(req.user.role)) {
                return next();
            }

            return res.status(403).json({
                success: false,
                message: "Forbidden: You do not have permission to perform this action."
            });

        } catch (error) {
            console.error("Authorization Error:", error);
            return res.status(500).json({
                success: false,
                message: "Something went wrong during authorization!"
            });
        }
    };
};

module.exports = authorizeRole;