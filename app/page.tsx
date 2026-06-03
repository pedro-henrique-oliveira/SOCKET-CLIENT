"use client";

import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

interface Message {
  message: string;
  author: string;
  date: string;
}

const EMOJI_CATEGORIES: { label: string; emojis: string[] }[] = [
  {
    label: "😀 Rostos",
    emojis: ["😀","😃","😄","😁","😆","😅","🤣","😂","🙂","🙃","😉","😊","😇","🥰","😍","🤩","😘","😗","😚","😙","🥲","😋","😛","😜","🤪","😝","🤑","🤗","🤭","🤫","🤔","🤐","🥴","😐","😑","😶","😏","😒","🙄","😬","🤥","😌","😔","😪","🤤","😴","😷","🤒","🤕","🤢","🤮","🤧","🥵","🥶","🥳","😵","🤯","🤠","🥸","😎","🤓","🧐","😕","😟","🙁","☹️","😮","😯","😲","😳","🥺","😦","😧","😨","😰","😥","😢","😭","😱","😖","😣","😞","😓","😩","😫","🥱","😤","😡","😠","🤬","😈","👿"],
  },
  {
    label: "👋 Gestos",
    emojis: ["👋","🤚","🖐️","✋","🖖","👌","🤌","🤏","✌️","🤞","🤟","🤘","🤙","👈","👉","👆","🖕","👇","☝️","👍","👎","✊","👊","🤛","🤜","👏","🙌","👐","🤲","🤝","🙏","✍️","💅","🤳","💪","🦾","🦿","🦵","🦶","👂","🦻","👃","🫀","🫁","🧠","🦷","🦴","👀","👁️","👅","👄"],
  },
  {
    label: "❤️ Corações",
    emojis: ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️","💕","💞","💓","💗","💖","💘","💝","💟","☮️","✝️","☯️","🔥","✨","⭐","🌟","💫","⚡","🌈","☀️","🌙","❄️","🎵","🎶","🎉","🎊","🎁","🎀"],
  },
  {
    label: "🐶 Animais",
    emojis: ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🙈","🙉","🙊","🐔","🐧","🐦","🦆","🦅","🦉","🦇","🐺","🐗","🐴","🦄","🐝","🐛","🦋","🐌","🐞","🐜","🦟","🦗","🕷️","🦂","🐢","🐍","🦎","🦖","🦕","🐙","🦑","🦐","🦞","🦀","🐡","🐠","🐟","🐬","🐳","🐋","🦈","🐊","🐅","🐆","🦓","🦍","🦧","🦣","🐘","🦛","🦏","🐪","🐫","🦒","🦘","🦬","🐃","🐂","🐄","🐎","🐖","🐏","🐑","🦙","🐐","🦌","🐕","🐩","🦮","🐕‍🦺","🐈","🐈‍⬛","🪶","🐓","🦃","🦤","🦚","🦜","🦢","🦩","🕊️","🐇","🦝","🦨","🦡","🦫","🦦","🦥","🐁","🐀","🐿️","🦔"],
  },
  {
    label: "🍎 Comida",
    emojis: ["🍎","🍊","🍋","🍇","🍓","🫐","🍈","🍑","🥭","🍍","🥥","🥝","🍅","🥑","🍆","🥦","🥬","🌽","🌶️","🫑","🧄","🧅","🥔","🍠","🥐","🥯","🍞","🥖","🥨","🧀","🥚","🍳","🧈","🥞","🧇","🥓","🥩","🍗","🍖","🌭","🍔","🍟","🍕","🫓","🥪","🥙","🧆","🌮","🌯","🫔","🥗","🥘","🫕","🍜","🍝","🍛","🍣","🍱","🥟","🦪","🍤","🍙","🍚","🍘","🍥","🥮","🍢","🧁","🍰","🎂","🍮","🍭","🍬","🍫","🍿","🍩","🍪","🌰","🥜","🍯","🧃","🥤","🧋","☕","🍵","🧉","🍺","🍻","🥂","🍷","🥃","🍸","🍹","🧊","🥄","🍴","🍽️"],
  },
];

