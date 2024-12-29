const video = document.getElementById('video');
const knownFaceDescriptors = [];
const knownFaceNames = [];
const uploadImageBtn = document.getElementById('uploadImageBtn');
let showExpressions = false;
const characters = "zahidnymur";
const charactersArray = characters.split("");

// Matrix configuration
const fontSize = 16;

// Create the canvas and context
const canvas = document.getElementById("matrix");
const context = canvas.getContext("2d");

// Set the canvas dimensions
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Calculate the number of columns
const columns = Math.floor(canvas.width / fontSize);

// Initialize the drop positions for each column at random heights
const drops = Array(columns).fill(0).map(() => Math.floor(Math.random() * canvas.height / fontSize));

// Matrix animation
function drawMatrix() {
  // Clear the canvas with a translucent background
  context.fillStyle = "rgba(0, 0, 0, 0.1)"; // Higher alpha for slower fade-out
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Set text color and font
  context.fillStyle = "#0F0";
  context.font = fontSize + "px monospace";

  // Draw each character at its drop position
  drops.forEach((y, index) => {
    const text = charactersArray[Math.floor(Math.random() * charactersArray.length)];
    const x = index * fontSize;

    context.fillText(text, x, y * fontSize);

    // Randomly reset the drop position after falling off screen
    if (y * fontSize > canvas.height && Math.random() > 0.975) {
      drops[index] = 0;
    }

    // Increment the drop position more slowly
    drops[index] += 0.5; // Reduce the increment value for slower movement
  });
}

// Render loop
function animateMatrix() {
  drawMatrix();
  setTimeout(() => {
    requestAnimationFrame(animateMatrix);
  }, 30); // Increase the timeout for slower updates
}

// Start the animation
animateMatrix();

// Adjust canvas size on window resize
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});




// Initialize variables and DOM elements
let alertMode = false; // Initialize alert mode
let lastLogTimestamp = 0; // Initialize last log timestamp



Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo);

function startVideo() {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      video.srcObject = stream;
    })
    .catch(err => console.error('Error accessing the camera:', err));
}

// toggle expression here js only 

toggleSwitch.addEventListener('change', () => {
  showExpressions = toggleSwitch.checked;
});



const saveFaceBtn = document.getElementById('saveFaceBtn');

