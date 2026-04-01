"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window { SpeechRecognition: any; webkitSpeechRecognition: any; }
}

const ANTHROPIC_PROXY = "/api/chat";

export default function VoiceTestPage() {
  const [status, setStatus] = useState("Nажмите для начала разговора");
  const [statusClass, setStatusClass] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [transcript, setTranscript] = useState<{role: string; text: string}[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const conversationRef = useRef<{role: string; content: string}[]>([
    { role: "assistant", content: "Zdravstvuyte! Menya zovut Anna, ya iz kompanii Centr Bankrotstva Yurist. Chem mogu pomoch?" }
  ]);

  const speak = useCallback(async (text: string) => {
    setStatus("AI говорит...");
    setStatusClass("active");

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error("TTS failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      return new Promise<void>((resolve) => {
        const audio = new Audio(url);
        audio.onended = () => {
          URL.revokeObjectURL(url);
          setStatus("Слушаю вас...");
          resolve();
        };
        audio.onerror = () => {
          URL.revokeObjectURL(url);
          setStatus("Слушаю вас...");
          resolve();
        };
        audioRef.current = audio;
        audio.play();
      });
    } catch {
      // Fallback to browser TTS
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ru-RU";
      return new Promise<void>((resolve) => {
        utterance.onend = () => { setStatus("Слушаю вас..."); resolve(); };
        speechSynthesis.speak(utterance);
      });
    }
  }, []);

  const processUserInput = useCallback(async (userText: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setTranscript(prev => [...prev, { role: "user", text: userText }]);

    conversationRef.current.push({ role: "user", content: userText });

    try {
      const res = await fetch(ANTHROPIC_PROXY, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversationRef.current }),
      });
      const data = await res.json();
      const aiText = data.text || "Извините, не расслышала. Повторите пожалуйста.";

      conversationRef.current.push({ role: "assistant", content: aiText });
      setTranscript(prev => [...prev, { role: "assistant", text: aiText }]);

      // Pause recognition while AI speaks to prevent echo
      recognitionRef.current?.stop();
      await speak(aiText);
      // Resume recognition after speaking
      try { recognitionRef.current?.start(); } catch { /* already started */ }
    } catch {
      setTranscript(prev => [...prev, { role: "assistant", text: "Ошибка соединения" }]);
    }
    setIsProcessing(false);
  }, [isProcessing, speak]);

  function startListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatus("Браузер не поддерживает распознавание речи");
      setStatusClass("error");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "ru-RU";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const last = event.results[event.results.length - 1];
      if (last.isFinal) {
        const text = last[0].transcript.trim();
        if (text) processUserInput(text);
      }
    };

    recognition.onend = () => {
      if (isActive) recognition.start();
    };

    recognition.onerror = () => {
      setStatus("Ошибка распознавания");
      setStatusClass("error");
    };

    recognitionRef.current = recognition;
    setIsActive(true);
    setStatus("AI говорит...");
    setStatusClass("active");

    // Say first message, then start listening
    speak("Здравствуйте! Меня зовут Анна, я из компании Центр Банкротства Юрист. Вы оставляли заявку на нашем сайте. Чем могу помочь?").then(() => {
      try { recognition.start(); } catch { /* already started */ }
    });
    setTranscript([{ role: "assistant", text: "Здравствуйте! Меня зовут Анна, я из компании Центр Банкротства Юрист. Вы оставляли заявку на нашем сайте. Чем могу помочь?" }]);
  }

  function stopListening() {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    speechSynthesis.cancel();
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setIsActive(false);
    setStatus("Разговор завершён");
    setStatusClass("");
  }

  function toggleCall() {
    if (isActive) {
      stopListening();
    } else {
      startListening();
    }
  }

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript]);

  // Load voices
  useEffect(() => { speechSynthesis.getVoices(); }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "linear-gradient(160deg, #dbeafe 0%, #f0f9ff 40%, #ede9fe 100%)" }}>
      <div style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.9)", borderRadius: 28, padding: "48px 36px", maxWidth: 420, width: "100%", textAlign: "center", boxShadow: "0 8px 32px rgba(59,130,246,0.1)" }}>

        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>Голосовая консультация</h1>
        <p style={{ color: "#64748b", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: 24 }}>
          Нажмите кнопку и задайте вопрос о банкротстве. AI-помощник ответит голосом.
        </p>

        <div style={{ fontSize: "0.85rem", minHeight: 24, marginBottom: 16, color: statusClass === "active" ? "#16a34a" : statusClass === "error" ? "#dc2626" : "#94a3b8" }}>
          {status}
        </div>

        <button
          onClick={toggleCall}
          style={{
            width: 120, height: 120, borderRadius: "50%", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px",
            background: isActive ? "linear-gradient(135deg, #ef4444, #f97316)" : "linear-gradient(135deg, #3b82f6, #818cf8)",
            boxShadow: isActive ? "0 8px 32px rgba(239,68,68,0.4)" : "0 8px 32px rgba(59,130,246,0.4)",
            transition: "all 0.3s ease",
          }}
        >
          {isActive ? (
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
          ) : (
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>

        {transcript.length > 0 && (
          <div ref={transcriptRef} style={{ maxHeight: 250, overflowY: "auto", textAlign: "left", padding: "12px 16px", background: "rgba(255,255,255,0.8)", borderRadius: 16, border: "1px solid rgba(226,232,240,0.6)", marginTop: 16 }}>
            {transcript.map((t, i) => (
              <p key={i} style={{ fontSize: "0.82rem", lineHeight: 1.5, margin: "4px 0", color: t.role === "user" ? "#3b82f6" : "#475569" }}>
                <strong style={{ color: t.role === "user" ? "#2563eb" : "#64748b" }}>
                  {t.role === "user" ? "Вы" : "AI"}:
                </strong>{" "}{t.text}
              </p>
            ))}
          </div>
        )}

        <audio ref={audioRef} />

        <p style={{ color: "#94a3b8", fontSize: "0.75rem", marginTop: 20 }}>
          Партнёрская программа от{" "}
          <a href="https://cbucompany.ru" target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6", textDecoration: "none", fontWeight: 600 }}>
            Центра Банкротства Юрист
          </a>
        </p>
      </div>
    </div>
  );
}
