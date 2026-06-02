import React, { useMemo, useState } from 'react';
import {
  Bookmark,
  Check,
  ClipboardCopy,
  Edit3,
  Heart,
  Image as ImageIcon,
  MessageCircle,
  MoreVertical,
  Plus,
  Search,
  SendHorizontal,
  Settings,
  Trash2,
  X,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useI18n, tr } from '../i18n/I18nProvider';
import {
  addComment as apiAddComment,
  copyWorkoutPost as apiCopyWorkoutPost,
  deletePost as apiDeletePost,
  getExplore,
  getFeed,
  getUserPosts,
  updatePost as apiUpdatePost,
} from '../services/fitgramApi';
import { getPublicProfile, searchUsers as apiSearchUsers } from '../services/socialApi';

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
      <div className="h-[220px] sm:h-[240px] w-full bg-black/10 border-y border-white/10 flex items-center justify-center">
        <div className="h-24 w-24 border border-white/15 bg-white/[0.02] flex items-center justify-center text-white/35 text-[11px] uppercase tracking-widest">
          {tr(lang, 'IMG', 'IMG')}
        </div>
      </div>
    );
  }
  return (
    <div className="w-full bg-black/10 border-y border-white/10">
      <img src={src} alt="" className="w-full h-[220px] sm:h-[240px] object-cover" loading="lazy" />
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

function CommentList({ comments = [], compact = false }) {
  const visible = compact ? comments.slice(-3) : comments;
  if (!visible.length) return null;

  return (
    <div className="px-4 py-3 border-t border-white/10 bg-white/[0.02] space-y-2">
      {visible.map((comment) => {
        const handle = comment?.author?.apodo || comment?.author?.nombre || 'usuario';
        return (
          <div key={comment.id || `${handle}-${comment.createdAt}`} className="text-[12px] leading-relaxed text-white/70">
            <span className="font-semibold text-white/85">@{handle}</span>{' '}
            <span>{comment.text}</span>
          </div>
        );
      })}
    </div>
  );
}

function FixedCommentPreview({ comments = [] }) {
  const visible = comments.slice(-3);
  return (
    <div className="h-[104px] px-4 py-3 border-t border-white/10 bg-white/[0.02] space-y-2 overflow-hidden">
      {Array.from({ length: 3 }).map((_, index) => {
        const comment = visible[index];
        const handle = comment?.author?.apodo || comment?.author?.nombre || 'usuario';
        return comment ? (
          <div key={comment.id || `${handle}-${comment.createdAt}`} className="truncate text-[12px] leading-relaxed text-white/70">
            <span className="font-semibold text-white/85">@{handle}</span>{' '}
            <span>{comment.text}</span>
          </div>
        ) : (
          <div key={`empty-comment-${index}`} className="h-[18px] text-[12px] leading-relaxed text-white/20">
            &nbsp;
          </div>
        );
      })}
    </div>
  );
}

function WorkoutSharePanel({ post, state, onSaveWorkout, lang }) {
  const workout = post.workoutSnapshot || {};
  const exercises = Array.isArray(workout.exercises) ? workout.exercises.slice(0, 3) : [];

  return (
    <div className="h-full bg-white/[0.02] p-3">
      <div className="relative h-full rounded-xl border border-[#ff7849]/25 bg-gradient-to-br from-[#ff7849]/12 via-white/[0.035] to-black/10 p-3 overflow-hidden">
        <button
          type="button"
          onClick={() => onSaveWorkout(post)}
          className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-lg border border-[#ff7849]/55 bg-[#1e1e1e]/90 px-2.5 py-1.5 text-[10px] font-bold text-[#ff7849] hover:bg-[#ff7849]/20 transition"
          aria-label={tr(lang, 'Guardar entreno', 'Save workout')}
          title={tr(lang, 'Guardar entreno', 'Save workout')}
        >
          {state.copied ? <Check className="h-3.5 w-3.5" /> : <ClipboardCopy className="h-3.5 w-3.5" />}
          {state.copied ? tr(lang, 'Guardado', 'Saved') : tr(lang, 'Guardar', 'Save')}
        </button>

        <div className="pr-24">
          <div className="text-[9px] uppercase tracking-widest text-[#ff7849]/90">
            {tr(lang, 'Entreno compartido', 'Shared workout')}
          </div>
          <div className="mt-1 truncate text-[13px] font-bold text-white/90">
            {workout.title || tr(lang, 'Entreno del día', "Today's workout")}
          </div>
          {workout.dateLabel ? <div className="mt-0.5 text-[10px] uppercase tracking-widest text-white/35">{workout.dateLabel}</div> : null}
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-white/10 bg-black/15 px-2 py-2 text-center">
            <div className="text-[12px] font-bold text-white/90">{post.stats?.exercises ?? exercises.length}</div>
            <div className="mt-0.5 text-[8px] uppercase tracking-widest text-white/35">{tr(lang, 'Ejer', 'Ex')}</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/15 px-2 py-2 text-center">
            <div className="text-[12px] font-bold text-white/90">{post.stats?.duration || '--'}</div>
            <div className="mt-0.5 text-[8px] uppercase tracking-widest text-white/35">{tr(lang, 'Dur', 'Dur')}</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/15 px-2 py-2 text-center">
            <div className="text-[12px] font-bold text-white/90">{post.stats?.volumeKg ? `${Math.round(post.stats.volumeKg)}kg` : '--'}</div>
            <div className="mt-0.5 text-[8px] uppercase tracking-widest text-white/35">{tr(lang, 'Vol', 'Vol')}</div>
          </div>
        </div>

        <div className="mt-3 grid gap-1">
          {exercises.length ? exercises.map((exercise) => (
            <div key={exercise.name} className="flex items-center justify-between gap-3 rounded-md bg-black/15 px-2.5 py-1 text-[10px]">
              <span className="truncate text-white/75">{exercise.name}</span>
              <span className="shrink-0 text-white/40">{exercise.sets || 0} sets</span>
            </div>
          )) : (
            <div className="rounded-md bg-black/15 px-2.5 py-2 text-[10px] text-white/45">
              {tr(lang, 'Ejercicios incluidos al guardar el entreno.', 'Exercises included when saving the workout.')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FitGramPost({ post, state, onToggleLike, onToggleSave, onToggleComments, onAddComment, onCopyWorkout, onOpenProfile }) {
  const { lang } = useI18n();
  const isWorkout = post.type === 'workout';

  return (
    <Card className="h-[736px] flex flex-col">
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
            <div className="text-[10px] uppercase tracking-widest text-white/35">
              {post.timeAgo}
              {post.createdLabel ? ` · ${post.createdLabel}` : ''}
            </div>
          </div>
        </div>
      </div>

      <PostImage src={post.image_url} />

      <div className="h-[104px] px-4 py-3 border-b border-white/10 overflow-hidden">
        <div className="text-[12px] text-white/80 line-clamp-2">
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
        <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] uppercase tracking-widest text-white/40">
          <div>{post.comments?.length || 0} {tr(lang, 'comentarios', 'comments')}</div>
          <div className="text-right">{post.tags?.length || 0} tags</div>
        </div>
      </div>

      <div className="h-[184px] border-b border-white/10">
        {isWorkout ? (
          <WorkoutSharePanel post={post} state={state} onSaveWorkout={onCopyWorkout} lang={lang} />
        ) : (
          <div className="h-full px-4 py-3 bg-white/[0.02] flex items-center">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-white/45">{tr(lang, 'Publicación', 'Post')}</div>
              <div className="mt-2 text-[12px] text-white/55">{tr(lang, 'Foto compartida con la comunidad', 'Photo shared with the community')}</div>
            </div>
          </div>
        )}
      </div>

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

      {!state.showComments ? <FixedCommentPreview comments={post.comments} /> : null}

      {state.showComments ? (
        <>
          <CommentList comments={post.comments} />
          <CommentComposer
            value={state.commentDraft}
            onChange={(v) => onAddComment(post.id, { type: 'draft', value: v })}
            onSend={() => onAddComment(post.id, { type: 'send' })}
          />
        </>
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

function TabButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'rounded-lg px-4 py-2.5 text-[11px] sm:text-[12px] font-bold uppercase tracking-wide transition border',
        active
          ? 'border-[#ff7849] bg-[#ff7849] text-white'
          : 'border-white/10 bg-white/[0.03] text-white/65 hover:bg-white/[0.07] hover:text-white/85'
      )}
    >
      {children}
    </button>
  );
}

function readCurrentUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem('fittrack_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function OwnProfileHeader({ user, postsCount, stats, onCreate, onBack, lang }) {
  const displayName = user?.apodo || user?.nombre || 'user';
  const fullName = user?.nombre || '';
  const avatarLabel = (displayName[0] || 'U').toUpperCase();

  return (
    <>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="h-10 w-10 rounded-lg border border-white/15 bg-white/[0.03] hover:bg-white/[0.08] transition flex items-center justify-center"
          aria-label={tr(lang, 'Volver', 'Back')}
          title={tr(lang, 'Volver', 'Back')}
        >
          <span className="text-[22px] text-white/70 leading-none">←</span>
        </button>
        <h2 className="text-[26px] sm:text-[34px] font-bold tracking-wide text-white/95 uppercase">
          {tr(lang, 'Perfil', 'Profile')}
        </h2>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5 sm:p-7">
      <div className="flex flex-col sm:flex-row sm:items-center gap-6">
        <div className="flex items-center gap-4 min-w-0">
          {user?.photo_url ? (
            <img src={user.photo_url} alt={displayName} className="h-24 w-24 rounded-2xl border border-white/15 object-cover" />
          ) : (
            <div className="h-24 w-24 rounded-2xl border border-white/15 bg-white/[0.02] flex items-center justify-center text-[22px] font-bold text-white/80">
              {avatarLabel}
            </div>
          )}
          <div className="min-w-0">
            <div className="text-[22px] font-bold text-white/95 truncate">@{displayName}</div>
            {fullName ? <div className="text-[12px] text-white/50 truncate">{fullName}</div> : null}
          </div>
        </div>

        <div className="flex-1 grid grid-cols-3 gap-4">
          <Stat label={tr(lang, 'Publicaciones', 'Posts')} value={postsCount} />
          <Stat label={tr(lang, 'Seguidores', 'Followers')} value={stats?.followers ?? 0} />
          <Stat label={tr(lang, 'Seguidos', 'Following')} value={stats?.following ?? 0} />
        </div>

        <div className="sm:ml-auto">
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex items-center gap-2 rounded-lg border border-[#ff7849]/70 bg-[#ff7849]/10 px-4 py-2.5 text-[12px] font-semibold text-[#ff7849] hover:bg-[#ff7849]/20 transition"
          >
            <Plus className="h-4 w-4" />
            {tr(lang, 'Nueva publicación', 'New post')}
          </button>
        </div>
      </div>
      </div>
    </>
  );
}

function OwnPostGrid({ posts, onOpen, lang }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
      <div className="text-[13px] uppercase tracking-widest text-white/45 mb-5">
        {tr(lang, 'Publicaciones', 'Posts')}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {posts.map((post) => (
          <button
            type="button"
            key={post.id}
            onClick={() => onOpen(post)}
            className="group relative aspect-square rounded-lg overflow-hidden border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] transition"
            title={post.caption || post.username}
          >
            {post.image_url ? (
              <img src={post.image_url} alt={post.caption || post.username} className="h-full w-full object-cover" loading="lazy" />
            ) : null}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition" />
            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition">
              <div className="rounded-lg border border-white/15 bg-[#1e1e1e]/90 p-2" title={tr(lang, 'Opciones', 'Options')}>
                <Settings className="h-4 w-4 text-white/80" />
              </div>
            </div>
            <div className="absolute left-2 bottom-2 opacity-0 group-hover:opacity-100 transition text-[11px] text-white/90">
              {post.comments?.length || 0} {tr(lang, 'comentarios', 'comments')}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function FitGramReal({ forceEmpty = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { lang } = useI18n();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState(() => {
    const tab = new URLSearchParams(location.search || '').get('tab');
    return ['for-you', 'community', 'profile'].includes(tab) ? tab : 'for-you';
  });

  const [posts, setPosts] = useState([]);
  const [postState, setPostState] = useState({});
  const [feedLoading, setFeedLoading] = useState(true);
  const [feedError, setFeedError] = useState('');
  const [currentUser, setCurrentUser] = useState(() => readCurrentUser());
  const [ownStats, setOwnStats] = useState({ followers: 0, following: 0, posts: 0 });
  const [selectedOwnPost, setSelectedOwnPost] = useState(null);
  const [editingPost, setEditingPost] = useState(false);
  const [ownPostOptionsOpen, setOwnPostOptionsOpen] = useState(false);
  const [editCaption, setEditCaption] = useState('');
  const [editTags, setEditTags] = useState('');

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

  const formatDate = (value) => {
    const date = new Date(value || Date.now());
    if (!Number.isFinite(date.getTime())) return '';
    return date.toLocaleDateString(lang === 'en' ? 'en-US' : 'es-ES', { day: '2-digit', month: 'short' });
  };

  const mapPost = (p) => {
    const base = (p?.author?.apodo || p?.author?.nombre || currentUser?.apodo || currentUser?.nombre || 'user')
      .toString()
      .trim();
    const username = base.toUpperCase();
    return {
      id: p.id,
      type: p.type || 'photo',
      image_url: p.image_url,
      avatarLabel: (base[0] || 'U').toUpperCase(),
      authorPhotoUrl: p?.author?.photo_url || currentUser?.photo_url || '',
      username,
      userId: p?.author?.id || p.authorId || currentUser?.id,
      timeAgo: formatTimeAgo(p.createdAt),
      createdLabel: formatDate(p.createdAt),
      caption: p.caption || '',
      tags: p.tags || [],
      workoutSnapshot: p.workoutSnapshot,
      stats: p.workoutSnapshot?.stats,
      comments: p.comments || [],
      metrics: { likes: 0, comments: p.commentsCount ?? p.comments?.length ?? 0 },
    };
  };

  const handleSetTab = (tab) => {
    setActiveTab(tab);
    navigate(`/fitgram?tab=${tab}`, { replace: true });
  };

  React.useEffect(() => {
    const tab = new URLSearchParams(location.search || '').get('tab');
    if (['for-you', 'community', 'profile'].includes(tab) && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [location.search, activeTab]);

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
        const latestUser = readCurrentUser();
        setCurrentUser(latestUser);

        let data;
        if (activeTab === 'profile') {
          const ownId = latestUser?.id || latestUser?._id;
          if (ownId) {
            const [postsData, profileData] = await Promise.all([
              getUserPosts(ownId, { limit: 120 }),
              getPublicProfile(ownId).catch(() => null),
            ]);
            data = postsData;
            setOwnStats(profileData?.stats || { followers: 0, following: 0, posts: postsData?.posts?.length || 0 });
          } else {
            data = { posts: [] };
            setOwnStats({ followers: 0, following: 0, posts: 0 });
          }
        } else if (activeTab === 'community') {
          data = await getFeed({ limit: 60 });
        } else {
          data = await getExplore({ limit: 60 });
        }

        const raw = data?.posts || [];
        const mapped = raw.map(mapPost);

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
              comments: post.comments?.length || 0,
            };
          });
          return initial;
        });
      } catch {
        if (!mounted) return;
        setFeedError(tr(lang, 'No se pudieron cargar las publicaciones.', 'Could not load posts.'));
        setPosts([]);
        setPostState({});
      } finally {
        if (mounted) setFeedLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [forceEmpty, location.state, lang, activeTab]);

  React.useEffect(() => {
    const created = location.state?.createdPost;
    if (!created) return;
    if (forceEmpty) return;
    if (activeTab !== 'profile') return;
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
              comments: created.comments?.length || 0,
            },
          }
    );
  }, [location.state, forceEmpty, activeTab]);

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

  const replacePost = (postId, nextPost) => {
    const mapped = mapPost(nextPost);
    setPosts((prev) => prev.map((post) => (post.id === postId ? mapped : post)));
    if (selectedOwnPost?.id === postId) setSelectedOwnPost(mapped);
    setPostState((prev) => ({
      ...prev,
      [postId]: {
        ...(prev[postId] || {}),
        comments: mapped.comments?.length || 0,
      },
    }));
  };

  const handleAddComment = async (postId, action) => {
    if (action.type === 'draft') {
      updatePostState(postId, (prev) => ({ ...prev, commentDraft: action.value }));
      return;
    }

    const draft = (postState[postId]?.commentDraft || '').trim();
    if (!draft) return;

    updatePostState(postId, (prev) => ({ ...prev, commentDraft: '' }));
    try {
      const data = await apiAddComment(postId, { text: draft });
      if (data?.post) replacePost(postId, data.post);
    } catch {
      updatePostState(postId, (prev) => ({ ...prev, commentDraft: draft }));
    }
  };

  const handleCopyWorkout = async (post) => {
    if (post.type !== 'workout') return;

    try {
      await apiCopyWorkoutPost(post.id);
      updatePostState(post.id, (prev) => ({ ...prev, copied: true }));
      window.setTimeout(() => updatePostState(post.id, (prev) => ({ ...prev, copied: false })), 1500);
    } catch {
      updatePostState(post.id, (prev) => ({ ...prev, copied: false }));
    }
  };

  const filtered = useMemo(() => posts, [posts]);

  const handleOpenProfile = (userId) => {
    if (!userId) return;
    navigate(`/fitgram/usuarios/${userId}`);
  };

  const handleOpenOwnPost = (post) => {
    setSelectedOwnPost(post);
    setEditingPost(false);
    setOwnPostOptionsOpen(false);
    setEditCaption(post.caption || '');
    setEditTags((post.tags || []).join(', '));
  };

  const handleDeleteOwnPost = async () => {
    if (!selectedOwnPost?.id) return;
    const postId = selectedOwnPost.id;
    try {
      await apiDeletePost(postId);
      setPosts((prev) => prev.filter((post) => post.id !== postId));
      setOwnStats((prev) => ({ ...prev, posts: Math.max(0, (prev.posts || 0) - 1) }));
      setSelectedOwnPost(null);
      setEditingPost(false);
      setOwnPostOptionsOpen(false);
    } catch {
      // keep modal open so the user can retry
    }
  };

  const handleSaveOwnPost = async () => {
    if (!selectedOwnPost?.id) return;
    try {
      const tags = editTags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);
      const data = await apiUpdatePost(selectedOwnPost.id, { caption: editCaption, tags });
      if (data?.post) replacePost(selectedOwnPost.id, data.post);
      setEditingPost(false);
      setOwnPostOptionsOpen(false);
    } catch {
      // keep edit mode open so the user can retry
    }
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
              {activeTab !== 'profile' ? (
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
                                navigate(`/fitgram/usuarios/${u.id}`);
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
              ) : (
                <div className="flex-1" />
              )}

              {activeTab === 'profile' ? (
                <button
                  type="button"
                  onClick={() => navigate('/fitgram/create')}
                  className="h-[46px] w-[46px] rounded-lg border border-white/15 bg-white/[0.03] hover:bg-white/[0.08] transition flex items-center justify-center"
                  aria-label={tr(lang, 'Crear publicación', 'Create post')}
                  title={tr(lang, 'Crear publicación', 'Create post')}
                >
                  <Plus className="h-5 w-5 text-white/70" />
                </button>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <TabButton active={activeTab === 'for-you'} onClick={() => handleSetTab('for-you')}>
              {tr(lang, 'Para ti', 'For you')}
            </TabButton>
            <TabButton active={activeTab === 'community'} onClick={() => handleSetTab('community')}>
              {tr(lang, 'Mi comunidad', 'My community')}
            </TabButton>
            <TabButton active={activeTab === 'profile'} onClick={() => handleSetTab('profile')}>
              {tr(lang, 'Mi perfil', 'My profile')}
            </TabButton>
          </div>

          <div className="h-px w-full bg-white/10" />

          {activeTab === 'profile' ? (
            <OwnProfileHeader
              user={currentUser}
              postsCount={posts.length}
              stats={ownStats}
              onCreate={() => navigate('/fitgram/create')}
              onBack={() => handleSetTab('for-you')}
              lang={lang}
            />
          ) : null}

          {feedLoading ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-10 text-center text-white/60">
              {tr(lang, 'Cargando publicaciones...', 'Loading posts...')}
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
                  {activeTab === 'profile'
                    ? tr(lang, 'Todavía no has subido publicaciones. Crea la primera desde tu perfil.', "You haven't uploaded posts yet. Create your first one from your profile.")
                    : activeTab === 'community'
                      ? tr(lang, 'Todavía no hay publicaciones de usuarios que sigues. Busca perfiles y empieza a crear tu comunidad.', 'There are no posts from followed users yet. Search profiles and start building your community.')
                      : tr(lang, 'Todavía no hay publicaciones disponibles.', 'There are no posts available yet.')}
                </p>

                {activeTab !== 'profile' ? (
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
                        onClick={() => handleSetTab('for-you')}
                        className="rounded-lg border border-white/15 bg-white/[0.03] hover:bg-white/[0.08] transition px-4 py-2 text-[12px] font-semibold text-white/80"
                      >
                        {tr(lang, 'Ver Para ti', 'Open For you')}
                      </button>
                    </div>
                  </EmptyStateCard>
                </div>
                ) : (
                  <div className="mt-7">
                    <button
                      type="button"
                      onClick={() => navigate('/fitgram/create')}
                      className="inline-flex items-center gap-2 rounded-lg border border-[#ff7849]/70 bg-[#ff7849]/10 px-4 py-2.5 text-[12px] font-semibold text-[#ff7849] hover:bg-[#ff7849]/20 transition"
                    >
                      <Plus className="h-4 w-4" />
                      {tr(lang, 'Crear publicación', 'Create post')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {feedError ? (
                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-[12px] text-white/70">
                  {feedError}
                </div>
              ) : null}

              {activeTab === 'profile' ? (
                <OwnPostGrid posts={filtered} onOpen={handleOpenOwnPost} lang={lang} />
              ) : (
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
              )}
            </>
          )}
        </div>
      </div>

      {selectedOwnPost ? (
        <div className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedOwnPost(null)}>
          <div
            className="w-full max-w-5xl max-h-[88vh] overflow-hidden rounded-xl border border-white/15 bg-[#1e1e1e]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
              <div className="min-w-0">
                <div className="text-[12px] font-bold text-white/90 truncate">@{selectedOwnPost.username}</div>
                <div className="text-[10px] uppercase tracking-widest text-white/35">
                  {selectedOwnPost.timeAgo} {selectedOwnPost.createdLabel ? `· ${selectedOwnPost.createdLabel}` : ''}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setOwnPostOptionsOpen((prev) => !prev)}
                    className="h-9 w-9 rounded-lg border border-white/15 bg-white/[0.03] hover:bg-white/[0.08] transition flex items-center justify-center"
                    aria-label={tr(lang, 'Opciones', 'Options')}
                    title={tr(lang, 'Opciones', 'Options')}
                  >
                    <MoreVertical className="h-4 w-4 text-white/70" />
                  </button>
                  {ownPostOptionsOpen ? (
                  <div className="absolute right-0 top-full z-10 mt-2 w-44 rounded-lg border border-white/15 bg-[#242424] p-1 shadow-xl">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPost(true);
                        setOwnPostOptionsOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[12px] text-white/80 hover:bg-white/[0.08]"
                    >
                      <Edit3 className="h-4 w-4 text-white/55" />
                      {tr(lang, 'Editar publicación', 'Edit post')}
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteOwnPost}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[12px] text-red-200 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4 text-red-300" />
                      {tr(lang, 'Eliminar foto', 'Delete photo')}
                    </button>
                  </div>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedOwnPost(null);
                    setOwnPostOptionsOpen(false);
                  }}
                  className="h-9 w-9 rounded-lg border border-white/15 bg-white/[0.03] hover:bg-white/[0.08] transition flex items-center justify-center"
                  aria-label={tr(lang, 'Cerrar', 'Close')}
                  title={tr(lang, 'Cerrar', 'Close')}
                >
                  <X className="h-4 w-4 text-white/70" />
                </button>
              </div>
            </div>

            <div className="grid max-h-[calc(88vh-58px)] grid-cols-1 lg:grid-cols-[minmax(0,1.2fr),minmax(320px,0.8fr)] overflow-y-auto">
              <div className="bg-black/30 flex items-center justify-center">
                <img
                  src={selectedOwnPost.image_url}
                  alt={selectedOwnPost.caption || selectedOwnPost.username}
                  className="max-h-[70vh] w-full object-contain"
                />
              </div>

              <div className="border-t border-white/10 lg:border-l lg:border-t-0 border-white/10">
                <div className="p-4 border-b border-white/10">
                  {editingPost ? (
                    <div className="space-y-3">
                      <textarea
                        value={editCaption}
                        onChange={(event) => setEditCaption(event.target.value)}
                        className="min-h-24 w-full rounded-lg border border-white/15 bg-white/[0.03] px-3 py-2 text-[13px] text-white/85 outline-none focus:border-white/30"
                        placeholder={tr(lang, 'Texto de la publicación', 'Post caption')}
                      />
                      <input
                        value={editTags}
                        onChange={(event) => setEditTags(event.target.value)}
                        className="w-full rounded-lg border border-white/15 bg-white/[0.03] px-3 py-2 text-[12px] text-white/85 outline-none focus:border-white/30"
                        placeholder={tr(lang, 'Tags separados por coma', 'Comma-separated tags')}
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingPost(false)}
                          className="rounded-lg border border-white/15 bg-white/[0.03] px-3 py-2 text-[12px] text-white/75 hover:bg-white/[0.08]"
                        >
                          {tr(lang, 'Cancelar', 'Cancel')}
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveOwnPost}
                          className="rounded-lg border border-[#ff7849]/70 bg-[#ff7849]/10 px-3 py-2 text-[12px] font-semibold text-[#ff7849] hover:bg-[#ff7849]/20"
                        >
                          {tr(lang, 'Guardar', 'Save')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="text-[13px] leading-relaxed text-white/80">
                        <span className="font-semibold text-white/90">@{selectedOwnPost.username}</span>{' '}
                        {selectedOwnPost.caption || tr(lang, 'Sin descripción.', 'No caption.')}
                      </div>
                      {selectedOwnPost.tags?.length ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {selectedOwnPost.tags.map((tag) => (
                            <Tag key={tag}>#{tag}</Tag>
                          ))}
                        </div>
                      ) : null}
                    </>
                  )}
                </div>

                <div className="p-4 border-b border-white/10">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <Stat label={tr(lang, 'Likes', 'Likes')} value={postState[selectedOwnPost.id]?.likes || 0} />
                    <Stat label={tr(lang, 'Comentarios', 'Comments')} value={selectedOwnPost.comments?.length || 0} />
                    <Stat label="Tags" value={selectedOwnPost.tags?.length || 0} />
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto">
                  <CommentList comments={selectedOwnPost.comments} />
                  {!selectedOwnPost.comments?.length ? (
                    <div className="p-4 text-[12px] text-white/45">
                      {tr(lang, 'Todavía no hay comentarios.', 'No comments yet.')}
                    </div>
                  ) : null}
                </div>

                <CommentComposer
                  value={postState[selectedOwnPost.id]?.commentDraft || ''}
                  onChange={(value) => handleAddComment(selectedOwnPost.id, { type: 'draft', value })}
                  onSend={() => handleAddComment(selectedOwnPost.id, { type: 'send' })}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
