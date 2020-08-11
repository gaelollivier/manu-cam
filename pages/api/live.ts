import { NextApiRequest, NextApiResponse } from 'next';

import { runDbQuery } from '../../lib/db';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const liveImage = await runDbQuery(async (db) => {
    return db.collection('live-image').findOne({});
  });

  res.status(200).send({ liveImage });
};
