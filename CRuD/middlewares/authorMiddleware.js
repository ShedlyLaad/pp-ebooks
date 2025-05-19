export const isAuthor = (req, res, next) => {
    if (req.user.role !== "author") {
        return res.status(403).json({ message: "Access Denied! Authors Only" });
    }
    next();
};
