const fs = require('fs');

(async () => {
  const labels = fs
    .readFileSync(`${__dirname}/data/labels.csv`, {
      encoding: 'utf-8',
    })
    .split('\n')
    .map((lineStr) => {
      const line = lineStr.split(',');
      return {
        label: line[0],
        x1: line[1],
        y1: line[2],
        x2: line[3],
        y2: line[4],
        filename: line[5],
        imageWidth: line[6],
        imageHeight: line[7],
      };
    });

  const newLabels = labels
    .map(({ label, x1, y1, x2, y2, filename, imageWidth, imageHeight }) =>
      [
        // Let gcloud assign the set: TRAIN/VALIDATE/TEST
        'UNASSIGNED',
        `gs://manu-cam-training-data/images/${filename}`,
        label,
        // NOTE: gcloud expects normalized coordinates
        (x1 / imageWidth).toFixed(4),
        (y1 / imageHeight).toFixed(4),
        '',
        '',
        (x2 / imageWidth).toFixed(4),
        (y2 / imageHeight).toFixed(4),
        '',
        '',
      ].join(',')
    )
    .join('\n');

  fs.writeFileSync(`${__dirname}/data/labels_gcloud.csv`, newLabels, {
    encoding: 'utf-8',
  });
})();
