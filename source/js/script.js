// "use strict";

var videoElement = document.querySelector("video"),
    videoSelect = document.querySelector("#videoSource"),
    canvas = document.getElementById("canvas"),
    ctx = canvas.getContext("2d"),
    snapshot = document.getElementById("theimage"),
    selectors = [videoSelect];

navigator.getUserMedia = navigator.getUserMedia ||
navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

window.URL = window.URL || window.webkitURL;

function gotSources(deviceInfos) {
  // Handles being called several times to update labels. Preserve values.
  var values = selectors.map(function(select) {
    return select.value;
  });
  selectors.forEach(function(select) {
    while (select.firstChild) {
      select.removeChild(select.firstChild);
    }
  });
  for (var i = 0; i !== deviceInfos.length; ++i) {
    var deviceInfo = deviceInfos[i];
    var option = document.createElement('option');
    option.value = deviceInfo.deviceId;
    if (deviceInfo.kind === 'videoinput') {
      option.text = deviceInfo.label || 'camera ' + (videoSelect.length + 1);
      videoSelect.appendChild(option);
    } else {
      console.log('Some other kind of source/device: ', deviceInfo);
    }
  }
  selectors.forEach(function(select, selectorIndex) {
    if (Array.prototype.slice.call(select.childNodes).some(function(n) {
      return n.value === values[selectorIndex];
    })) {
      select.value = values[selectorIndex];
    }
  });
}

navigator.mediaDevices.enumerateDevices().then(gotSources).catch(handleError);

if (typeof MediaStreamTrack === "undefined" ||
    typeof MediaStreamTrack.getSources === "undefined") {
  // alert("This browser does not support MediaStreamTrack.\n\nTry Chrome.");
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

function gotStream(stream) {
  window.stream = stream; // make stream available to console
  videoElement.srcObject = stream;
  // Refresh button list in case labels have become available
  return navigator.mediaDevices.enumerateDevices();
}

function start() {
  if (window.stream) {
    window.stream.getTracks().forEach(function(track) {
      track.stop();
    });
  }
  var videoSource = videoSelect.value;
  var constraints = {
    video: {deviceId: videoSource ? {exact: videoSource} : undefined}
  };
  navigator.mediaDevices.getUserMedia(constraints).
      then(gotStream).then(gotSources).catch(handleError);
}
function handleError(error) {
  console.log('navigator.getUserMedia error: ', error);
}

videoSelect.onchange = start;
start();

$(window).on("keydown", function(e) {
  e.preventDefault();
  
  if ( e.which == 32 ) {
    $("#save").trigger("click");
  }
});

// Take and Save Snapshot
$("#save").click(function() {
  canvas.width = $("video").width();
  canvas.height = $("video").height();
  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  snapshot.src = canvas.toDataURL("image/png");
  var iframe = Object.assign(document.createElement('iframe'), {
    onload() {
      var doc = this.contentDocument;
      var a = Object.assign(doc.createElement('a'), {
        href: canvas.toDataURL("image/png"),
        download: 'photo.png',
      });
      doc.body.appendChild(a);
      a.dispatchEvent(new MouseEvent('click'));
      setTimeout(() => this.remove());
    },
    style: 'display: none',
  });
  document.body.appendChild(iframe);
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