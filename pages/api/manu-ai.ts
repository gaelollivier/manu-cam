import { NextApiRequest, NextApiResponse } from 'next';

import * as automl from '@tensorflow/tfjs-automl';

import { runDbQuery } from '../../lib/db';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  // NOTE: Not authenticated... Please don't DDOS me!

  const startTime = Date.now();

  const model = await automl.loadObjectDetection(
    `${__dirname}/../../manu-ai/manu_images_v1`
  );

  const img = document.getElementById('salad');
  const options = { score: 0.5, iou: 0.5 };
  const predictions = await model.detect(img, options);
  console.log(predictions);

  const endTime = Date.now();
  console.log(`[manu-ai] ${Math.round(endTime - startTime)}ms`);

  res.status(200).send({});
};
