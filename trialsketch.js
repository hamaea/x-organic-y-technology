// TITLE:
// X: ORGANIC, Y: TECHNOLOGY
// (ELLIA, ISHAANA, NAOMI)
// We want to make interactive audio-visual experience combining video with audio-reactive rectangles
// We want rectangles to move and pulse in response to music frequency and amplitude
// We want each rectangle to display its real-time coordinate position
// We need to touch/click to play or pause the audio

// GLOBAL VARIABLES
// Video and audio elements
let vid;
let sound;
let amp; // Amplitude analyzer to measure overall volume
let fft; // FFT analyzer to measure frequency data
let play = false; // Boolean to track play state
let rectangles = []; // Array to store all rectangle objects with their properties
let videoIsPlaying = false; // Boolean to track if video is currently playing

function preload() {
  // Load audio file before the sketch starts
  // This ensures the sound is ready when the program begins
  sound = loadSound("assets/song01.mp3");
}

function setup() {
  // Create canvas that fills the entire window
  createCanvas(windowWidth, windowHeight);

  // VIDEO SETUP
  // Create video element with autoplay capabilities
  vid = createVideo("assets/finalvideo.mp4");
  // To Set video size to match canvas dimensions
  vid.size(width, height);
  // Hide the default HTML video element (we'll draw it on canvas instead)
  vid.hide();
  // Mute the video's audio track (we use separate audio file)
  vid.volume(0);
  // Set muted attribute - this is required for autoplay to work in browsers
  vid.attribute('muted', '');
  // Set playsinline attribute - this is required for autoplay on mobile devices
  vid.attribute('playsinline', '');
  // Enable autoplay so video starts immediately
  vid.autoplay(true);
  // Loop video continuously
  vid.loop();
  // Set videoIsPlaying to true since video starts automatically
  videoIsPlaying = true;

  // Console log to confirm video element was created successfully
  console.log("Video element created:", vid);

  // AUDIO ANALYSIS SETUP
  // Create amplitude analyzer to measure overall loudness (0 to 1)
  amp = new p5.Amplitude();
  // Create FFT analyzer to measure frequency spectrum data
  fft = new p5.FFT();

  // CREATE RECTANGLES
  // To generate 12 rectangles with random properties
  // We use for-loop to create multiple rectangles efficiently
  // Instead of writing the same code 12 times, the loop does it for us
  for (let i = 0; i < 12; i++) {
    // To generate random size for each rectangle
    let size = random(20, 80);
    // Add new rectangle object to the array with all its properties
    rectangles.push({
      x: random(width), // Random starting x position
      y: random(height), // Random starting y position
      size: size, // Base size of rectangle
      speedX: random(-3, 3), // Horizontal movement speed (negative = left, positive = right)
      speedY: random(-3, 3), // Vertical movement speed (negative = up, positive = down)
      sensitivity: random(0.5, 2) // To measure how much the rectangle reacts to audio (higher = more reactive)
    });
  }

  // DRAWING SETTINGS
  // Set rectangle drawing mode to center (draws from center point instead of corner)
  rectMode(CENTER);
  // Set text alignment to center horizontally and vertically
  textAlign(CENTER, CENTER);
}

