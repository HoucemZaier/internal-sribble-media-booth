import { useEffect, useRef, useState } from "react";
import axios from "axios";

export default function Camera() {

  const videoRef = useRef(null);
  const captureStageRef = useRef(null); // Ref pour le conteneur de capture plein écran
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
  // FULLSCREEN HANDLING
  // =========================
  
  const enterCaptureFullscreen = async () => {
    if (captureStageRef.current?.requestFullscreen && !document.fullscreenElement) {
      try {
        await captureStageRef.current.requestFullscreen();
      } catch (err) {
        console.warn("Fullscreen unavailable:", err);
      }
    }
  };

  const exitCaptureFullscreen = async () => {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch (err) {
        console.warn("Exit fullscreen failed:", err);
      }
    }
  };

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
    enterCaptureFullscreen();
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
    exitCaptureFullscreen();

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
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    exitCaptureFullscreen();

    window.location.reload();

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

  const styles = {
    page: {
      minHeight: "100svh",
      padding: "24px 18px 40px",
      boxSizing: "border-box",
      background:
        "radial-gradient(circle at top, rgba(34, 38, 54, 0.95) 0%, rgba(12, 14, 20, 1) 46%, rgba(6, 8, 12, 1) 100%)",
      color: "#f3f4f6",
    },
    shell: {
      width: "min(1200px, 100%)",
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      gap: "22px",
    },
    header: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      alignItems: "center",
      textAlign: "center",
      paddingTop: "8px",
    },
    eyebrow: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      padding: "8px 14px",
      borderRadius: "999px",
      background: "rgba(255, 255, 255, 0.07)",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      color: "#cbd5e1",
      fontSize: "12px",
      letterSpacing: "0.16em",
      textTransform: "uppercase",
    },
    title: {
      margin: 0,
      fontSize: "clamp(24px, 3vw, 40px)",
      lineHeight: 1.1,
      color: "#f8fafc",
    },
    subtitle: {
      margin: 0,
      maxWidth: "720px",
      color: "#9ca3af",
      fontSize: "15px",
    },
    stage: {
      position: "relative",
      borderRadius: "28px",
      overflow: "hidden",
      background: "#090b10",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      boxShadow: "0 24px 80px rgba(0, 0, 0, 0.45)",
      minHeight: "clamp(420px, 68vh, 780px)",
    },
    stageFullscreen: {
      position: "fixed",
      inset: 0,
      zIndex: 50,
      borderRadius: 0,
      border: "none",
      boxShadow: "none",
      minHeight: "100svh",
    },
    video: {
      width: "100%",
      height: "100%",
      minHeight: "inherit",
      objectFit: "cover",
      display: "block",
      background: "#000",
    },
    stageOverlay: {
      position: "absolute",
      inset: 0,
      background:
        "linear-gradient(180deg, rgba(8, 10, 14, 0.08) 0%, rgba(8, 10, 14, 0.08) 72%, rgba(8, 10, 14, 0.65) 100%)",
      pointerEvents: "none",
    },
    controlsDock: {
      position: "absolute",
      left: "50%",
      bottom: "22px",
      transform: "translateX(-50%)",
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: "10px",
      padding: "12px",
      borderRadius: "18px",
      background: "rgba(6, 8, 12, 0.55)",
      border: "1px solid rgba(255, 255, 255, 0.12)",
      backdropFilter: "blur(16px)",
      boxShadow: "0 14px 40px rgba(0, 0, 0, 0.35)",
      zIndex: 2,
    },
    button: {
      appearance: "none",
      border: "1px solid transparent",
      borderRadius: "12px",
      padding: "12px 16px",
      fontSize: "14px",
      fontWeight: 700,
      cursor: "pointer",
      transition: "transform 160ms ease, box-shadow 160ms ease, background 160ms ease, opacity 160ms ease",
      color: "#f8fafc",
      background: "rgba(255, 255, 255, 0.08)",
      minWidth: "140px",
    },
    primaryButton: {
      background: "linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)",
      boxShadow: "0 10px 24px rgba(37, 99, 235, 0.35)",
    },
    dangerButton: {
      background: "linear-gradient(135deg, #f97316 0%, #dc2626 100%)",
      boxShadow: "0 10px 24px rgba(220, 38, 38, 0.32)",
    },
    mutedButton: {
      background: "rgba(255, 255, 255, 0.06)",
      border: "1px solid rgba(255, 255, 255, 0.08)",
    },
    panel: {
      padding: "18px",
      borderRadius: "22px",
      background: "rgba(255, 255, 255, 0.05)",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      backdropFilter: "blur(12px)",
      boxShadow: "0 16px 40px rgba(0, 0, 0, 0.24)",
    },
    panelTitle: {
      margin: 0,
      fontSize: "18px",
      color: "#f8fafc",
    },
    panelText: {
      margin: "6px 0 0",
      color: "#94a3b8",
      fontSize: "14px",
    },
    resultVideo: {
      width: "100%",
      maxWidth: "100%",
      borderRadius: "16px",
      background: "#000",
      marginTop: "14px",
    },
    successBanner: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      background: "rgba(34, 197, 94, 0.12)",
      color: "#dcfce7",
      padding: "14px 16px",
      borderRadius: "16px",
      border: "1px solid rgba(34, 197, 94, 0.24)",
    },
    qrImage: {
      display: "block",
      marginTop: "14px",
      width: 220,
      maxWidth: "100%",
      borderRadius: "16px",
      background: "#fff",
      padding: "10px",
    },
    downloadButton: {
      width: "fit-content",
      alignSelf: "center",
    },
  };


  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <header style={styles.header}>
          <div style={styles.eyebrow}>Scribble Booth Experience</div>
          <h2 style={styles.title}>Scribble Booth - PRO Recorder</h2>
        </header>

        {/* CAMERA PREVIEW */}

        {showCamera && (
          <section
            ref={captureStageRef}
            style={{
              ...styles.stage,
              ...(isRecording ? styles.stageFullscreen : {}),
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                ...styles.video,
                minHeight: isRecording ? "100svh" : styles.stage.minHeight,
              }}
            />
            <div style={styles.stageOverlay} />

            <div style={styles.controlsDock}>
              <button
                onClick={startRecording}
                disabled={isRecording}
                style={{
                  ...styles.button,
                  ...styles.primaryButton,
                  opacity: isRecording ? 0.6 : 1,
                  cursor: isRecording ? "not-allowed" : "pointer",
                }}
              >
                🎬 Start Recording
              </button>

              <button
                onClick={stopRecording}
                disabled={!isRecording}
                style={{
                  ...styles.button,
                  ...styles.dangerButton,
                  opacity: !isRecording ? 0.6 : 1,
                  cursor: !isRecording ? "not-allowed" : "pointer",
                }}
              >
                ⛔ Stop Recording
              </button>

              <button
                onClick={resetRecording}
                style={{
                  ...styles.button,
                  ...styles.mutedButton,
                }}
              >
                🔄 Reset
              </button>
            </div>
          </section>
        )}

        {/* CONTROLS */}

        {!showCamera && (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button
              onClick={resetRecording}
              style={{ ...styles.button, ...styles.mutedButton }}
            >
              🔄 Reset
            </button>
          </div>
        )}

        {/* OUTPUT */}

        {recordedVideo && (
          <section style={styles.panel}>
            <h3 style={styles.panelTitle}>Recorded Result</h3>
            <video
              src={recordedVideo}
              controls
              style={styles.resultVideo}
            />
          </section>
        )}

        {videoReady && (
          <div style={styles.successBanner}>
            <span>your video has been processed and is ready to be downloaded!</span>
          </div>
        )}

        {downloadUrl && (
          <button onClick={handleDownload} style={{ ...styles.button, ...styles.primaryButton, ...styles.downloadButton }}>
            ⬇️ Download Video
          </button>
        )}

        {qrCode && (
          <center>
          <section style={styles.panel}>
            <h3 style={styles.panelTitle}>Scan QR Code</h3>
            <p style={styles.panelText}>Scan QR Code to acces to your vedio</p>
            <img src={qrCode} alt="QR Code" style={styles.qrImage} />
          </section>
          </center>
        )}
      </div>
    </div>
  );
}
