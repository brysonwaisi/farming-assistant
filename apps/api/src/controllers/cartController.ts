import { Request, Response } from 'express';
import * as cartService from '../services/cartService';

const create = async (req: Request, res: Response) => {
  const cart = await cartService.create(req.user!._id, req.body);
  return res.status(201).json(cart);
};

const upsertByUser = async (req: Request, res: Response) => {
  const cart = await cartService.upsertByUser(req.params.userId, req.body.products || []);
  return res.status(200).json(cart);
};

const updateById = async (req: Request, res: Response) => {
  const cart = await cartService.updateById(req.params.id!, req.body, req.user!);
  return res.status(200).json(cart);
};

const removeById = async (req: Request, res: Response) => {
  await cartService.removeById(req.params.id!, req.user!);
  return res.status(200).json({ message: 'Cart has been deleted' });
};

const getByUser = async (req: Request, res: Response) => {
  const cart = await cartService.getByUser(req.params.userId!);
  return res.status(200).json(cart);
};

const getAll = async (req: Request, res: Response) => {
  const carts = await cartService.getAll();
  return res.status(200).json(carts);
};

export {
  create, upsertByUser, updateById, removeById, getByUser, getAll,
};
