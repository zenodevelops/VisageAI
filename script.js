// Select the button and video elements
const startBtn = document.getElementById("startBtn");
const video = document.getElementById("video");

// Attach a click event listener to the button
startBtn.addEventListener("click", () => {
  // Prompt the user for permission to use the camera
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: false })
    .then(stream => {
      // Stream the video to the video element
      video.srcObject = stream;
    })
    .catch(err => {
      console.error("Error accessing webcam: ", err);
      alert("Unable to access your webcam. Please make sure you have given permission.");
    });
});
