// (ELLIA, ISHAANA, NAOMI)
// TITLE:
// X: ORGANIC, Y: TECHNOLOGY
// We want to make interactive audio-visual experience combining video with audio-reactive rectangles
// We want rectangles to move and pulse in response to music frequency and amplitude
// We want each rectangle to display its real-time coordinate position
// We need to touch/click to play or pause the audio

// GLOBAL VARIABLES
// Video and audio elements
let vid;
let sound;
let sound2; // Second audio file
let sound3; // Third audio file
let amp; // Amplitude analyzer to measure overall volume
let fft; // FFT analyzer to measure frequency data
let play = false; // Boolean to track play state
let rectangles = []; // Array to store all rectangle objects with their properties
let videoIsPlaying = false; // Boolean to track if video is currently playing
let hasStarted = false; // Boolean to track if audio has been started
let words = ["freedom", "is", "now"]; // Array of words to display for song 1
let currentSong = 1; // Track which song is currently playing (1, 2, or 3)
let nextButton; // Button to switch to next audio
let playButton; // Button to play audio
let pauseButton; // Button to pause audio

function preload() {
  // Load audio files before the sketch starts
  // This ensures the sounds are ready when the program begins
  sound = loadSound("assets/song01.mp3");
  sound2 = loadSound("assets/song03.mp3");
  sound3 = loadSound("assets/song04.mp3");
}

function setup() {
  // Create canvas that fills the entire window
  createCanvas(windowWidth, windowHeight);

  // VIDEO SETUP
  // To create video element with autoplay capabilities
  vid = createVideo("assets/finalvideo.mp4");
  // To set video size to match canvas dimensions
  vid.size(width, height);
  // To hide the default HTML video element (we'll draw it on canvas instead)
  vid.hide();
  // To mute the video's audio track (we use separate audio file)
  vid.volume(0);
  // To set muted attribute - this is required for autoplay to work in browsers
  vid.attribute('muted', '');
  // To set playsinline attribute - this is required for autoplay on mobile devices
  vid.attribute('playsinline', '');
  // To enable autoplay so video starts immediately
  vid.autoplay(true);
  // To loop video continuously
  vid.loop();
  // To set videoIsPlaying to true since video starts automatically
  videoIsPlaying = true;

  // Console log to confirm video element was created successfully
  console.log("Video element created:", vid);

  // AUDIO ANALYSIS SETUP
  // To create amplitude analyzer to measure overall loudness (0 to 1)
  amp = new p5.Amplitude();
  amp.smooth(0.9);
  // To create FFT analyzer to measure frequency spectrum data
  fft = new p5.FFT();

  // CREATE NEXT AUDIO BUTTON
  // Create button in top right corner to switch audio
  nextButton = createButton('NEXT AUDIO');
  // Position button in top right corner
  nextButton.position(width - 180, 20);
  // Style the button
  nextButton.style('background-color', '#FF0000');
  nextButton.style('color', '#FFFFFF');
  nextButton.style('border', 'none');
  nextButton.style('padding', '10px 20px');
  nextButton.style('font-size', '16px');
  nextButton.style('cursor', 'pointer');
  // Set what happens when button is clicked
  nextButton.mousePressed(switchAudio);

  // CREATE PLAY BUTTON
  // Create play button below the next audio button
  playButton = createButton('PLAY');
  // Position button below next audio button
  playButton.position(width - 180, 70);
  // Style the button
  playButton.style('background-color', '#FF0000');
  playButton.style('color', '#FFFFFF');
  playButton.style('border', 'none');
  playButton.style('padding', '10px 20px');
  playButton.style('font-size', '16px');
  playButton.style('cursor', 'pointer');
  playButton.style('width', '85px');
  // Set what happens when button is clicked
  playButton.mousePressed(playAudio);

  // CREATE PAUSE BUTTON
  // Create pause button next to play button
  pauseButton = createButton('PAUSE');
  // Position button next to play button
  pauseButton.position(width - 85, 70);
  // Style the button
  pauseButton.style('background-color', '#FF0000');
  pauseButton.style('color', '#FFFFFF');
  pauseButton.style('border', 'none');
  pauseButton.style('padding', '10px 20px');
  pauseButton.style('font-size', '16px');
  pauseButton.style('cursor', 'pointer');
  pauseButton.style('width', '85px');
  // Set what happens when button is clicked
  pauseButton.mousePressed(pauseAudio);

  // CREATE RECTANGLES
  // To generate rectangles with random properties
  // We use for-loop to create multiple rectangles efficiently
  // Instead of writing the same code 12 times, the loop does it for us
  for (let i = 0; i < 8; i++) {
    // To generate random size for each rectangle
    let size = random(20, 80);
    // Add new rectangle object to the array with all its properties
    rectangles.push({
      x: random(width), // Random starting x position
      y: random(height), // Random starting y position
      size: size, // Base size of rectangle
      speedX: random(-1.5, 1.5), // Horizontal movement speed (negative = left, positive = right)
      speedY: random(-1.5, 1.5), // Vertical movement speed (negative = up, positive = down)
      sensitivity: random(0.5, 2), // To measure how much the rectangle reacts to audio (higher = more reactive)
      showText: false, // Boolean to control if text is visible
      textTimer: 0, // Timer to track when to show text
      nextDisplay: random(60, 180), // Random interval for when text appears (in frames)
      currentWord: "" // Store the current word to display for this rectangle
    });
  }

  // DRAWING SETTINGS
  // Set rectangle drawing mode to center (draws from center point instead of corner)
  rectMode(CENTER);
  // Set text alignment to center horizontally and vertically
  textAlign(CENTER, CENTER);
}

