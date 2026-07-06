import { useEffect, useRef, useState } from "react";
import axios from "axios";

export default function Camera() {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const [downloadUrl, setDownloadUrl] = useState(null); // URL de la vidéo traitée à télécharger
  const [videoReady, setVideoReady] = useState(false); // etat pour indiquer que la vidéo traitée est prête à être affichée
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showCamera, setShowCamera] = useState(true); // etat pour afficher ou masquer la caméra
  const [qrCode, setQrCode] = useState(null); // etat pour stocker le QR code généré

  // =========================
  // CAMERA START
  // =========================

  useEffect(() => {

    let stream;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Erreur caméra:", err);
      }
    }

    startCamera();

    // liberate camera resources

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // =========================
  // START RECORDING
  // =========================

  const startRecording = () => {
    if (!streamRef.current) {
      console.error("Aucun stream caméra disponible");
      return;
    }

    chunksRef.current = []; // reset chunks for new recording

    const options = {
      mimeType: "video/webm; codecs=vp8,opus",
    };

    let mediaRecorder;

    try {
      mediaRecorder = new MediaRecorder(streamRef.current, options);
    } 
    catch (err) {
      console.warn("Codec fallback applied");
      mediaRecorder = new MediaRecorder(streamRef.current);
    }

    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onerror = (err) => {
      console.error("MediaRecorder error:", err);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, {
        type: "video/webm",
      });

      const url = URL.createObjectURL(blob);

      setRecordedVideo(url);

      chunksRef.current = []; // cleanup
    };

    mediaRecorder.start(100); // segment the video into stable chunks of 100ms
    setIsRecording(true);
  };

  // =========================
  // STOP RECORDING
  // =========================

  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;

    if (mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    setIsRecording(false);

    mediaRecorderRef.current.onstop = async () => {
      const blob = new Blob(chunksRef.current, {
        type: "video/webm",
      });

      const formData = new FormData();
      formData.append("video", blob, "recording.webm");

      try {
        const res = await axios.post("http://localhost:3001/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        console.log(res.data);

        console.log("Upload success:", res.data);

        console.log("Download URL reçue :", res.data.videoUrl);

        setDownloadUrl(res.data.videoUrl); // Set the download URL for the processed video

        setVideoReady(true); // Indicate that the processed video is ready to be displayed

        setQrCode(res.data.qrCode); // Set the QR code received from the backend
      } 
      catch (err) {
        console.error("Upload error:", err);
      }

      const url = URL.createObjectURL(blob);

      setRecordedVideo(url);

      setShowCamera(false); // Hide the camera preview after recording

      chunksRef.current = []; // cleanup
    };
  };

  // =========================
  // RESET VIDEO
  // =========================

  const resetRecording = () => {
    
    setRecordedVideo(null);

    chunksRef.current = [];

    setShowCamera(true);

    setVideoReady(false);

    setDownloadUrl(null);

  };

  // =========================
  // download the processed video
  // =========================

  const handleDownload = () => {

    const link = document.createElement("a");

    link.href = downloadUrl;

    link.download = "scribble.mp4";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };


  return (
    <div>
      <h2>Scribble Booth - PRO Recorder</h2>

      {/* CAMERA PREVIEW */}

      {showCamera && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: "600px",
            borderRadius: "12px",
            background: "#000",
          }}
        />
      )}

      {/* CONTROLS */}

      <div style={{ marginTop: "12px" }}>
        <button onClick={startRecording} disabled={isRecording}>
          🎬 Start Recording
        </button>

        <button onClick={stopRecording} disabled={!isRecording}>
          ⛔ Stop Recording
        </button>

        <button onClick={resetRecording}>🔄 Reset</button>
      </div>

      {/* OUTPUT */}

      {recordedVideo && (
        <div style={{ marginTop: "20px" }}>
          <h3>Recorded Result</h3>
           <br />
          <video
            src={recordedVideo}
            controls
            style={{ width: "600px", borderRadius: "10px" }}
          />
        </div>
      )}

      {videoReady && (
        <div
          style={{
            background: "#d4edda",
            padding: "15px",
            marginTop: "20px",
            borderRadius: "8px",
          }}
        >
          ✅ your video has been processed and is ready to be downloaded!
        </div>
      )}
      <br />

      {downloadUrl && (
          <button onClick={handleDownload}>⬇️ Download Video</button>
      )}
      {qrCode && (
        <div style={{ marginTop: 20 }}>
          <h3>Scan QR Code</h3>
           <br />
          <img src={qrCode} alt="QR Code" width={220} />
        </div>
      )}
    </div>
  );
}
