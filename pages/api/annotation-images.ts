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

  const filterMissingBoundingBoxes =
    req.query.filterMissingBoundingBoxes === 'true'
      ? {
          'annotations.hasManu': true,
          $or: [
            { 'annotations.boundingBoxes': null },
            { 'annotations.boundingBoxes': [] },
          ],
        }
      : {};

  const filterMissingAnnotations =
    req.query.filterMissingAnnotations === 'true'
      ? {
          annotations: null,
        }
      : {};

  const offset = parseInt((req.query.offset as string) ?? '') || 0;

  const filters = {
    ...filterMissingBoundingBoxes,
    ...filterMissingAnnotations,
  };

  const [images, totalCount] = await runDbQuery(async (db) => {
    return Promise.all([
      db
        .collection('images')
        .find(filters)
        .sort({ time: 1 })
        .skip(offset)
        .limit(limit)
        .toArray(),
      db.collection('images').find(filters).count(),
    ]);
  });

  const endTime = Date.now();
  console.log(`[annotation-images] ${Math.round(endTime - startTime)}ms`);

  res.status(200).send({
    images,
    totalCount,
  });
};
