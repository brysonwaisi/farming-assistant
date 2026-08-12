import { Request, Response } from 'express';
import * as productService from '../services/productService';

const create = async (req: Request, res: Response) => {
  const product = await productService.create(req.body);
  return res.status(201).json(product);
};

const update = async (req: Request, res: Response) => {
  const product = await productService.update(req.params.id!, req.body);
  return res.status(200).json(product);
};

const remove = async (req: Request, res: Response) => {
  await productService.remove(req.params.id!);
  return res.status(200).json({ message: 'Product has been deleted' });
};

const getById = async (req: Request, res: Response) => {
  const product = await productService.getById(req.params.id!);
  return res.status(200).json(product);
};

const list = async (req: Request, res: Response) => {
  const products = await productService.list({
    qNew: req.query.new,
    qCategory: req.query.category,
    qSearch: req.query.search,
  });
  return res.status(200).json(products);
};

export {
  create, update, remove, getById, list,
};
