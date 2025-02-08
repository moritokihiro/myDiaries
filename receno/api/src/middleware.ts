import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload} from "jsonwebtoken";
import AuthentificationError from "./errors/AuthentificationError"
import "../types/express";
import jwtConfig from "./config/jwtConfig";

declare global {
    namespace Express {
        interface Request {
            auth?: {
                payload: JwtPayload;
                token: string;
            };
        }
    }
}

const authentificateUser = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authentification as string;

    if (!authHeader || !authHeader.startsWith("Bearer")){
        throw new AuthentificationError({
            message: "Authorization header missing or payload",
            statusCode: 401,
            code: "ERR_AUTH"
        })
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, jwtConfig.appSecret)
        req.auth = { payload: decoded as JwtPayload, token}

        next();
    }catch (error) {
        throw new AuthentificationError({
            message: "You are not authorized to perform this operation",
            statusCode: 403,
            code: "ERR_AUTH"
        })
    }
}

export default authentificateUser