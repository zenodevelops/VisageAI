const video = document.getElementById('video');
const knownFaceDescriptors = [];
const knownFaceNames = [];
let showExpressions = false;

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

// Added button to toggle expressions
const toggleSwitchContainer = document.createElement('div');
toggleSwitchContainer.style.position = 'absolute';
toggleSwitchContainer.style.top = '10px';
toggleSwitchContainer.style.left = '50%';
toggleSwitchContainer.style.transform = 'translateX(-50%)';
toggleSwitchContainer.style.display = 'flex';
toggleSwitchContainer.style.alignItems = 'center';
toggleSwitchContainer.style.gap = '10px';

// Add label for the toggle 
const toggleLabel = document.createElement('span');
toggleLabel.textContent = 'Show Expression';
toggleLabel.style.fontSize = '16px';
toggleLabel.style.color = '#007BFF';
toggleSwitchContainer.appendChild(toggleLabel);

// Add the toggle input 
const toggleSwitch = document.createElement('input');
toggleSwitch.type = 'checkbox';
toggleSwitch.style.width = '40px';
toggleSwitch.style.height = '20px';
toggleSwitch.style.cursor = 'pointer';
toggleSwitchContainer.appendChild(toggleSwitch);

document.body.appendChild(toggleSwitchContainer);

// Toggle functionality for expressions 
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
