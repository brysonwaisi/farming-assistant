const jwt = require('jsonwebtoken');
const User = require('../models/User');

/* eslint-disable consistent-return */
const verifyToken = async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({ message: 'You are not authenticated' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid!' });
    }
    req.user = user;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Token is not valid!' });
  }
};

const verifyTokenAndAuthorization = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user && (String(req.user._id) === req.params.id || req.user.isAdmin)) {
      return next();
    }
    return res.status(403).json({ message: 'You are not allowed to perform the operation!' });
  });
};

const verifyTokenAndAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.isAdmin) {
      return next();
    }
    return res.status(403).json({ message: 'You are not allowed to perform the operation!' });
  });
};

// For routes whose ownership key is :userId (cart, order, wishlist). Run after
// verifyToken. Owner or admin only.
const checkOwnership = (req, res, next) => {
  if (String(req.user._id) === req.params.userId || req.user.isAdmin) {
    return next();
  }
  return res.status(403).json({ message: 'You are not allowed to perform the operation!' });
};

module.exports = {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
  checkOwnership,
};
