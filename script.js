let canvas = document.getElementById("canvas");
let ctx;
if (canvas.getContext) {
  ctx = canvas.getContext("2d", { willReadFrequently: true });
}

let loadedFile,
  binarized = false;

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
});

document.getElementById("dilation").addEventListener("click", () => {});
document.getElementById("erosion").addEventListener("click", () => {});
document.getElementById("opening").addEventListener("click", () => {});
document.getElementById("closing").addEventListener("click", () => {});
document.getElementById("emboldening").addEventListener("click", () => {});
document.getElementById("thinning").addEventListener("click", () => {});

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

const dilation = () => {};
