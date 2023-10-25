
// ml5 Face Detection Model
let faceapi;
let detections = [];
let trackerX_p, trackerDisplacement;
let trackerSwitch, faceShake;

// Video
let video;

function setup() {
    createCanvas(innerWidth, innerHeight);
    

    // Creat the video and start face tracking
    video = createCapture(VIDEO);
    video.size(width, height);
    // Only need landmarks for this example
    const faceOptions = { withLandmarks: true, withExpressions: true, withDescriptors: true };
    faceapi = ml5.faceApi(video, faceOptions, faceReady);
    trackerX_p = 0;
    trackerDisplacement = 0;
    trackerSwitch  = false;
    faceShake = false;
}

// Start detecting faces
function faceReady() {
    faceapi.detect(gotFaces);
}

// Got faces
function gotFaces(error, result) {
    if (error) {
        console.log(error);
        return;
    }
    detections = result;
    faceapi.detect(gotFaces);
}

// Draw everything
function draw() {
    background(255);
    // Just look at the first face and draw all the points
    if (detections.length > 0) {
        let points = detections[0].landmarks.positions;
        trackerDisplacement = abs(points[10].x - trackerX_p);
        
        if(trackerSwitch){
            if(trackerDisplacement>0.8){
                faceShake = true;
                background(255,0,0);
            }else{
                faceShake = false;
            }
//            print(faceShake);
        }
        trackerX_p = points[10].x;
//        print(trackerDisplacement);
//        for (let i = 0; i < points.length; i++) {
//            stroke(161, 95, 251);
//            strokeWeight(4);
//            point(points[i]._x, points[i]._y);
//        }
    }
    trackerSwitch = true;

}
