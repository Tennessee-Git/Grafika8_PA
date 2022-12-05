let canvas = document.getElementById("canvas");
let ctx;
if (canvas.getContext) {
  ctx = canvas.getContext("2d", { willReadFrequently: true });
}

let loadedFile,
  binarized = false;

const hitOrMissThickening = [
  // 0 stopni
  [
    [1, 1, 0],
    [1, -1, 0],
    [1, 0, -1],
  ],
  // 90 stopni
  [
    [1, 1, 1],
    [0, -1, 1],
    [-1, 0, 0],
  ],
  // 180 stopni
  [
    [-1, 0, 1],
    [0, -1, 1],
    [0, 1, 1],
  ],
  // 270 stopni
  [
    [0, 0, -1],
    [1, -1, 0],
    [1, 1, 1],
  ],
];

const hitOrMissThining = [
  // 0 stopni
  [
    [-1, -1, -1],
    [0, 1, 0],
    [1, 1, 1],
  ],
  // 90 stopni
  [
    [1, 0, -1],
    [1, 1, -1],
    [1, 0, -1],
  ],
  // 180 stopni
  [
    [1, 1, 1],
    [0, 1, 0],
    [-1, -1, -1],
  ],
  // 270 stopni
  [
    [-1, 0, 1],
    [-1, 1, 1],
    [-1, 0, 1],
  ],
];

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
  binarized = true;
};

const neighboringPixelWithValue = (value, x, y) => {
  for (let i = x - 1; i <= x + 1; i++) {
    for (let j = y - 1; j <= y + 1; j++) {
      var [R, G, B] = ctx.getImageData(i, j, 1, 1).data;
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
      pixel.data[3] = 255;
      ctx.putImageData(pixel, i, j);
    }
  }
};

const hitOrMiss = (x, y, patterns) => {
  var fits;
  for (let patternIndex = 0; patternIndex < 4; patternIndex++) {
    var pattern = patterns[patternIndex],
      index = 0;
    fits = true;
    for (let i = x - 1; i < x + 1; i++) {
      for (let j = y - 1; j < y + 1; j++) {
        var [R, G, B] = ctx.getImageData(i, j, 1, 1).data;
        if (
          pattern[Math.round(index % 3)][Math.round(index / 3)] === 1 &&
          (R !== 255 || G !== 255 || B !== 255)
        ) {
          fits = false;
        } else if (
          pattern[Math.round(index % canvas.width)][
            Math.round(index / canvas.width)
          ] === -1 &&
          (R !== 0 || G !== 0 || B !== 0)
        )
          index++;
      }
    }
    if (fits) return true;
  }
  return false;
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

const performThinning = () => {
  var hitOrMissArray = [];
  for (let i = 0; i < canvas.width; i++) {
    hitOrMissArray[i] = [];
    for (let j = 0; j < canvas.height; j++) {
      hitOrMissArray[i][j] = hitOrMiss(i, j, hitOrMissThining);
    }
  }
  for (let x = 0; x < canvas.width; x++) {
    for (let y = 0; y < canvas.height; y++) {
      if (hitOrMissArray[x][y]) {
        var pixel = ctx.getImageData(x, y, 1, 1);
        pixel.data[0] = 255;
        pixel.data[1] = 255;
        pixel.data[2] = 255;
        ctx.putImageData(pixel, x, y);
      }
    }
  }
};

const performThickening = () => {
  var hitOrMissArray = [];
  for (let i = 0; i < canvas.width; i++) {
    hitOrMissArray[i] = [];
    for (let j = 0; j < canvas.height; j++) {
      hitOrMissArray[i][j] = hitOrMiss(i, j, hitOrMissThickening);
    }
  }
  for (let x = 0; x < canvas.width; x++) {
    for (let y = 0; y < canvas.height; y++) {
      var pixel = ctx.getImageData(x, y, 1, 1);
      var [R, G, B] = pixel.data;
      if (R === 255 && G === 255 && B === 255)
        if (hitOrMissArray[x][y]) {
          pixel.data[0] = 0;
          pixel.data[1] = 0;
          pixel.data[2] = 0;
          ctx.putImageData(pixel, x, y);
        }
    }
  }
};
