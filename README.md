# Visage AI
Visage AI is a cutting-edge face recognition and expression analysis tool that blends modern artificial intelligence capabilities with a retro aesthetic. Designed to deliver real-time facial analysis, Visage AI can identify and track faces, recognize expressions, and provide insightful visual logs.

---

## Table of Contents

1. [Overview](#overview)  
2. [Features](#features)  
3. [Project Structure](#project-structure)  
4. [Usage](#usage)  
   - [Real-Time Camera Detection](#real-time-camera-detection)  
   - [Saving Faces](#saving-faces)  
   - [Uploading Images](#uploading-images)  
   - [Expression Toggle](#expression-toggle)  
   - [Alert Mode](#alert-mode)  
   - [Logs](#logs)  
5. [Credits](#credits)   
6. [License](#license)

---

## Overview

Visage AI harnesses the power of [face-api.js](https://github.com/justadudewhohacks/face-api.js) to detect, recognize, and analyze faces in real time or via uploaded images. The UI employs a retro “green terminal” design and features a Matrix-inspired background animation for a unique aesthetic.

---

## Features

- **Real-Time Camera Feed**: Detects and displays faces on live video.
- **Face Recognition**: Saves faces with names for quick identification.
- **Expression Analysis**: Identifies and labels facial expressions (e.g., happy, sad, surprised).
- **Upload & Detect**: Recognizes faces from uploaded images.
- **Alert Mode**: Logs known faces in a dedicated panel and highlights recognized individuals in red.
- **Retro UI**: Retro “green on black” interface with a scrolling Matrix effect.

---

## Project Structure
- **index.html** loads all resources and defines the DOM structure.  
- **style.css** contains custom styling for the matrix effect, retro UI, and layout.  
- **script.js** incorporates the face detection logic, UI interactions, and matrix animation.  
- **models** stores the pretrained Face API model files for detection, landmarks, recognition, and expression analysis.

---
## Usage

### Real-Time Camera Detection
- When prompted, allow **Camera Access** to enable the live video feed.  
- The webcam feed will appear on the screen, and any detected faces will be outlined with green bounding boxes.

### Saving Faces
1. Click the **Save Face** button in the Control Center.  
2. A pop-up dialog will appear with a preview of the detected face and an input field to assign a name.  
3. Once saved, the face will be added to the **Saved Faces** list.

### Uploading Images
1. Click the **Upload Image** button in the **Saved Faces** section.  
2. Select an image from your computer containing one or more faces.  
3. If a face is detected, you’ll be prompted to save it with a name. The saved face will be stored for future recognition.

### Expression Toggle
- Enable the **Show Expression** checkbox in the Control Center to display detected facial expressions (e.g., happy, sad, surprised) and facial landmarks over the live video feed.

### Alert Mode
1. Enable the **Alert Mode** checkbox in the Control Center.  
2. Faces that have been previously saved will be logged in the **Logs** section with timestamps when recognized.  
3. Recognized faces will also have their bounding boxes highlighted in red.

### Logs
- The **Logs** panel displays a list of recognized faces along with timestamps.  
- Use the **Clear Logs** button to clear the history.
---
## Credits
- **Developers**: Nymur Rahman and Zahid Hasan
- **Face Detection & Recognition**: Powered by face-api.js  
- **Design Inspiration**: Retro green-terminal aesthetic inspired by classic computer visuals and the Matrix theme.

