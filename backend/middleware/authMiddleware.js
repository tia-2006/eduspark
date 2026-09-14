const jwt = require("jsonwebtoken");
const User = require("../models/user");

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select("-password");

            if (!req.user) {
                return res.status(401).json({
                    message: "User not found for provided token"
                });
            }

            return next();
        } catch (error) {
            return res.status(401).json({
                message: "Not authorized, token verification failed",
                error: error.message
            });
        }
    }

    if (!token) {
        return res.status(401).json({
            message: "Not authorized, token is missing"
        });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || (roles.length && !roles.includes(req.user.role))) {
            return res.status(403).json({
                message: `User role '${req.user ? req.user.role : "none"}' is not authorized to perform this action`
            });
        }
        next();
    };
};

module.exports = {
    protect,
    authorize
};
