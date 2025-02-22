import { Request, Response } from "express";
import SendMailFunc from "../utils/SendMail";

export async function handleLogin(req: Request, res: Response): Promise<Response>{    
    try {
        console.log("login process start")
        console.log(req.body)
        const { email, password} = req.body;
        if (!email || !password){
            return res.status(400).json({message: "emailまたはパスワードのどちらかが未入力です。"})
        }
        if(email === 'tokihiro112@gmail.com' && password === 'TG605'){
            console.log("第一ログイン成功");
            SendMailFunc();
            return res.status(200).json({message: "authentification is successful"});
        }else {
            return res.status(401).json({message: "emailまたはパスワードが違います。"})
        }
    }catch (error: unknown) {
        console.log(error as Error)
        return res.status(500).json({message: (error as Error).message })
    }
}