import { useState, useEffect, useRef } from 'react';
import aiService from '../../services/aiService';
import { useAuth } from '../../hooks/useAuth';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const FinancialAssistant = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Bonjour ${user?.firstName ?? ''} ! Je suis votre assistant financier IA. Comment puis-je vous aider ?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sessionId] = useState(() => `session_${Date.now()}`);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await aiService.chat({ session_id: sessionId, message: userMessage.content });
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.reply || 'Désolé, je n\'ai pas pu traiter votre demande.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Le service chatbot est indisponible pour le moment. Veuillez réessayer plus tard.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold">Assistant Financier IA</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-300">Posez vos questions sur vos finances</p>
        </div>

        <div className="flex h-[70vh] flex-col rounded-4xl border border-slate-200 bg-white/80 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-cyan-500/20 text-cyan-700 border border-cyan-400/30 dark:text-cyan-50'
                      : 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800/50 dark:text-slate-200 dark:border-white/10'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-slate-100 px-4 py-3 border border-slate-200 dark:bg-slate-800/50 dark:border-white/10">
                  <div className="flex space-x-2">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-cyan-400" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-cyan-400" style={{ animationDelay: '0.2s' }} />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-cyan-400" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="border-t border-slate-200 p-4 dark:border-white/10">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Écrivez votre message..."
                className="flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-cyan-500 focus:outline-none dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-cyan-400"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(e);
                  }
                }}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="rounded-2xl bg-cyan-500 px-6 py-3 font-semibold text-white transition hover:bg-cyan-400 disabled:opacity-50"
              >
                Envoyer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FinancialAssistant;
