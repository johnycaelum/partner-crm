"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

export default function VoiceTestPage() {
  const [status, setStatus] = useState("Нажмите для начала разговора");
  const [statusClass, setStatusClass] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [transcript, setTranscript] = useState<{ role: string; text: string }[]>([]);
  const vapiRef = useRef<any>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  function initVapi() {
    if (vapiRef.current) return;
    const v = new (window as any).Vapi("aef82e33-ceb9-486e-9cfa-3ad2d5736bd0");

    v.on("call-start", () => {
      setIsActive(true);
      setStatus("Соединение установлено — говорите!");
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

    v.on("message", (msg: any) => {
      if (msg.type === "transcript" && msg.transcriptType === "final") {
        setTranscript(prev => [...prev, { role: msg.role, text: msg.transcript }]);
      }
    });

    v.on("error", (err: any) => {
      console.error("Vapi error:", err);
      setStatus("Ошибка: " + (err.message || "попробуйте снова"));
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
      vapiRef.current?.start("54144acf-b3ad-4306-a767-d215502e1347");
    }
  }

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript]);

  return (
    <>
      <Script src="https://cdn.jsdelivr.net/npm/@vapi-ai/web@latest/dist/vapi-web.min.js" strategy="beforeInteractive" />
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
              <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>

          {transcript.length > 0 && (
            <div ref={transcriptRef} style={{
              background: "rgba(241,245,249,0.7)", border: "1px solid rgba(203,213,225,0.6)",
              borderRadius: 16, padding: 16, marginTop: 20, textAlign: "left",
              maxHeight: 200, overflowY: "auto", fontSize: "0.82rem", color: "#334155", lineHeight: 1.6
            }}>
              {transcript.map((t, i) => (
                <div key={i}>
                  <span style={{ color: t.role === "assistant" ? "#3b82f6" : "#8b5cf6", fontWeight: 600 }}>
                    {t.role === "assistant" ? "AI" : "Вы"}:
                  </span>{" "}
                  {t.text}
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 24, fontSize: "0.75rem", color: "#94a3b8" }}>
            Партнёрская программа от <a href="https://cbucompany.ru" target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6", textDecoration: "none" }}>Центра Банкротства Юрист</a>
          </div>
        </div>
      </div>
    </>
  );
}
