import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/User';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

/* eslint-disable consistent-return */
const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({ message: 'You are not authenticated' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    const userId = typeof decoded === 'object' ? (decoded as JwtPayload).userId : undefined;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid!' });
    }
    req.user = user;
    return next();
  } catch (err: unknown) {
    return res.status(401).json({ message: 'Token is not valid!' });
  }
};

const verifyTokenAndAuthorization = (req: Request, res: Response, next: NextFunction) => {
  verifyToken(req, res, () => {
    if (req.user && (String(req.user._id) === req.params.id || req.user.isAdmin)) {
      return next();
    }
    return res.status(403).json({ message: 'You are not allowed to perform the operation!' });
  });
};

const verifyTokenAndAdmin = (req: Request, res: Response, next: NextFunction) => {
  verifyToken(req, res, () => {
    if (req.user?.isAdmin) {
      return next();
    }
    return res.status(403).json({ message: 'You are not allowed to perform the operation!' });
  });
};

// For routes whose ownership key is :userId (cart, order, wishlist). Run after
// verifyToken. Owner or admin only.
const checkOwnership = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && (String(req.user._id) === req.params.userId || req.user.isAdmin)) {
    return next();
  }
  return res.status(403).json({ message: 'You are not allowed to perform the operation!' });
};

export {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
  checkOwnership,
};
