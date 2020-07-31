import { NextApiRequest, NextApiResponse } from 'next';

import { checkAuth } from '../../lib/auth';
import { runDbQuery } from '../../lib/db';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await checkAuth(req);

  if (!req.body.logs.length) {
    res.status(200).end();
    return;
  }

  await runDbQuery(async (db) => {
    await db.collection('pi-logs').insertOne({
      time: new Date(),
      logs: req.body.logs ?? '',
    });

    // Delete logs older than 60min
    await db.collection('pi-logs').deleteMany({
      time: { $lt: new Date(Date.now() - 60 * 60 * 1000) },
    });
  });

  res.status(200).end();
};
