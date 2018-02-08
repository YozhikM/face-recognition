const fs = require('fs');
const tmp = require('tmp');
const fr = require('face-recognition');
const gm = require('gm').subClass({ imageMagick: true });

function createRectangles(imgPath) {
  const image = fr.loadImage(imgPath);
  const detector = fr.FaceDetector();
  const faceRectangles = detector.locateFaces(image);

  console.log('rectangles created');
  return faceRectangles;
}

async function createCroppedImages(faceRectangles, buffer, scale) {
  const arr = [];
  faceRectangles.forEach(async (fc, i) => {
    const { bottom, top, right, left } = fc.rect || {};

    const width = (right - left) * scale;
    const height = (bottom - top) * scale;
    const x = left;
    const y = top;

    await gm(buffer)
      .crop(width, height, x, y)
      .toBuffer('JPG', async (error, croppedBuffer) => {
        if (error) console.log(error);
        // этого не будет, сделано для проверки
        // gm(croppedBuffer).write(`./images/face${i + 1}.jpg`, () => {
        //   console.log(`image #${i + 1} recorded`);
        // });
        await gm(croppedBuffer).toBuffer('JPG', async (err, buff) => {
          await arr.push(buff);
          console.log(`buff${i}`, buff);
        });
      });
  });
  console.log('arr: ', arr);
}

function getBuffer(buffer, scale = 1) {
  const tmpobj = tmp.fileSync({ postfix: '.jpg' });
  const tmpName = tmpobj.name;
  let result;

  fs.writeFile(tmpName, buffer, 'binary', err => {
    if (err) console.log(err);

    const faceRectangles = createRectangles(tmpName);

    createCroppedImages(faceRectangles, buffer, scale);

    fs.unlink(tmpName, () => console.log('file deleted'));
  });
  if (result) console.log(result);
}

module.exports = getBuffer;
