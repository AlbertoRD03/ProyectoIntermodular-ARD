import React from 'react';
import { ArrowLeft, Loader2, UserPlus, UserCheck } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import { useI18n, tr } from '../i18n/I18nProvider';
import { followUser, getPublicProfile, unfollowUser } from '../services/socialApi';
import { getUserPosts } from '../services/fitgramApi';

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

function Stat({ label, value }) {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="text-[14px] font-bold text-white/90">{value}</div>
      <div className="text-[9px] uppercase tracking-widest text-white/40 mt-0.5">{label}</div>
    </div>
  );
}

function GridImage({ src, alt, onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="aspect-square rounded-lg overflow-hidden border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition"
      title={alt}
    >
      <img src={src} alt={alt} className="h-full w-full object-cover" loading="lazy" />
    </button>
  );
}

export default function UserPublicProfile() {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const { id } = useParams();

  const [profile, setProfile] = React.useState(null);
  const [posts, setPosts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [working, setWorking] = React.useState(false);
  const [selected, setSelected] = React.useState(null);

  const user = profile?.user;
  const stats = profile?.stats || { followers: 0, following: 0, posts: 0 };
  const isFollowing = Boolean(profile?.viewer?.isFollowing);

  React.useEffect(() => {
    const ac = new AbortController();
    const run = async () => {
      try {
        setLoading(true);
        setError('');
        const [p, pp] = await Promise.all([
          getPublicProfile(id, { signal: ac.signal }),
          getUserPosts(id, { limit: 60, signal: ac.signal }),
        ]);
        setProfile(p);
        setPosts(pp?.posts || []);
      } catch (e) {
        if (e?.name === 'AbortError') return;
        setError(tr(lang, 'No se pudo cargar el perfil.', 'Could not load profile.'));
      } finally {
        setLoading(false);
      }
    };
    run();
    return () => ac.abort();
  }, [id, lang]);

  const handleToggleFollow = async () => {
    if (!user?.id || working) return;
    setWorking(true);
    try {
      if (isFollowing) {
        await unfollowUser(user.id);
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                viewer: { isFollowing: false },
                stats: { ...prev.stats, followers: Math.max(0, (prev.stats?.followers || 0) - 1) },
              }
            : prev
        );
      } else {
        await followUser(user.id);
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                viewer: { isFollowing: true },
                stats: { ...prev.stats, followers: (prev.stats?.followers || 0) + 1 },
              }
            : prev
        );
      }
    } catch {
      // keep silent and allow retry
    } finally {
      setWorking(false);
    }
  };

  const displayName = user?.apodo ? `@${user.apodo}` : user?.nombre || '';
  const subtitle = user?.apodo ? user?.nombre || '' : '';
  const avatarLabel = (displayName?.replace('@', '')?.[0] || 'U').toUpperCase();

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-[#f5f5f5]">
      <Header />

      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6 lg:py-7 xl:py-8">
        <div className="max-w-5xl mx-auto space-y-4 sm:space-y-5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="h-10 w-10 rounded-lg border border-white/15 bg-white/[0.03] hover:bg-white/[0.08] transition flex items-center justify-center"
              aria-label={tr(lang, 'Volver', 'Back')}
              title={tr(lang, 'Volver', 'Back')}
            >
              <ArrowLeft className="h-4 w-4 text-white/70" />
            </button>
            <h1 className="text-[18px] sm:text-[22px] md:text-[26px] font-bold tracking-wide text-white/95 uppercase">
              {tr(lang, 'Perfil', 'Profile')}
            </h1>
            <div className="flex-1" />
          </div>

          {loading ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-10 text-center text-white/60">
              <Loader2 className="h-5 w-5 inline-block animate-spin text-white/50" />{' '}
              {tr(lang, 'Cargando...', 'Loading...')}
            </div>
          ) : error ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-10 text-center text-white/70">
              {error}
            </div>
          ) : (
            <>
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-7">
                  <div className="flex items-center gap-4">
                    {user?.photo_url ? (
                      <img
                        src={user.photo_url}
                        alt={displayName}
                        className="h-20 w-20 rounded-2xl border border-white/15 object-cover"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-2xl border border-white/15 bg-white/[0.02] flex items-center justify-center text-[20px] font-bold text-white/80">
                        {avatarLabel}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-[16px] sm:text-[18px] font-bold text-white/95 truncate">{displayName}</div>
                      {subtitle ? <div className="text-[12px] text-white/55 truncate">{subtitle}</div> : null}
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-3 gap-3 sm:gap-6">
                    <Stat label={tr(lang, 'Publicaciones', 'Posts')} value={stats.posts ?? 0} />
                    <Stat label={tr(lang, 'Seguidores', 'Followers')} value={stats.followers ?? 0} />
                    <Stat label={tr(lang, 'Seguidos', 'Following')} value={stats.following ?? 0} />
                  </div>

                  <div className="sm:ml-auto">
                    <button
                      type="button"
                      onClick={handleToggleFollow}
                      disabled={working}
                      className={cx(
                        'inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-[12px] font-semibold transition border',
                        isFollowing
                          ? 'border-white/20 bg-white/[0.02] text-white/80 hover:bg-white/[0.06]'
                          : 'border-[#ff7849]/70 bg-[#ff7849]/10 text-[#ff7849] hover:bg-[#ff7849]/20'
                      )}
                      aria-label={isFollowing ? tr(lang, 'Dejar de seguir', 'Unfollow') : tr(lang, 'Seguir', 'Follow')}
                      title={isFollowing ? tr(lang, 'Dejar de seguir', 'Unfollow') : tr(lang, 'Seguir', 'Follow')}
                    >
                      {isFollowing ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                      {working ? tr(lang, '...', '...') : isFollowing ? tr(lang, 'Siguiendo', 'Following') : tr(lang, 'Seguir', 'Follow')}
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
                <div className="text-[11px] uppercase tracking-widest text-white/45">
                  {tr(lang, 'Publicaciones', 'Posts')}
                </div>

                {posts?.length ? (
                  <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3">
                    {posts.map((p) => (
                      <GridImage
                        key={p.id}
                        src={p.image_url}
                        alt={p.caption || displayName}
                        onOpen={() => setSelected(p)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center text-white/55">
                    {tr(lang, 'Este usuario aún no ha publicado.', "This user hasn't posted yet.")}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {selected ? (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div
            className="max-w-3xl w-full rounded-2xl border border-white/15 bg-[#1e1e1e] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="text-[12px] font-semibold text-white/80 truncate">{displayName}</div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg border border-white/15 bg-white/[0.03] hover:bg-white/[0.08] transition px-3 py-1.5 text-[12px] text-white/80"
              >
                {tr(lang, 'Cerrar', 'Close')}
              </button>
            </div>
            <div className="bg-black/30">
              <img src={selected.image_url} alt={selected.caption || displayName} className="w-full max-h-[70vh] object-contain" />
            </div>
            {selected.caption ? (
              <div className="p-4 text-[13px] text-white/80">
                <span className="font-semibold text-white/90">{displayName}</span>{' '}
                <span className="text-white/75">{selected.caption}</span>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
