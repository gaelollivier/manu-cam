import { NextApiRequest, NextApiResponse } from 'next';

import { runDbQuery } from '../../lib/db';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  // NOTE: Not authenticated... Please don't DDOS me!

  const startTime = Date.now();

  // Limit: default 200
  const limit = Math.min(
    parseInt((req.query.limit as string) ?? '') || 200,
    200
  );

  const offset = parseInt((req.query.offset as string) ?? '') || 0;

  const [images, totalCount, totalMissingAnnotations] = await runDbQuery(
    async (db) => {
      return Promise.all([
        db
          .collection('images')
          .find()
          .sort({ time: 1 })
          .skip(offset)
          .limit(limit)
          .toArray(),
        db.collection('images').find().count(),
        db.collection('images').find({ annotations: null }).count(),
      ]);
    }
  );

  const endTime = Date.now();
  console.log(`[annotation-images] ${Math.round(endTime - startTime)}ms`);

  res.status(200).send({
    images,
    totalCount,
    totalMissingAnnotations,
  });
};
