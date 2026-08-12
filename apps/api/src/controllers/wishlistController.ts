import { Request, Response } from 'express';
import * as wishlistService from '../services/wishlistService';

const getByUser = async (req: Request, res: Response) => {
  const wishlist = await wishlistService.getByUser(req.params.userId!);
  return res.status(200).json(wishlist);
};

const replace = async (req: Request, res: Response) => {
  const wishlist = await wishlistService.replace(req.params.userId!, req.body.products);
  return res.status(200).json(wishlist);
};

const add = async (req: Request, res: Response) => {
  const wishlist = await wishlistService.add(req.user!._id, req.params.productId!);
  return res.status(200).json(wishlist);
};

const remove = async (req: Request, res: Response) => {
  const wishlist = await wishlistService.remove(req.user!._id, req.params.productId!);
  return res.status(200).json(wishlist);
};

export {
  getByUser, replace, add, remove,
};
