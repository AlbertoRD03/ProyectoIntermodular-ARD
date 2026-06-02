import React, { useMemo, useState } from 'react';
import {
  Bookmark,
  Check,
  ClipboardCopy,
  Heart,
  Image as ImageIcon,
  MessageCircle,
  Plus,
  Search,
  SendHorizontal,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useI18n, tr } from '../i18n/I18nProvider';
import { getFeed } from '../services/fitgramApi';
import { searchUsers as apiSearchUsers } from '../services/socialApi';

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

function Card({ children, className }) {
  return (
    <section
      className={cx(
        'rounded-lg sm:rounded-lg md:rounded-xl border border-white/10 bg-white/[0.06] shadow-[0_10px_40px_-30px_rgba(0,0,0,0.8)] overflow-hidden',
        className
      )}
    >
      {children}
    </section>
  );
}

function Tag({ children }) {
  return (
    <span className="inline-flex items-center rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/65">
      {children}
    </span>
  );
}

function Stat({ label, value }) {
  return (
    <div className="flex flex-col items-center justify-center py-3">
      <div className="text-[14px] font-bold text-white/90">{value}</div>
      <div className="text-[9px] uppercase tracking-widest text-white/40 mt-0.5">{label}</div>
    </div>
  );
}

function IconMetric({ icon: Icon, value, active, onClick, ariaLabel }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'flex w-full items-center justify-center gap-2 py-3 transition border-r border-white/10 last:border-r-0',
        active ? 'text-[#ff7849]' : 'text-white/70 hover:text-white/90'
      )}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      <Icon className={cx('h-4 w-4', active ? 'text-[#ff7849]' : 'text-white/55')} />
      <span className="text-[12px] font-semibold">{value}</span>
    </button>
  );
}

function Avatar({ label, src, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-8 w-8 rounded-md border border-white/15 bg-white/[0.03] flex items-center justify-center overflow-hidden"
      aria-label={label}
      title={label}
    >
      {src ? (
        <img src={src} alt={label} className="h-full w-full object-cover" />
      ) : (
        <span className="text-[12px] font-bold text-white/80">{label}</span>
      )}
    </button>
  );
}

function PostImage({ src }) {
  const { lang } = useI18n();
  if (!src) {
    return (
      <div className="h-[170px] sm:h-[190px] md:h-[210px] w-full bg-black/10 border-y border-white/10 flex items-center justify-center">
        <div className="h-24 w-24 border border-white/15 bg-white/[0.02] flex items-center justify-center text-white/35 text-[11px] uppercase tracking-widest">
          {tr(lang, 'IMG', 'IMG')}
        </div>
      </div>
    );
  }
  return (
    <div className="w-full bg-black/10 border-y border-white/10">
      <img src={src} alt="" className="w-full h-[260px] sm:h-[300px] object-cover" loading="lazy" />
    </div>
  );
}

function CommentComposer({ value, onChange, onSend }) {
  const { lang } = useI18n();
  return (
    <div className="px-4 py-3 border-t border-white/10 bg-white/[0.02]">
      <div className="flex items-center gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={tr(lang, 'Escribe un comentario...', 'Write a comment...')}
          className="flex-1 rounded-lg border border-white/15 bg-white/[0.03] px-3 py-2 text-[12px] text-white/85 placeholder:text-white/30 outline-none focus:border-white/30 focus:bg-white/[0.06]"
        />
        <button
          type="button"
          onClick={onSend}
          className="h-9 w-9 rounded-lg border border-white/15 bg-white/[0.03] hover:bg-white/[0.08] transition flex items-center justify-center"
          aria-label={tr(lang, 'Enviar comentario', 'Send comment')}
          title={tr(lang, 'Enviar', 'Send')}
        >
          <SendHorizontal className="h-4 w-4 text-white/70" />
        </button>
      </div>
    </div>
  );
}

