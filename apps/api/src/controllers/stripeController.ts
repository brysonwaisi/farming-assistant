import { Request, Response } from 'express';
import { IUser } from '../models/User';
import * as stripeService from '../services/stripeService';

// Routes run `verifyToken` before these handlers, so `req.user` is guaranteed.
type AuthedRequest = Request & { user: IUser };

const createEmbeddedSession = async (req: Request, res: Response) => {
  const { user } = req as AuthedRequest;
  const data = await stripeService.createEmbeddedSession(String(user._id), req.body.products);
  return res.status(201).json(data);
};

const createCheckoutSession = async (req: Request, res: Response) => {
  const { user } = req as AuthedRequest;
  const data = await stripeService.createHostedSession(String(user._id), req.body.products);
  return res.status(201).json(data);
};

const getSession = async (req: Request, res: Response) => {
  const data = await stripeService.retrieveSession(req.params.id!);
  return res.status(200).json(data);
};

export { createEmbeddedSession, createCheckoutSession, getSession };