function draw() {
  // BACKGROUND (GREY)
  background(220);

  // VIDEO DISPLAY
  // Set image drawing mode to corner (draws from top-left corner)
  imageMode(CORNER);
  // Draw video to fill the entire canvas
  image(vid, 0, 0, width, height);

  // AUDIO ANALYSIS
  // Get current audio amplitude level (overall loudness from 0 to 1)
  let level = amp.getLevel();
  // Analyze frequency spectrum (returns array of 1024 frequency values from 0 to 255)
  let spectrum = fft.analyze();

  // DRAW RECTANGLES WITH COORDINATE TEXT
  // Use push() to save current drawing settings
  push();
  // Set blend mode to DIFFERENCE for visual effect with video
  // DIFFERENCE inverts colors where shapes overlap with video
  blendMode(DIFFERENCE);

  // Loop through each rectangle in the array
  for (let i = 0; i < rectangles.length; i++) {
    // UPDATE POSITION
    // Move rectangle horizontally based on its speed and audio level
    // Multiplying by (1 + level * 20) makes movement faster when music is louder
    rectangles[i].x += rectangles[i].speedX * (1 + level * 20);
    // Move rectangle vertically based on its speed and audio level
    rectangles[i].y += rectangles[i].speedY * (1 + level * 20);

    // WRAP AROUND SCREEN EDGES
    // if statement: check if rectangle moves past right edge
    // If true, wrap it back to the left side
    if (rectangles[i].x > (width + 90)) rectangles[i].x = 0;
    // if statement: check if rectangle moves past left edge
    // If true, wrap it back to the right side
    if (rectangles[i].x < (0 - 90)) rectangles[i].x = width;
    // if statement: check if rectangle moves past bottom edge
    // If true, wrap it back to the top
    if (rectangles[i].y > (height + 90)) rectangles[i].y = 0;
    // if statement: check if rectangle moves past top edge
    // If true, wrap it back to the bottom
    if (rectangles[i].y < (0 - 90)) rectangles[i].y = height;

    // UPDATE SIZE BASED ON AUDIO
    // Map audio level to rectangle size using the map() function
    // Multiply level by sensitivity so each rectangle reacts differently
    // Map range: when audio is quiet (0), size is 10; when loud (0.3), size is 120
    rectangles[i].size = map(level * rectangles[i].sensitivity, 0, 0.3, 10, 120);

    // DRAW RECTANGLE
    // Set fill color to white
    fill(255);
    // Remove stroke/outline
    noStroke();
    // Draw rectangle at its current position and size
    rect(rectangles[i].x, rectangles[i].y, rectangles[i].size, rectangles[i].size);

    // DRAW COORDINATE TEXT
    // Set text color to red
    fill(0, 255, 255);
    textSize(18);
    // Display x and y coordinates on a single line above the rectangle like (x:value, y:value)
    // int() converts coordinates to whole numbers (removes decimals)
    // Text is positioned above the rectangle by subtracting half the size plus offset
    text("x: " + int(rectangles[i].x) + ", " + "y: " + int(rectangles[i].y),
      rectangles[i].x,
      rectangles[i].y - rectangles[i].size / 2 - 15);
  }
  // Use pop() to restore previous drawing settings
  pop(); // End DIFFERENCE blend mode

  // DEBUG TEXT (We want to add this to match the vibe)
  // This display technical information about audio and video status
  // Reset blend mode to normal so text appears in regular colors
  blendMode(BLEND);
  fill(255, 0, 0);
  textAlign(LEFT, BOTTOM);
  textSize(18);
  noStroke();
  // Display amplitude (volume level) with 4 decimal places
  text("AMP: " + level.toFixed(4), 10, height - 90);
  // Display first frequency bin value from spectrum array
  text("FREQUENCY: " + spectrum[0], 10, height - 70);
  // Display status of audio using sound.isPlaying value
  text("AUDIO PLAYING: " + sound.isPlaying(), 10, height - 50);
  // Display video playing status using the videoIsPlaying boolean variable
  text("VIDEO PLAYING: " + videoIsPlaying, 10, height - 30);
  // Display current video playback time in seconds with 2 decimal places
  text("VIDEO TIME: " + vid.time().toFixed(2) + " sec", 10, height - 10);
}

// TOUCH INTERACTION
// Function that runs when user touches or clicks the screen
function touchStarted() {
  // Enable audio context (required by web browsers before playing sound)
  userStartAudio();

  // TOGGLE AUDIO PLAYBACK
  // if statement: check if sound is currently playing. If sound is playing, pause it
  if (sound.isPlaying()) {

    sound.pause();
  } else {
    // If sound is not playing, start it and loop continuously
    sound.loop();
  }
  // Return false to prevent default touch behavior
  return false;
}
