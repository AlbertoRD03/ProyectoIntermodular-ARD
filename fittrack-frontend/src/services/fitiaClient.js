/**
 * FitIA client (UI-layer).
 * Replace this file's implementation to call your backend / OpenAI proxy.
 */

export async function sendFitIaMessage({ lang, messages, signal }) {
  // Placeholder implementation: simulate latency and return a deterministic reply.
  // `messages` is shaped like: [{ role: 'user'|'assistant', content: string }]
  const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.content?.trim() || '';

  await sleep(550, signal);

  if (!lastUser) return lang === 'es' ? '¿En qué te ayudo?' : 'How can I help?';

  if (lang === 'es') {
    return (
      'Perfecto. Aún no estoy conectado a la IA real, pero ya tienes la pantalla lista.\n\n' +
      'Cuando conectes el backend, aquí devolveremos la respuesta del modelo. Mientras tanto, dime tu objetivo (pérdida de grasa, fuerza, masa muscular) y tu nivel.'
    );
  }

  return (
    "Got it. I'm not connected to the real AI yet, but the chat UI is ready.\n\n" +
    'Once you wire the backend, this will return the model response. Meanwhile, tell me your goal (fat loss, strength, muscle gain) and your level.'
  );
}

function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    const id = setTimeout(resolve, ms);
    if (!signal) return;
    if (signal.aborted) {
      clearTimeout(id);
      reject(Object.assign(new Error('Aborted'), { name: 'AbortError' }));
      return;
    }
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(id);
        reject(Object.assign(new Error('Aborted'), { name: 'AbortError' }));
      },
      { once: true }
    );
  });
}

