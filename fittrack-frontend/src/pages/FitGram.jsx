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

function Avatar({ label }) {
  return (
    <div className="h-8 w-8 rounded-md border border-white/15 bg-white/[0.03] flex items-center justify-center text-[12px] font-bold text-white/80">
      {label}
    </div>
  );
}

function PlaceholderImage({ label }) {
  return (
    <div className="h-[170px] sm:h-[190px] md:h-[210px] w-full bg-black/10 border-y border-white/10 flex items-center justify-center">
      <div className="h-24 w-24 border border-white/15 bg-white/[0.02] flex items-center justify-center text-white/35 text-[11px] uppercase tracking-widest">
        {label || 'IMG'}
      </div>
    </div>
  );
}

function CommentComposer({ value, onChange, onSend }) {
  return (
    <div className="px-4 py-3 border-t border-white/10 bg-white/[0.02]">
      <div className="flex items-center gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Escribe un comentario..."
          className="flex-1 rounded-lg border border-white/15 bg-white/[0.03] px-3 py-2 text-[12px] text-white/85 placeholder:text-white/30 outline-none focus:border-white/30 focus:bg-white/[0.06]"
        />
        <button
          type="button"
          onClick={onSend}
          className="h-9 w-9 rounded-lg border border-white/15 bg-white/[0.03] hover:bg-white/[0.08] transition flex items-center justify-center"
          aria-label="Enviar comentario"
          title="Enviar"
        >
          <SendHorizontal className="h-4 w-4 text-white/70" />
        </button>
      </div>
    </div>
  );
}

function FitGramPost({ post, state, onToggleLike, onToggleSave, onToggleComments, onAddComment, onCopyWorkout }) {
  const isWorkout = post.type === 'workout';

  return (
    <Card>
      <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-white/10">
        <div className="flex items-start gap-3">
          <Avatar label={post.avatarLabel} />
          <div>
            <div className="text-[12px] font-bold text-white/90">@{post.username}</div>
            <div className="text-[10px] uppercase tracking-widest text-white/35">{post.timeAgo}</div>
          </div>
        </div>
      </div>

      <PlaceholderImage label="IMG" />

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
          <Stat label="Ejer" value={post.stats.exercises} />
          <Stat label="Dur" value={post.stats.duration} />
          <Stat label="Cal" value={post.stats.calories} />
        </div>
      ) : null}

      {isWorkout ? (
        <div className="px-4 py-3 border-b border-white/10 bg-white/[0.02] flex items-center justify-between gap-3">
          <div className="text-[10px] uppercase tracking-widest text-white/45">Entreno del día</div>
          <button
            type="button"
            onClick={() => onCopyWorkout(post)}
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.03] px-3 py-2 text-[11px] font-semibold text-white/75 hover:bg-white/[0.08] hover:text-white/90 transition"
            aria-label="Copiar entreno"
            title="Copiar entreno"
          >
            {state.copied ? <Check className="h-4 w-4 text-[#ff7849]" /> : <ClipboardCopy className="h-4 w-4" />}
            {state.copied ? 'Copiado' : 'Copiar entreno'}
          </button>
        </div>
      ) : null}

      <div className="grid grid-cols-3">
        <IconMetric
          icon={Heart}
          value={state.likes}
          active={state.liked}
          onClick={() => onToggleLike(post.id)}
          ariaLabel={state.liked ? 'Quitar me gusta' : 'Dar me gusta'}
        />
        <IconMetric
          icon={MessageCircle}
          value={state.comments}
          active={state.showComments}
          onClick={() => onToggleComments(post.id)}
          ariaLabel="Comentar"
        />
        <button
          type="button"
          onClick={() => onToggleSave(post.id)}
          className={cx(
            'flex w-full items-center justify-center gap-2 py-3 transition',
            state.saved ? 'text-[#ff7849]' : 'text-white/70 hover:text-white/90'
          )}
          aria-label={state.saved ? 'Quitar guardado' : 'Guardar'}
          title={state.saved ? 'Quitar guardado' : 'Guardar'}
        >
          <Bookmark className={cx('h-4 w-4', state.saved ? 'text-[#ff7849]' : 'text-white/55')} />
          <span className="text-[12px] font-semibold">{state.saved ? 'Guardado' : 'Guardar'}</span>
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
  return (
    <div className="rounded-xl border border-white/15 bg-white/[0.02] p-5 sm:p-6 text-center">
      <div className="mx-auto h-14 w-14 rounded-xl border border-white/15 bg-white/[0.03] flex items-center justify-center text-[18px] font-bold text-white/80">
        {user.avatarLabel}
      </div>
      <div className="mt-3 text-[12px] font-bold text-white/90">@{user.username}</div>
      <div className="text-[10px] uppercase tracking-widest text-white/40 mt-1">{user.followers}</div>
      <button
        type="button"
        onClick={onFollow}
        className="mt-4 w-full rounded-lg border border-white/20 bg-white/[0.02] px-4 py-2.5 text-[11px] font-semibold text-white/75 hover:text-white/90 hover:border-white/35 hover:bg-white/[0.05] transition"
      >
        + SEGUIR
      </button>
    </div>
  );
}

