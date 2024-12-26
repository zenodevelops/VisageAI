const video = document.getElementById('video');
const knownFaceDescriptors = [];
const knownFaceNames = [];

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

const saveFaceBtn = document.getElementById('saveFaceBtn');

// Saving face with its associate name
saveFaceBtn.addEventListener('click', async () => {
  const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) {
    alert('No face detected! Please ensure your face is visible to the camera.');
    return;
  }

  const name = prompt('Enter your name:');
  if (name) {
    // Saving the descriptor and name
    knownFaceDescriptors.push(detection.descriptor);
    knownFaceNames.push(name);

    // Capturing current frame as an image
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL('image/png');

    // Adding the name and image to the right-side list
    const savedFacesList = document.getElementById('savedFacesList');
    const listItem = document.createElement('li');
    listItem.style.display = 'flex';
    listItem.style.alignItems = 'center';
    listItem.style.marginBottom = '10px';

    const img = document.createElement('img');
    img.src = imageData;
    img.style.width = '40px';
    img.style.height = '40px';
    img.style.borderRadius = '50%';
    img.style.marginRight = '10px';

    const nameText = document.createElement('span');
    nameText.textContent = name;

    listItem.appendChild(img);
    listItem.appendChild(nameText);
    savedFacesList.appendChild(listItem);

    alert(`Face saved for ${name}!`);
  }
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
  
    // Drawing bounding boxes, landmarks, and expressions
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
  
    // Recognizing faces and display names
    resizedDetections.forEach(detection => {
      if (knownFaceDescriptors.length > 0) {
        const labeledDescriptors = knownFaceDescriptors.map((desc, i) => {
          return new faceapi.LabeledFaceDescriptors(knownFaceNames[i], [desc]);
        });
      
        const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
      
        const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
        const box = detection.detection.box;
      
        // Drawing name or "Unknown" above the bounding box
        context.font = '16px Arial';
        context.fillStyle = '#00FF00';
        context.fillText(bestMatch.label === "unknown" ? "Unknown" : bestMatch.label, box.x, box.y - 10);
      } else {
        // If no faces are saved we show "No Faces Saved"
        context.font = '16px Arial';
        context.fillStyle = '#FF0000';
        context.fillText("No Faces Saved", detection.detection.box.x, detection.detection.box.y - 10);
      }
    });
  }, 100);
});
