"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = require("jsonwebtoken");
const prisma = new client_1.PrismaClient();
const authenticate = async (req, res, next) => {
    if (!req.headers.authorization) {
        throw new Error("Unauthorized");
    }
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
        throw new Error("Token not found");
    }
    try {
        const decode = (0, jsonwebtoken_1.verify)(token, "JWT_SECRET");
        const user = await prisma.user.findUnique({
            where: {
                id: decode.id,
            },
        });
        req.user = user ?? undefined;
        next();
    }
    catch (err) {
        req.user = undefined;
        next();
    }
};
exports.authenticate = authenticate;