export default function Home() {
  const socketRef = useRef(io("http://localhost:8080/", { autoConnect: false }));

  const [messages, setMessages] = useState<Message[]>([]);
  const [author, setAuthor] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const socket = socketRef.current;
    socket.connect();
    socket.on("connect", () => {
      socket.on("message", (data: Message) => {
        setMessages((old) => [...old, data]);
      });
    });
    return () => { socket.disconnect(); };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close picker when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    }
    if (showPicker) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showPicker]);

  function insertEmoji(emoji: string) {
    const input = inputRef.current;
    if (!input) {
      setNewMessage((m) => m + emoji);
      return;
    }
    const start = input.selectionStart ?? newMessage.length;
    const end = input.selectionEnd ?? newMessage.length;
    const updated = newMessage.slice(0, start) + emoji + newMessage.slice(end);
    setNewMessage(updated);
    // Restore cursor after emoji
    setTimeout(() => {
      input.focus();
      const pos = start + emoji.length;
      input.setSelectionRange(pos, pos);
    }, 0);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    fetch("http://localhost:8080/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: newMessage, author, date: new Date().toISOString() }),
    }).catch(() => alert("Erro ao enviar mensagem"));
    setNewMessage("");
    setShowPicker(false);
  }

  const isOwn = (msg: Message) => msg.author === author;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Nunito', sans-serif; background: #111b21; }

        .app {
          display: flex; flex-direction: column;
          width: 100vw; height: 100vh;
          background: #111b21; overflow: hidden;
          position: relative;
        }

        /* Header */
        .header {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 16px; background: #202c33;
          border-bottom: 1px solid #2a373f; flex-shrink: 0;
        }
        .avatar {
          width: 40px; height: 40px; border-radius: 50%;
          background: linear-gradient(135deg, #25d366 0%, #128c7e 100%);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; font-weight: 700; color: #fff;
          flex-shrink: 0; text-transform: uppercase;
        }
        .header-info { flex: 1; min-width: 0; }
        .header-title { color: #e9edef; font-size: 16px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .header-sub { color: #8696a0; font-size: 12px; }
        .name-input {
          background: #2a373f; border: 1px solid #3b4a50; border-radius: 8px;
          color: #e9edef; font-family: 'Nunito', sans-serif; font-size: 13px;
          padding: 6px 12px; outline: none; transition: border-color 0.2s; width: 160px;
        }
        .name-input::placeholder { color: #8696a0; }
        .name-input:focus { border-color: #25d366; }

        /* Messages */
        .messages-area {
          flex: 1; overflow-y: auto; padding: 16px 10%;
          display: flex; flex-direction: column; gap: 4px;
          background:
            repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(255,255,255,0.015) 28px, rgba(255,255,255,0.015) 29px),
            radial-gradient(ellipse at 20% 50%, rgba(18,140,126,0.07) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 20%, rgba(37,211,102,0.05) 0%, transparent 50%),
            #0b141a;
        }
        .messages-area::-webkit-scrollbar { width: 6px; }
        .messages-area::-webkit-scrollbar-track { background: transparent; }
        .messages-area::-webkit-scrollbar-thumb { background: #2a373f; border-radius: 3px; }

        .bubble-row { display: flex; flex-direction: column; max-width: 65%; animation: popIn 0.18s ease-out; }
        @keyframes popIn { from { opacity:0; transform:scale(0.94) translateY(6px); } to { opacity:1; transform:scale(1) translateY(0); } }
        .bubble-row.own   { align-self: flex-end;   align-items: flex-end; }
        .bubble-row.other { align-self: flex-start; align-items: flex-start; }

        .bubble {
          position: relative; padding: 7px 12px 6px; border-radius: 8px;
          font-size: 14.5px; line-height: 1.45; word-break: break-word;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }
        .bubble.own   { background: #005c4b; color: #e9edef; border-bottom-right-radius: 2px; }
        .bubble.other { background: #202c33; color: #e9edef; border-bottom-left-radius: 2px; }
        .bubble.own::after   { content:''; position:absolute; bottom:0; right:-8px; width:0; border:8px solid transparent; border-bottom-color:#005c4b; border-right:none; }
        .bubble.other::after { content:''; position:absolute; bottom:0; left:-8px;  width:0; border:8px solid transparent; border-bottom-color:#202c33; border-left:none; }

        .bubble-author { font-size:12px; font-weight:700; color:#25d366; margin-bottom:2px; }
        .bubble-meta {
          display:inline-flex; align-items:center; gap:3px;
          font-size:11px; color:#8696a0; white-space:nowrap;
          float:right; margin-left:8px; margin-bottom:-2px; margin-top:2px;
          position:relative; bottom:-1px;
        }
        .bubble.own .bubble-meta { color: rgba(134,224,177,0.8); }
        .tick { font-size:13px; line-height:1; }

        .empty-state {
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          gap:10px; flex:1; color:#8696a0; font-size:14px; opacity:0.7;
        }
        .empty-state span { font-size:40px; }

        /* Input bar */
        .input-bar {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 14px; background: #202c33;
          border-top: 1px solid #2a373f; flex-shrink: 0;
          position: relative;
        }

        .emoji-toggle {
          background: none; border: none; font-size: 22px;
          cursor: pointer; opacity: 0.6; transition: opacity 0.15s, transform 0.15s;
          flex-shrink: 0; line-height: 1; padding: 0;
        }
        .emoji-toggle:hover { opacity: 1; }
        .emoji-toggle.active { opacity: 1; transform: rotate(20deg); }

        .msg-input {
          flex: 1; background: #2a373f; border: none; border-radius: 10px;
          color: #e9edef; font-family: 'Nunito', sans-serif; font-size: 15px;
          padding: 10px 16px; outline: none; min-height: 44px; line-height: 1.4;
        }
        .msg-input::placeholder { color: #8696a0; }

        .send-btn {
          width:44px; height:44px; border-radius:50%; background:#25d366; border:none;
          cursor:pointer; display:flex; align-items:center; justify-content:center;
          flex-shrink:0; transition:background 0.15s,transform 0.1s;
          box-shadow:0 2px 6px rgba(37,211,102,0.35);
        }
        .send-btn:hover:not(:disabled) { background:#20c05b; transform:scale(1.06); }
        .send-btn:disabled { background:#2a373f; box-shadow:none; cursor:not-allowed; }
        .send-btn svg { width:20px; height:20px; fill:#fff; }
        .send-btn:disabled svg { fill:#8696a0; }

        /* ── Emoji Picker ── */
        .emoji-picker {
          position: absolute;
          bottom: 70px;
          left: 14px;
          width: 320px;
          background: #233138;
          border: 1px solid #3b4a50;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
          overflow: hidden;
          z-index: 100;
          animation: slideUp 0.18s ease-out;
        }
        @keyframes slideUp {
          from { opacity:0; transform:translateY(10px); }
          to   { opacity:1; transform:translateY(0); }
        }

        .picker-search {
          display: flex; align-items: center;
          padding: 8px 10px; border-bottom: 1px solid #2a373f; gap: 8px;
        }
        .picker-search input {
          flex: 1; background: #2a373f; border: none; border-radius: 8px;
          color: #e9edef; font-family: 'Nunito', sans-serif; font-size: 13px;
          padding: 6px 10px; outline: none;
        }
        .picker-search input::placeholder { color: #8696a0; }

        .picker-tabs {
          display: flex; overflow-x: auto; background: #1d2c33;
          border-bottom: 1px solid #2a373f; gap: 0;
        }
        .picker-tabs::-webkit-scrollbar { height: 3px; }
        .picker-tabs::-webkit-scrollbar-thumb { background: #2a373f; }

        .picker-tab {
          flex-shrink: 0; padding: 8px 12px; background: none; border: none;
          font-size: 16px; cursor: pointer; opacity: 0.5;
          transition: opacity 0.15s, background 0.15s;
          border-bottom: 2px solid transparent;
        }
        .picker-tab:hover { opacity: 0.8; }
        .picker-tab.active { opacity: 1; border-bottom-color: #25d366; background: rgba(37,211,102,0.08); }

        .picker-grid {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 2px;
          padding: 8px;
          max-height: 200px;
          overflow-y: auto;
        }
        .picker-grid::-webkit-scrollbar { width: 4px; }
        .picker-grid::-webkit-scrollbar-thumb { background: #2a373f; border-radius: 2px; }

        .emoji-cell {
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; height: 36px; border-radius: 6px;
          cursor: pointer; transition: background 0.1s, transform 0.1s;
          background: none; border: none;
        }
        .emoji-cell:hover { background: rgba(255,255,255,0.1); transform: scale(1.2); }
        .emoji-cell:active { transform: scale(0.95); }
      `}</style>

      <div className="app">
        {/* Header */}
        <div className="header">
          <div className="avatar">{author ? author[0] : "?"}</div>
          <div className="header-info">
            <div className="header-title">Chat Geral</div>
            <div className="header-sub">{author ? `Você: ${author}` : "Defina seu nome →"}</div>
          </div>
          <input
            className="name-input"
            placeholder="Seu nome..."
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
        </div>

        {/* Messages */}
        <div className="messages-area">
          {messages.length === 0 ? (
            <div className="empty-state">
              <span>💬</span>
              Nenhuma mensagem ainda. Diga olá!
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`bubble-row ${isOwn(msg) ? "own" : "other"}`}>
                <div className={`bubble ${isOwn(msg) ? "own" : "other"}`}>
                  {!isOwn(msg) && <div className="bubble-author">{msg.author}</div>}
                  {msg.message}
                  <div className="bubble-meta">
                    {new Date(msg.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    {isOwn(msg) && <span className="tick">✓✓</span>}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form className="input-bar" onSubmit={handleSubmit} style={{ display: "flex" }}>

          {/* Emoji Picker */}
          {showPicker && (
            <div className="emoji-picker" ref={pickerRef}>
              <div className="picker-search">
                <input
                  placeholder="🔍 Pesquisar emoji..."
                  onChange={(e) => {
                    const q = e.target.value.toLowerCase();
                    // filter via data-name on cells (handled below via state)
                    const cells = document.querySelectorAll<HTMLButtonElement>(".emoji-cell");
                    cells.forEach((c) => {
                      const match = !q || c.dataset.name?.includes(q) || c.textContent?.includes(q);
                      (c as HTMLElement).style.display = match ? "" : "none";
                    });
                  }}
                />
              </div>
              <div className="picker-tabs">
                {EMOJI_CATEGORIES.map((cat, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`picker-tab ${activeCategory === i ? "active" : ""}`}
                    onClick={() => setActiveCategory(i)}
                    title={cat.label}
                  >
                    {cat.emojis[0]}
                  </button>
                ))}
              </div>
              <div className="picker-grid">
                {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji, i) => (
                  <button
                    key={i}
                    type="button"
                    className="emoji-cell"
                    data-name={emoji}
                    onClick={() => insertEmoji(emoji)}
                    title={emoji}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            className={`emoji-toggle ${showPicker ? "active" : ""}`}
            onClick={() => setShowPicker((v) => !v)}
          >
            {showPicker ? "⌨️" : "😊"}
          </button>

          <input
            ref={inputRef}
            className="msg-input"
            placeholder="Digite uma mensagem"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && newMessage && author) {
                e.preventDefault();
                (e.target as HTMLInputElement).form?.requestSubmit();
              }
            }}
          />

          <button type="submit" className="send-btn" disabled={!newMessage || !author}>
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </form>
      </div>
    </>
  );
}