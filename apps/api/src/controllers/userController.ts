import { Request, Response } from 'express';
import * as userService from '../services/userService';

const update = async (req: Request, res: Response) => {
  const user = await userService.update(req.params.id!, req.body);
  return res.status(200).json(user);
};

const remove = async (req: Request, res: Response) => {
  await userService.remove(req.params.id!);
  return res.status(200).json({ message: 'User has been deleted' });
};

const getById = async (req: Request, res: Response) => {
  const user = await userService.getById(req.params.id!);
  return res.status(200).json(user);
};

const list = async (req: Request, res: Response) => {
  const users = await userService.list(Boolean(req.query.new));
  return res.status(200).json(users);
};

const stats = async (req: Request, res: Response) => {
  const data = await userService.stats();
  return res.status(200).json(data);
};

export {
  update, remove, getById, list, stats,
};
