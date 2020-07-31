import { NextApiRequest, NextApiResponse } from 'next';

import { runDbQuery } from '../../lib/db';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  // NOTE: Not authenticated... Please don't DDOS me!

  const startTime = Date.now();

  // Limit: default 60, max 200
  const limit = Math.min(
    parseInt((req.query.limit as string) ?? '') || 60,
    200
  );

  const latestImages = await runDbQuery(async (db) => {
    return db
      .collection('images')
      .find({})
      .sort({ time: -1 })
      .limit(limit)
      .toArray();
  });

  const endTime = Date.now();
  console.log(`[images] ${Math.round(endTime - startTime)}ms`);

  res.status(200).send({ images: latestImages });
};
