const eraserSize = document.getElementById("brushSize");
const eraserBtn = document.getElementById("eraserBtn");
eraserBtn.addEventListener("click", () => (drawing = "eraser"));

const chooseImageBtn = document.getElementById("chooseImageBtn");
const imageInput = document.getElementById("imageInput");
let selectedImage = null;
const imageLoader = document.getElementById("imageLoader");
const pasteBtn = document.getElementById("pasteBtn");

imageLoader.addEventListener("change", loadImage, false);
pasteBtn.addEventListener("click", () => {
  imageLoader.click();
});

function loadImage(e) {
  const reader = new FileReader();
  reader.onload = function (event) {
    const img = new Image();
    img.onload = function () {
      ctx.drawImage(img, 0, 0);
      saveHistory();
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(e.target.files[0]);
}

const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const pencilBtn = document.getElementById("pencilBtn");
const rectBtn = document.getElementById("rectBtn");
const circleBtn = document.getElementById("circleBtn");
const starBtn = document.getElementById("starBtn");
const colorPicker = document.getElementById("colorPicker");
const brushSize = document.getElementById("brushSize");
const fillBtn = document.getElementById("fillBtn");
const undoBtn = document.getElementById("undoBtn");
const redoBtn = document.getElementById("redoBtn");

let painting = false;
let drawing = "pencil";
let brushColor = "#000000";
let startX, startY;

let history = [];
let undoneHistory = [];

let imageDataBeforePreview;

canvas.addEventListener("mousedown", (e) => {
  painting = true;
  startX = e.clientX - canvas.offsetLeft;
  startY = e.clientY - canvas.offsetTop;
  ctx.beginPath();
  ctx.moveTo(startX, startY);

  if (drawing === "fill") {
    floodFill(
      startX,
      startY,
      ctx.getImageData(0, 0, canvas.width, canvas.height),
      brushColor
    );
  }

  imageDataBeforePreview = ctx.getImageData(0, 0, canvas.width, canvas.height);
  saveHistory();
});

canvas.addEventListener("mousemove", (e) => {
  const x = e.clientX - canvas.offsetLeft;
  const y = e.clientY - canvas.offsetTop;

  if (painting) {
    if (drawing === "pencil") {
      ctx.lineWidth = brushSize.value;
      ctx.lineTo(x, y);
      ctx.strokeStyle = brushColor;
      ctx.stroke();
    } else if (drawing === "rectangle") {
      ctx.putImageData(imageDataBeforePreview, 0, 0);
      drawRectanglePreview(startX, startY, x, y);
    } else if (drawing === "circle") {
      ctx.putImageData(imageDataBeforePreview, 0, 0);
      drawCirclePreview(startX, startY, x, y);
    } else if (drawing === "star") {
      ctx.putImageData(imageDataBeforePreview, 0, 0);
      drawStarPreview(startX, startY, x, y);
    } else if (painting && drawing === "eraser") {
      ctx.lineWidth = eraserSize.value;
      ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();
    }
  }
});

canvas.addEventListener("mouseup", (e) => {
  const x = e.clientX - canvas.offsetLeft;
  const y = e.clientY - canvas.offsetTop;

  if (drawing === "rectangle") {
    ctx.putImageData(imageDataBeforePreview, 0, 0);
    drawRectanglePreview(startX, startY, x, y);
  } else if (drawing === "circle") {
    ctx.putImageData(imageDataBeforePreview, 0, 0);
    drawCirclePreview(startX, startY, x, y);
  } else if (drawing === "star") {
    ctx.putImageData(imageDataBeforePreview, 0, 0);
    drawStar(startX, startY, x, y);
  }
  painting = false;
  ctx.closePath();
  saveHistory();
});

canvas.addEventListener("mouseleave", () => {
  painting = false;
  ctx.closePath();
});

pencilBtn.addEventListener("click", () => (drawing = "pencil"));
rectBtn.addEventListener("click", () => (drawing = "rectangle"));
circleBtn.addEventListener("click", () => (drawing = "circle"));
starBtn.addEventListener("click", () => (drawing = "star"));
colorPicker.addEventListener("input", () => (brushColor = colorPicker.value));
fillBtn.addEventListener("click", () => (drawing = "fill"));

function drawRectanglePreview(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.rect(x1, y1, x2 - x1, y2 - y1);
  ctx.strokeStyle = brushColor;
  ctx.stroke();
  ctx.closePath();
}

function drawCirclePreview(x1, y1, x2, y2) {
  ctx.beginPath();
  const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  ctx.arc(x1, y1, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = brushColor;
  ctx.stroke();
  ctx.closePath();
}

function drawStarPreview(x1, y1, x2, y2) {
  ctx.beginPath();
  const outerRadius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  const innerRadius = outerRadius / 2;
  const numPoints = 5;
  const angle = (2 * Math.PI) / numPoints;

  for (let i = 0; i <= 2 * numPoints; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    ctx.lineTo(
      x1 + radius * Math.sin(i * angle),
      y1 - radius * Math.cos(i * angle)
    );
  }
  ctx.closePath();
  ctx.strokeStyle = brushColor;
  ctx.stroke();
}

function drawStar(x1, y1, x2, y2) {
  ctx.beginPath();
  const outerRadius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  const innerRadius = outerRadius / 2;
  const numPoints = 5;
  const angle = (2 * Math.PI) / numPoints;

  for (let i = 0; i <= 2 * numPoints; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    ctx.lineTo(
      x1 + radius * Math.sin(i * angle),
      y1 - radius * Math.cos(i * angle)
    );
  }
  ctx.closePath();
  ctx.fillStyle = brushColor;
  ctx.fill();
  ctx.strokeStyle = brushColor;
  ctx.stroke();
}

function getColorAtPixel(imageData, x, y) {
  const index = (y * imageData.width + x) * 4;
  return {
    r: imageData.data[index],
    g: imageData.data[index + 1],
    b: imageData.data[index + 2],
    a: imageData.data[index + 3],
  };
}

function setColorAtPixel(imageData, x, y, color) {
  const index = (y * imageData.width + x) * 4;
  imageData.data[index] = color.r;
  imageData.data[index + 1] = color.g;
  imageData.data[index + 2] = color.b;
  imageData.data[index + 3] = color.a;
}

function colorsMatch(a, b) {
  return a.r === b.r && a.g === b.g && a.b === b.b && a.a === b.a;
}

function hexToRGBA(hex) {
  const bigint = parseInt(hex.slice(1), 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
    a: 255,
  };
}

function floodFill(startX, startY, imageData, newColor) {
  const stack = [[startX, startY]];
  const width = imageData.width;
  const height = imageData.height;
  const newColorRGBA = hexToRGBA(newColor);
  const oldColor = getColorAtPixel(imageData, startX, startY);

  if (colorsMatch(oldColor, newColorRGBA)) {
    return;
  }

  while (stack.length) {
    const [x, y] = stack.pop();

    if (x < 0 || x >= width || y < 0 || y >= height) {
      continue;
    }

    const currentColor = getColorAtPixel(imageData, x, y);

    if (colorsMatch(currentColor, oldColor)) {
      setColorAtPixel(imageData, x, y, newColorRGBA);

      stack.push([x - 1, y]);
      stack.push([x + 1, y]);
      stack.push([x, y - 1]);
      stack.push([x, y + 1]);
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

function saveHistory() {
  history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  undoneHistory = [];
}

function undo() {
  if (history.length > 1) {
    undoneHistory.push(history.pop());
    ctx.putImageData(history[history.length - 1], 0, 0);
  }
}

function redo() {
  if (undoneHistory.length > 0) {
    history.push(undoneHistory.pop());
    ctx.putImageData(history[history.length - 1], 0, 0);
  }
}

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "z") {
    undo();
  } else if (e.ctrlKey && e.key === "y") {
    redo();
  }
});

undoBtn.addEventListener("click", undo);

function drawStar(x1, y1, x2, y2) {
  ctx.beginPath();
  const outerRadius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  const innerRadius = outerRadius / 2;
  const numPoints = 16;
  const angle = (2 * Math.PI) / numPoints;

  for (let i = 0; i <= 2 * numPoints; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    ctx.lineTo(
      x1 + radius * Math.sin(i * angle),
      y1 - radius * Math.cos(i * angle)
    );
  }
  ctx.closePath();
  ctx.fillStyle = brushColor;
  ctx.fill();
  ctx.strokeStyle = brushColor;
  ctx.stroke();
}

starBtn.addEventListener("click", () => (drawing = "star"));

function drawStarPreview(x1, y1, x2, y2) {
  ctx.beginPath();
  const outerRadius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  const innerRadius = outerRadius / 2;
  const numPoints = 16;
  const angle = (2 * Math.PI) / numPoints;

  for (let i = 0; i <= 2 * numPoints; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    ctx.lineTo(
      x1 + radius * Math.sin(i * angle),
      y1 - radius * Math.cos(i * angle)
    );
  }
  ctx.closePath();
  ctx.strokeStyle = brushColor;
  ctx.stroke();
}

canvas.addEventListener("mousedown", (e) => {
  painting = true;
  startX = e.clientX - canvas.offsetLeft;
  startY = e.clientY - canvas.offsetTop;

  if (drawing === "star") {
    drawStarPreview(
      startX,
      startY,
      e.clientX - canvas.offsetLeft,
      e.clientY - canvas.offsetTop
    );
  }
});
canvas.addEventListener("mousemove", (e) => {
  if (painting && drawing === "pencil") {
    ctx.lineWidth = brushSize.value;
    ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
    ctx.strokeStyle = brushColor;
    ctx.stroke();
  } else if (painting && drawing === "rectangle") {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(history[history.length - 1], 0, 0);
    const width = e.clientX - canvas.offsetLeft - startX;
    const height = e.clientY - canvas.offsetTop - startY;
    ctx.strokeRect(startX, startY, width, height);
  } else if (painting && drawing === "circle") {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(history[history.length - 1], 0, 0);
    const radius = Math.sqrt(
      Math.pow(e.clientX - canvas.offsetLeft - startX, 2) +
        Math.pow(e.clientY - canvas.offsetTop - startY, 2)
    );
    ctx.beginPath();
    ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
    ctx.stroke();
  } else if (painting && drawing === "star") {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(history[history.length - 1], 0, 0);
    drawStarPreview(
      startX,
      startY,
      e.clientX - canvas.offsetLeft,
      e.clientY - canvas.offsetTop
    );
  }
});

canvas.addEventListener("mouseup", (e) => {
  if (drawing === "rectangle") {
    const width = e.clientX - canvas.offsetLeft - startX;
    const height = e.clientY - canvas.offsetTop - startY;
    ctx.strokeRect(startX, startY, width, height);
    saveState();
  } else if (drawing === "circle") {
    const radius = Math.sqrt(
      Math.pow(e.clientX - canvas.offsetLeft - startX, 2) +
        Math.pow(e.clientY - canvas.offsetTop - startY, 2)
    );
    ctx.beginPath();
    ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
    ctx.stroke();
    saveState();
  } else if (drawing === "star") {
    drawStar(
      startX,
      startY,
      e.clientX - canvas.offsetLeft,
      e.clientY - canvas.offsetTop
    );
    saveState();
  }
  painting = false;
  ctx.closePath();
});
chooseImageBtn.addEventListener("click", () => {
  imageInput.click();
});

imageInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      selectedImage = new Image();
      selectedImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
    drawing = "image";
  }
});
