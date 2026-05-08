import React, { useEffect, useMemo, useRef, useState } from 'react';
import Header from '../components/Header';
import { useI18n, tr } from '../i18n/I18nProvider';
import { sendFitIaMessage } from '../services/fitiaClient';

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

function formatTime(date) {
  try {
    return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(date);
  } catch {
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }
}

function Bubble({ role, text, timestamp }) {
  const isUser = role === 'user';

  return (
    <div className={cx('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cx(
          'max-w-[92%] sm:max-w-[78%] rounded-2xl border px-4 sm:px-5 py-3',
          isUser ? 'bg-white text-black border-white/80' : 'bg-white/[0.03] text-white/90 border-white/15'
        )}
      >
        <div className={cx('text-[13px] sm:text-[14px] leading-relaxed whitespace-pre-wrap', isUser ? 'text-black' : 'text-white/90')}>
          {text}
        </div>
        <div className={cx('mt-2 text-[10px] tracking-wide', isUser ? 'text-black/50' : 'text-white/35')}>
          {timestamp}
        </div>
      </div>
    </div>
  );
}

export default function FitIA() {
  const { lang, t } = useI18n();
  const [messages, setMessages] = useState(() => [
    {
      id: 'welcome',
      role: 'assistant',
      content: tr(
        lang,
        'Hola, soy FitIA. Puedo ayudarte con rutinas, nutrición y dudas sobre tus entrenamientos. ¿En qué te ayudo?',
        "Hi, I'm FitIA. I can help with training routines, nutrition, and workout questions. How can I help?"
      ),
      createdAt: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const listRef = useRef(null);
  const abortRef = useRef(null);

  const canSend = input.trim().length > 0 && !isSending;

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, isSending]);

  useEffect(() => {
    // Keep welcome message translated if user toggles language.
    setMessages((prev) => {
      const hasWelcome = prev.some((m) => m.id === 'welcome');
      if (!hasWelcome) return prev;
      return prev.map((m) => {
        if (m.id !== 'welcome') return m;
        return {
          ...m,
          content: tr(
            lang,
            'Hola, soy FitIA. Puedo ayudarte con rutinas, nutrición y dudas sobre tus entrenamientos. ¿En qué te ayudo?',
            "Hi, I'm FitIA. I can help with training routines, nutrition, and workout questions. How can I help?"
          ),
        };
      });
    });
  }, [lang]);

  const viewModels = useMemo(() => {
    return messages.map((m) => ({
      id: m.id,
      role: m.role,
      text: m.content,
      timestamp: formatTime(m.createdAt || new Date()),
    }));
  }, [messages]);

  const handleClear = () => {
    abortRef.current?.abort?.();
    abortRef.current = null;
    setIsSending(false);
    setInput('');
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: tr(
          lang,
          'Hola, soy FitIA. Puedo ayudarte con rutinas, nutrición y dudas sobre tus entrenamientos. ¿En qué te ayudo?',
          "Hi, I'm FitIA. I can help with training routines, nutrition, and workout questions. How can I help?"
        ),
        createdAt: new Date(),
      },
    ]);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isSending) return;

    const userMsg = {
      id: `${Date.now()}-u`,
      role: 'user',
      content: text,
      createdAt: new Date(),
    };

    setInput('');
    setIsSending(true);
    setMessages((prev) => [...prev, userMsg]);

    const controller = new AbortController();
    abortRef.current?.abort?.();
    abortRef.current = controller;

    try {
      const reply = await sendFitIaMessage({
        lang,
        messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
        signal: controller.signal,
      });

      const assistantMsg = {
        id: `${Date.now()}-a`,
        role: 'assistant',
        content: reply,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      if (err?.name === 'AbortError') return;
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-e`,
          role: 'assistant',
          content: tr(lang, 'Ha ocurrido un error al enviar el mensaje. Inténtalo de nuevo.', 'Something went wrong. Please try again.'),
          createdAt: new Date(),
        },
      ]);
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-[#f5f5f5]">
      <Header />

      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-10 sm:py-12">
        <div className="mx-auto w-full max-w-[1100px]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] shadow-[0_22px_70px_-55px_rgba(0,0,0,0.95)]">
            <div className="px-5 sm:px-7 py-6 border-b border-white/10">
              <div
                className="text-[18px] sm:text-[20px] font-bold tracking-wide text-white/95"
                style={{ fontFamily: 'Arimo, Poppins, system-ui' }}
              >
                {t('fitia_title')}
              </div>
              <div className="mt-2 text-[12px] sm:text-[13px] text-white/45">{t('fitia_subtitle')}</div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px]">
              <div className="min-h-[420px] sm:min-h-[520px] lg:min-h-[620px] border-b lg:border-b-0 lg:border-r border-white/10">
                <div ref={listRef} className="h-full max-h-[520px] lg:max-h-[620px] overflow-y-auto px-5 sm:px-7 py-6 space-y-4">
                  {viewModels.length === 0 ? (
                    <div className="grid place-items-center h-full text-center">
                      <div className="max-w-[520px]">
                        <div className="text-[14px] text-white/55">{t('fitia_empty_hint')}</div>
                      </div>
                    </div>
                  ) : (
                    viewModels.map((m) => <Bubble key={m.id} role={m.role} text={m.text} timestamp={m.timestamp} />)
                  )}

                  {isSending && (
                    <div className="flex justify-start">
                      <div className="rounded-2xl border border-white/15 bg-white/[0.03] px-4 sm:px-5 py-3 text-white/70">
                        <div className="text-[13px] sm:text-[14px]">{t('fitia_typing')}</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="px-5 sm:px-7 py-5 border-t border-white/10">
                  <div className="flex items-end gap-3">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      rows={2}
                      placeholder={t('fitia_placeholder')}
                      className="flex-1 min-h-[46px] max-h-[140px] resize-none rounded-xl border border-white/20 bg-transparent px-4 py-3 text-[13px] sm:text-[14px] text-white/90 placeholder:text-white/25 outline-none focus:border-white/40"
                    />
                    <button
                      type="button"
                      onClick={handleSend}
                      disabled={!canSend}
                      className={cx(
                        'h-[46px] min-w-[110px] rounded-xl border px-4 text-[12px] font-bold tracking-wide transition',
                        canSend ? 'bg-white text-black border-white hover:bg-white/90' : 'bg-white/10 text-white/35 border-white/10 cursor-not-allowed'
                      )}
                    >
                      {t('fitia_send').toUpperCase()}
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="text-[10px] text-white/35">{t('fitia_disclaimer')}</div>
                    <button
                      type="button"
                      onClick={handleClear}
                      className="text-[11px] font-semibold tracking-wide text-white/55 hover:text-white/80 transition"
                    >
                      {t('fitia_clear').toUpperCase()}
                    </button>
                  </div>
                </div>
              </div>

              <aside className="px-5 sm:px-7 py-6">
                <div className="text-[11px] uppercase tracking-[0.25em] text-white/45">{t('fitia_suggestions')}</div>
                <div className="mt-4 space-y-3">
                  {[
                    tr(lang, 'Hazme una rutina full body 3 días/semana', 'Build me a 3-day full body routine'),
                    tr(lang, '¿Qué puedo comer post-entreno para ganar músculo?', 'What should I eat post-workout to build muscle?'),
                    tr(lang, 'Ayúdame a organizar mi semana de entrenamiento', 'Help me plan my training week'),
                  ].map((text) => (
                    <button
                      key={text}
                      type="button"
                      onClick={() => setInput(text)}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-left text-[12px] text-white/80 hover:bg-white/[0.04] hover:border-white/20 transition"
                    >
                      {text}
                    </button>
                  ))}
                </div>

                <div className="mt-8 rounded-xl border border-white/10 bg-black/10 px-4 py-4">
                  <div className="text-[12px] font-semibold text-white/85">{t('fitia_integration_title')}</div>
                  <div className="mt-2 text-[11px] text-white/45">{t('fitia_integration_body')}</div>
                  <div className="mt-3 text-[11px] text-white/55">
                    <span className="font-semibold text-white/75">API:</span> `sendFitIaMessage(...)`
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