// Saving face with its associate name
saveFaceBtn.addEventListener('click', async () => {
  const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptors();

  if (detections.length === 0) {
    alert('No faces detected! Please ensure your face is visible to the camera.');
    return;
  }

  for (let i = 0; i < detections.length; i++) {
    const detection = detections[i];


     // Check if the face is already saved
     if (knownFaceDescriptors.length > 0) {
      const labeledDescriptors = knownFaceDescriptors.map((desc, index) => {
        return new faceapi.LabeledFaceDescriptors(knownFaceNames[index], [desc]);
      });

      const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
      const bestMatch = faceMatcher.findBestMatch(detection.descriptor);

      if (bestMatch.label !== 'unknown') {
        alert(`Face already saved as: ${bestMatch.label}`);
        continue; // Skip saving this face
      }
    }




    const box = detection.detection.box;

    // Create a canvas to display the detected face for naming
    const faceCanvas = document.createElement('canvas');
    faceCanvas.width = box.width;
    faceCanvas.height = box.height;
    const faceCtx = faceCanvas.getContext('2d');
    faceCtx.drawImage(
      video,
      box.x, box.y, box.width, box.height, // Source rectangle
      0, 0, box.width, box.height // Destination rectangle
    );

    // Create a dialog box for naming the face
    const previewDialog = document.createElement('div');
    previewDialog.style.position = 'absolute';
    previewDialog.style.top = '50%';
    previewDialog.style.left = '50%';
    previewDialog.style.transform = 'translate(-50%, -50%)';
    previewDialog.style.backgroundColor = '#fff';
    previewDialog.style.border = '1px solid #ccc';
    previewDialog.style.borderRadius = '8px';
    previewDialog.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    previewDialog.style.padding = '20px';
    previewDialog.style.zIndex = '1000';
    previewDialog.style.display = 'flex';
    previewDialog.style.alignItems = 'center';
    previewDialog.style.width = '400px';

    // Left side: Face preview
    const imagePreview = document.createElement('div');
    imagePreview.style.flex = '1';
    imagePreview.style.display = 'flex';
    imagePreview.style.justifyContent = 'center';
    imagePreview.style.alignItems = 'center';
    imagePreview.style.padding = '10px';
    imagePreview.style.overflow = 'hidden';
    imagePreview.style.borderRadius = '8px';
    imagePreview.style.backgroundColor = '#f5f5f5';
    faceCanvas.style.width = '100px';
    faceCanvas.style.height = '100px';
    faceCanvas.style.borderRadius = '50%';
    imagePreview.appendChild(faceCanvas);
    previewDialog.appendChild(imagePreview);

    // Right side: Input and button
    const inputSection = document.createElement('div');
    inputSection.style.flex = '2';
    inputSection.style.display = 'flex';
    inputSection.style.flexDirection = 'column';
    inputSection.style.gap = '10px';
    inputSection.style.padding = '10px';

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = `Enter name for face ${i + 1}`;
    nameInput.style.padding = '10px';
    nameInput.style.border = '1px solid #ccc';
    nameInput.style.borderRadius = '4px';
    nameInput.style.width = '100%';
    inputSection.appendChild(nameInput);

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.style.padding = '10px';
    saveButton.style.backgroundColor = '#007BFF';
    saveButton.style.color = '#fff';
    saveButton.style.border = 'none';
    saveButton.style.borderRadius = '4px';
    saveButton.style.cursor = 'pointer';
    saveButton.style.width = '100%';

    saveButton.addEventListener('mouseover', () => {
      saveButton.style.backgroundColor = '#0056b3';
    });

    saveButton.addEventListener('mouseout', () => {
      saveButton.style.backgroundColor = '#007BFF';
    });

    inputSection.appendChild(saveButton);
    previewDialog.appendChild(inputSection);
    document.body.appendChild(previewDialog);

    // Wait for the user to name the face
    await new Promise((resolve) => {
      saveButton.addEventListener('click', () => {
        const name = nameInput.value.trim();
        if (name) {
          knownFaceDescriptors.push(detection.descriptor);
          knownFaceNames.push(name);

          // Save face preview in the list
          const imageData = faceCanvas.toDataURL('image/png');
          const savedFacesList = document.getElementById('savedFacesList');
          const listItem = document.createElement('li');
          listItem.style.display = 'flex';
          listItem.style.alignItems = 'center';
          listItem.style.marginBottom = '10px';
          listItem.style.position = 'relative'; // For positioning the remove button

          const img = document.createElement('img');
          img.src = imageData;
          img.style.width = '40px';
          img.style.height = '40px';
          img.style.borderRadius = '50%';
          img.style.marginRight = '10px';

          const nameText = document.createElement('span');
          nameText.textContent = name;

          // Remove Button
          const removeButton = document.createElement('button');
          removeButton.textContent = 'Remove';
          removeButton.style.position = 'absolute';
          removeButton.style.right = '10px';
          removeButton.style.padding = '5px 10px';
          removeButton.style.fontSize = '12px';
          removeButton.style.color = '#fff';
          removeButton.style.backgroundColor = '#FF0000';
          removeButton.style.border = 'none';
          removeButton.style.borderRadius = '4px';
          removeButton.style.cursor = 'pointer';
          removeButton.style.opacity = '0'; //Initially hidden
          removeButton.style.transition = 'opacity 0.3s ease';

          // Showing remove button on hover
          listItem.addEventListener('mouseover', () => {
            removeButton.style.opacity = '1';
          });
          listItem.addEventListener('mouseout', () => {
            removeButton.style.opacity = '0';
          });

          // Removing the face on button click
          removeButton.addEventListener('click', () => {
            const confirmDeletion = confirm(`Are you sure you want to remove ${name}?`);
            if (confirmDeletion) {
              savedFacesList.removeChild(listItem);
              const index = knownFaceNames.indexOf(name);
              if (index > -1) {
                knownFaceNames.splice(index, 1);
                knownFaceDescriptors.splice(index, 1);
              }

              alert(`${name} has been removed.`);
            }
          });

          listItem.appendChild(img);
          listItem.appendChild(nameText);
          listItem.appendChild(removeButton);
          savedFacesList.appendChild(listItem);

          alert(`Face saved for ${name}!`);
        } else {
          alert('Please enter a name for the face.');
          return;
        }

        document.body.removeChild(previewDialog); // closing dialog
        resolve(); // Continue to the next face
      });
    });
  }
  alert('All faces saved successfully!');
});

// uploading image part 

