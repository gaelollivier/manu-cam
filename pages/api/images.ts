import { NextApiRequest, NextApiResponse } from 'next';

import { runDbQuery } from '../../lib/db';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  // NOTE: Not authenticated... Please don't DDOS me!

  const startTime = Date.now();

  const latestImages = await runDbQuery(async (db) => {
    return db
      .collection('images')
      .find({})
      .sort({ time: -1 })
      .limit(60)
      .toArray();
  });

  const endTime = Date.now();
  console.log(`[images] ${Math.round(endTime - startTime)}ms`);

  res.status(200).send({ images: latestImages });
};
