// "use strict";

var videoElement = document.querySelector("video"),
    videoSelect = document.querySelector("#videoSource"),
    canvas = document.getElementById("canvas"),
    ctx = canvas.getContext("2d"),
    snapshot = document.getElementById("theimage");

navigator.getUserMedia = navigator.getUserMedia ||
navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

window.URL = window.URL || window.webkitURL;

function gotSources(sourceInfos) {
  for (var i = 0; i !== sourceInfos.length; ++i) {
    var sourceInfo = sourceInfos[i];
    var option = document.createElement("option");
    option.value = sourceInfo.id;
    if (sourceInfo.kind === "video") {
      option.text = sourceInfo.label || "camera " + (videoSelect.length + 1);
      videoSelect.appendChild(option);
    } else {
      console.log("Some other kind of source: ", sourceInfo);
    }
  }
}

if (typeof MediaStreamTrack === "undefined" ||
    typeof MediaStreamTrack.getSources === "undefined") {
  alert("This browser does not support MediaStreamTrack.\n\nTry Chrome.");
} else {
  MediaStreamTrack.getSources(gotSources);
}

function successCallback(stream) {
  window.stream = stream; // make stream available to console
  videoElement.src = window.URL.createObjectURL(stream);
  videoElement.play();
}

function errorCallback(error) {
  console.log("navigator.getUserMedia error: ", error);
}

function start() {
  if (!!window.stream) {
    videoElement.src = null;
    window.stream.stop();
  }
  var videoSource = videoSelect.value;
  var constraints = {
    video: {
      optional: [{
        sourceId: videoSource
      }]
    }
  };
  navigator.getUserMedia(constraints, successCallback, errorCallback);
 
  window.onkeydown = function(e) {
    if ( e.which == 32 ) {
      canvas.width = document.querySelector("video").innerWidth;
      canvas.height = document.querySelector("video").innerHeight;
      // ctx.drawImage(video,window.innerWidth,window.innerHeight);
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      snapshot.src = canvas.toDataURL("image/png");
      document.querySelector("#save").setAttribute("href", canvas.toDataURL("image/png"));
      document.querySelector("#save").setAttribute("download", "photo");
      document.querySelector("#save").click();
    }
  };
}

videoSelect.onchange = start;
start();

// Take and Save Snapshot
$("#save").click(function() {
  canvas.width = $("video").width();
  canvas.height = $("video").height();
  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  snapshot.src = canvas.toDataURL("image/png");
  $("#save").attr("href", canvas.toDataURL("image/png"));
  $("#save").attr("download", "photo");
});

// Detect what operating system the user is using.
if ( navigator.platform.toLowerCase() === "macintosh" || "macintel" || "macppc" || "mac68k" ) {
  window.onkeydown = function(e) {
    if ( e.metaKey && e.which == 82 ) {
      location.reload(true);
    }
  };
} else {
  // Reload app [non mac computers]
  shortcut.add("Ctrl+R", function() {
    location.reload(true);
  });
}

// Toggle dialog
shortcut.add("Tab", function() {
  $("[data-action=toggle]").toggleClass("hide");
});

// Close the app on Chromebooks
shortcut.add("Esc", function() {
  window.close();
});