"use client";

import { useEffect, useRef, useState } from "react";
import Vapi from "@vapi-ai/web";

const PRIVATE_KEY = "3bd1fd8a-a97c-4757-aea1-32cde5716d40";
const ASSISTANT_ID = "cc273cf4-80f8-46c4-a04c-b3c9240be51c";

export default function VoiceTestPage() {
  const [status, setStatus] = useState("Nажмите для начала разговора");
  const [statusClass, setStatusClass] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [transcript, setTranscript] = useState<{role: string; text: string}[]>([]);
  const vapiRef = useRef<Vapi | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  function initVapi() {
    if (vapiRef.current) return;
    const v = new Vapi(PRIVATE_KEY);

    v.on("call-start", () => {
      setIsActive(true);
      setStatus("AI говорит...");
      setStatusClass("active");
    });

    v.on("call-end", () => {
      setIsActive(false);
      setStatus("Разговор завершён");
      setStatusClass("");
    });

    v.on("speech-start", () => {
      setStatus("AI говорит...");
      setStatusClass("active");
    });

    v.on("speech-end", () => {
      setStatus("Слушаю вас...");
      setStatusClass("active");
    });

    v.on("message", (msg) => {
      if (msg.type === "transcript" && msg.transcriptType === "final") {
        const role = msg.role === "assistant" ? "assistant" : "user";
        setTranscript(prev => [...prev, { role, text: msg.transcript }]);
      }
    });

    v.on("error", (err) => {
      console.error("Vapi error:", err);
      setStatus("Ошибка: попробуйте снова");
      setStatusClass("error");
      setIsActive(false);
    });

    vapiRef.current = v;
  }

  function toggleCall() {
    initVapi();
    if (isActive) {
      vapiRef.current?.stop();
    } else {
      setStatus("Подключение...");
      setStatusClass("");
      vapiRef.current?.start(ASSISTANT_ID);
    }
  }

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript]);

  return (
    <>
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
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

          <p style={{ color: "#94a3b8", fontSize: "0.75rem", marginTop: 20 }}>
            Партнёрская программа от{" "}
            <a href="https://cbucompany.ru" target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6", textDecoration: "none", fontWeight: 600 }}>
              Центра Банкротства Юрист
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
