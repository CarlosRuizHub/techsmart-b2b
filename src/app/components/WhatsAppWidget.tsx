"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, CheckCheck, Loader2 } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  time: string;
}

export default function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-welcome",
      sender: "bot",
      text: "¡Hola! 👋 Bienvenido a Techsmart B2B El Salvador. Soy tu asistente virtual con IA. ¿En qué componentes, precios por volumen o garantías puedo ayudarte hoy?",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const userText = inputText.trim();
    const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const newMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: userText,
      time: currentTime,
    };

    const updatedHistory = [...messages, newMsg];
    setMessages(updatedHistory);
    setInputText("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedHistory.map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: data.reply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err) {
      console.error("Error al enviar mensaje:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "bot",
          text: "Lo sentimos, ocurrió una interrupción de red. Intenta nuevamente.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside aria-label="Asistente virtual de WhatsApp" className="print:hidden fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* VENTANA DE CHAT ABIERTA */}
      {isOpen && (
        <div className="w-[350px] sm:w-[380px] h-[500px] bg-[#EFEAE2] rounded-2xl shadow-2xl border border-slate-300 flex flex-col overflow-hidden mb-3 animate-in fade-in slide-in-from-bottom-5">
          {/* Encabezado Verde WhatsApp */}
          <div className="bg-[#075E54] text-white p-3.5 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white border border-white/30">
                  <Bot className="w-6 h-6 text-emerald-300" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#075E54]" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight">Techsmart B2B Asesor IA</h3>
                <p className="text-[11px] text-emerald-200">En línea • Respuestas al instante</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition cursor-pointer text-white/80 hover:text-white"
              aria-label="Cerrar chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Área de Mensajes */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5 text-xs">
            <div className="text-center my-1">
              <span className="bg-[#FFF3C2] text-[#54656F] text-[10px] px-2.5 py-1 rounded-md shadow-2xs font-medium">
                🔒 Chat cifrado • Conectado con catálogo en tiempo real
              </span>
            </div>

            {messages.map((m) => {
              const isUser = m.sender === "user";
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 shadow-xs whitespace-pre-wrap leading-relaxed ${
                      isUser
                        ? "bg-[#D9FDD3] text-slate-900 rounded-tr-none"
                        : "bg-white text-slate-900 rounded-tl-none"
                    }`}
                  >
                    <p>{m.text}</p>
                    <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-slate-400">
                      <span>{m.time}</span>
                      {isUser && <CheckCheck className="w-3.5 h-3.5 text-sky-500" />}
                    </div>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-start">
                <div className="bg-white rounded-lg rounded-tl-none px-3 py-2 shadow-xs flex items-center gap-2 text-slate-500 text-xs">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  <span>Consultando inventario...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Barra de Entrada de Texto */}
          <form
            onSubmit={handleSendMessage}
            className="bg-[#F0F2F5] p-2.5 flex items-center gap-2 border-t border-slate-200"
          >
            <input
              type="text"
              placeholder="Escribe tu consulta de hardware..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-white border border-slate-300 rounded-full px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="w-9 h-9 rounded-full bg-[#00A884] hover:bg-[#075E54] disabled:bg-slate-300 text-white flex items-center justify-center transition cursor-pointer shadow-xs"
              aria-label="Enviar mensaje"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </div>
      )}

      {/* BOTÓN FLOTANTE VERDE DE WHATSAPP */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white shadow-xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer relative"
        aria-label="Abrir asistente de WhatsApp"
      >
        {isOpen ? (
          <X className="w-7 h-7" />
        ) : (
          <>
            <MessageCircle className="w-7 h-7 fill-white" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
              1
            </span>
          </>
        )}
      </button>
    </aside>
  );
}