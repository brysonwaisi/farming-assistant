import { Request, Response } from 'express';
import { subscribe as subscribeService } from '../services/newsletterService';

const subscribe = async (req: Request, res: Response) => {
  await subscribeService(req.body.email);
  return res.status(201).json({ message: 'Subscription successful' });
};

export { subscribe };
