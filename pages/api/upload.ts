import { Fields, Files, IncomingForm } from 'formidable';
import { NextApiRequest, NextApiResponse } from 'next';

import { checkAuth } from '../../lib/auth';
import { runDbQuery } from '../../lib/db';
import { uploadImage } from '../../lib/storage';

// Disable body-parser for file upload
export const config = { api: { bodyParser: false } };

const parseRequest = (
  req: NextApiRequest
): Promise<{ fields: Fields; files: Files }> => {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm();
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }
      resolve({ fields, files });
    });
  });
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await checkAuth(req);

  const startTime = Date.now();

  const { files } = await parseRequest(req);

  const file = await uploadImage(files.image.path);

  const savedImage = await runDbQuery(async (db) => {
    return db
      .collection('images')
      .insertOne({ time: new Date(), fileId: file.id });
  });

  const endTime = Date.now();
  console.log(`[upload] ${Math.round(endTime - startTime)}ms`);

  res.status(200).send({ imageId: savedImage.insertedId });
};
