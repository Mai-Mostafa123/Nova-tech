import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Sparkles, Bot, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';
import { cn } from '../lib/utils';
import { getRecentProducts } from '../lib/userActivity';
import { storefrontApi } from '../services/storefrontApi';
import type { Product } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: "Hello! I'm your Velora AI assistant. Ask me about products, categories, or recommendations." },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    storefrontApi.getProducts().then(setProducts).catch(() => {});
  }, []);

  useEffect(() => {
    const openAssistant = (event: Event) => {
      const detail = (event as CustomEvent<{ prompt?: string }>).detail;
      setIsOpen(true);
      if (detail?.prompt) {
        setInput(detail.prompt);
      }
    };

    window.addEventListener('velora:open-assistant', openAssistant as EventListener);

    return () => {
      window.removeEventListener('velora:open-assistant', openAssistant as EventListener);
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fallbackReply = (question: string) => {
    const lower = question.toLowerCase();
    const byCategory = products.filter((product) => product.category.toLowerCase().includes(lower)).slice(0, 3);
    const matches = products.filter((product) =>
      [product.name, product.description, product.brand, product.category].some((value) => value.toLowerCase().includes(lower))
    );
    const recent = getRecentProducts(products).slice(0, 3);

    if (byCategory.length > 0) {
      return `Top picks in that category: ${byCategory.map((product) => product.name).join(', ')}.`;
    }

    if (matches.length > 0) {
      return `I found these matching products: ${matches.slice(0, 3).map((product) => product.name).join(', ')}.`;
    }

    if (recent.length > 0) {
      return `Based on what you explored recently, try: ${recent.map((product) => product.name).join(', ')}.`;
    }

    return 'I can help with product names, categories, pricing, and recommendations. Try asking about mobiles, gaming, or accessories.';
  };

  const sendMessage = async () => {
    if (!input.trim()) {
      return;
    }

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      const recentProducts = getRecentProducts(products).slice(0, 4);
      const productList = products
        .slice(0, 12)
        .map((product) => `${product.name} (${product.category}) - ${product.price} EGP: ${product.description}`)
        .join('\n');

      let reply = fallbackReply(userMessage);

      if (process.env.GEMINI_API_KEY) {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `You are helping a shopper in the Velora tech store.\nProducts:\n${productList}\nRecent user activity:\n${recentProducts.map((product) => product.name).join(', ')}\n\nUser question: ${userMessage}\nReply briefly and helpfully.`,
        });
        reply = response.text || reply;
      }

      setMessages((prev) => [...prev, { role: 'bot', text: reply }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'bot', text: fallbackReply(userMessage) }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-black shadow-lg shadow-emerald-500/30 transition-transform hover:scale-105"
      >
        <MessageSquare className="h-6 w-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 right-6 z-50 flex h-[32rem] w-[22rem] flex-col overflow-hidden rounded-3xl border border-white/10 bg-black/90 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-500/10 p-2 text-emerald-500">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Velora Assistant</h3>
                  <p className="text-[10px] uppercase tracking-widest text-white/40">Store-aware support</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/40 transition-colors hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              <div className="flex flex-wrap gap-2">
                {getRecentProducts(products).slice(0, 3).map((product) => (
                  <button
                    key={product.id}
                    onClick={() => setInput(`Compare ${product.name} with another similar product.`)}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/60 transition-all hover:text-white"
                  >
                    {product.name}
                  </button>
                ))}
              </div>
              {messages.map((message, index) => (
                <div key={index} className={cn('flex gap-3', message.role === 'user' ? 'justify-end' : 'justify-start')}>
                  {message.role === 'bot' && (
                    <div className="rounded-full bg-white/5 p-2 text-emerald-500">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  <div className={cn('max-w-[80%] rounded-2xl px-4 py-3 text-sm', message.role === 'user' ? 'bg-emerald-500 text-black' : 'bg-white/5 text-white')}>
                    {message.text}
                  </div>
                  {message.role === 'user' && (
                    <div className="rounded-full bg-white/5 p-2 text-white">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-white/5 p-2 text-emerald-500">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="rounded-2xl bg-white/5 px-4 py-3 text-white">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-white/10 p-4">
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      void sendMessage();
                    }
                  }}
                  placeholder="Ask about products..."
                  className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
                />
                <button onClick={() => void sendMessage()} disabled={isLoading} className="rounded-full bg-emerald-500 p-2 text-black transition-colors hover:bg-emerald-400 disabled:opacity-50">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
