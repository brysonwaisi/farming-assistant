const productService = require('../services/productService');

const create = async (req, res) => {
  const product = await productService.create(req.body);
  return res.status(201).json(product);
};

const update = async (req, res) => {
  const product = await productService.update(req.params.id, req.body);
  return res.status(200).json(product);
};

const remove = async (req, res) => {
  await productService.remove(req.params.id);
  return res.status(200).json({ message: 'Product has been deleted' });
};

const getById = async (req, res) => {
  const product = await productService.getById(req.params.id);
  return res.status(200).json(product);
};

const list = async (req, res) => {
  const products = await productService.list({
    qNew: req.query.new,
    qCategory: req.query.category,
    qSearch: req.query.search,
  });
  return res.status(200).json(products);
};

module.exports = {
  create, update, remove, getById, list,
};