function FitGramPost({ post, state, onToggleLike, onToggleSave, onToggleComments, onAddComment, onCopyWorkout, onOpenProfile }) {
  const { lang } = useI18n();
  const isWorkout = post.type === 'workout';

  return (
    <Card>
      <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-white/10">
        <div className="flex items-start gap-3">
          <Avatar label={post.avatarLabel} src={post.authorPhotoUrl} onClick={onOpenProfile} />
          <div>
            <button
              type="button"
              onClick={onOpenProfile}
              className="text-[12px] font-bold text-white/90 hover:text-white transition"
              title={`@${post.username}`}
            >
              @{post.username}
            </button>
            <div className="text-[10px] uppercase tracking-widest text-white/35">{post.timeAgo}</div>
          </div>
        </div>
      </div>

      <PostImage src={post.image_url} />

      <div className="px-4 py-3 border-b border-white/10">
        <div className="text-[12px] text-white/80">
          <span className="font-bold text-white/85">@{post.username}</span>{' '}
          <span className="text-white/75">{post.caption}</span>
        </div>

        {post.tags?.length ? (
          <div className="flex flex-wrap gap-2 mt-3">
            {post.tags.map((tag) => (
              <Tag key={tag}>#{tag}</Tag>
            ))}
          </div>
        ) : null}
      </div>

      {isWorkout ? (
        <div className="grid grid-cols-3 divide-x divide-white/10 border-b border-white/10">
          <Stat label={tr(lang, 'Ejer', 'Ex')} value={post.stats.exercises} />
          <Stat label={tr(lang, 'Dur', 'Dur')} value={post.stats.duration} />
          <Stat label={tr(lang, 'Cal', 'Cal')} value={post.stats.calories} />
        </div>
      ) : null}

      {isWorkout ? (
        <div className="px-4 py-3 border-b border-white/10 bg-white/[0.02] flex items-center justify-between gap-3">
          <div className="text-[10px] uppercase tracking-widest text-white/45">
            {tr(lang, 'Entreno del día', "Today's workout")}
          </div>
          <button
            type="button"
            onClick={() => onCopyWorkout(post)}
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.03] px-3 py-2 text-[11px] font-semibold text-white/75 hover:bg-white/[0.08] hover:text-white/90 transition"
            aria-label={tr(lang, 'Copiar entreno', 'Copy workout')}
            title={tr(lang, 'Copiar entreno', 'Copy workout')}
          >
            {state.copied ? <Check className="h-4 w-4 text-[#ff7849]" /> : <ClipboardCopy className="h-4 w-4" />}
            {state.copied ? tr(lang, 'Copiado', 'Copied') : tr(lang, 'Copiar entreno', 'Copy workout')}
          </button>
        </div>
      ) : null}

      <div className="grid grid-cols-3">
        <IconMetric
          icon={Heart}
          value={state.likes}
          active={state.liked}
          onClick={() => onToggleLike(post.id)}
          ariaLabel={state.liked ? tr(lang, 'Quitar me gusta', 'Unlike') : tr(lang, 'Dar me gusta', 'Like')}
        />
        <IconMetric
          icon={MessageCircle}
          value={state.comments}
          active={state.showComments}
          onClick={() => onToggleComments(post.id)}
          ariaLabel={tr(lang, 'Comentar', 'Comment')}
        />
        <button
          type="button"
          onClick={() => onToggleSave(post.id)}
          className={cx(
            'flex w-full items-center justify-center gap-2 py-3 transition',
            state.saved ? 'text-[#ff7849]' : 'text-white/70 hover:text-white/90'
          )}
          aria-label={state.saved ? tr(lang, 'Quitar guardado', 'Unsave') : tr(lang, 'Guardar', 'Save')}
          title={state.saved ? tr(lang, 'Quitar guardado', 'Unsave') : tr(lang, 'Guardar', 'Save')}
        >
          <Bookmark className={cx('h-4 w-4', state.saved ? 'text-[#ff7849]' : 'text-white/55')} />
          <span className="text-[12px] font-semibold">
            {state.saved ? tr(lang, 'Guardado', 'Saved') : tr(lang, 'Guardar', 'Save')}
          </span>
        </button>
      </div>

      {state.showComments ? (
        <CommentComposer
          value={state.commentDraft}
          onChange={(v) => onAddComment(post.id, { type: 'draft', value: v })}
          onSend={() => onAddComment(post.id, { type: 'send' })}
        />
      ) : null}
    </Card>
  );
}

function EmptyStateCard({ children, className }) {
  return (
    <div
      className={cx(
        'rounded-xl border border-white/15 bg-white/[0.03] shadow-[0_10px_40px_-30px_rgba(0,0,0,0.8)]',
        className
      )}
    >
      {children}
    </div>
  );
}

function PopularUserCard({ user, onFollow }) {
  const { lang } = useI18n();
  return (
    <div className="rounded-xl border border-white/15 bg-white/[0.02] p-5 sm:p-6 text-center">
      <div className="mx-auto h-14 w-14 rounded-xl border border-white/15 bg-white/[0.03] flex items-center justify-center overflow-hidden">
        {user.photo_url ? (
          <img src={user.photo_url} alt={user.username} className="h-full w-full object-cover" />
        ) : (
          <span className="text-[18px] font-bold text-white/80">{user.avatarLabel}</span>
        )}
      </div>
      <div className="mt-3 text-[12px] font-bold text-white/90">@{user.username}</div>
      <div className="text-[10px] uppercase tracking-widest text-white/40 mt-1">{user.followers}</div>
      <button
        type="button"
        onClick={onFollow}
        className="mt-4 w-full rounded-lg border border-white/20 bg-white/[0.02] px-4 py-2.5 text-[11px] font-semibold text-white/75 hover:text-white/90 hover:border-white/35 hover:bg-white/[0.05] transition"
      >
        + {tr(lang, 'VER PERFIL', 'VIEW PROFILE')}
      </button>
    </div>
  );
}

