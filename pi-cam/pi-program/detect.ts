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

(async () => {
  console.log('Initializing model', MODEL_PATH);
  const model = await loadImageClassification(MODEL_PATH);

  // Model uses 320x320 images, so we only need to capture small images
  const stillCamera = new StillCamera({
    width: 640,
    height: 480,
  });

  console.log('Starting camera');

  while (true) {
    let startTime = Date.now();
    const image = await stillCamera.takeImage();
    console.log(`Image captured in ${Date.now() - startTime}ms`);
    startTime = Date.now();

    const form = new FormData();
    form.append('image', image);

    const res = await fetch(UPLOAD_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.MANUCAM_AUTH}`,
      },
    })
      .then((res) => res.text())
      .catch((err) => {
        console.error(err);
        return null;
      });

    console.log({ res });

    console.log(`Image uploaded in ${Date.now() - startTime}ms`);

    console.log('Running predictions');
    // const decodedImage = decodeImage(image);
    // const predictions = await model.detect(decodedImage, {
    //   score: 0.5,
    //   iou: 0.5,
    //   topk: 5,
    // });
    // console.log(predictions);

    console.log(`Done in ${Date.now() - startTime}ms`);
  }
})().catch((err) => {
  console.error(err);
});
