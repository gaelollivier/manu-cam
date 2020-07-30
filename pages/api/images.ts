import { NextApiRequest, NextApiResponse } from 'next';

import { checkAuth } from '../../lib/auth';
import { runDbQuery } from '../../lib/db';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await checkAuth(req);

  const startTime = Date.now();

  const latestImages = await runDbQuery(async (db) => {
    return db
      .collection('images')
      .find({})
      .sort({ time: -1 })
      .limit(100)
      .toArray();
  });

  const endTime = Date.now();
  console.log(`[images] ${Math.round(endTime - startTime)}ms`);

  res.status(200).send({ images: latestImages });
};
