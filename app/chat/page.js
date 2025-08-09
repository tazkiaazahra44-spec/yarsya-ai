"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ensurePushSubscription } from "./registerPush";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { 
  FiSend, 
  FiUser, 
  FiCpu, 
  FiDownload, 
  FiCopy, 
  FiRefreshCw, 
  FiMic, 
  FiMicOff, 
  FiVolume2, 
  FiUploadCloud,
  FiHome,
  FiTrash2,
  FiCheck,
  FiAlertCircle,
  FiArrowRight
} from "react-icons/fi";

function classNames(...parts) {
  return parts.filter(Boolean).join(" ");
}

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef(null);
  const [chatId, setChatId] = useState(() => `chat-${Date.now()}`);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [sttSupported, setSttSupported] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [ocrText, setOcrText] = useState("");
  const [showToast, setShowToast] = useState(null);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

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
    } catch (error) {
      console.error("Failed to load chat state:", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        "yarsya_chat_state",
        JSON.stringify({ messages, session })
      );
    } catch (error) {
      console.error("Failed to save chat state:", error);
    }
  }, [messages, session]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  function showNotification(message, type = 'success') {
    setShowToast({ message, type });
    setTimeout(() => setShowToast(null), 3000);
  }

  function clearChat() {
    setMessages([]);
    setSession(null);
    setChatId(`chat-${Date.now()}`);
    setImagePreview(null);
    setOcrText("");
    showNotification("Chat cleared successfully!");
  }

  function regenerate() {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (lastUser) {
      // Remove the last AI response
      setMessages(prev => {
        const newMessages = [...prev];
        const lastAiIndex = newMessages.map(m => m.role).lastIndexOf("assistant");
        if (lastAiIndex !== -1) {
          newMessages.splice(lastAiIndex, 1);
        }
        return newMessages;
      });
      sendMessage(lastUser.content);
    }
  }

  async function sendMessage(text) {
    const trimmed = (text ?? input).trim();
    if (!trimmed && !imagePreview) return;

    const userMsg = { 
      id: crypto.randomUUID(), 
      role: "user", 
      content: trimmed,
      timestamp: new Date().toISOString()
    };
    
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setImagePreview(null);
    setOcrText("");
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

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      
      if (!data?.success) {
        throw new Error(data?.error || "Request failed");
      }

      setSession(data.session || session);

      const aiMsg = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: String(data.result ?? ""),
        timestamp: new Date().toISOString()
      };
      
      setMessages((prev) => [...prev, aiMsg]);

      // Try to send push notification (optional)
      try {
        await ensurePushSubscription();
        await fetch("/api/push/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "YARSYA-AI",
            body: aiMsg.content.slice(0, 120) + (aiMsg.content.length > 120 ? "…" : ""),
            url: "/chat",
          }),
        });
      } catch (pushError) {
        console.warn("Push notification failed:", pushError);
      }
      
    } catch (err) {
      console.error("Chat error:", err);
      const errorMsg = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Sorry, I encountered an error: ${err.message}. Please try again.`,
        isError: true,
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, errorMsg]);
      showNotification("Failed to send message. Please try again.", "error");
    } finally {
      setIsLoading(false);
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
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      showNotification("Image too large. Please choose a smaller file.", "error");
      return;
    }
    
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    showNotification("Processing image with OCR...", "info");
    
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
        showNotification("Text extracted successfully!", "success");
      } else {
        showNotification("No text found in image", "warning");
      }
    } catch (e) {
      console.error("OCR error:", e);
      setOcrText("");
      showNotification("Failed to extract text from image", "error");
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
      showNotification("Reading message aloud...", "info");
    } catch (error) {
      console.error("TTS error:", error);
      showNotification("Failed to read message", "error");
    }
  }

  function startRecording() {
    const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Rec) return;
    const rec = new Rec();
    rec.lang = "id-ID";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    setIsRecording(true);
    showNotification("Listening...", "info");
    
    rec.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map((r) => r[0]?.transcript)
        .join(" ");
      setInput((prev) => (prev ? prev + " " + transcript : transcript));
      showNotification("Speech recognized!", "success");
    };
    
    rec.onerror = (e) => {
      console.error("Speech recognition error:", e);
      setIsRecording(false);
      showNotification("Speech recognition failed", "error");
    };
    
    rec.onend = () => setIsRecording(false);
    rec.start();
    recognitionRef.current = rec;
  }

  function stopRecording() {
    try {
      recognitionRef.current?.stop?.();
    } catch (error) {
      console.error("Stop recording error:", error);
    }
    setIsRecording(false);
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-purple-900">
      {/* Toast Notification */}
      {showToast && (
        <div className={classNames(
          "fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-floating animate-fade-in",
          showToast.type === 'success' && "bg-green-100 text-green-800 border border-green-200",
          showToast.type === 'error' && "bg-red-100 text-red-800 border border-red-200",
          showToast.type === 'warning' && "bg-yellow-100 text-yellow-800 border border-yellow-200",
          showToast.type === 'info' && "bg-blue-100 text-blue-800 border border-blue-200"
        )}>
          <div className="flex items-center space-x-2">
            {showToast.type === 'success' && <FiCheck className="w-5 h-5" />}
            {showToast.type === 'error' && <FiAlertCircle className="w-5 h-5" />}
            {showToast.type === 'warning' && <FiAlertCircle className="w-5 h-5" />}
            {showToast.type === 'info' && <FiAlertCircle className="w-5 h-5" />}
            <span className="font-medium">{showToast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="glass border-b border-white/20 dark:border-gray-700/30 sticky top-0 z-40">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="p-2 rounded-xl gradient-bg hover:scale-105 transition-transform">
                <FiHome className="w-5 h-5 text-white" />
              </Link>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl gradient-bg">
                  <Image src="/next.svg" alt="YARSYA-AI" width={24} height={24} className="dark:invert" />
                </div>
                <div>
                  <h1 className="text-lg font-bold gradient-text">YARSYA-AI Chat</h1>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Smart AI Assistant • LaTeX • Code • OCR
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="hidden md:flex items-center space-x-2 text-xs bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-600 dark:text-gray-400">3 req/sec limit</span>
              </div>
              
              <button
                onClick={clearChat}
                className="btn-secondary p-2 rounded-xl hover:scale-105 transition-all"
                title="Clear chat"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>

              <button
                onClick={regenerate}
                disabled={isLoading || messages.length === 0}
                className="btn-secondary p-2 rounded-xl hover:scale-105 transition-all disabled:opacity-50"
                title="Regenerate last response"
              >
                <FiRefreshCw className={classNames("w-4 h-4", isLoading && "animate-spin")} />
              </button>

              <button
                onClick={() => exportChat(messages, session)}
                className="btn-secondary p-2 rounded-xl hover:scale-105 transition-all"
                title="Export chat"
              >
                <FiDownload className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="mx-auto max-w-4xl">
              {messages.length === 0 && (
                <WelcomeScreen onSendMessage={sendMessage} />
              )}

              <div className="space-y-6">
                {messages.map((message, index) => (
                  <MessageBubble 
                    key={message.id} 
                    message={message}
                    isLatest={index === messages.length - 1}
                    onSpeak={speak}
                    speechSupported={speechSupported && ttsEnabled}
                  />
                ))}
                
                {isLoading && <TypingIndicator />}
                <div ref={bottomRef} />
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur">
            <div className="mx-auto max-w-4xl px-4 py-4">
              <div className="relative">
                {/* Image Preview */}
                {imagePreview && (
                  <div className="mb-4 p-4 glass rounded-2xl">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Image Preview</span>
                      <button 
                        onClick={() => {
                          setImagePreview(null);
                          setOcrText("");
                        }}
                        className="text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                      <img src={imagePreview} alt="Preview" className="max-h-40 w-full object-contain bg-gray-50 dark:bg-gray-800" />
                      {ocrText && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Extracted text:</p>
                          <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{ocrText}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Input Container */}
                <div className="glass rounded-2xl p-4 shadow-elegant">
                  <div className="flex items-end space-x-3">
                    <div className="flex-1">
                      <textarea
                        ref={textareaRef}
                        className="w-full resize-none bg-transparent outline-none placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white min-h-[2.5rem] max-h-32"
                        rows={1}
                        placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      {/* Image Upload */}
                      <label className="btn-secondary p-2 rounded-xl cursor-pointer hover:scale-105 transition-all" title="Upload image (OCR)">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e.target.files?.[0])}
                        />
                        <FiUploadCloud className="w-5 h-5" />
                      </label>

                      {/* Voice Recording */}
                      {sttSupported && (
                        <button
                          onClick={isRecording ? stopRecording : startRecording}
                          className={classNames(
                            "p-2 rounded-xl transition-all hover:scale-105",
                            isRecording 
                              ? "bg-red-100 text-red-600 border border-red-200 animate-pulse" 
                              : "btn-secondary"
                          )}
                          title={isRecording ? "Stop recording" : "Start voice recording"}
                        >
                          {isRecording ? <FiMicOff className="w-5 h-5" /> : <FiMic className="w-5 h-5" />}
                        </button>
                      )}

                      {/* Text-to-Speech */}
                      {speechSupported && ttsEnabled && messages.length > 0 && (
                        <button
                          onClick={() => {
                            const lastAiMessage = [...messages].reverse().find(m => m.role === "assistant");
                            if (lastAiMessage) speak(lastAiMessage.content);
                          }}
                          className="btn-secondary p-2 rounded-xl hover:scale-105 transition-all"
                          title="Read last AI response"
                        >
                          <FiVolume2 className="w-5 h-5" />
                        </button>
                      )}

                      {/* Send/Stop Button */}
                      {isLoading ? (
                        <button
                          onClick={() => {
                            try {
                              abortRef.current?.abort();
                            } catch (error) {
                              console.error("Abort error:", error);
                            }
                          }}
                          className="bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-xl font-medium hover:bg-red-200 transition-colors"
                        >
                          Stop
                        </button>
                      ) : (
                        <button
                          onClick={() => sendMessage()}
                          disabled={!input.trim() && !imagePreview}
                          className={classNames(
                            "px-6 py-2 rounded-xl font-medium flex items-center space-x-2 transition-all",
                            (input.trim() || imagePreview)
                              ? "btn-primary hover:scale-105 shadow-elegant"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600"
                          )}
                        >
                          <FiSend className="w-4 h-4" />
                          <span>Send</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
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
  const [copied, setCopied] = useState(false);
  
  async function onCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  }
  
  return (
    <div className="relative group code-block">
      <button
        onClick={onCopy}
        className={classNames(
          "absolute right-3 top-3 z-10 px-3 py-1 rounded-lg text-xs font-medium transition-all",
          "opacity-0 group-hover:opacity-100",
          copied 
            ? "bg-green-100 text-green-700 border border-green-200" 
            : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
        )}
        title={copied ? "Copied!" : "Copy code"}
      >
        {copied ? (
          <>
            <FiCheck className="w-3 h-3 inline mr-1" />
            Copied!
          </>
        ) : (
          <>
            <FiCopy className="w-3 h-3 inline mr-1" />
            Copy
          </>
        )}
      </button>
      <SyntaxHighlighter 
        style={oneDark} 
        language={language} 
        PreTag="div"
        customStyle={{
          margin: 0,
          borderRadius: '12px',
          fontSize: '14px',
          lineHeight: '1.5'
        }}
      >
        {code.replace(/\n$/, "")}
      </SyntaxHighlighter>
    </div>
  );
}

function exportChat(messages, session) {
  const data = { 
    session: session ?? null, 
    messages,
    exportedAt: new Date().toISOString(),
    appVersion: "YARSYA-AI v2.0"
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `yarsya-chat-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function TypingIndicator() {
  return (
    <div className="flex items-start space-x-3 animate-fade-in">
      <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
        <FiCpu className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1">
        <div className="glass rounded-2xl rounded-tl-md p-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">YARSYA-AI is thinking</span>
            <div className="loading-dots">
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WelcomeScreen({ onSendMessage }) {
  const suggestions = [
    {
      icon: "🧮",
      title: "Mathematics & Physics",
      text: "Jelaskan E=mc² dan turunkan persamaannya dalam LaTeX",
      category: "math"
    },
    {
      icon: "📊",
      title: "Data & Tables",  
      text: "Buat tabel Markdown perbandingan algoritma sorting",
      category: "data"
    },
    {
      icon: "💻",
      title: "Programming",
      text: "Contoh kode JavaScript: fungsi debounce() dengan TypeScript",
      category: "code"
    },
    {
      icon: "🎨",
      title: "Creative Writing",
      text: "Tulis puisi dengan simbol ©, ™, ∞, →, ±, α, β, γ",
      category: "creative"
    },
    {
      icon: "🔬",
      title: "Science Explanation",
      text: "Bagaimana cara kerja fotosintesis secara detail?",
      category: "science"
    },
    {
      icon: "🌍",
      title: "General Knowledge",
      text: "Sejarah singkat perkembangan internet",
      category: "general"
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="text-center">
        <div className="inline-flex p-4 rounded-2xl gradient-bg mb-6">
          <FiCpu className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold gradient-text mb-4">
          Welcome to YARSYA-AI
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Your intelligent assistant for learning, problem-solving, and creative thinking. 
          Ask anything from math and science to programming and literature.
        </p>
      </div>

      {/* Capabilities */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass rounded-2xl p-6 text-center">
          <div className="text-2xl mb-3">📐</div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">LaTeX & Math</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Complex equations, formulas, and mathematical notation
          </p>
        </div>
        
        <div className="glass rounded-2xl p-6 text-center">
          <div className="text-2xl mb-3">🖥️</div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Code Highlighting</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Syntax highlighting for all major programming languages
          </p>
        </div>
        
        <div className="glass rounded-2xl p-6 text-center">
          <div className="text-2xl mb-3">📝</div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Rich Formatting</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Markdown support for beautiful, structured content
          </p>
        </div>
      </div>

      {/* Suggestion Cards */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
          Try asking about...
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSendMessage(suggestion.text)}
              className="group glass rounded-2xl p-6 text-left hover:shadow-floating transition-all hover:scale-105"
            >
              <div className="flex items-start space-x-4">
                <div className="text-2xl flex-shrink-0">
                  {suggestion.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {suggestion.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {suggestion.text}
                  </p>
                </div>
                <FiArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Start Tips */}
      <div className="glass rounded-2xl p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">💡 Quick Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <span className="font-medium text-gray-900 dark:text-white">Press Enter</span>
              <span className="text-gray-600 dark:text-gray-400"> to send your message</span>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <span className="font-medium text-gray-900 dark:text-white">Shift + Enter</span>
              <span className="text-gray-600 dark:text-gray-400"> for a new line</span>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <span className="font-medium text-gray-900 dark:text-white">Upload images</span>
              <span className="text-gray-600 dark:text-gray-400"> for OCR text extraction</span>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <span className="font-medium text-gray-900 dark:text-white">Voice input</span>
              <span className="text-gray-600 dark:text-gray-400"> supported in modern browsers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message, isLatest, onSpeak, speechSupported }) {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";
  const isError = message.isError;
  const [copied, setCopied] = useState(false);
  
  const timestamp = message.timestamp 
    ? new Date(message.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    : new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleSpeak = () => {
    if (isAssistant && speechSupported) {
      onSpeak(message.content);
    }
  };

  return (
    <div className={classNames(
      "flex items-start space-x-3 group animate-slide-in",
      isUser && "flex-row-reverse space-x-reverse"
    )}>
      {/* Avatar */}
      <div className={classNames(
        "p-2 rounded-full flex-shrink-0",
        isUser 
          ? "bg-gradient-to-r from-blue-500 to-purple-500" 
          : isError 
            ? "bg-red-100 text-red-600 border border-red-200"
            : "bg-gradient-to-r from-gray-500 to-gray-600"
      )}>
        {isUser ? (
          <FiUser className="w-4 h-4 text-white" />
        ) : (
          <FiCpu className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={classNames("flex-1 max-w-[85%]", isUser && "flex flex-col items-end")}>
        <div className={classNames(
          "relative rounded-2xl px-4 py-3 shadow-elegant",
          isUser 
            ? "message-user rounded-tr-md" 
            : isError 
              ? "message-error rounded-tl-md"
              : "message-ai rounded-tl-md"
        )}>
          {/* Action buttons for AI messages */}
          {isAssistant && !isError && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
              <button
                onClick={handleCopy}
                className={classNames(
                  "p-1 rounded-md text-xs transition-all",
                  copied 
                    ? "bg-green-100 text-green-700" 
                    : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                )}
                title={copied ? "Copied!" : "Copy message"}
              >
                {copied ? <FiCheck className="w-3 h-3" /> : <FiCopy className="w-3 h-3" />}
              </button>
              
              {speechSupported && (
                <button
                  onClick={handleSpeak}
                  className="p-1 rounded-md text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all"
                  title="Read aloud"
                >
                  <FiVolume2 className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {/* Message text */}
          <div className="pr-12">
            {isUser ? (
              <div className="text-white whitespace-pre-wrap break-words">
                {message.content}
              </div>
            ) : (
              <div className={classNames(
                "prose prose-sm max-w-none",
                isError ? "text-red-700 dark:text-red-300" : "text-gray-900 dark:text-gray-100"
              )}>
                <MarkdownRenderer>{message.content}</MarkdownRenderer>
              </div>
            )}
          </div>

          {/* Timestamp */}
          <div className={classNames(
            "text-xs mt-2 opacity-70",
            isUser ? "text-white" : isError ? "text-red-600" : "text-gray-500 dark:text-gray-400"
          )}>
            {timestamp}
            {isLatest && isAssistant && !isError && (
              <span className="ml-2 text-green-500">●</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}