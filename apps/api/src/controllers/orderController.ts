import { Request, Response } from 'express';
import * as orderService from '../services/orderService';

const create = async (req: Request, res: Response) => {
  const order = await orderService.create(req.user!._id, req.body);
  return res.status(201).json(order);
};

const updateById = async (req: Request, res: Response) => {
  const order = await orderService.updateById(req.params.id!, req.body);
  return res.status(200).json(order);
};

const removeById = async (req: Request, res: Response) => {
  await orderService.removeById(req.params.id!);
  return res.status(200).json({ message: 'Order has been deleted' });
};

const getByUser = async (req: Request, res: Response) => {
  const orders = await orderService.getByUser(req.params.userId!);
  return res.status(200).json(orders);
};

const getAll = async (req: Request, res: Response) => {
  const orders = await orderService.getAll();
  return res.status(200).json(orders);
};

const income = async (req: Request, res: Response) => {
  const data = await orderService.monthlyIncome();
  return res.status(200).json(data);
};

export {
  create, updateById, removeById, getByUser, getAll, income,
};
