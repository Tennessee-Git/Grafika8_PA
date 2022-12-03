let canvas = document.getElementById("canvas");
let ctx;
if (canvas.getContext) {
  ctx = canvas.getContext("2d", { willReadFrequently: true });
}

let loadedFile,
  binarized = false,
  binarizedImage;

document.getElementById("dragAndDrop").addEventListener(
  "dragover",
  (event) => {
    event.preventDefault();
  },
  true
);

document.getElementById("dragAndDrop").addEventListener(
  "drop",
  (event) => {
    const data = event.dataTransfer;
    event.preventDefault();
    handleFile(data.files[0]);
  },
  true
);

document.getElementById("binBtn").addEventListener("click", () => {
  var value = document.getElementById("bin").value;
  binarizeImage(value);
});

document.getElementById("reset").addEventListener("click", () => {
  handleFile(loadedFile);
  binarized = false;
});

document.getElementById("dilation").addEventListener("click", () => {
  if (binarized) performDilation();
  else alert("Binarize image first!!");
});
document.getElementById("erosion").addEventListener("click", () => {
  if (binarized) performErosion();
  else alert("Binarize image first!!");
});
document.getElementById("opening").addEventListener("click", () => {
  if (binarized) performOpening();
  else alert("Binarize image first!!");
});
document.getElementById("closing").addEventListener("click", () => {
  if (binarized) performClosing();
  else alert("Binarize image first!!");
});
document.getElementById("thickening").addEventListener("click", () => {
  if (binarized) performThickening();
  else alert("Binarize image first!!");
});
document.getElementById("thinning").addEventListener("click", () => {
  if (binarized) performThinning();
  else alert("Binarize image first!!");
});

const handleFile = (file) => {
  const imageType = /image.*/;
  if (file.type.match(imageType)) {
    const reader = new FileReader();
    reader.onloadend = (event) => {
      const image = new Image();
      image.onload = (e) => {
        canvas.height = e.target.height;
        canvas.width = e.target.width;
        ctx.drawImage(e.target, 0, 0);
      };
      image.src = event.target.result;
    };
    reader.readAsDataURL(file);
    loadedFile = file;
  }
};

const binarizeImage = (value) => {
  var LUT = [256];
  for (let i = 0; i < 256; i++) {
    LUT[i] = i > value ? 255 : 0;
  }
  var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  var arr = imageData.data;
  for (let i = 0; i < arr.length; i += 4) {
    var avg = Math.round((arr[i] + arr[i + 1] + arr[i + 2]) / 3);
    arr[i] = LUT[avg];
    arr[i + 1] = LUT[avg];
    arr[i + 2] = LUT[avg];
    arr[i + 3] = 255;
  }
  imageData.data = arr;
  ctx.putImageData(imageData, 0, 0);
  binarizedImage = imageData;
  binarized = true;
};

const converTo2dArray = (imageData, height, width) => {
  let arr = [];
  for (let i = 0; i < imageData.length; i += 4) {
    arr.push(
      Math.round(
        0.3 * imageData[i] + 0.59 * imageData[i + 1] + 0.11 * imageData[i + 2]
      )
    );
  }
  var outputArray = [];
  for (let i = 0; i < height; i++) {
    outputArray.push(Array.from(Array(width)));
  }
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      outputArray[y][x] = arr[x + width * y];
    }
  }
  return outputArray;
};

const neighboringPixelWithValue = (value, x, y) => {
  for (let i = x - 1; i <= x + 1; i++) {
    for (let j = y - 1; j <= y + 1; j++) {
      let [R, G, B] = ctx.getImageData(i, j, 1, 1).data;
      if (R === value && G === value && B === value) return true;
    }
  }
  return false;
};

const fillPixelsWithValue = (filteredArray, valueIftrue, valueIfFalse) => {
  for (let i = 0; i < canvas.width; i++) {
    for (let j = 0; j < canvas.height; j++) {
      const pixel = ctx.getImageData(i, j, 1, 1);
      if (filteredArray[i][j]) {
        pixel.data[0] = valueIftrue;
        pixel.data[1] = valueIftrue;
        pixel.data[2] = valueIftrue;
      } else {
        pixel.data[0] = valueIfFalse;
        pixel.data[1] = valueIfFalse;
        pixel.data[2] = valueIfFalse;
      }
      ctx.putImageData(pixel, i, j);
    }
  }
};

const performDilation = () => {
  const filteredArray = [];
  for (let i = 0; i < canvas.width; i++) {
    filteredArray[i] = [];
    for (let j = 0; j < canvas.height; j++) {
      filteredArray[i][j] = neighboringPixelWithValue(0, i, j);
    }
  }
  fillPixelsWithValue(filteredArray, 0, 255);
};
const performErosion = () => {
  const filteredArray = [];
  for (let i = 0; i < canvas.width; i++) {
    filteredArray[i] = [];
    for (let j = 0; j < canvas.height; j++) {
      filteredArray[i][j] = neighboringPixelWithValue(255, i, j);
    }
  }
  fillPixelsWithValue(filteredArray, 255, 0);
};
const performOpening = () => {
  performErosion();
  performDilation();
};
const performClosing = () => {
  performDilation();
  performErosion();
};
const performThinning = () => {};
const performThickening = () => {};
