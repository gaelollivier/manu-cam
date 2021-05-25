import { NextApiRequest } from 'next';

export const checkAuth = (
  req: NextApiRequest,
  options: { allowGuest?: boolean } = {}
): { isGuest: boolean } => {
  const { allowGuest = true } = options;

  const requestToken =
    req.headers.authorization?.match(/Bearer (.+)/)?.[1] ?? '';

  if (allowGuest && requestToken === process.env.MANUCAM_AUTH_GUEST) {
    return { isGuest: true };
  }

  if (requestToken !== process.env.MANUCAM_AUTH) {
    throw new Error('Unauthorized');
  }

  return { isGuest: false };
};
