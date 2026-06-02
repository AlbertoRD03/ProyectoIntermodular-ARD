import React from 'react';
import { Search, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useI18n, tr } from '../i18n/I18nProvider';
import { searchUsers } from '../services/socialApi';

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

function UserRow({ user, onOpen }) {
  const handle = user?.apodo?.trim() || user?.nombre?.trim() || 'user';
  const avatarLabel = (handle[0] || 'U').toUpperCase();

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full text-left rounded-xl border border-white/15 bg-white/[0.03] hover:bg-white/[0.06] transition px-4 py-3 flex items-center gap-3"
    >
      {user?.photo_url ? (
        <img
          src={user.photo_url}
          alt={handle}
          className="h-10 w-10 rounded-lg border border-white/15 object-cover"
        />
      ) : (
        <div className="h-10 w-10 rounded-lg border border-white/15 bg-white/[0.02] flex items-center justify-center text-[13px] font-bold text-white/80">
          {avatarLabel}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="text-[13px] font-bold text-white/90 truncate">
            {user?.apodo ? `@${user.apodo}` : user?.nombre}
          </div>
        </div>
        <div className="text-[11px] text-white/45 truncate">{user?.nombre || ''}</div>
      </div>
    </button>
  );
}

export default function Community() {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const [query, setQuery] = React.useState('');
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const ac = new AbortController();
    const run = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await searchUsers({ q: query, limit: 30 }, { signal: ac.signal });
        setUsers(data?.users || []);
      } catch (e) {
        if (e?.name === 'AbortError') return;
        setError(tr(lang, 'No se pudieron cargar los usuarios.', 'Could not load users.'));
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    const t = window.setTimeout(run, 250);
    return () => {
      ac.abort();
      window.clearTimeout(t);
    };
  }, [query, lang]);

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-[#f5f5f5]">
      <Header />

      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6 lg:py-7 xl:py-8">
        <div className="max-w-5xl mx-auto space-y-4 sm:space-y-5">
          <div className="flex items-center gap-3">
            <h1 className="text-[18px] sm:text-[22px] md:text-[26px] font-bold tracking-wide text-white/95 uppercase">
              {tr(lang, 'Comunidad', 'Community')}
            </h1>
            <div className="flex-1" />
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
            <div className="relative">
              <Search className="h-4 w-4 text-white/35 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={tr(lang, 'Busca usuarios por nombre o @apodo', 'Search users by name or @handle')}
                className="w-full rounded-lg border border-white/15 bg-white/[0.03] pl-11 pr-4 py-3 text-[12px] sm:text-[13px] text-white/85 placeholder:text-white/30 outline-none focus:border-white/30 focus:bg-white/[0.06]"
              />
            </div>
            <div className="mt-2 text-[11px] text-white/40">
              {tr(lang, 'Tip: sigue a usuarios para ver sus publicaciones en tu feed.', 'Tip: follow users to see their posts in your feed.')}
            </div>
          </div>

          {error ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-[12px] text-white/70">
              {error}
            </div>
          ) : null}

          <div className={cx('grid grid-cols-1 sm:grid-cols-2 gap-3', loading ? 'opacity-80' : '')}>
            {loading ? (
              <div className="col-span-full rounded-xl border border-white/10 bg-white/[0.04] p-8 text-center text-white/55">
                <Users className="h-5 w-5 inline-block text-white/45" />{' '}
                {tr(lang, 'Cargando...', 'Loading...')}
              </div>
            ) : users.length ? (
              users.map((u) => (
                <UserRow key={u.id} user={u} onOpen={() => navigate(`/usuarios/${u.id}`)} />
              ))
            ) : (
              <div className="col-span-full rounded-xl border border-white/10 bg-white/[0.04] p-8 text-center text-white/55">
                {tr(lang, 'No hay resultados.', 'No results.')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