uploadImageBtn.addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.click();

  input.onchange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      img.onload = async () => {
        const detections = await faceapi
          .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (detections) {
          const descriptor = detections.descriptor;

          const previewDialog = document.createElement('div');
          previewDialog.className = 'preview-dialog';

          const imagePreview = document.createElement('img');
          imagePreview.src = img.src;
          previewDialog.appendChild(imagePreview);

          const nameInput = document.createElement('input');
          nameInput.type = 'text';
          nameInput.placeholder = 'Enter name for the face';
          previewDialog.appendChild(nameInput);

          const saveButton = document.createElement('button');
          saveButton.textContent = 'Save Face';
          saveButton.addEventListener('click', () => {
            const name = nameInput.value.trim();
            if (name) {
              knownFaceDescriptors.push(descriptor);
              knownFaceNames.push(name);

              const listItem = document.createElement('li');

              const imgPreview = document.createElement('img');
              imgPreview.src = img.src;
              listItem.appendChild(imgPreview);

              const nameSpan = document.createElement('span');
              nameSpan.textContent = name;
              listItem.appendChild(nameSpan);

              const removeButton = document.createElement('button');
              removeButton.textContent = 'Remove';
              removeButton.addEventListener('click', () => {
                const confirmDeletion = confirm(`Are you sure you want to remove ${name}?`);
                if (confirmDeletion) {
                  savedFacesList.removeChild(listItem);
                  const index = knownFaceNames.indexOf(name);
                  if (index > -1) {
                    knownFaceNames.splice(index, 1);
                    knownFaceDescriptors.splice(index, 1);
                  }
                  alert(`${name} has been removed.`);
                }
              });

              listItem.appendChild(removeButton);
              savedFacesList.appendChild(listItem);

              alert(`Face saved as: ${name}`);
              document.body.removeChild(previewDialog);
            } else {
              alert('Name is required to save the face.');
            }
          });

          previewDialog.appendChild(saveButton);
          document.body.appendChild(previewDialog);
        } else {
          alert('No face detected in the uploaded image.');
        }
      };
    }
  };
});


video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors()
      .withFaceExpressions();

    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Recognizing faces and display names
    resizedDetections.forEach(detection => {
      const box = detection.detection.box;
    
      // Handle names only if there are saved faces
      let text = "Unknown";
      if (knownFaceDescriptors.length > 0) {
        const labeledDescriptors = knownFaceDescriptors.map((desc, i) => {
          return new faceapi.LabeledFaceDescriptors(knownFaceNames[i], [desc]);
        });
    
        const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
        const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
        text = bestMatch.label === "unknown" ? "Unknown" : bestMatch.label;
      }
    
      // Always show name or "No Faces Saved"
      context.font = "bold 16px Arial";
      context.fillStyle = "#00FF00";
      const textWidth = context.measureText(text).width;
      const xPosition = box.x + (box.width / 2) - (textWidth / 2);
      context.fillText(text, xPosition, box.y - 10);
    
      // Always handle expressions, landmarks, and boxes if toggle is enabled
      if (showExpressions) {
        faceapi.draw.drawDetections(canvas, [detection]);
        faceapi.draw.drawFaceLandmarks(canvas, [detection]);
        faceapi.draw.drawFaceExpressions(canvas, [detection]);
      }
    });
  }, 100);
});



video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors()
      .withFaceExpressions();

    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    resizedDetections.forEach((detection) => {
      const box = detection.detection.box;
      let text = 'Unknown';

      if (knownFaceDescriptors.length > 0) {
        const labeledDescriptors = knownFaceDescriptors.map((desc, i) => {
          return new faceapi.LabeledFaceDescriptors(knownFaceNames[i], [desc]);
        });

        const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
        const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
        text = bestMatch.label === 'unknown' ? 'Unknown' : bestMatch.label;

        if (alertMode && text !== 'Unknown') {
          const currentTimestamp = Date.now();
          if (currentTimestamp - lastLogTimestamp > 2000) {
            const logEntry = document.createElement('div');
            logEntry.textContent = `${new Date().toLocaleTimeString()}: ${text} detected.`;
            logBox.appendChild(logEntry);
            logBox.scrollTop = logBox.scrollHeight;

            lastLogTimestamp = currentTimestamp;
          }
        }
      }

      if (alertMode && text !== 'Unknown') {
        context.lineWidth = 2;
        context.strokeStyle = '#FF0000';
        context.strokeRect(box.x, box.y, box.width, box.height);

        context.font = 'bold 16px Arial';
        context.fillStyle = '#FF0000';
        context.fillText(text, box.x, box.y - 10);
      }
    });
  }, 100);
});

// Toggle alert mode
alertModeCheckbox.addEventListener('change', () => {
  alertMode = alertModeCheckbox.checked;
});

// Clear logs
clearLogsButton.addEventListener('click', () => {
  logBox.innerHTML = '';
});
