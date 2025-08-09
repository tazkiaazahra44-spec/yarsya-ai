"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { FiSend, FiUser, FiCpu, FiTrash2 } from "react-icons/fi";

function classNames(...parts) {
  return parts.filter(Boolean).join(" ");
}

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

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
  }

  async function sendMessage(text) {
    const trimmed = (text ?? input).trim();
    if (!trimmed) return;

    const userMsg = { id: crypto.randomUUID(), role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed, session }),
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
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex flex-col h-[100dvh] max-h-[100dvh] font-sans">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-black/10 dark:border-white/10">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center gap-3">
          <Image src="/next.svg" alt="logo" width={28} height={28} className="dark:invert" />
          <div className="flex flex-col">
            <h1 className="text-base font-semibold tracking-tight">YARSYA-AI Chat</h1>
            <p className="text-xs text-black/60 dark:text-white/60">Mendukung Markdown, LaTeX/Math, dan Code Highlight</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-black/60 dark:text-white/60">3 rps limiter</span>
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
                className="flex-1 resize-none rounded-xl px-3 py-2 bg-transparent outline-none min-h-[44px] max-h-[180px] placeholder:text-black/50 dark:placeholder:text-white/50"
                rows={1}
                placeholder="Tulis pesan... (Enter untuk kirim, Shift+Enter baris baru)"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                className={classNames(
                  "rounded-xl h-10 px-4 font-medium flex items-center gap-2",
                  input.trim() && !isLoading
                    ? "bg-foreground text-background hover:opacity-90"
                    : "bg-black/10 dark:bg-white/10 text-black/50 dark:text-white/50 cursor-not-allowed"
                )}
              >
                <FiSend />
                Kirim
              </button>
            </div>
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
            <SyntaxHighlighter
              style={oneDark}
              language={match?.[1] || "text"}
              PreTag="div"
              {...props}
            >
              {String(codeChildren).replace(/\n$/, "")}
            </SyntaxHighlighter>
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

function MessageBubble({ role, content, isError }) {
  const isUser = role === "user";
  return (
    <div className={classNames("flex items-start gap-3", isUser && "flex-row-reverse")}>
      <div
        className={classNames(
          "h-8 w-8 rounded-full flex items-center justify-center",
          isUser ? "bg-blue-600 text-white" : "bg-black/5 dark:bg-white/10"
        )}
      >
        {isUser ? <FiUser /> : <FiCpu />}
      </div>
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
      </div>
    </div>
  );
}