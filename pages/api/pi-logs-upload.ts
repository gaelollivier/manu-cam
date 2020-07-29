import { NextApiRequest, NextApiResponse } from 'next';

import { checkAuth } from '../../lib/auth';
import { runDbQuery } from '../../lib/db';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await checkAuth(req);

  await runDbQuery(async (db) => {
    await db.collection('pi-logs').insertOne({
      time: new Date(),
      logs: req.body.logs ?? '',
    });

    // Delete logs older than 10min
    await db.collection('pi-logs').deleteMany({
      time: { $lt: new Date(Date.now() - 60 * 10 * 1000) },
    });
  });

  res.status(200).end();
};
