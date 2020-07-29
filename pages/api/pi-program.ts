import { NextApiRequest, NextApiResponse } from 'next';

import { checkAuth } from '../../lib/auth';
import { runDbQuery } from '../../lib/db';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await checkAuth(req);

  const piProgram = await runDbQuery(async (db) => {
    return db.collection('pi-program').findOne({});
  });

  if (!piProgram) {
    throw new Error('Cannnot retrieve program');
  }

  res.status(200).send({ piProgram });
};
