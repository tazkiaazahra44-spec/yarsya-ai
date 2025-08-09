"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { FiSend, FiUser, FiCpu, FiTrash2, FiSettings, FiDownload, FiCopy, FiRefreshCw, FiMic, FiMicOff, FiImage, FiVolume2, FiVolumeX, FiUploadCloud } from "react-icons/fi";

function classNames(...parts) {
  return parts.filter(Boolean).join(" ");
}

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [isAborting, setIsAborting] = useState(false);
  const abortRef = useRef(null);
  const [chatId, setChatId] = useState(() => `chat-${Date.now()}`);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [sttSupported, setSttSupported] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [ocrText, setOcrText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    setSpeechSupported("speechSynthesis" in window);
    setSttSupported(!!(window.webkitSpeechRecognition || window.SpeechRecognition));
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("yarsya_chat_state");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed?.messages)) setMessages(parsed.messages);
        if (parsed?.session) setSession(parsed.session);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        "yarsya_chat_state",
        JSON.stringify({ messages, session })
      );
    } catch {}
  }, [messages, session]);

  function clearChat() {
    setMessages([]);
    setSession(null);
    setChatId(`chat-${Date.now()}`);
  }

  function regenerate() {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (lastUser) {
      sendMessage(lastUser.content);
    }
  }

  async function sendMessage(text) {
    const trimmed = (text ?? input).trim();
    if (!trimmed) return;

    const userMsg = { id: crypto.randomUUID(), role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const controller = new AbortController();
      abortRef.current = controller;
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed, session }),
        signal: controller.signal,
      });

      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error || "Request failed");

      setSession(data.session || session);

      const aiMsg = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: String(data.result ?? ""),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Terjadi kesalahan: ${err.message}`,
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setIsAborting(false);
      abortRef.current = null;
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  async function handleImageUpload(file) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    try {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker({ logger: () => {} });
      await worker.loadLanguage("ind+eng");
      await worker.initialize("ind+eng");
      const { data } = await worker.recognize(url);
      await worker.terminate();
      const text = data?.text?.trim?.() || "";
      setOcrText(text);
      if (text) {
        setInput((prev) => (prev ? prev + "\n" + text : text));
      }
    } catch (e) {
      setOcrText("");
    }
  }

  function speak(text) {
    if (!speechSupported || !ttsEnabled || !text) return;
    try {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "id-ID";
      utter.rate = 1;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    } catch {}
  }

  function startRecording() {
    const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Rec) return;
    const rec = new Rec();
    rec.lang = "id-ID";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    setIsRecording(true);
    rec.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map((r) => r[0]?.transcript)
        .join(" ");
      setInput((prev) => (prev ? prev + " " + transcript : transcript));
    };
    rec.onerror = () => setIsRecording(false);
    rec.onend = () => setIsRecording(false);
    rec.start();
    mediaRecorderRef.current = rec;
  }

  function stopRecording() {
    try {
      mediaRecorderRef.current?.stop?.();
    } catch {}
    setIsRecording(false);
  }

  return (
    <div className="flex flex-col h-[100dvh] max-h-[100dvh] font-sans">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-black/10 dark:border-white/10">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center gap-3">
          <Image src="/next.svg" alt="logo" width={28} height={28} className="dark:invert" />
          <div className="flex flex-col">
            <h1 className="text-base font-semibold tracking-tight">YARSYA-AI Chat</h1>
            <p className="text-xs text-black/60 dark:text-white/60">Mendukung Markdown, LaTeX/Math, Code Highlight, OCR, dan Voice</p>
          </div>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <span className="hidden sm:inline text-xs text-black/60 dark:text-white/60">3 rps limiter</span>
            <button
              onClick={() => clearChat()}
              title="Mulai percakapan baru"
              className="rounded-lg border border-black/10 dark:border-white/10 px-2 py-1 hover:bg-black/[.03] dark:hover:bg-white/[.06]"
            >
              New Chat
            </button>
            <button
              onClick={regenerate}
              title="Regenerasi jawaban terakhir"
              className="rounded-lg border border-black/10 dark:border-white/10 px-2 py-1 hover:bg-black/[.03] dark:hover:bg-white/[.06]"
            >
              <FiRefreshCw />
            </button>
            <button
              onClick={() => exportChat(messages, session)}
              title="Export percakapan"
              className="rounded-lg border border-black/10 dark:border-white/10 px-2 py-1 hover:bg-black/[.03] dark:hover:bg-white/[.06]"
            >
              <FiDownload />
            </button>
            <button
              onClick={clearChat}
              title="Bersihkan percakapan"
              className="rounded-lg border border-black/10 dark:border-white/10 px-2 py-1 hover:bg-black/[.03] dark:hover:bg-white/[.06]"
            >
              <FiTrash2 />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-6">
          {messages.length === 0 && (
            <div className="rounded-2xl border border-black/10 dark:border-white/10 p-6 text-center bg-gradient-to-b from-black/[.02] to-transparent dark:from-white/[.03]">
              <h2 className="text-lg font-semibold mb-2">Selamat datang di YARSYA-AI</h2>
              <p className="text-sm text-black/70 dark:text-white/70">Tanyakan apa saja. Gunakan simbol, LaTeX, Markdown, ataupun kode.</p>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                {[
                  "Jelaskan E=mc^2 dan turunkan persamaannya dalam LaTeX",
                  "Buat tabel Markdown perbandingan algoritma sorting",
                  "Contoh kode JavaScript: fungsi debounce() dengan TypeScript",
                  "Tulis puisi dengan simbol ©, ™, ∞, →, ±, α, β, γ",
                ].map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="rounded-xl border border-black/10 dark:border-white/10 px-4 py-3 text-left hover:bg-black/[.03] dark:hover:bg-white/[.06] transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4">
            {messages.map((m) => (
              <MessageBubble key={m.id} role={m.role} content={m.content} isError={m.isError} />
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center"><FiCpu /></div>
                <div className="flex-1">
                  <div className="h-5 w-28 animate-pulse rounded bg-black/10 dark:bg-white/10" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>
      </main>

      <footer className="sticky bottom-0 bg-background/80 backdrop-blur border-t border-black/10 dark:border-white/10">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="rounded-2xl border border-black/10 dark:border-white/10 p-2 bg-white dark:bg-black/30">
            <div className="flex items-end gap-2">
              <textarea
                className="flex-1 resize-none rounded-xl px-3 py-2 bg-transparent outline-none min-h-[44px] max-h-[220px] placeholder:text-black/50 dark:placeholder:text-white/50"
                rows={1}
                placeholder="Tulis pesan... (Enter untuk kirim, Shift+Enter baris baru)"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-2 cursor-pointer" title="Unggah gambar (OCR)">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e.target.files?.[0])}
                  />
                  <span className="rounded-xl h-10 px-3 border border-black/10 dark:border-white/10 flex items-center gap-2 hover:bg-black/[.03] dark:hover:bg-white/[.06]">
                    <FiUploadCloud />
                  </span>
                </label>
                {sttSupported && (
                  isRecording ? (
                    <button
                      onClick={stopRecording}
                      title="Stop Rekam"
                      className="rounded-xl h-10 px-3 border border-black/10 dark:border-white/10 flex items-center gap-2 hover:bg-black/[.03] dark:hover:bg-white/[.06]"
                    >
                      <FiMicOff />
                    </button>
                  ) : (
                    <button
                      onClick={startRecording}
                      title="Mulai Rekam (gratis, browser)"
                      className="rounded-xl h-10 px-3 border border-black/10 dark:border-white/10 flex items-center gap-2 hover:bg-black/[.03] dark:hover:bg-white/[.06]"
                    >
                      <FiMic />
                    </button>
                  )
                )}
                {ttsEnabled && speechSupported && (
                  <button
                    onClick={() => speak(messages.filter((m) => m.role === "assistant").slice(-1)[0]?.content || "")}
                    title="Bacakan jawaban AI"
                    className="rounded-xl h-10 px-3 border border-black/10 dark:border-white/10 flex items-center gap-2 hover:bg-black/[.03] dark:hover:bg-white/[.06]"
                  >
                    <FiVolume2 />
                  </button>
                )}
                {isLoading ? (
                  <button
                    onClick={() => {
                      try {
                        setIsAborting(true);
                        abortRef.current?.abort();
                      } catch {}
                    }}
                    className="rounded-xl h-10 px-4 font-medium border border-black/10 dark:border-white/10 hover:bg-black/[.03] dark:hover:bg-white/[.06]"
                  >
                    Stop
                  </button>
                ) : (
                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim()}
                    className={classNames(
                      "rounded-xl h-10 px-4 font-medium flex items-center gap-2",
                      input.trim()
                        ? "bg-foreground text-background hover:opacity-90"
                        : "bg-black/10 dark:bg-white/10 text-black/50 dark:text-white/50 cursor-not-allowed"
                    )}
                  >
                    <FiSend />
                    Kirim
                  </button>
                )}
              </div>
            </div>
            {imagePreview && (
              <div className="px-2 pt-2">
                <div className="text-xs text-black/60 dark:text-white/60 mb-1">Pratinjau OCR</div>
                <div className="rounded-xl border border-black/10 dark:border-white/10 overflow-hidden">
                  <img src={imagePreview} alt="preview" className="max-h-56 object-contain w-full bg-black/5 dark:bg-white/5" />
                  {ocrText && (
                    <div className="p-2 text-xs text-black/80 dark:text-white/80 whitespace-pre-wrap">{ocrText}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </footer>


    </div>
  );
}

function MarkdownRenderer({ children }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        code({ inline, className, children: codeChildren, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          return !inline ? (
            <CodeBlock language={match?.[1] || "text"} code={String(codeChildren)} />
          ) : (
            <code className={className} {...props}>
              {codeChildren}
            </code>
          );
        },
      }}
    >
      {children}
    </ReactMarkdown>
  );
}

function CodeBlock({ language, code }) {
  async function onCopy() {
    try {
      await navigator.clipboard.writeText(code);
    } catch {}
  }
  return (
    <div className="relative group">
      <button
        onClick={onCopy}
        className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition rounded-md border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/10 px-2 py-1 text-xs flex items-center gap-1"
        title="Salin kode"
      >
        <FiCopy /> Copy
      </button>
      <SyntaxHighlighter style={oneDark} language={language} PreTag="div">
        {code.replace(/\n$/, "")}
      </SyntaxHighlighter>
    </div>
  );
}


function exportChat(messages, session) {
  const data = { session: session ?? null, messages };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `yarsya-chat-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function MessageBubble({ role, content, isError }) {
  const isUser = role === "user";
  const timestamp = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  return (
    <div className={classNames("flex items-start gap-3 group", isUser && "flex-row-reverse")}>
      <div
        className={classNames(
          "h-8 w-8 rounded-full flex items-center justify-center",
          isUser ? "bg-blue-600 text-white" : "bg-black/5 dark:bg-white/10"
        )}
      >
        {isUser ? <FiUser /> : <FiCpu />}
      </div>
      <div className="relative">
        {!isUser && (
          <button
            onClick={() => navigator.clipboard.writeText(String(content))}
            className="absolute -top-2 -right-2 z-10 rounded-md border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/10 px-2 py-1 text-xs opacity-0 group-hover:opacity-100"
            title="Salin balasan"
          >
            <FiCopy />
          </button>
        )}
        <div
          className={classNames(
            "max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 leading-relaxed",
            isUser
              ? "bg-blue-600 text-white"
              : isError
              ? "bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300"
              : "border border-black/10 dark:border-white/10 bg-white dark:bg-black/30"
          )}
        >
          {isUser ? (
            <div>{content}</div>
          ) : (
            <MarkdownRenderer>{content}</MarkdownRenderer>
          )}
          <div className={classNames("mt-1 text-[10px]", isUser ? "text-white/80" : "text-black/50 dark:text-white/50")}>{timestamp}</div>
        </div>
      </div>
    </div>
  );
}