export default function FitGram({ forceEmpty = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const seedPosts = useMemo(
    () => [
      {
        id: 'juan',
        type: 'workout',
        avatarLabel: 'J',
        username: 'JUAN_FITNESS',
        timeAgo: 'HACE 2H',
        caption: '¡Día de pierna completado! 💪',
        tags: ['PIERNA', 'FUERZA'],
        stats: { exercises: 8, duration: '65m', calories: 420 },
        metrics: { likes: 45, comments: 12 },
      },
      {
        id: 'ana',
        type: 'workout',
        avatarLabel: 'A',
        username: 'ANA_STRONG',
        timeAgo: 'HACE 5H',
        caption: 'Nueva rutina HIIT 🏃',
        tags: ['CARDIO', 'HIIT'],
        stats: { exercises: 6, duration: '30m', calories: 420 },
        metrics: { likes: 78, comments: 23 },
      },
      {
        id: 'miguel',
        type: 'info',
        avatarLabel: 'C',
        username: 'COACH_MIGUEL',
        timeAgo: 'HACE 1D',
        caption: 'Nueva rutina de pecho y tríceps: consistente y con progresión.',
        tags: ['PECHO', 'TRICEPS'],
        metrics: { likes: 124, comments: 34 },
      },
      {
        id: 'maria',
        type: 'workout',
        avatarLabel: 'M',
        username: 'MARIA_GYM',
        timeAgo: 'HACE 1D',
        caption: 'PR en sentadillas! 🎉',
        tags: ['PIERNA', 'PR'],
        stats: { exercises: 5, duration: '45m', calories: 360 },
        metrics: { likes: 89, comments: 15 },
      },
      {
        id: 'carlos',
        type: 'workout',
        avatarLabel: 'C',
        username: 'CARLOS_FIT',
        timeAgo: 'HACE 2D',
        caption: 'Espalda y bíceps ✅',
        tags: ['ESPALDA'],
        stats: { exercises: 7, duration: '55m', calories: 410 },
        metrics: { likes: 62, comments: 8 },
      },
      {
        id: 'laura',
        type: 'workout',
        avatarLabel: 'L',
        username: 'LAURA_SPORT',
        timeAgo: 'HACE 2D',
        caption: 'Yoga flow matutino 🧘',
        tags: ['YOGA'],
        stats: { exercises: 10, duration: '25m', calories: 180 },
        metrics: { likes: 51, comments: 6 },
      },
    ],
    []
  );

  const initialPosts = useMemo(() => {
    if (forceEmpty || location.state?.empty === true) return [];
    return seedPosts;
  }, [forceEmpty, location.state, seedPosts]);

  const [posts, setPosts] = useState(() => initialPosts);

  const [postState, setPostState] = useState(() => {
    const initial = {};
    posts.forEach((post) => {
      initial[post.id] = {
        liked: false,
        saved: false,
        copied: false,
        showComments: false,
        commentDraft: '',
        likes: post.metrics?.likes ?? 0,
        comments: post.metrics?.comments ?? 0,
      };
    });
    return initial;
  });

  React.useEffect(() => {
    setPosts(initialPosts);
    setPostState(() => {
      const initial = {};
      initialPosts.forEach((post) => {
        initial[post.id] = {
          liked: false,
          saved: false,
          copied: false,
          showComments: false,
          commentDraft: '',
          likes: post.metrics?.likes ?? 0,
          comments: post.metrics?.comments ?? 0,
        };
      });
      return initial;
    });
  }, [initialPosts]);

  React.useEffect(() => {
    const newPost = location.state?.newPost;
    if (!newPost) return;
    if (forceEmpty) return;

    setPosts((prev) => (prev.some((p) => p.id === newPost.id) ? prev : [newPost, ...prev]));
    setPostState((prev) =>
      prev[newPost.id]
        ? prev
        : {
            ...prev,
            [newPost.id]: {
              liked: false,
              saved: false,
              copied: false,
              showComments: false,
              commentDraft: '',
              likes: newPost.metrics?.likes ?? 0,
              comments: newPost.metrics?.comments ?? 0,
            },
          }
    );
  }, [forceEmpty, location.state]);

  const popularUsers = useMemo(
    () => [
      { id: 'pu_coach', avatarLabel: 'C', username: 'COACH_MIGUEL', followers: '1.2K SEGUIDORES' },
      { id: 'pu_ana', avatarLabel: 'A', username: 'ANA_STRONG', followers: '890 SEGUIDORES' },
      { id: 'pu_juan', avatarLabel: 'J', username: 'JUAN_FITNESS', followers: '654 SEGUIDORES' },
    ],
    []
  );

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

    const workoutText = [
      `@${post.username}`,
      post.caption ? `\n${post.caption}` : '',
      `\nEjercicios: ${post.stats.exercises}`,
      `Duración: ${post.stats.duration}`,
      `Calorías: ${post.stats.calories}`,
      post.tags?.length ? `\nTags: ${post.tags.map((t) => `#${t}`).join(' ')}` : '',
    ]
      .filter(Boolean)
      .join('');

    try {
      await navigator.clipboard.writeText(workoutText);
      updatePostState(post.id, (prev) => ({ ...prev, copied: true }));
      window.setTimeout(() => {
        updatePostState(post.id, (prev) => ({ ...prev, copied: false }));
      }, 1500);
    } catch {
      updatePostState(post.id, (prev) => ({ ...prev, copied: true }));
      window.setTimeout(() => {
        updatePostState(post.id, (prev) => ({ ...prev, copied: false }));
      }, 1500);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((post) => post.username.toLowerCase().includes(q));
  }, [posts, query]);

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
                  placeholder="BUSCAR USUARIOS..."
                  className="w-full rounded-lg border border-white/15 bg-white/[0.03] pl-11 pr-4 py-3 text-[12px] sm:text-[13px] text-white/85 placeholder:text-white/30 outline-none focus:border-white/30 focus:bg-white/[0.06]"
                />
              </div>

              <button
                type="button"
                onClick={() => navigate('/fitgram/create')}
                className="h-[46px] w-[46px] rounded-lg border border-white/15 bg-white/[0.03] hover:bg-white/[0.08] transition flex items-center justify-center"
                aria-label="Crear publicación"
                title="Crear publicación"
              >
                <Plus className="h-5 w-5 text-white/70" />
              </button>
            </div>
          </div>

          <div className="h-px w-full bg-white/10" />

          {posts.length === 0 ? (
            <div className="py-10 sm:py-14">
              <div className="max-w-3xl mx-auto text-center">
                <div className="mx-auto h-28 w-28 rounded-xl border border-white/20 bg-white/[0.02] flex items-center justify-center">
                  <ImageIcon className="h-10 w-10 text-white/70" />
                </div>
                <h2 className="mt-6 text-[22px] sm:text-[26px] font-bold tracking-wide text-white/90 uppercase">
                  NO HAY PUBLICACIONES
                </h2>
                <p className="mt-2 text-[12px] sm:text-[13px] text-white/45 leading-relaxed">
                  Todavía no sigues a ningún usuario. Utiliza el buscador para encontrar usuarios y empezar a seguir sus
                  entrenamientos y publicaciones.
                </p>

                <div className="mt-7 space-y-4">
                  <EmptyStateCard className="p-5 sm:p-6 text-left">
                    <div className="text-center text-[11px] font-semibold uppercase tracking-widest text-white/55">
                      SUGERENCIAS PARA EMPEZAR
                    </div>
                    <ol className="mt-4 space-y-3 text-[12px] sm:text-[13px] text-white/75">
                      <li className="flex gap-3">
                        <span className="min-w-6 text-white/70 font-bold">1.</span>
                        <span>Usa el buscador para encontrar usuarios por nombre o @usuario</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="min-w-6 text-white/70 font-bold">2.</span>
                        <span>Sigue a otros usuarios para ver sus entrenamientos en tu feed</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="min-w-6 text-white/70 font-bold">3.</span>
                        <span>Comparte tus propios entrenamientos usando el botón “+”</span>
                      </li>
                    </ol>
                  </EmptyStateCard>

                  <EmptyStateCard className="p-5 sm:p-6">
                    <div className="text-center text-[11px] font-semibold uppercase tracking-widest text-white/55">
                      USUARIOS POPULARES
                    </div>
                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {popularUsers.map((user) => (
                        <PopularUserCard key={user.id} user={user} onFollow={() => {}} />
                      ))}
                    </div>
                  </EmptyStateCard>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                {filtered.map((post) => (
                  <FitGramPost
                    key={post.id}
                    post={post}
                    state={postState[post.id]}
                    onToggleLike={handleToggleLike}
                    onToggleSave={handleToggleSave}
                    onToggleComments={handleToggleComments}
                    onAddComment={handleAddComment}
                    onCopyWorkout={handleCopyWorkout}
                  />
                ))}
              </div>

              {filtered.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-10 text-center text-white/55">
                  <div className="inline-flex items-center gap-2 text-[13px] font-semibold text-white/70">
                    <ImageIcon className="h-4 w-4 text-white/50" />
                    No se encontraron usuarios
                  </div>
                  <div className="text-[12px] text-white/40 mt-2">
                    Prueba con otro nombre (ej. ANA, CARLOS...).
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
