import { Fields, Files, IncomingForm } from 'formidable';
import { NextApiRequest, NextApiResponse } from 'next';

import { checkAuth } from '../../lib/auth';
import { runDbQuery } from '../../lib/db';
import { saveImage } from '../../lib/images';

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

  const { fields, files } = await parseRequest(req);

  const time = typeof fields.time === 'string' ? new Date(fields.time) : null;
  if (!time) {
    throw new Error('Missing image time');
  }

  const savedImage = await saveImage(files.image.path, { time });

  const endTime = Date.now();
  console.log(`[upload] ${Math.round(endTime - startTime)}ms`);

  res.status(200).send({ imageId: savedImage.insertedId });
};
