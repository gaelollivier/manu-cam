// Use these instructions to install on RaspberryPi...
// https://github.com/yhwang/node-red-contrib-tf-model
const path = require('path');
const fs = require('fs');

const tf = require('@tensorflow/tfjs-node');
const automl = require('@tensorflow/tfjs-automl');

const MODEL_PATH = path.resolve(
  process.env.MODEL_PATH ||
    `${__dirname}/../../public/models/tf_js-manu_images_v2/model.json`
);
const IMAGE_PATH = path.resolve(process.env.IMAGE_PATH);

const loadDictionary = (modelUrl) => {
  const lastIndexOfSlash = modelUrl.lastIndexOf('/');
  const prefixUrl =
    lastIndexOfSlash >= 0 ? modelUrl.slice(0, lastIndexOfSlash + 1) : '';
  const dictUrl = `${prefixUrl}dict.txt`;
  const text = fs.readFileSync(dictUrl, { encoding: 'utf-8' });
  return text.trim().split('\n');
};

const loadImageClassification = async (modelUrl) => {
  const [model, dict] = await Promise.all([
    tf.loadGraphModel(`file://${modelUrl}`),
    loadDictionary(modelUrl),
  ]);
  return new automl.ObjectDetectionModel(model, dict);
};

const decodeImage = (imgPath) => {
  const imgSrc = fs.readFileSync(imgPath);
  const arrByte = Uint8Array.from(Buffer.from(imgSrc));
  return tf.node.decodeImage(arrByte);
};

(async () => {
  console.log('Loading model...', MODEL_PATH);

  const model = await loadImageClassification(MODEL_PATH);
  const decodedImage = decodeImage(IMAGE_PATH);

  console.log('Running predictions...');
  const predictions = await model.detect(decodedImage, {
    score: 0.5,
    iou: 0.5,
    topk: 5,
  });

  console.log(predictions);
})().catch((err) => {
  console.error(err);
});
