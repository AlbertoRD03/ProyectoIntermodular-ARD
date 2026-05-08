import React from 'react';
import { useI18n } from '../i18n/I18nProvider';

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function LanguageSelect({ className }) {
  const { lang, setLang } = useI18n();

  return (
    <select
      value={lang}
      onChange={(e) => setLang(e.target.value === 'en' ? 'en' : 'es')}
      aria-label="Language"
      className={cx(
        'h-10 rounded-lg border border-white/15 bg-transparent px-3 pr-8 text-[13px] font-medium text-white/80 outline-none transition focus:border-white/30 focus:bg-white/[0.04]',
        className
      )}
    >
      <option value="es" className="bg-[#1e1e1e]">
        Español
      </option>
      <option value="en" className="bg-[#1e1e1e]">
        English
      </option>
    </select>
  );
}

