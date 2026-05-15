/**
 * CamDesk Main Application - Alpine.js Component
 * ===============================================
 * This object contains all reactive state and methods for the app.
 * It handles:
 * - Camera initialization via getUserMedia
 * - Device enumeration and selection
 * - Photo capture (Canvas API)
 * - Video recording (MediaRecorder API)
 * - Picture-in-Picture (PiP)
 * - Fullscreen toggle
 * - Mirror effect
 * - Resolution constraints
 * - Microphone toggle (audio track)
 * - Web Share API integration (sharing captures and the app itself)
 * - Gallery management (in-memory blobs with revokable URLs)
 * - Activity logging
 * - PWA service worker registration & manifest injection
 */
function camdeskApp() {
  return {
    // ========== MEDIA STATE ==========
    stream: null, // Current MediaStream from getUserMedia
    videoElem: null, // Reference to the <video> element
    videoDevices: [], // List of available video input devices
    selectedDeviceId: "", // Currently selected device ID
    cameraLabel: "Camera", // Display name of active camera
    cameraEnabled: false, // Whether stream is active
    mirrorEnabled: false, // Mirror video horizontally (CSS transform)
    micEnabled: false, // Microphone enabled for recording
    selectedResolution: "auto", // 'auto', '720p', or '1080p'
    // ========== FEATURE DETECTION FLAGS ==========
    webShareSupported: false, // navigator.share available?
    pipSupported: false, // Picture-in-Picture API available?
    mediaRecorderSupported: true, // MediaRecorder API available?
    // ========== RECORDING STATE ==========
    isRecording: false,
    mediaRecorder: null,
    recordedChunks: [],
    // ========== GALLERY ==========
    lastCaptureBlob: null, // Most recent capture (for quick share)
    galleryItems: [], // Array of { type, blob, url }
    activityLog: [], // User action log { id, text }
    /**
     * INITIALIZATION
     * Called automatically when Alpine component is mounted.
     * Sets up feature detection, camera enumeration, and PWA service worker.
     */
    async initApp() {
      this.videoElem = document.getElementById('cameraPreview');
      // Feature detection for modern browser APIs
      this.webShareSupported = !!navigator.share;
      this.pipSupported = !!document.pictureInPictureEnabled;
      this.mediaRecorderSupported = !!window.MediaRecorder;
      // Start camera (requests permission automatically)
      await this.enumerateDevices();
      await this.startCamera();
      // PWA: Register service worker for offline caching
      // Service worker caches the root and index.html for offline access.
      if ('serviceWorker' in navigator) {
        // Inline service worker script as a Blob (works in modern browsers)
        const swCode = `
          self.addEventListener('install', e => {
            e.waitUntil(caches.open('camdesk-v2').then(cache => cache.addAll(['/', '/index.html'])));
          });
          self.addEventListener('fetch', e => {
            e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).catch(() => caches.match('/index.html'))));
          });
        `;
        const blob = new Blob([swCode], {
          type: 'application/javascript'
        });
        navigator.serviceWorker.register(URL.createObjectURL(blob)).catch(e => console.warn("SW registration failed", e));
      }
      // Update live clock every second
      setInterval(() => this.$nextTick(() => {}), 1000);
      this.addActivityLog('🚀 CamDesk ready');
    },
    /**
     * LOGGING
     * Adds a timestamped message to the activity log.
     * @param {string} text - Message to display
     */
    addActivityLog(text) {
      this.activityLog.unshift({
        id: Date.now(),
        text: text + ' at ' + new Date().toLocaleTimeString()
      });
      if (this.activityLog.length > 12) this.activityLog.pop();
    },
    clearActivityLog() {
      this.activityLog = [];
      this.addActivityLog('Log cleared');
    },
    /**
     * SHARE APP (via Web Share API)
     * Shares the CamDesk GitHub repository URL.
     */
    async shareApp() {
      if (!this.webShareSupported) {
        alert("Web Share not supported on this browser. You can copy the link: https://github.com/michaelsboost/CamDesk");
        return;
      }
      try {
        await navigator.share({
          title: 'CamDesk',
          text: 'Free privacy-first webcam studio - take photos, record videos, PiP, and more!',
          url: 'https://github.com/michaelsboost/CamDesk'
        });
        this.addActivityLog(`📤 Shared CamDesk app`);
      } catch (e) {
        console.warn(e);
      }
    },
    // ========== CAMERA MANAGEMENT ==========
    /**
     * Enumerates all video input devices and populates the device dropdown.
     * Uses navigator.mediaDevices.enumerateDevices()
     */
    async enumerateDevices() {
      if (!navigator.mediaDevices) return;
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.videoDevices = devices.filter(d => d.kind === 'videoinput');
      if (this.videoDevices.length && !this.selectedDeviceId)
        this.selectedDeviceId = this.videoDevices[0].deviceId;
    },
    /**
     * Starts the camera stream with current deviceId and resolution.
     * Applies video constraints and optionally enables audio track.
     * @param {string} deviceId - Optional device ID to use
     * @param {string} resolution - 'auto', '720p', or '1080p'
     */
    async startCamera(deviceId = this.selectedDeviceId, resolution = this.selectedResolution) {
      if (this.stream) this.stopTracks();
      let videoConstraints = {
        deviceId: deviceId ? {
          exact: deviceId
        } : undefined
      };
      // Set width/height constraints based on resolution
      if (resolution === '720p') {
        videoConstraints.width = {
          ideal: 1280
        };
        videoConstraints.height = {
          ideal: 720
        };
      } else if (resolution === '1080p') {
        videoConstraints.width = {
          ideal: 1920
        };
        videoConstraints.height = {
          ideal: 1080
        };
      } else {
        videoConstraints.width = {
          ideal: 1920
        };
        videoConstraints.height = {
          ideal: 1080
        };
      }
      const constraints = {
        video: videoConstraints,
        audio: this.micEnabled
      };
      try {
        const newStream = await navigator.mediaDevices.getUserMedia(constraints);
        this.stream = newStream;
        this.videoElem.srcObject = newStream;
        this.cameraEnabled = true;
        const track = newStream.getVideoTracks()[0];
        if (track) this.cameraLabel = track.label || "Webcam";
        await this.enumerateDevices(); // Refresh device labels after permission
        this.addActivityLog(`📷 Camera ready: ${this.cameraLabel}`);
      } catch (err) {
        this.cameraEnabled = false;
        this.addActivityLog(`⚠️ Camera error: ${err.message || 'permission denied'}`);
        alert("Camera access failed: " + (err.message || "Check permissions and reload."));
      }
    },
    /**
     * Stops all tracks of the current MediaStream.
     */
    stopTracks() {
      if (this.stream) {
        this.stream.getTracks().forEach(t => t.stop());
        this.stream = null;
      }
      this.cameraEnabled = false;
    },
    /**
     * Toggles camera power (on/off).
     */
    toggleCameraPower() {
      if (this.cameraEnabled) {
        this.stopTracks();
        this.addActivityLog('Camera off');
      } else {
        this.startCamera();
      }
    },
    /**
     * Called when user selects a different camera from dropdown.
     */
    async selectCameraDevice() {
      if (this.selectedDeviceId) await this.startCamera(this.selectedDeviceId, this.selectedResolution);
    },
    /**
     * Called when resolution dropdown changes.
     */
    async changeResolution() {
      await this.startCamera(this.selectedDeviceId, this.selectedResolution);
    },
    /**
     * Called when microphone checkbox toggles.
     * Restarts stream to add/remove audio track.
     */
    async toggleMicrophone() {
      await this.startCamera(this.selectedDeviceId, this.selectedResolution);
    },
    /**
     * Cycles to the next available camera device.
     */
    async switchCamera() {
      if (this.videoDevices.length < 2) {
        alert("Only one camera detected");
        return;
      }
      const currentIdx = this.videoDevices.findIndex(d => d.deviceId === this.selectedDeviceId);
      const nextIdx = (currentIdx + 1) % this.videoDevices.length;
      this.selectedDeviceId = this.videoDevices[nextIdx].deviceId;
      await this.startCamera(this.selectedDeviceId, this.selectedResolution);
    },
    /**
     * Toggles mirror effect (CSS transform).
     */
    toggleMirror() {
      this.mirrorEnabled = !this.mirrorEnabled;
    },
    // ========== PHOTO CAPTURE ==========
    /**
     * Captures a photo from the current video frame using Canvas API.
     * Saves as JPEG blob and adds to gallery.
     */
    async takePhoto() {
      if (!this.videoElem || !this.videoElem.videoWidth) {
        alert("Camera not ready");
        return;
      }
      const canvas = document.createElement('canvas');
      canvas.width = this.videoElem.videoWidth;
      canvas.height = this.videoElem.videoHeight;
      const ctx = canvas.getContext('2d');
      // Apply mirror transformation if enabled
      if (this.mirrorEnabled) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(this.videoElem, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.92));
      const url = URL.createObjectURL(blob);
      this.galleryItems.unshift({
        type: 'photo',
        blob: blob,
        url: url
      });
      this.lastCaptureBlob = blob;
      this.addActivityLog(`📸 Photo captured`);
      this.trimGallery();
    },
    // ========== VIDEO RECORDING ==========
    /**
     * Starts video recording using MediaRecorder API.
     * Records both video and audio (if mic enabled).
     */
    startRecording() {
      if (!this.stream || !this.mediaRecorderSupported) return;
      this.recordedChunks = [];
      const mime = MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : '';
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: mime
      });
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size) this.recordedChunks.push(e.data);
      };
      this.mediaRecorder.onstop = async () => {
        const blob = new Blob(this.recordedChunks, {
          type: mime || 'video/webm'
        });
        const url = URL.createObjectURL(blob);
        this.galleryItems.unshift({
          type: 'video',
          blob: blob,
          url: url
        });
        this.lastCaptureBlob = blob;
        this.addActivityLog(`🎥 Recording saved (${(blob.size/1024).toFixed(1)} KB)`);
        this.isRecording = false;
        this.trimGallery();
      };
      this.mediaRecorder.start(1000); // Collect data every second
      this.isRecording = true;
      this.addActivityLog(`🔴 Recording started`);
    },
    /**
     * Stops the ongoing recording.
     */
    stopRecording() {
      if (this.mediaRecorder && this.isRecording) this.mediaRecorder.stop();
    },
    // ========== DOWNLOAD & SHARE ==========
    /**
     * Downloads a gallery item (photo or video).
     * @param {object} item - Gallery item with blob and type
     */
    downloadItem(item) {
      const a = document.createElement('a');
      a.href = item.url;
      a.download = `camdesk_${item.type}_${Date.now()}.${item.type === 'photo' ? 'jpg' : 'webm'}`;
      a.click();
      this.addActivityLog(`⬇️ Downloaded ${item.type}`);
    },
    /**
     * Shares a gallery item using Web Share API.
     * @param {object} item - Gallery item with blob and type
     */
    async shareItem(item) {
      if (!this.webShareSupported) {
        alert("Web Share not supported");
        return;
      }
      const file = new File([item.blob], `capture.${item.type === 'photo' ? 'jpg' : 'webm'}`, {
        type: item.type === 'photo' ? 'image/jpeg' : 'video/webm'
      });
      if (navigator.canShare && navigator.canShare({
          files: [file]
        })) {
        await navigator.share({
          files: [file],
          title: 'CamDesk capture'
        });
        this.addActivityLog(`📤 Shared ${item.type}`);
      } else alert("Sharing not possible for this file");
    },
    /**
     * Shares the most recent capture (lastCaptureBlob).
     */
    async shareLastCapture() {
      if (this.lastCaptureBlob && this.webShareSupported) {
        const file = new File([this.lastCaptureBlob], "snapshot.jpg", {
          type: 'image/jpeg'
        });
        if (navigator.canShare && navigator.canShare({
            files: [file]
          })) {
          await navigator.share({
            files: [file],
            title: 'CamDesk Snapshot'
          });
          this.addActivityLog(`📤 Shared last capture`);
        } else alert("Sharing unavailable");
      } else alert("No recent capture or share not supported");
    },
    /**
     * Takes a photo from current preview and downloads it immediately.
     */
    downloadCurrentPreview() {
      if (this.videoElem && this.videoElem.videoWidth) this.takePhoto();
      else alert("No active preview");
    },
    // ========== PICTURE-IN-PICTURE ==========
    /**
     * Enters or exits Picture-in-Picture mode on the video element.
     * Feature detection used to hide button if unsupported.
     */
    async enterPiP() {
      if (!this.pipSupported) {
        alert("Picture-in-Picture not supported");
        return;
      }
      try {
        if (document.pictureInPictureElement) await document.exitPictureInPicture();
        else await this.videoElem.requestPictureInPicture();
        this.addActivityLog(`🖼️ PiP toggled`);
      } catch (e) {
        console.warn(e);
      }
    },
    // ========== FULLSCREEN ==========
    /**
     * Toggles fullscreen mode on the entire document.
     */
    toggleFullscreen() {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(e => alert());
      else document.exitFullscreen();
    },
    // ========== GALLERY MANAGEMENT ==========
    /**
     * Deletes a single gallery item and revokes its object URL.
     * @param {number} idx - Index of item in galleryItems array
     */
    deleteItem(idx) {
      const item = this.galleryItems[idx];
      if (item.url) URL.revokeObjectURL(item.url);
      this.galleryItems.splice(idx, 1);
      this.addActivityLog(`🗑️ Deleted from gallery`);
    },
    /**
     * Clears the entire gallery and revokes all URLs.
     */
    clearGallery() {
      this.galleryItems.forEach(i => URL.revokeObjectURL(i.url));
      this.galleryItems = [];
      this.lastCaptureBlob = null;
      this.addActivityLog(`🧹 Gallery cleared`);
    },
    /**
     * Keeps only the 20 most recent items to prevent memory bloat.
     */
    trimGallery() {
      if (this.galleryItems.length > 20) this.galleryItems.pop();
    }
  };
}