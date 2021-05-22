import { NextApiRequest } from 'next';

export const checkAuth = (req: NextApiRequest): { isGuest: boolean } => {
  const requestToken =
    req.headers.authorization?.match(/Bearer (.+)/)?.[1] ?? '';

  console.log(requestToken, process.env.MANUCAM_AUTH_GUEST);

  if (requestToken === process.env.MANUCAM_AUTH_GUEST) {
    return { isGuest: true };
  }

  if (requestToken !== process.env.MANUCAM_AUTH) {
    throw new Error('Unauthorized');
  }

  return { isGuest: false };
};
