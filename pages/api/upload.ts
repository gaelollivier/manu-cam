import { NextApiRequest, NextApiResponse } from 'next';

import { checkAuth } from '../../lib/auth';
import { saveImage } from '../../lib/images';
import { parseRequest } from '../../lib/upload';

// Disable body-parser for file upload
export const config = { api: { bodyParser: false } };

export default async (req: NextApiRequest, res: NextApiResponse) => {
  checkAuth(req);

  const startTime = Date.now();

  const { fields, files } = await parseRequest(req);

  const objectDetection = (() => {
    try {
      return JSON.parse(fields.objectDetection as string);
    } catch (err) {
      console.error('Error parsing object detection param', err);
      return null;
    }
  })();

  const savedImage = await saveImage(files.image.path, {
    time: new Date(),
    objectDetection,
  });

  const endTime = Date.now();
  console.log(`[upload] ${Math.round(endTime - startTime)}ms`);

  res.status(200).send({ imageId: savedImage.insertedId });
};
