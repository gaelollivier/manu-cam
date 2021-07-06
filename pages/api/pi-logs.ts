import { NextApiRequest, NextApiResponse } from 'next';

import { checkAuth } from '../../lib/auth';
import { runDbQuery } from '../../lib/db';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const logs = await runDbQuery(async (db) => {
    return db
      .collection('pi-logs')
      .find({})
      .limit(100)
      .sort({ time: -1 })
      .toArray();
  });

  res.status(200).send({ logs });
};
