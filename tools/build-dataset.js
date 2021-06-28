const fs = require('fs');

(async () => {
  const { images } = JSON.parse(
    fs.readFileSync(`${__dirname}/data/images-export.json`, {
      encoding: 'utf-8',
    })
  );

  const annotatedImages = images.filter(
    ({ annotations }) => annotations?.boundingBoxes?.length > 0
  );

  console.log('Annotated images count:', annotatedImages.length);

  const annotations = annotatedImages
    .map((image) =>
      image.annotations.boundingBoxes.map((annotation) => ({
        image,
        annotation,
      }))
    )
    .flat();

  console.log('Annotations count:', annotations.length);

  const annotationsCSV = annotations
    .map(({ image, annotation }) => {
      return [
        'UNASSIGNED',
        `gs://manu-cam-training-data/images/${image._id}.jpg`,
        // Label
        'turtle',
        // NOTE: gcloud expects normalized coordinates
        Math.min(annotation.x1, 1).toFixed(5),
        Math.min(annotation.y1, 1).toFixed(5),
        '',
        '',
        Math.min(annotation.x2, 1).toFixed(5),
        Math.min(annotation.y2, 1).toFixed(5),
        '',
        '',
      ].join(',');
    })
    .join('\n');

  fs.writeFileSync(`${__dirname}/data/labels.csv`, annotationsCSV, {
    encoding: 'utf-8',
  });
})();
