import jwt from "jsonwebtoken";
import jwtConfig from "./config/jwtConfig";

async function issueToken(){
    const payload = {
        sub : "ABV-103-YNO-LOP",
    }
    
    const token = jwt.sign(payload, jwtConfig.appSecret, { 
        expiresIn: "1h",
        issuer: "task-manager-app"
    });
    
    console.log(token);
    return token;
}

export default issueToken;