let startMillis;
let fps = 24;
let circles = [];
let maxAttempts = 100;
let circleDensity = 400; // Adjust to increase or decrease the number of circles

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(fps);
  noiseSeed(random(1000));
  randomSeed(99);

  // Generate non-overlapping circles
  generateCircles(circleDensity); // Increase number to ensure the screen is filled
}

function draw() {
  background(0, 85, 128); // Change background to a deeper blue

  if (frameCount === 1) {
    startMillis = millis();
  }

  let elapsed = millis() - startMillis;
  let t = map(elapsed, 0, 30000, 0, 1);

  if (t > 1) {
    noLoop();
    return;
  }

  for (let circle of circles) {
    let noiseFactor = noise(frameCount * 0.01 + circle.index * 0.1);
    let newSize = circle.baseSize * noise(frameCount * 0.01 + circle.index * 0.1);
    drawConcentricCircles(circle.x, circle.y, newSize, noiseFactor);
    drawEllipsesAroundCircle(circle.x, circle.y, newSize, noiseFactor);
    drawSurroundingCircles(circle.x, circle.y, 15, circles.length, newSize, noiseFactor);
    drawExtendingLine(circle.x, circle.y, newSize, noiseFactor);
  }
}

/**
 * Generates non-overlapping circles.
 * @param {number} numCircles - The number of circles to generate.
 */
function generateCircles(numCircles) {
  for (let i = 0; i < numCircles; i++) {
    let attempts = 0;
    let newCircle;
    while (attempts < maxAttempts) {
      let posX = random(width);
      let posY = random(height);
      let size = random(200, 400); // Increase the size of the circles
      newCircle = { x: posX, y: posY, baseSize: size, index: i };

      if (!isOverlapping(newCircle)) {
        circles.push(newCircle);
        break;
      }
      attempts++;
    }
  }
}

/**
 * Checks if a new circle overlaps with existing circles.
 * @param {object} newCircle - The new circle to check.
 * @returns {boolean} - True if overlapping, false otherwise.
 */
function isOverlapping(newCircle) {
  for (let circle of circles) {
    let d = dist(newCircle.x, newCircle.y, circle.x, circle.y);
    if (d < (newCircle.baseSize + circle.baseSize) / 2) {
      return true;
    }
  }
  return false;
}

/**
 * Draws an ellipse.
 * @param {number} centerX - The x-coordinate of the ellipse's center.
 * @param {number} centerY - The y-coordinate of the ellipse's center.
 * @param {number} ellipseWidth - The width of the ellipse.
 * @param {number} ellipseHeight - The height of the ellipse.
 * @param {number} rotation - The rotation angle of the ellipse.
 */
function drawEllipse(centerX, centerY, ellipseWidth, ellipseHeight, rotation) {
  push();
  translate(centerX, centerY);
  rotate(rotation);
  beginShape();
  for (let i = 0; i < 100; i++) {
    fill(randomColor());
    stroke(255, 117, 26); // Remove transparency for a more vibrant effect
    strokeWeight(2);
    let angle = TWO_PI * i / 100;
    let x = ellipseWidth * cos(angle);
    let y = ellipseHeight * sin(angle);
    vertex(x, y);
  }
  endShape(CLOSE);
  pop();
}

/**
 * Draws ellipses around a circle.
 * @param {number} centerX - The x-coordinate of the circle's center.
 * @param {number} centerY - The y-coordinate of the circle's center.
 * @param {number} circleSize - The size of the circle.
 * @param {number} noiseFactor - The noise factor for randomness.
 */
function drawEllipsesAroundCircle(centerX, centerY, circleSize, noiseFactor) {
  let numEllipses = 33;
  let ellipseWidth = random(circleSize / 8, circleSize / 4); // Randomize ellipse size
  let ellipseHeight = random(circleSize / 16, circleSize / 8); // Randomize ellipse size
  let radius = circleSize / 1.8;

  for (let i = 0; i < numEllipses; i++) {
    let angle = TWO_PI * i / numEllipses;
    let ellipseCenterX = centerX + radius * cos(angle + noiseFactor);
    let ellipseCenterY = centerY + radius * sin(angle + noiseFactor);
    let rotation = angle + HALF_PI;
    drawEllipse(ellipseCenterX, ellipseCenterY, ellipseWidth, ellipseHeight, rotation);
  }
}

/**
 * Draws surrounding circles.
 * @param {number} centerX - The x-coordinate of the main circle's center.
 * @param {number} centerY - The y-coordinate of the main circle's center.
 * @param {number} angle - The angle to start drawing the surrounding circles.
 * @param {number} numCircles - The number of surrounding circles.
 * @param {number} circleSize - The size of the main circle.
 * @param {number} noiseFactor - The noise factor for randomness.
 */
function drawSurroundingCircles(centerX, centerY, angle, numCircles, circleSize, noiseFactor) {
  let smallCircleSize = random(circleSize / 5, circleSize / 3); // Randomize small circle size
  let radius = circleSize / 2 + smallCircleSize / 2 + 2;

  for (let i = 0; i < numCircles; i++) {
    for (angle; angle < 360; angle += 72) {
      fill(randomColor());
      stroke(0, 0, 0); // Remove transparency for a more vibrant effect
      strokeWeight(4);
      let rad = radians(angle + noiseFactor * 100);
      let x = centerX + radius * cos(rad);
      let y = centerY + radius * sin(rad);
      circle(x, y, smallCircleSize);
    }
  }
}

/**
 * Draws concentric circles.
 * @param {number} x - The x-coordinate of the center.
 * @param {number} y - The y-coordinate of the center.
 * @param {number} size - The size of the outermost circle.
 * @param {number} noiseFactor - The noise factor for randomness.
 */
function drawConcentricCircles(x, y, size, noiseFactor) {
  const layers = random(4, 10);
  let currentSize = size;

  for (let i = 0; i < layers; i++) {
    stroke(0, 0, 0); // Remove transparency for a more vibrant effect
    strokeWeight(random(3));
    fill(randomColor());
    ellipse(x + noiseFactor * 10, y + noiseFactor * 10, currentSize, currentSize);
    currentSize *= random(0.6, 0.9); // Adjust the shrinking factor with randomness
  }
}

/**
 * Draws an extending line from the center of a circle.
 * @param {number} centerX - The x-coordinate of the circle's center.
 * @param {number} centerY - The y-coordinate of the circle's center.
 * @param {number} circleSize - The size of the circle.
 * @param {number} noiseFactor - The noise factor for randomness.
 */
function drawExtendingLine(centerX, centerY, circleSize, noiseFactor) {
  const HALF_PI = Math.PI / 2;
  let angle = random(-HALF_PI, HALF_PI);
  let radius = circleSize / 1.6;

  let xEnd = centerX + radius * cos(angle + noiseFactor);
  let yEnd = centerY + radius * sin(angle + noiseFactor);

  let controlX = centerX + radius * 0.4 * cos(angle);
  let controlY = centerY + radius * 1 * sin(angle);

  stroke(255, 20, 147); // Remove transparency for a more vibrant effect
  strokeWeight(4);

  noFill();
  beginShape();
  vertex(centerX, centerY);
  quadraticVertex(controlX, controlY, xEnd, yEnd);
  endShape();
}

/**
 * Generates a random color without transparency.
 * @returns {p5.Color} - A p5.Color object with random RGB values.
 */
function randomColor() {
  return color(random(0, 255), random(0, 255), random(0, 255)); // Remove transparency for a more vibrant effect
}
