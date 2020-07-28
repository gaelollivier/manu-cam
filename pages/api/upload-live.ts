import { copyFile, createReadStream } from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';

import { checkAuth } from '../../lib/auth';
import { saveImage } from '../../lib/images';
import { uploadImage } from '../../lib/storage';
import { parseRequest } from '../../lib/upload';

// Disable body-parser for file upload
export const config = { api: { bodyParser: false } };

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await checkAuth(req);

  const startTime = Date.now();

  const { files } = await parseRequest(req);

  const file = await uploadImage({
    image: createReadStream(files.image.path),
    destination: `live/latest-image.jpg`,
  });

  const endTime = Date.now();
  console.log(`[upload-live] ${Math.round(endTime - startTime)}ms`);

  res.status(200).send({ success: true });
};
