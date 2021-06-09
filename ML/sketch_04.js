
/*
X + Y Coords come from the top left
Pose Left Wrist 9 + Right Wrist 10
Confidence, I assume, is confident the model is that the pose point is present.

The X+Y coords of objects comes form the top left corner of their bounding box

Issues/Concerns:
Object persistance/Object coverage.
Mouse when covered by the hand disappears.


*/

console.log("V5");

// Grab elements, create settings, etc.
var video = document.getElementById("video");
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var ctx2 = canvas.getContext("2d");

// The detected positions will be inside an array
let poses = [];

// The detected objects
let objectDetector;
let status;
let objects = [];

//Wrist handLocations
let handLocations = [];

var dataArray = [];

const width = 640;
const height = 480;

// Create a webcam capture
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
    video.srcObject = stream;
    video.play();
  });
}

// A function to draw the video and poses into the canvas.
// This function is independent of the result of posenet
// This way the video will not seem slow if poseNet
// is not detecting a position
function drawCameraIntoCanvas() {
  // Draw the video element into the canvas
  ctx.drawImage(video, 0, 0, 640, 480);
  // We can call both functions to draw all keypoints and the skeletons
  drawKeypoints();
  drawSkeleton();
  draw()

  window.requestAnimationFrame(drawCameraIntoCanvas);
}
// Loop over the drawCameraIntoCanvas function
drawCameraIntoCanvas();

// Create a new poseNet method with a single detection
const poseNet = ml5.poseNet(video, modelReady);
poseNet.on("pose", gotPoses);

// A function that gets called every time there's an update from the model
function gotPoses(results) {
  poses = results;
}

function modelReady() {
  console.log("Model ready!");
  poseNet.singlePose(video);
  objectDetector = ml5.objectDetector('cocossd', startDetecting)

}

function startDetecting(){
  console.log('model ready')
  detect();
}

function detect() {
  objectDetector.detect(video, function(err, results) {
    if(err){
      console.log(err);
      return
    }




    objects = results;
    if(objects){
      draw();
      //drawSkeleton();
    //  drawKeypoints();
    }
    draw();
  //detect();
  });
}

function draw(){
  // Clear part of the canvas

  for (let i = 0; i < objects.length; i += 1) {

    ctx2.font = "16px Arial";
    ctx2.fillStyle = "green";
    ctx2.fillText(objects[i].label, objects[i].x + 4, objects[i].y + 16);

    ctx2.beginPath();
    ctx2.rect(objects[i].x, objects[i].y, objects[i].width, objects[i].height);
    ctx2.strokeStyle = "green";
    ctx2.stroke();
    ctx2.closePath();
  }
}



// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
  // Loop through all the poses detected
  for (let i = 0; i < poses.length; i += 1) {
    // For each pose detected, loop through all the keypoints
    for (let j = 0; j < poses[i].pose.keypoints.length; j += 1) {
      let keypoint = poses[i].pose.keypoints[j];
      // Only draw an ellipse is the pose probability is bigger than 0.2
      if (keypoint.score > 0.2) {
        ctx.beginPath();
        ctx.arc(keypoint.position.x, keypoint.position.y, 10, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }
  }


}

// A function to draw the skeletons
function drawSkeleton() {
  // Loop through all the skeletons detected
  for (let i = 0; i < poses.length; i += 1) {
    // For every skeleton, loop through all body connections
    for (let j = 0; j < poses[i].skeleton.length; j += 1) {
      let partA = poses[i].skeleton[j][0];
      let partB = poses[i].skeleton[j][1];
      ctx.beginPath();
      ctx.moveTo(partA.position.x, partA.position.y);
      ctx.lineTo(partB.position.x, partB.position.y);
      ctx.stroke();
    }
  }



}

function inRange(x, min, max) {
    return ((x-min)*(x-max) <= 0);
}

function getInfo() {
        //console.log(poses);

    //console.log(poses[0].pose);
  console.log(objects);

  //Create some added padding
  buffer = 25;

  handLocations = [
            leftWristX = poses[0].pose.leftWrist.x,
            leftWristY = poses[0].pose.leftWrist.y,

            rightWristX = poses[0].pose.rightWrist.x,
            rightWristY = poses[0].pose.rightWrist.y
  ]
  console.log(rightWristX);
  console.log(rightWristY);

    for (let b = 0; b < objects.length; b+=1 ) {



      if (objects[b].label == "person") {} else {

        objectXMin = objects[b].x
        objectXMax = objects[b].x + objects[b].width

        objectYMax = objects[b].y + objects[b].height
        objectYMin = objects[b].y


        if ((inRange(leftWristX,objectXMin - buffer,objectXMax + buffer) == true) &&
            (inRange(leftWristY,objectYMin - buffer,objectYMax + buffer) == true) )
         {
          console.log("Left Hand Touching on " + objects[b].label);
          console.log(leftWristX);
          console.log(leftWristY);
        }

        if ((inRange(rightWristX,objectXMin - buffer,objectXMax + buffer) == true) &&
            (inRange(rightWristY,objectYMin - buffer,objectYMax + buffer) == true) )
         {
          console.log("Right Hand Touching on " + objects[b].label);
          console.log(rightWristX);
          console.log(rightWristY);
        }

      }

    }




}




function generateData() {
  rightWristXSnap = poses[0].pose.rightWrist.x,
  rightWristYSnap = poses[0].pose.rightWrist.y
  dataArray.push([rightWristXSnap,rightWristYSnap,1]);
console.log("WHOA");
}

setInterval(function() {
      generateData();
}, 3000);






function download_csv() {
    var csv = 'x,y,value\n';
    dataArray.forEach(function(row) {
            csv += row.join(' ');
            csv += "\n";
    });

    console.log(csv);
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    hiddenElement.target = '_blank';
    hiddenElement.download = 'data.csv';
    hiddenElement.click();
}
