import { reallocationPose } from './model.js'

const videoWidth = 200;
const videoHeight = 200;

const canvas2d = document.querySelector("#canvas")
const ctx = canvas2d.getContext("2d");

const defaultQuantBytes = 2;

const defaultMobileNetMultiplier = 0.75;
const defaultMobileNetStride = 16;
const defaultMobileNetInputResolution = 500;

const guiState = {
    algorithm: 'multi-pose',
    input: {
        architecture: 'MobileNetV1',
        outputStride: defaultMobileNetStride,
        inputResolution: defaultMobileNetInputResolution,
        multiplier: defaultMobileNetMultiplier,
        quantBytes: defaultQuantBytes
    },
    singlePoseDetection: {
        minPoseConfidence: 0.1,
        minPartConfidence: 0.5,
    },
    multiPoseDetection: {
        maxPoseDetections: 5,
        minPoseConfidence: 0.15,
        minPartConfidence: 0.1,
        nmsRadius: 30.0,
    },
    output: {
        showVideo: true,
        showSkeleton: true,
        showPoints: true,
        showBoundingBox: false,
    },
    net: null,
    camera: undefined
};

const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');
const landmarkContainer = document.getElementsByClassName('landmark-grid-container')[0];
const grid = new LandmarkGrid(landmarkContainer);


const pose = new Pose({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
}});

const camera = new Camera(videoElement, {
    onFrame: async () => {
        await pose.send({image: videoElement});
    },
    width: 500,
    height: 300
});

pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  enableSegmentation: true,
  smoothSegmentation: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});




const isMobile = async () => {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
}

const setupCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
            'Browser API navigator.mediaDevices.getUserMedia not available');
    }

    const video = document.getElementById('video');
    video.width = videoWidth;
    video.height = videoHeight;

    const mobile = isMobile();
    const stream = await navigator.mediaDevices.getUserMedia({
        'audio': false,
        'video': {
        facingMode: 'user',
        width: mobile ? undefined : videoWidth,
        height: mobile ? undefined : videoHeight,
        },
    });
    video.srcObject = stream;

    return new Promise((resolve) => {
        video.onloadedmetadata = () => {
            resolve(video);
        };
    });
}

const stopCamera = async () => {
    if (isVideoPlaying(guiState.camera)) {
        guiState.output.showVideo = false
    }
}

const startCamera = async () => {
    guiState.output.showVideo = true
    calculatePose()
}

const loadVideo = async () => {
    const video = await setupCamera();
    if (!isVideoPlaying(video)) {
        video.play();
    }
    
    return video;
}

const isVideoPlaying = (video) => {
    return !!(video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2)
}


const drawRect = async (x, y, r) => {
    ctx.fillRect(x,y,r,r);
}

const clearCanvas = async () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

const updateCanvasVideo = async (video) => {
    ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
    ctx.restore();
}

const getPoseFromVideo = async (video) => {
    let poses = [];
    const imageScaleFactor = 0.50;
    const flipHorizontal = false;
    const outputStride = 16;

    const net = await posenet.load({
        architecture: guiState.changeToArchitecture,
        outputStride: guiState.outputStride,
        inputResolution: guiState.inputResolution,
        multiplier: guiState.multiplier,
        quantBytes: guiState.changeToQuantBytes
    })
    const pose = await net.estimatePoses(video, {
        flipHorizontal: flipHorizontal,
        decodingMethod: 'single-person',
        imageScaleFactor: imageScaleFactor,
        outputStride: outputStride
    });

    return pose[0]
}

const drawRectToCanvas = async (keypoints) => {
    clearCanvas()
    keypoints.forEach(element => {
        let x = element.position.x
        let y = element.position.y
        drawRect(x, y, 5)
    });
}



const onResults = (results) => {
    if (!results.poseLandmarks) {
      grid.updateLandmarks([]);
      return;
    }
  
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.segmentationMask, 0, 0, canvasElement.width, canvasElement.height);
  
    canvasCtx.globalCompositeOperation = 'source-in';
    canvasCtx.fillStyle = '#00FF00';
    canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);
  
    canvasCtx.globalCompositeOperation = 'destination-atop';
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
  
    canvasCtx.globalCompositeOperation = 'source-over';
    drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {color: '#00FF00', lineWidth: 4});
    drawLandmarks(canvasCtx, results.poseLandmarks, {color: '#FF0000', lineWidth: 2});
    canvasCtx.restore();
  
    grid.updateLandmarks(results.poseWorldLandmarks);

    const parsePoses = {
        "head": results.poseWorldLandmarks[0],
        "leftShoulder": results.poseWorldLandmarks[11],
        "rightShoulder": results.poseWorldLandmarks[12],
        "leftElbow": results.poseWorldLandmarks[13],
        "rightElbow": results.poseWorldLandmarks[14],
        "leftWrist": results.poseWorldLandmarks[15],
        "rightWrist": results.poseWorldLandmarks[16],
        "leftHip": results.poseWorldLandmarks[23],
        "rightHip": results.poseWorldLandmarks[24],
        "leftKnee": results.poseWorldLandmarks[25],
        "rightKnee":results.poseWorldLandmarks[26],
        "leftAnkle": results.poseWorldLandmarks[27],
        "rightAnkle":results.poseWorldLandmarks[28],
    }
    reallocationPose(parsePoses)
  
    //console.log(results.poseWorldLandmarks[19].x, results.poseWorldLandmarks[20].x)
}

const calculatePose = async () => {
    const video = await loadVideo()
    const pose = await getPoseFromVideo(video)

    console.log(pose)
    guiState.camera = video
    
    drawRectToCanvas(pose.keypoints)
    if (guiState.output.showVideo) {
        requestAnimationFrame(calculatePose);

        const parsePoses = {
            "head": pose.keypoints[0].position,
            "leftShoulder": pose.keypoints[5].position,
            "rightShoulder": pose.keypoints[6].position,
            "leftElbow": pose.keypoints[7].position,
            "rightElbow": pose.keypoints[8].position,
            "leftWrist": pose.keypoints[9].position,
            "rightWrist": pose.keypoints[10].position,
            "leftHip": pose.keypoints[23].position,
            "rightHip": pose.keypoints[24].position,
            "leftKnee": pose.keypoints[25].position,
            "rightKnee": pose.keypoints[26].position,
            "leftAnkle": pose.keypoints[27].position,
            "rightAnkle": pose.keypoints[28].position
        }

        reallocationPose(parsePoses)
    }
    
}



//calculatePose()

pose.onResults(onResults);
camera.start();


document.getElementById("startCamera").addEventListener("click", startCamera);
document.getElementById("stopCamera").addEventListener("click", stopCamera);