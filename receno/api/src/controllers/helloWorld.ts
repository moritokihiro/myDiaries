import { Request, Response } from 'express';
export async function helloWorld(req: Request, res: Response): Promise<void> {
  res.send('Hello World');
}
