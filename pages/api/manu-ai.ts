import { ObjectId } from 'mongodb';
import { NextApiRequest, NextApiResponse } from 'next';
import getConfig from 'next/config';
import { resolve } from 'path';

import * as automl from '@tensorflow/tfjs-automl';
import * as tf from '@tensorflow/tfjs-node';

import { runDbQuery } from '../../lib/db';
import { getImage } from '../../lib/storage';

const { serverRuntimeConfig } = getConfig();

const loadObjectDection = async () => {
  const modelDirectory = resolve(
    `${serverRuntimeConfig.PROJECT_ROOT}/manu-ai/manu_images_v1`
  );
  const model = await tf.loadGraphModel(`file://${modelDirectory}/model.json`);
  const dict = ['background', 'manu'];
  return new automl.ObjectDetectionModel(model, dict);
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  // NOTE: Not authenticated... Please don't DDOS me!

  const startTime = Date.now();

  const imageId =
    typeof req.query.imageId === 'string' ? req.query.imageId : null;
  if (!imageId) {
    throw new Error('Missing image ID');
  }

  const imageRecord = await runDbQuery(async (db) => {
    return db.collection('images').findOne({ _id: new ObjectId(imageId) });
  });

  console.log('Loading image & model...');
  const [imageData, model] = await Promise.all([
    getImage(imageRecord.files.large.name),
    loadObjectDection(),
  ]);

  console.log('Running image detection...');
  const detectionResult = await model.detect(
    tf.node.decodeImage(imageData) as tf.Tensor3D
  );
  console.log(detectionResult);

  const endTime = Date.now();
  console.log(`[manu-ai] ${Math.round(endTime - startTime)}ms`);

  res.status(200).send({ detectionResult });
};
