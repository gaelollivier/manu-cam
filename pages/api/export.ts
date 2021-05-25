import { NextApiRequest, NextApiResponse } from 'next';

import { checkAuth } from '../../lib/auth';
import { runDbQuery } from '../../lib/db';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  checkAuth(req, { allowGuest: false });

  const startTime = Date.now();

  console.log('Exporting...');

  const images = await runDbQuery(async (db) => {
    return db.collection('images').find().sort({ time: 1 }).toArray();
  });

  const endTime = Date.now();

  console.log(`[export] ${Math.round(endTime - startTime)}ms`);

  res.status(200).send({ images });
};
