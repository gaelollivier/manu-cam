import { createReadStream } from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';

import { checkAuth } from '../../lib/auth';
import { runDbQuery } from '../../lib/db';
import { uploadImage } from '../../lib/storage';
import { parseRequest } from '../../lib/upload';

// Disable body-parser for file upload
export const config = { api: { bodyParser: false } };

export default async (req: NextApiRequest, res: NextApiResponse) => {
  checkAuth(req);

  const startTime = Date.now();

  const {
    files,
    fields: { objectDetection },
  } = await parseRequest(req);

  const file = await uploadImage({
    image: createReadStream(files.image.path),
    destination: `live/latest-image.jpg`,
  });

  await runDbQuery(async (db) => {
    await db.collection('live-image').updateOne(
      {},
      {
        $set: {
          file: file.metadata,
          objectDetection,
        },
      },
      { upsert: true }
    );
  });

  const endTime = Date.now();
  console.log(`[upload-live] ${Math.round(endTime - startTime)}ms`);

  res.status(200).send({ success: true });
};