export default function FitGramReal({ forceEmpty = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { lang } = useI18n();
  const [query, setQuery] = useState('');

  const [posts, setPosts] = useState([]);
  const [postState, setPostState] = useState({});
  const [feedLoading, setFeedLoading] = useState(true);
  const [feedError, setFeedError] = useState('');

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [popularUsers, setPopularUsers] = useState([]);

  const formatTimeAgo = (value) => {
    const ts = new Date(value || Date.now()).getTime();
    if (!Number.isFinite(ts)) return '';
    const diff = Math.max(0, Date.now() - ts);
    const m = Math.floor(diff / 60000);
    if (m < 60) return tr(lang, `HACE ${m}M`, `${m}M AGO`);
    const h = Math.floor(m / 60);
    if (h < 24) return tr(lang, `HACE ${h}H`, `${h}H AGO`);
    const d = Math.floor(h / 24);
    return tr(lang, `HACE ${d}D`, `${d}D AGO`);
  };

  React.useEffect(() => {
    const shouldForceEmpty = forceEmpty || location.state?.empty === true;
    if (shouldForceEmpty) {
      setPosts([]);
      setPostState({});
      setFeedLoading(false);
      setFeedError('');
      return;
    }

    let mounted = true;
    (async () => {
      try {
        setFeedLoading(true);
        setFeedError('');
        const data = await getFeed({ limit: 60 });
        const raw = data?.posts || [];
        const mapped = raw.map((p) => {
          const base = (p?.author?.apodo || p?.author?.nombre || 'user').toString().trim();
          const username = base.toUpperCase();
          return {
            id: p.id,
            type: 'photo',
            image_url: p.image_url,
            avatarLabel: (base[0] || 'U').toUpperCase(),
            authorPhotoUrl: p?.author?.photo_url || '',
            username,
            userId: p?.author?.id || p.authorId,
            timeAgo: formatTimeAgo(p.createdAt),
            caption: p.caption || '',
            tags: p.tags || [],
            metrics: { likes: 0, comments: 0 },
          };
        });

        if (!mounted) return;
        setPosts(mapped);
        setPostState(() => {
          const initial = {};
          mapped.forEach((post) => {
            initial[post.id] = {
              liked: false,
              saved: false,
              copied: false,
              showComments: false,
              commentDraft: '',
              likes: 0,
              comments: 0,
            };
          });
          return initial;
        });
      } catch {
        if (!mounted) return;
        setFeedError(tr(lang, 'No se pudo cargar el feed.', 'Could not load feed.'));
        setPosts([]);
        setPostState({});
      } finally {
        if (mounted) setFeedLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [forceEmpty, location.state, lang]);

  React.useEffect(() => {
    const created = location.state?.createdPost;
    if (!created) return;
    if (forceEmpty) return;
    setPosts((prev) => (prev.some((p) => p.id === created.id) ? prev : [created, ...prev]));
    setPostState((prev) =>
      prev[created.id]
        ? prev
        : {
            ...prev,
            [created.id]: {
              liked: false,
              saved: false,
              copied: false,
              showComments: false,
              commentDraft: '',
              likes: 0,
              comments: 0,
            },
          }
    );
  }, [location.state, forceEmpty]);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await apiSearchUsers({ q: '', limit: 6 });
        if (!mounted) return;
        setPopularUsers(data?.users || []);
      } catch {
        if (!mounted) return;
        setPopularUsers([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    const q = query.trim();
    if (!q) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }

    let mounted = true;
    const t = window.setTimeout(async () => {
      try {
        const data = await apiSearchUsers({ q, limit: 8 });
        if (!mounted) return;
        setSearchResults(data?.users || []);
        setSearchOpen(true);
      } catch {
        if (!mounted) return;
        setSearchResults([]);
        setSearchOpen(true);
      }
    }, 250);

    return () => {
      mounted = false;
      window.clearTimeout(t);
    };
  }, [query]);

  const updatePostState = (postId, updater) => {
    setPostState((prev) => ({ ...prev, [postId]: updater(prev[postId]) }));
  };

  const handleToggleLike = (postId) => {
    updatePostState(postId, (prev) => {
      const nextLiked = !prev.liked;
      return { ...prev, liked: nextLiked, likes: Math.max(0, prev.likes + (nextLiked ? 1 : -1)) };
    });
  };

  const handleToggleSave = (postId) => {
    updatePostState(postId, (prev) => ({ ...prev, saved: !prev.saved }));
  };

  const handleToggleComments = (postId) => {
    updatePostState(postId, (prev) => ({ ...prev, showComments: !prev.showComments }));
  };

  const handleAddComment = (postId, action) => {
    if (action.type === 'draft') {
      updatePostState(postId, (prev) => ({ ...prev, commentDraft: action.value }));
      return;
    }

    updatePostState(postId, (prev) => {
      const text = prev.commentDraft.trim();
      if (!text) return prev;
      return { ...prev, commentDraft: '', comments: prev.comments + 1 };
    });
  };

  const handleCopyWorkout = async (post) => {
    if (post.type !== 'workout') return;

    const isEn = lang === 'en';
    const workoutText = [
      `@${post.username}`,
      post.caption ? `\\n${post.caption}` : '',
      `\\n${isEn ? 'Exercises' : 'Ejercicios'}: ${post.stats.exercises}`,
      `\\n${isEn ? 'Duration' : 'Duración'}: ${post.stats.duration}`,
      `\\n${isEn ? 'Calories' : 'Calorías'}: ${post.stats.calories}`,
      post.tags?.length ? `\\n${isEn ? 'Tags' : 'Tags'}: ${post.tags.map((t) => `#${t}`).join(' ')}` : '',
    ]
      .filter(Boolean)
      .join('');

    try {
      await navigator.clipboard.writeText(workoutText);
      updatePostState(post.id, (prev) => ({ ...prev, copied: true }));
      window.setTimeout(() => updatePostState(post.id, (prev) => ({ ...prev, copied: false })), 1500);
    } catch {
      updatePostState(post.id, (prev) => ({ ...prev, copied: true }));
      window.setTimeout(() => updatePostState(post.id, (prev) => ({ ...prev, copied: false })), 1500);
    }
  };

  const filtered = useMemo(() => posts, [posts]);

  const handleOpenProfile = (userId) => {
    if (!userId) return;
    navigate(`/usuarios/${userId}`);
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-[#f5f5f5]">
      <Header />

      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6 lg:py-7 xl:py-8">
        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-5">
          <div className="flex items-center gap-4">
            <h1 className="text-[22px] sm:text-[26px] md:text-[30px] font-bold tracking-wide text-white/95 uppercase">
              <span className="text-[#ff7849]">FIT</span>GRAM
            </h1>

            <div className="flex-1 flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="h-4 w-4 text-white/35 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={tr(lang, 'BUSCAR USUARIOS...', 'SEARCH USERS...')}
                  onFocus={() => setSearchOpen(Boolean(query.trim()))}
                  className="w-full rounded-lg border border-white/15 bg-white/[0.03] pl-11 pr-4 py-3 text-[12px] sm:text-[13px] text-white/85 placeholder:text-white/30 outline-none focus:border-white/30 focus:bg-white/[0.06]"
                />
                {searchOpen ? (
                  <div className="absolute left-0 right-0 top-full mt-2 rounded-xl border border-white/10 bg-[#1e1e1e] shadow-[0_20px_60px_-30px_rgba(0,0,0,0.9)] overflow-hidden z-40">
                    {searchResults.length ? (
                      <div className="divide-y divide-white/10">
                        {searchResults.map((u) => {
                          const handle = u?.apodo?.trim() || u?.nombre?.trim() || 'user';
                          const avatar = (handle[0] || 'U').toUpperCase();
                          return (
                            <button
                              key={u.id}
                              type="button"
                              onClick={() => {
                                setSearchOpen(false);
                                setQuery('');
                                navigate(`/usuarios/${u.id}`);
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-white/[0.06] transition flex items-center gap-3"
                            >
                              {u.photo_url ? (
                                <img
                                  src={u.photo_url}
                                  alt={handle}
                                  className="h-9 w-9 rounded-lg border border-white/15 object-cover"
                                />
                              ) : (
                                <div className="h-9 w-9 rounded-lg border border-white/15 bg-white/[0.02] flex items-center justify-center text-[12px] font-bold text-white/80">
                                  {avatar}
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="text-[12px] font-semibold text-white/90 truncate">
                                  {u.apodo ? `@${u.apodo}` : u.nombre}
                                </div>
                                <div className="text-[11px] text-white/45 truncate">{u.nombre || ''}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="px-4 py-4 text-[12px] text-white/55">
                        {tr(lang, 'Sin resultados.', 'No results.')}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => navigate('/fitgram/create')}
                className="h-[46px] w-[46px] rounded-lg border border-white/15 bg-white/[0.03] hover:bg-white/[0.08] transition flex items-center justify-center"
                aria-label={tr(lang, 'Crear publicación', 'Create post')}
                title={tr(lang, 'Crear publicación', 'Create post')}
              >
                <Plus className="h-5 w-5 text-white/70" />
              </button>
            </div>
          </div>

          <div className="h-px w-full bg-white/10" />

          {feedLoading ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-10 text-center text-white/60">
              {tr(lang, 'Cargando feed...', 'Loading feed...')}
            </div>
          ) : posts.length === 0 ? (
            <div className="py-10 sm:py-14">
              <div className="max-w-3xl mx-auto text-center">
                <div className="mx-auto h-28 w-28 rounded-xl border border-white/20 bg-white/[0.02] flex items-center justify-center">
                  <ImageIcon className="h-10 w-10 text-white/70" />
                </div>
                <h2 className="mt-6 text-[22px] sm:text-[26px] font-bold tracking-wide text-white/90 uppercase">
                  {tr(lang, 'NO HAY PUBLICACIONES', 'NO POSTS')}
                </h2>
                <p className="mt-2 text-[12px] sm:text-[13px] text-white/45 leading-relaxed">
                  {tr(
                    lang,
                    'Todavía no sigues a ningún usuario. Utiliza el buscador o visita Comunidad para empezar.',
                    "You're not following anyone yet. Use search or visit Community to get started."
                  )}
                </p>

                <div className="mt-7 space-y-4">
                  <EmptyStateCard className="p-5 sm:p-6 text-left">
                    <div className="text-center text-[11px] font-semibold uppercase tracking-widest text-white/55">
                      {tr(lang, 'SUGERENCIAS PARA EMPEZAR', 'GET STARTED')}
                    </div>
                    <ol className="mt-4 space-y-3 text-[12px] sm:text-[13px] text-white/75">
                      <li className="flex gap-3">
                        <span className="min-w-6 text-white/70 font-bold">1.</span>
                        <span>{tr(lang, 'Busca usuarios por nombre o @usuario', 'Search users by name or @handle')}</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="min-w-6 text-white/70 font-bold">2.</span>
                        <span>{tr(lang, 'Entra en su perfil y síguelos', 'Open their profile and follow')}</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="min-w-6 text-white/70 font-bold">3.</span>
                        <span>{tr(lang, 'Comparte tus publicaciones con el botón “+”', 'Share your posts using the “+” button')}</span>
                      </li>
                    </ol>
                  </EmptyStateCard>

                  <EmptyStateCard className="p-5 sm:p-6">
                    <div className="text-center text-[11px] font-semibold uppercase tracking-widest text-white/55">
                      {tr(lang, 'USUARIOS POPULARES', 'POPULAR USERS')}
                    </div>
                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {popularUsers.map((u) => (
                        <PopularUserCard
                          key={u.id}
                          user={{
                            ...u,
                            avatarLabel: ((u?.apodo || u?.nombre || 'U')[0] || 'U').toUpperCase(),
                            username: u?.apodo || u?.nombre || 'user',
                            followers: '',
                          }}
                          onFollow={() => handleOpenProfile(u.id)}
                        />
                      ))}
                    </div>
                    <div className="mt-4 text-center">
                      <button
                        type="button"
                        onClick={() => navigate('/comunidad')}
                        className="rounded-lg border border-white/15 bg-white/[0.03] hover:bg-white/[0.08] transition px-4 py-2 text-[12px] font-semibold text-white/80"
                      >
                        {tr(lang, 'Ver comunidad', 'Browse community')}
                      </button>
                    </div>
                  </EmptyStateCard>
                </div>
              </div>
            </div>
          ) : (
            <>
              {feedError ? (
                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-[12px] text-white/70">
                  {feedError}
                </div>
              ) : null}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                {filtered.map((post) => (
                  <FitGramPost
                    key={post.id}
                    post={post}
                    state={postState[post.id] || { liked: false, saved: false, copied: false, showComments: false, commentDraft: '', likes: 0, comments: 0 }}
                    onToggleLike={handleToggleLike}
                    onToggleSave={handleToggleSave}
                    onToggleComments={handleToggleComments}
                    onAddComment={handleAddComment}
                    onCopyWorkout={handleCopyWorkout}
                    onOpenProfile={() => handleOpenProfile(post.userId)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
