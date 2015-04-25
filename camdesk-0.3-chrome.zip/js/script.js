var view = document.querySelector(".view"),
    video = document.querySelector(".view > video"),
    canvas = document.getElementById("canvas"),
    ctx = canvas.getContext("2d"),
    snapshot = document.getElementById("theimage"),
    rotated = false;
    
function start() {
  navigator.getUserMedia = (navigator.getUserMedia ||
                            navigator.webkitGetUserMedia ||
                            navigator.mozGetUserMedia ||
                            navigator.msGetUserMedia);
  window.URL = window.URL || window.webkitURL;

  navigator.getUserMedia({video: true, audio: false}, onReady, console.error);
  
  function onReady(stream) {
    // video.addEventListener("click", rotate);
    view.dataset.active = true;
    video.src = window.URL.createObjectURL(stream);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // setTimeout(fitVideo, 500);
    
    // Snapshot
    shortcut.add("Tab", function(e) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // ctx.drawImage(video,window.innerWidth,window.innerHeight);
      ctx.drawImage(video, 0, 0);
      snapshot.src = canvas.toDataURL("image/png");
      document.getElementById("savepicture").setAttribute('href', canvas.toDataURL("image/png"));
      document.getElementById("savepicture").setAttribute('download', 'photo');
      document.getElementById("savepicture").click();
    });
  }
}

function rotate() {
  rotated = !rotated;
  fitVideo();
}

function fitVideo() {
  var vWidth = video.videoWidth;
  var vHeight = video.videoHeight;
  var vRatio = vWidth / vHeight;

  var sWidth = rotated ? window.innerHeight : window.innerWidth;
  var sHeight = rotated ? window.innerWidth : window.innerHeight;
  var sRatio = sWidth / sHeight;

  if (sRatio < vRatio) {
    video.width = sWidth;
    video.removeAttribute("height");

    var new_vHeight = ~~(sWidth / vRatio);

    if (!rotated) {
      video.style.transform = "scaleY(" + sHeight / new_vHeight + ")";
    } else {
      video.style.transform = "translateX(" + sHeight + "px) rotate(90deg) scaleY(" + sHeight / new_vHeight + ")";
    }
  } else {
    video.height = sHeight;
    video.removeAttribute("width");

    var new_vWidth = ~~(sHeight * vRatio);
    if (!rotated) {
      video.style.transform = "scaleX(" + sWidth / new_vWidth + ")";
    } else {
      video.style.transform = "translateY(" + sWidth + "px) rotate(-90deg) scaleX(" + sWidth / new_vWidth + ")";
    }
  }

}

// window.addEventListener("resize", fitVideo);
start();
    
$(document).ready(function() {
  $(".tips").delay(2000).fadeOut(500);
  
  shortcut.add("Esc", function() {
    window.close();
  });
});
