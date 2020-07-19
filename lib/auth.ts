import { NextApiRequest } from 'next';

export const checkAuth = (req: NextApiRequest) => {
  if (req.headers.authorization !== `Bearer ${process.env.MANUCAM_AUTH}`) {
    throw new Error('Unauthorized');
  }
};
