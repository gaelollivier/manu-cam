import * as tf from '@tensorflow/tfjs';
import { loadGraphModel } from '@tensorflow/tfjs-converter';

const threshold = 0.75;

async function loadModel() {
  const model = await loadGraphModel('/models/tf_js-manu_images_v2/model.json');
  return model;
}

function prepareImage(image: HTMLImageElement) {
  const tfimg = tf.browser.fromPixels(image).toFloat();
  const expandedimg = tfimg.transpose([0, 1, 2]).expandDims();
  return expandedimg;
}

export const ManuAI = ({
  imageRef,
}: {
  imageRef: React.RefObject<HTMLImageElement>;
}) => {
  const handleDetect = async () => {
    const img = imageRef.current;
    if (!img) {
      return;
    }

    const model = await loadModel();

    tf.engine().startScope();
    const predictions = (await model.executeAsync(
      prepareImage(img)
    )) as Array<tf.Tensor>;
    console.log('Predictions 0', predictions[0].arraySync());
    console.log('Predictions 1', predictions[1].arraySync());
    tf.engine().endScope();
  };

  return <button onClick={handleDetect}>MANU AI</button>;
};
