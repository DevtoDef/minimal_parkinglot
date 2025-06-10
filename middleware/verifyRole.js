

const verifyRole = (...allowedRoles) => {
    return (req, res, next) => {
        const roles = req.role;
        if (!roles) return res.sendStatus(401);
        const rolesArray = [...allowedRoles];
        const match = roles.split(', ').some(role => rolesArray.includes(role));
        if(!match) return res.sendStatus(401);
        next()
    }
}

module.exports = verifyRole;