function draw() {
  // BACKGROUND
  background(255);

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

  // DRAW RECTANGLES WITH TEXT PHRASES
  // Use push() to save current drawing settings
  push();
  // Set blend mode to DIFFERENCE for visual effect with video
  // DIFFERENCE inverts colors where shapes overlap with video
  blendMode(DIFFERENCE);

  // Loop through each rectangle in the array
  for (let i = 0; i < rectangles.length; i++) {
    // UPDATE POSITION
    // Move rectangle horizontally based on its speed and audio level
    // Multiplying by (1 + level * 5) makes movement faster when music is louder
    rectangles[i].x += rectangles[i].speedX * (1 + level * 5);
    // Move rectangle vertically based on its speed and audio level
    rectangles[i].y += rectangles[i].speedY * (1 + level * 5);

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

    // TEXT DISPLAY LOGIC
    // Increment timer for each rectangle
    rectangles[i].textTimer++;
    
    // if statement: check if timer reached the next display interval
    if (rectangles[i].textTimer >= rectangles[i].nextDisplay) {
      // Show text for this rectangle
      rectangles[i].showText = true;
      // Pick a random word from the words array
      rectangles[i].currentWord = random(words);
      // Reset timer
      rectangles[i].textTimer = 0;
    }
    
    // if statement: check if text should be visible and hide it after 120 frames (2 seconds)
    if (rectangles[i].showText == true && rectangles[i].textTimer > 120) {
      // Hide text
      rectangles[i].showText = false;
      // Set new random interval for next display
      rectangles[i].nextDisplay = random(60, 180);
      // Reset timer
      rectangles[i].textTimer = 0;
    }
    
    // DRAW TEXT BLOCK WITH CONNECTING LINE
    // if statement: check if text should be displayed for this rectangle
    if (rectangles[i].showText == true) {
      // Calculate text block position (closer to rectangle)
      let textBlockX = rectangles[i].x + rectangles[i].size / 2 + 80;
      let textBlockY = rectangles[i].y;
      
      // DRAW CONNECTING LINE - SHORTER
      // Set stroke color to cyan
      stroke(0, 255, 255);
      strokeWeight(2);
      // Draw line from rectangle edge to text block
      line(rectangles[i].x + rectangles[i].size / 2, rectangles[i].y, textBlockX - 40, textBlockY);
      
      // DRAW TEXT BLOCK BACKGROUND
      // Set fill color to more visible semi-transparent black
      fill(0, 0, 0, 200);
      noStroke();
      // Calculate text width for background sizing
      textSize(24);
      let textWidth = rectangles[i].currentWord.length * 16 + 40;
      // Draw background rectangle for text
      rect(textBlockX, textBlockY, textWidth, 50);
      
      // DRAW TEXT
      // Set text color to cyan
      fill(0, 255, 255);
      textSize(24);
      // Display the current word
      text(rectangles[i].currentWord, textBlockX, textBlockY);
    }
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
  text("AMP: " + level.toFixed(4), 10, height - 110);
  // Display first frequency bin value from spectrum array
  text("FREQUENCY: " + spectrum[0], 10, height - 90);
  // Display which song is currently playing
  text("CURRENT SONG: " + currentSong, 10, height - 70);
  // Display status of audio playing (checks if any of the three songs are playing)
  text("AUDIO PLAYING: " + (sound.isPlaying() || sound2.isPlaying() || sound3.isPlaying()), 10, height - 50);
  // Display video playing status using the videoIsPlaying boolean variable
  text("VIDEO PLAYING: " + videoIsPlaying, 10, height - 30);
  // Display current video playback time in seconds with 2 decimal places
  text("VIDEO TIME: " + vid.time().toFixed(2) + " sec", 10, height - 10);
}

// SWITCH AUDIO FUNCTION
// Function that runs when "NEXT AUDIO" button is clicked
function switchAudio() {
  // if statement: check which song is currently playing and cycle through
  if (currentSong == 1) {
    // Stop song 1 and play song 2
    sound.stop();
    sound2.loop();
    currentSong = 2;
    // Change words to "break the pattern" for song 2
    words = ["break", "the", "pattern"];
  } else if (currentSong == 2) {
    // Stop song 2 and play song 3
    sound2.stop();
    sound3.loop();
    currentSong = 3;
    // Change words to "exist loudly" for song 3
    words = ["exist", "loudly"];
  } else {
    // Stop song 3 and play song 1
    sound3.stop();
    sound.loop();
    currentSong = 1;
    // Change words back to "freedom is now" for song 1
    words = ["freedom", "is", "now"];
  }
  // Set hasStarted to true since audio is now playing
  hasStarted = true;
}

// PLAY AUDIO FUNCTION
// Function that runs when "PLAY" button is clicked
function playAudio() {
  // Enable audio context (required by web browsers before playing sound)
  userStartAudio();
  
  // Set hasStarted to true
  hasStarted = true;
  
  // if statement: check which song should be playing and start it
  if (currentSong == 1) {
    sound.loop();
  } else if (currentSong == 2) {
    sound2.loop();
  } else {
    sound3.loop();
  }
}

// PAUSE AUDIO FUNCTION
// Function that runs when "PAUSE" button is clicked
function pauseAudio() {
  // if statement: check which song is playing and pause it
  if (currentSong == 1) {
    sound.pause();
  } else if (currentSong == 2) {
    sound2.pause();
  } else {
    sound3.pause();
  }
}
