// Use these instructions to install tfjs-node on RaspberryPi...
// https://github.com/yhwang/node-red-contrib-tf-model

import FormData from 'form-data';
import * as fs from 'fs';
import fetch from 'node-fetch';
import * as path from 'path';
import { StillCamera } from 'pi-camera-connect';

import * as automl from '@tensorflow/tfjs-automl';
import * as tf from '@tensorflow/tfjs-node';

const MODEL_PATH = path.resolve(
  process.env.MODEL_PATH ||
    `/home/pi/app/models/tf_js-manu_images_v2/model.json`
);

const UPLOAD_URL = 'https://manu-cam.vercel.app/api/upload-live';
// const UPLOAD_URL = 'https://manu-cam.vercel.app/api/upload';

const measureTiming = async <Res>(fn: () => Promise<Res>) => {
  const startTime = Date.now();
  const res = await fn();
  return { time: Date.now() - startTime, res };
};

const loadDictionary = (modelUrl: string) => {
  const lastIndexOfSlash = modelUrl.lastIndexOf('/');
  const prefixUrl =
    lastIndexOfSlash >= 0 ? modelUrl.slice(0, lastIndexOfSlash + 1) : '';
  const dictUrl = `${prefixUrl}dict.txt`;
  const text = fs.readFileSync(dictUrl, { encoding: 'utf-8' });
  return text.trim().split('\n');
};

const loadImageClassification = async (modelUrl: string) => {
  const [model, dict] = await Promise.all([
    tf.loadGraphModel(`file://${modelUrl}`),
    loadDictionary(modelUrl),
  ]);
  return new automl.ObjectDetectionModel(model, dict);
};

const decodeImage = (img: string | Buffer) => {
  if (typeof img === 'string') {
    const imgSrc = fs.readFileSync(img);
    const arrByte = Uint8Array.from(Buffer.from(imgSrc));
    return tf.node.decodeImage(arrByte) as tf.Tensor3D;
  }

  const arrByte = Uint8Array.from(img);
  return tf.node.decodeImage(arrByte) as tf.Tensor3D;
};

const uploadImage = async ({
  image,
  objectDetection,
}: {
  image: Buffer;
  objectDetection: Array<automl.PredictedObject>;
}) => {
  const form = new FormData();
  form.append('image', image, { filename: 'image.jpg' });
  form.append('objectDetection', JSON.stringify(objectDetection));

  const res = await fetch(UPLOAD_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.MANUCAM_AUTH}`,
    },
    body: form,
  })
    .then(async (res) => {
      const text = await res.text();
      return JSON.parse(text);
    })
    .catch((err) => {
      console.error('Error uploading image:', err);
      return null;
    });

  return res;
};

(async () => {
  console.log('Initializing model', MODEL_PATH);
  const model = await loadImageClassification(MODEL_PATH);

  const stillCamera = new StillCamera({
    width: 2028,
    height: 1520,
  });

  console.log('Starting camera');

  while (true) {
    const { res: image, time: captureTime } = await measureTiming(() =>
      stillCamera.takeImage()
    );

    const { res: objectDetection, time: predictionTime } = await measureTiming(
      () =>
        model.detect(decodeImage(image), {
          score: 0.5,
          iou: 0.5,
          topk: 5,
        })
    );

    const { res: uploadRes, time: uploadTime } = await measureTiming(() =>
      uploadImage({ image, objectDetection })
    );

    console.log({ captureTime, predictionTime, uploadRes });
  }
})().catch((err) => {
  console.error(err);
});
