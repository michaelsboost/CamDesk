var videoElement = document.querySelector("video"),
    videoSelect  = document.querySelector("#videoSource"),
    canvas       = document.getElementById("canvas"),
    ctx          = canvas.getContext("2d"),
    snapshot     = document.getElementById("theimage"),
    rotated      = false;

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
}

videoSelect.onchange = start;

start();

$(document).ready(function() {
  shortcut.add("Space", function() {
    $("#save").trigger("click");
    return false;
  });

  // Take and Save Snapshot
  $("#save").click(function() {
    // ctx.drawImage(video,window.innerWidth,window.innerHeight);
    canvas.width = $("video").width();
    canvas.height = $("video").height();
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(function(blob) {
      saveAs(blob, "snapshot.jpg");
      return false;
    });
    return false;
  });
  
  $(window).resize(function() {
    if ($(window).width() >= 800) {
      if ( $(".navlinks").is(":hidden") ) {
        $(".navlinks").show();
      }
    } else {
      if ( $("#toggle").is(":checked") ) {
        $(".navlinks").show();
      } else {
        $(".navlinks").hide();
      }
    }
  });

  $(".appname").html(document.title);

  $(".navlinks").html( $("[data-action=pushpagelinks").html() )
      .find(".notinheader").remove();

  $("#toggle").click(function() {
    $(".navlinks").slideToggle();
  });
});