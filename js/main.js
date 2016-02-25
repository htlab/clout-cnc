var vid = document.getElementById('videoel');
var nosepoint_overlay = document.getElementById('nosepoint_overlay');
var textinfo_overlay = document.getElementById('textinfo_overlay');
var nosePointerOverlay = nosepoint_overlay.getContext('2d');
var textInfoOverlay = textinfo_overlay.getContext('2d');

var SMILE_TERM = 2000;
var SMILE_TERM_DEGREE = 2;
var smileTermDegree = 0;

var ctrack = new clm.tracker({useWebGL : true, searchWindow: 33});
ctrack.init(pModel);

var ec = new emotionClassifier();
ec.init(emotionModel);
var emotionData = ec.getBlank();

var CAMERA_WIDTH = 600;
var CAMERA_HEIGHT = 450;
var CITY = "fujisawa";

initSmileUi();

// WebRTCの準備
function setupCamera(){
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL;
    // check for camerasupport
    if (navigator.getUserMedia) {
        // set up stream
        var videoSelector = {video : true};
        if (window.navigator.appVersion.match(/Chrome\/(.*?) /)) {
            var chromeVersion = parseInt(window.navigator.appVersion.match(/Chrome\/(\d+)\./)[1], 10);
            if (chromeVersion < 20) {
                videoSelector = "video";
            }
        };
    
        navigator.getUserMedia(videoSelector, function( stream ) {
            if (vid.mozCaptureStream) {
                vid.mozSrcObject = stream;
            } else {
                vid.src = (window.URL && window.URL.createObjectURL(stream)) || stream;
            }
            vid.play();
        }, function() {
            alert("There was some problem trying to fetch video from your webcam. If you have a webcam, please make sure to accept when the browser asks for access to your webcam.");
        });
    } else {
        alert("This demo depends on getUserMedia, which your browser does not seem to support. :(");
    }
}

function startVideo() {
    // start tracking
    ctrack.start(vid);
    // start loop to draw face
    drawLoop();
}

function drawLoop() {
    requestAnimFrame(drawLoop);
    nosePointerOverlay.clearRect(0, 0, CAMERA_WIDTH, CAMERA_HEIGHT);
    textInfoOverlay.clearRect(0, 0, CAMERA_WIDTH, CAMERA_HEIGHT);
    var position = ctrack.getCurrentPosition();

    var rate = 320/640;

    // 鼻のポジションと倍率
    var x = position[62][0] * rate;
    var y = position[62][1] * rate;

    drawOval(x, y);

    var cp = ctrack.getCurrentParameters();
    
    var er = ec.meanPredict(cp);
    var discount = 0;
    if (er) {
        discount = er[3].value;
    }
    
    var smileDegree = Math.floor(discount*100);

    if(isNaN(smileDegree)){
        smileDegree = 0;
    }
    drawSmileDegree(smileDegree);    

    // discount is 0 to 9
    discount = Math.floor(discount*10);

    // for count
    smileTermDegree += discount;

    var dispMsg = "";

    var gaugeParam = smileDegree + "%";
    var gaugeDiv = document.getElementById('gauge_smile');
    gaugeDiv.style.width = gaugeParam;

    // publishSmileLevel();
}


// 鼻の赤い丸を書く部分
function drawOval(x, y){
        nosePointerOverlay.setTransform(1, 0, 0, 1, 0, 0);
        nosePointerOverlay.translate(x, y);    
        
        nosePointerOverlay.fillStyle = 'red';
        nosePointerOverlay.beginPath();
        nosePointerOverlay.arc(x, y, 10, 0, 2*Math.PI, false);
        nosePointerOverlay.fill();
        nosePointerOverlay.stroke();
        nosePointerOverlay.setTransform(1, 0, 0, 1, 0, 0);

}

// 笑顔度を表示する部分
function drawSmileDegree(degree){
        textInfoOverlay.fillStyle = "white";

        textInfoOverlay.font = "normal bold 25px sagoe";
        
        var displayStr = "Smile：" + degree + "%";

        textInfoOverlay.lineWidth = 6;
        textInfoOverlay.strokeText(displayStr, 0, 30);
        textInfoOverlay.fillText(displayStr, 0, 30);

        textInfoOverlay.font = "normal bold 20px sagoe";
}



// ある一定期間の笑顔度をカウントする関数
function countSmileDegreeInTerm(){
    if(smileTermDegree/100 > SMILE_TERM_DEGREE){
        publishSmileLevel();
        // 一定期間笑顔の値が高い時の処理
        // var degree = document.getElementById('param_good_left');
        // var currentDegree = Number(degree.innerHTML);
        // degree.innerHTML = currentDegree+1;
        // publishCityGood();
    } else {
        // そうでない時
    }

    smileTermDegree = 0;

    setTimeout("countSmileDegreeInTerm()", SMILE_TERM);
}

// 画面UIのinitialize
function initSmileUi(){
    countSmileDegreeInTerm();
    setupCamera();
    startVideo();
}

function getDegree(){
    return document.getElementById('param_good_left').innerHTML;
}

function setDegree(degree){
    document.getElementById('param_good_left').innerHTML = degree;
}

function setSmileLevel(id, degree){
    // document.getElementById('smile-level').innerHTML = degree;
    $(id).html(degree);
}

function openCNC() {
    location.replace("https://sox.ht.sfc.keio.ac.jp/~richie/clout-cnc/cnc.html");
}

function openEngCNC() {
    location.replace("https://www.ht.sfc.keio.ac.jp/~shinny/fujisawa-2015f/renewal/cnc.en.html");
}
