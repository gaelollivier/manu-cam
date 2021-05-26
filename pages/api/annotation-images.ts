import { NextApiRequest, NextApiResponse } from 'next';

import { runDbQuery } from '../../lib/db';

const FILTERS_PRESET = {
  missingBoundingBox: {
    'annotations.hasManu': true,
    $or: [
      { 'annotations.boundingBoxes': null },
      { 'annotations.boundingBoxes': [] },
    ],
    'annotations.skipped': { $ne: true },
  },
  missingAnnotation: {
    annotations: null,
  },
  skipped: {
    'annotations.skipped': true,
  },
  hasBoundingBox: {
    $and: [
      { 'annotations.boundingBoxes': { $ne: null } },
      { 'annotations.boundingBoxes': { $ne: [] } },
    ],
  },
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  // NOTE: Not authenticated... Please don't DDOS me!

  const startTime = Date.now();

  // Limit: default 200
  const limit = Math.min(
    parseInt((req.query.limit as string) ?? '') || 200,
    200
  );

  const offset = parseInt((req.query.offset as string) ?? '') || 0;

  const filtersView =
    (req.query.filtersView as keyof typeof FILTERS_PRESET) ?? '';

  const filters = FILTERS_PRESET[filtersView] ?? {};

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
