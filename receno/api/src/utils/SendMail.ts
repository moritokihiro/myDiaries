import nodemailer from 'nodemailer';

export default async function SendMailFunc(): Promise<void> {
    try{
         // SMTP 
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'tokihiro112@gmail.com',
                pass: 'd9db2hl57t'
            },
        });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const info = await transporter.sendMail({
            from: "moritokihiro@icloud.com",
            to: "tokihiro112@gmail.com",
            subject: "二段階認証コード",
            text: `あなたの二段階認証コードは: ${otp} です。5分以内に入力してください。`,
        });
        console.log(info);
    }catch(Error){
        console.log(Error)
    }
   
}
