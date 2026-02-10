import { useRef, useState } from "react";

export default function useRecorder(onStop) {
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [isRecording, setIsRecording] = useState(false);

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recorderRef.current = new MediaRecorder(stream, {
      mimeType: "audio/webm;codecs=opus",
    });

    chunksRef.current = [];
    recorderRef.current.ondataavailable = (e) =>
      chunksRef.current.push(e.data);

    recorderRef.current.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      onStop(blob);
      stream.getTracks().forEach((t) => t.stop());
    };

    recorderRef.current.start();
    setIsRecording(true);
  };

  const stop = () => {
    recorderRef.current?.stop();
    setIsRecording(false);
  };

  return { start, stop, isRecording };
}
