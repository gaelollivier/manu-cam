const fs = require('fs');
const sharp = require('sharp');
const request = require('request');

(async () => {
  const input = JSON.parse(
    fs.readFileSync(`${__dirname}/annotations.json`, {
      encoding: 'utf-8',
    })
  );

  for (const { image } of input.filter(({ turtle }) => turtle)) {
    const filename = `${__dirname}/images/${image.time
      .substr(0, 16)
      .replace('T', '_')
      .replace(/:/g, '-')}.jpg`;

    await new Promise((resolve) =>
      request
        .get(image.files.large.mediaLink)
        // Resize to fix google cloud max image dimensions
        .pipe(sharp().resize({ height: 1080 }))
        .pipe(fs.createWriteStream(filename))
        .on('close', resolve)
    );

    console.log(filename);
  }
})();
