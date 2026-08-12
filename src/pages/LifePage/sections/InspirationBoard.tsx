import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Mic,
  Link2,
  ChevronRight,
  ChevronLeft,
  Trash2,
  Play,
  X,
  Lightbulb,
  Sparkles,
  Tag,
} from 'lucide-react';
import {
  getInspirations,
  addInspirationCard,
  updateInspirationStatus,
  deleteInspirationCard,
  monthlyInspirationConnect,
  type IInspirationCard,
  type InspirationSourceType,
  type InspirationStatus,
} from '@/lib/storage';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { UniversalLink } from '@lark-apaas/client-toolkit-lite';

const KANBAN_COLUMNS: {
  id: InspirationStatus;
  name: string;
  color: string;
  bg: string;
  textColor: string;
}[] = [
  { id: 'backlog', name: '积压碎片', color: 'bg-slate-400', bg: 'bg-slate-50', textColor: 'text-slate-600' },
  { id: 'todo', name: '待办事项', color: 'bg-blue-500', bg: 'bg-blue-50', textColor: 'text-blue-600' },
  { id: 'in-progress', name: '进行中', color: 'bg-orange-500', bg: 'bg-orange-50', textColor: 'text-orange-600' },
  { id: 'review', name: '审核区', color: 'bg-violet-500', bg: 'bg-violet-50', textColor: 'text-violet-600' },
  { id: 'done', name: '完成区', color: 'bg-emerald-500', bg: 'bg-emerald-50', textColor: 'text-emerald-600' },
];

const SOURCE_TYPE_META: Record<InspirationSourceType, { name: string; icon: string }> = {
  manual: { name: '手动', icon: '✍️' },
  voice: { name: '语音', icon: '🎙️' },
  video: { name: '视频', icon: '🎬' },
};

// 常用标签
const COMMON_TAGS = ['AI', '产品', '设计', '读书', '理财', '效率', '心理学', '技术', '创业', '健康'];

export default function InspirationBoard() {
  const [state, setState] = useState(() => getInspirations());
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showAddForm, setShowAddForm] = useState<false | { mode: 'manual' | 'voice' | 'video' }>(false);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [showConnect, setShowConnect] = useState(false);

  const cardsByColumn = useMemo(() => {
    const map: Record<InspirationStatus, IInspirationCard[]> = {
      backlog: [],
      todo: [],
      'in-progress': [],
      review: [],
      done: [],
    };
    state.cards.forEach((c) => {
      if (map[c.status]) map[c.status].push(c);
      else map.backlog.push(c);
    });
    return map;
  }, [state.cards]);

  const activeCard = state.cards.find((c) => c.id === activeCardId) ?? null;

  const handleAddManual = (data: { title: string; content: string; tags: string[] }) => {
    addInspirationCard({
      title: data.title,
      content: data.content,
      tags: data.tags,
      sourceType: 'manual',
    });
    setState(getInspirations());
    setShowAddForm(false);
    toast.success('灵感已记录 ✨');
  };

  const handleAddVideo = (data: {
    title: string;
    content: string;
    url: string;
    tags: string[];
    whyCollect: string;
    planDate?: string;
  }) => {
    const videoId = extractVideoId(data.url);
    addInspirationCard({
      title: data.title,
      content: data.content,
      sourceUrl: data.url,
      tags: data.tags,
      sourceType: 'video',
      whyCollect: data.whyCollect,
      planDate: data.planDate,
      videoId,
    });
    setState(getInspirations());
    setShowAddForm(false);
    toast.success('视频灵感已记录 🎬');
  };

  const handleAddVoice = (data: { title: string; content: string; tags: string[] }) => {
    addInspirationCard({
      title: data.title,
      content: data.content,
      tags: data.tags,
      sourceType: 'voice',
    });
    setState(getInspirations());
    setShowAddForm(false);
    toast.success('语音灵感已记录 🎙️');
  };

  const moveCard = (id: string, direction: 'forward' | 'backward') => {
    const card = state.cards.find((c) => c.id === id);
    if (!card) return;
    const colOrder = KANBAN_COLUMNS.map((c) => c.id);
    const curIdx = colOrder.indexOf(card.status);
    const newIdx = direction === 'forward' ? curIdx + 1 : curIdx - 1;
    if (newIdx < 0 || newIdx >= colOrder.length) return;
    updateInspirationStatus(id, colOrder[newIdx]);
    setState(getInspirations());
  };

  const handleDelete = (id: string) => {
    deleteInspirationCard(id);
    setState(getInspirations());
    setActiveCardId(null);
    toast.success('已删除');
  };

  const handleMonthlyConnect = () => {
    const result = monthlyInspirationConnect();
    // 自动把组里的灵感转成待办（每个标签组创建一个待办项目卡片）
    result.groups.forEach((group) => {
      if (group.cards.length >= 2) {
        // 同标签多条 → 批量移到 todo
        group.cards.forEach((card) => {
          if (card.status === 'backlog') {
            updateInspirationStatus(card.id, 'todo');
          }
        });
      }
    });
    setState(getInspirations());
    setShowConnect(false);
    toast.success(`本月 ${result.totalBacklog} 条灵感，串联为 ${result.groupCount} 个项目 💡`);
  };

  return (
    <div className="space-y-4">
      {/* 顶部操作 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">灵感看板</h2>
          <p className="text-xs text-muted-foreground">灵感 → 待办 → 执行 → 复盘 → 完成</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowConnect(true)}
            className="flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-200"
          >
            <Sparkles className="size-3.5" />
            月度串联
          </button>
          <button
            onClick={() => setShowAddMenu(true)}
            className="flex items-center gap-1 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/20"
          >
            <Plus className="size-4" />
            记录
          </button>
        </div>
      </div>

      {/* 看板：横向滚动 */}
      <div className="-mx-4 overflow-x-auto px-4 pb-4 touch-pan-x">
        <div className="flex gap-3" style={{ minWidth: 'max-content' }}>
          {KANBAN_COLUMNS.map((col) => (
            <div key={col.id} className="w-64 shrink-0">
              <div className={cn('mb-2 flex items-center justify-between rounded-xl px-3 py-2', col.bg)}>
                <div className="flex items-center gap-2">
                  <span className={cn('size-2 rounded-full', col.color)} />
                  <span className={cn('text-sm font-semibold', col.textColor)}>{col.name}</span>
                </div>
                <span className={cn('text-xs', col.textColor)}>{cardsByColumn[col.id].length}</span>
              </div>
              <div className="space-y-2">
                {cardsByColumn[col.id].length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border bg-card/50 p-6 text-center text-xs text-muted-foreground">
                    <Lightbulb className="mx-auto mb-1 size-5 opacity-40" />
                    空空如也
                  </div>
                ) : (
                  cardsByColumn[col.id].map((card) => (
                    <motion.div
                      key={card.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => setActiveCardId(card.id)}
                      className="cursor-pointer rounded-2xl bg-card p-3 shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
                    >
                      <div className="mb-1.5 flex items-start justify-between gap-2">
                        <h4 className="line-clamp-2 flex-1 text-sm font-medium text-foreground">
                          {card.title}
                        </h4>
                        <span className="shrink-0 text-base">
                          {SOURCE_TYPE_META[card.sourceType]?.icon}
                        </span>
                      </div>
                      {card.content && (
                        <p className="mb-2 line-clamp-2 text-xs text-muted-foreground">
                          {card.content}
                        </p>
                      )}
                      {card.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {card.tags.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] text-indigo-600"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 添加菜单弹窗 */}
      <AnimatePresence>
        {showAddMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/40"
              onClick={() => setShowAddMenu(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-1/2 z-[70] w-full max-w-md -translate-x-1/2 rounded-t-3xl bg-card p-5 pb-10 shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground">记录灵感</h3>
                <button
                  onClick={() => setShowAddMenu(false)}
                  className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-accent"
                >
                  <X className="size-4" />
                </button>
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setShowAddMenu(false);
                    setShowAddForm({ mode: 'manual' });
                  }}
                  className="flex w-full items-center gap-3 rounded-2xl bg-indigo-50 p-4 text-left hover:bg-indigo-100/70"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500 text-white">
                    ✍️
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">手动输入</p>
                    <p className="text-xs text-muted-foreground">记录一段文字灵感</p>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setShowAddMenu(false);
                    setShowAddForm({ mode: 'voice' });
                  }}
                  className="flex w-full items-center gap-3 rounded-2xl bg-rose-50 p-4 text-left hover:bg-rose-100/70"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-500 text-white">
                    <Mic className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">语音录制</p>
                    <p className="text-xs text-muted-foreground">说话自动转文字</p>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setShowAddMenu(false);
                    setShowAddForm({ mode: 'video' });
                  }}
                  className="flex w-full items-center gap-3 rounded-2xl bg-violet-50 p-4 text-left hover:bg-violet-100/70"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-500 text-white">
                    <Play className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">视频链接</p>
                    <p className="text-xs text-muted-foreground">收藏好内容慢慢拆解</p>
                  </div>
                </button>
              </div>
              <div className="h-4" />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 添加表单弹窗 */}
      <AnimatePresence>
        {showAddForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/40"
              onClick={() => setShowAddForm(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-1/2 z-[70] max-h-[85vh] w-full max-w-md -translate-x-1/2 overflow-y-auto rounded-t-3xl bg-card p-5 pb-10 shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground">
                  {showAddForm.mode === 'manual' && '手动记录'}
                  {showAddForm.mode === 'voice' && '语音记录'}
                  {showAddForm.mode === 'video' && '视频链接'}
                </h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-accent"
                >
                  <X className="size-4" />
                </button>
              </div>
              {showAddForm.mode === 'manual' && (
                <ManualForm onSubmit={handleAddManual} onCancel={() => setShowAddForm(false)} />
              )}
              {showAddForm.mode === 'voice' && (
                <VoiceForm onSubmit={handleAddVoice} onCancel={() => setShowAddForm(false)} />
              )}
              {showAddForm.mode === 'video' && (
                <VideoForm onSubmit={handleAddVideo} onCancel={() => setShowAddForm(false)} />
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 卡片详情弹窗 */}
      <AnimatePresence>
        {activeCard && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/40"
              onClick={() => setActiveCardId(null)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-1/2 z-[70] max-h-[80vh] w-full max-w-md -translate-x-1/2 overflow-y-auto rounded-t-3xl bg-card p-5 pb-10 shadow-2xl"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span>{SOURCE_TYPE_META[activeCard.sourceType]?.icon}</span>
                    <span className="text-xs text-muted-foreground">
                      {SOURCE_TYPE_META[activeCard.sourceType]?.name}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{activeCard.title}</h3>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleDelete(activeCard.id)}
                    className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-rose-500"
                  >
                    <Trash2 className="size-4" />
                  </button>
                  <button
                    onClick={() => setActiveCardId(null)}
                    className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-accent"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>

              {activeCard.content && (
                <p className="mb-3 rounded-xl bg-muted/30 p-3 text-sm leading-relaxed text-foreground">
                  {activeCard.content}
                </p>
              )}

              {activeCard.sourceUrl && (
                <UniversalLink
                  to={activeCard.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mb-3 flex items-center gap-2 rounded-xl bg-blue-50 p-3 text-sm text-blue-600 hover:bg-blue-100"
                >
                  <Link2 className="size-4" />
                  <span className="truncate">{activeCard.sourceUrl}</span>
                </UniversalLink>
              )}

              {activeCard.whyCollect && (
                <div className="mb-3">
                  <p className="mb-1 text-xs font-medium text-muted-foreground">为什么收藏</p>
                  <p className="text-sm text-foreground">{activeCard.whyCollect}</p>
                </div>
              )}

              {activeCard.tags.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {activeCard.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs text-indigo-600"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              {/* 前后移动 */}
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => moveCard(activeCard.id, 'backward')}
                  disabled={activeCard.status === 'backlog'}
                  className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-muted py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-40"
                >
                  <ChevronLeft className="size-4" />
                  后退
                </button>
                <div className="text-center text-xs text-muted-foreground">
                  {KANBAN_COLUMNS.find((c) => c.id === activeCard.status)?.name}
                </div>
                <button
                  onClick={() => moveCard(activeCard.id, 'forward')}
                  disabled={activeCard.status === 'done'}
                  className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 py-2.5 text-sm font-medium text-white disabled:opacity-40"
                >
                  前进
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 月度串联弹窗 */}
      <AnimatePresence>
        {showConnect && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/40"
              onClick={() => setShowConnect(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-1/2 z-[70] max-h-[80vh] w-full max-w-md -translate-x-1/2 overflow-y-auto rounded-t-3xl bg-card p-5 pb-10 shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground">
                  <Sparkles className="mr-1 inline size-5 text-amber-500" />
                  月度灵感串联
                </h3>
                <button
                  onClick={() => setShowConnect(false)}
                  className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-accent"
                >
                  <X className="size-4" />
                </button>
              </div>
              <MonthlyConnectPanel />
              <button
                onClick={handleMonthlyConnect}
                className="mt-4 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 py-3 text-sm font-semibold text-white"
              >
                一键转为待办项目
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// =================== 子组件 ===================

function ManualForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: { title: string; content: string; tags: string[] }) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');

  const toggleTag = (t: string) => {
    setTags(tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t]);
  };

  const addCustomTag = () => {
    const t = customTag.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
      setCustomTag('');
    }
  };

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      toast.error('请填写标题和内容');
      return;
    }
    onSubmit({ title: title.trim(), content: content.trim(), tags });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">标题</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="给这条灵感起个名字"
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">内容</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="写下你的灵感..."
          rows={4}
          className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        />
      </div>
      <div>
        <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-foreground">
          <Tag className="size-3.5" /> 标签
        </label>
        <div className="mb-2 flex flex-wrap gap-1.5">
          {COMMON_TAGS.map((t) => (
            <button
              key={t}
              onClick={() => toggleTag(t)}
              className={cn(
                'rounded-full px-2.5 py-1 text-xs transition-colors',
                tags.includes(t)
                  ? 'bg-indigo-500 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-accent',
              )}
            >
              #{t}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
            placeholder="自定义标签"
            className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
          <button
            onClick={addCustomTag}
            className="rounded-xl bg-muted px-3 text-sm text-foreground hover:bg-accent"
          >
            添加
          </button>
        </div>
      </div>
      <button
        onClick={handleSubmit}
        className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/20"
      >
        保存到积压碎片
      </button>
    </div>
  );
}

function VoiceForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: { title: string; content: string; tags: string[] }) => void;
  onCancel: () => void;
}) {
  const [recording, setRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // 检测浏览器支持
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
    }
  }, []);

  const startRecording = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'zh-CN';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        let final = '';
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript;
          } else {
            interim += transcript;
          }
        }
        setContent((prev) => {
          // 只追加最终结果
          if (final) return prev + final;
          return prev;
        });
      };

      recognition.onerror = () => {
        setRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
      };

      recognition.onend = () => {
        setRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } catch {
      setSupported(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error('请先填写标题');
      return;
    }
    if (!content.trim()) {
      toast.error('还没有录制内容哦');
      return;
    }
    onSubmit({ title: title.trim(), content: content.trim(), tags });
  };

  const toggleTag = (t: string) => {
    setTags(tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t]);
  };

  return (
    <div className="space-y-3">
      {!supported ? (
        <div className="rounded-xl bg-amber-50 p-4 text-center">
          <p className="mb-2 text-sm font-medium text-amber-700">浏览器暂不支持语音识别</p>
          <p className="text-xs text-amber-600/80">请使用 Chrome / Edge 浏览器，或手动输入文字</p>
        </div>
      ) : (
        <div className="mb-4 text-center">
          <div
            className={cn(
              'mx-auto mb-3 flex size-24 items-center justify-center rounded-full transition-all',
              recording
                ? 'bg-rose-500 scale-110 animate-pulse'
                : 'bg-rose-100 hover:bg-rose-200 cursor-pointer',
            )}
            onClick={recording ? stopRecording : startRecording}
          >
            <Mic className={cn('size-10', recording ? 'text-white' : 'text-rose-500')} />
          </div>
          <div className="mb-1 text-2xl font-bold text-foreground tabular-nums">
            {formatDuration(duration)}
          </div>
          <p className="text-xs text-muted-foreground">
            {recording ? '正在录音，点击停止' : '点击麦克风开始录音'}
          </p>
          {/* 波形动画 */}
          {recording && (
            <div className="mt-3 flex items-end justify-center gap-1 h-8">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 rounded-full bg-rose-400"
                  animate={{
                    height: ['30%', `${30 + Math.random() * 70}%`, '30%'],
                  }}
                  transition={{
                    duration: 0.5 + Math.random() * 0.5,
                    repeat: Infinity,
                    repeatType: 'mirror',
                    delay: i * 0.05,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">标题</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="给这段语音起个标题"
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/30"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          识别结果（可编辑）
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="语音转文字结果..."
          rows={4}
          className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/30"
        />
      </div>
      <div>
        <label className="mb-1.5 text-sm font-medium text-foreground">标签</label>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_TAGS.slice(0, 6).map((t) => (
            <button
              key={t}
              onClick={() => toggleTag(t)}
              className={cn(
                'rounded-full px-2.5 py-1 text-xs transition-colors',
                tags.includes(t)
                  ? 'bg-rose-500 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-accent',
              )}
            >
              #{t}
            </button>
          ))}
        </div>
      </div>
      <button
        onClick={handleSubmit}
        className="w-full rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 py-3 text-sm font-semibold text-white shadow-md shadow-rose-500/20"
      >
        保存语音灵感
      </button>
    </div>
  );
}

function VideoForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: {
    title: string;
    content: string;
    url: string;
    tags: string[];
    whyCollect: string;
    planDate?: string;
  }) => void;
  onCancel: () => void;
}) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [whyCollect, setWhyCollect] = useState('');
  const [planDate, setPlanDate] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const toggleTag = (t: string) => {
    setTags(tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t]);
  };

  const handleSubmit = () => {
    if (!url.trim()) {
      toast.error('请粘贴视频链接');
      return;
    }
    if (!title.trim()) {
      toast.error('请填写标题');
      return;
    }
    onSubmit({
      title: title.trim(),
      content: summary.trim(),
      url: url.trim(),
      tags,
      whyCollect: whyCollect.trim(),
      planDate: planDate || undefined,
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">视频链接</label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="粘贴抖音/B站/YouTube 链接"
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/30"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">标题</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="这个视频讲了什么"
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/30"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          内容简介
        </label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="简要描述视频核心内容..."
          rows={2}
          className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/30"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          为什么收藏？（1句话）
        </label>
        <input
          type="text"
          value={whyCollect}
          onChange={(e) => setWhyCollect(e.target.value)}
          placeholder="比如：想深入学习这个方法"
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/30"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          计划拆解日期
        </label>
        <input
          type="date"
          value={planDate}
          onChange={(e) => setPlanDate(e.target.value)}
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/30"
        />
      </div>
      <div>
        <label className="mb-1.5 text-sm font-medium text-foreground">标签</label>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_TAGS.map((t) => (
            <button
              key={t}
              onClick={() => toggleTag(t)}
              className={cn(
                'rounded-full px-2.5 py-1 text-xs transition-colors',
                tags.includes(t)
                  ? 'bg-violet-500 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-accent',
              )}
            >
              #{t}
            </button>
          ))}
        </div>
      </div>
      <button
        onClick={handleSubmit}
        className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 py-3 text-sm font-semibold text-white shadow-md shadow-violet-500/20"
      >
        保存到积压碎片
      </button>
    </div>
  );
}

function MonthlyConnectPanel() {
  const result = useMemo(() => monthlyInspirationConnect(), []);

  if (result.totalBacklog === 0) {
    return (
      <div className="rounded-2xl bg-muted/30 p-6 text-center">
        <Lightbulb className="mx-auto mb-2 size-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">还没有积压灵感~</p>
        <p className="mt-1 text-xs text-muted-foreground/70">先去记录一些灵感吧</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-indigo-50 p-3">
          <div className="text-xl font-bold text-indigo-600">{result.totalBacklog}</div>
          <div className="text-[11px] text-muted-foreground">积压灵感</div>
        </div>
        <div className="rounded-xl bg-violet-50 p-3">
          <div className="text-xl font-bold text-violet-600">{result.groupCount}</div>
          <div className="text-[11px] text-muted-foreground">可串联项目</div>
        </div>
        <div className="rounded-xl bg-amber-50 p-3">
          <div className="text-xl font-bold text-amber-600">
            {result.groups.filter((g) => g.cards.length >= 2).length}
          </div>
          <div className="text-[11px] text-muted-foreground">同主题项目</div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">按标签分组</p>
        {result.groups.slice(0, 5).map((group) => (
          <div key={group.tag} className="rounded-xl bg-card p-3 shadow-sm">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">#{group.tag}</span>
              <span className="text-xs text-muted-foreground">{group.cards.length} 条</span>
            </div>
            <div className="space-y-1">
              {group.cards.slice(0, 3).map((c) => (
                <div key={c.id} className="flex items-center gap-2">
                  <span>{SOURCE_TYPE_META[c.sourceType]?.icon}</span>
                  <span className="truncate text-xs text-muted-foreground">{c.title}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =================== 工具函数 ===================

function extractVideoId(url: string): string {
  // 抖音
  if (url.includes('douyin.com')) {
    const match = url.match(/video\/(\d+)/);
    if (match) return match[1];
  }
  // B站
  if (url.includes('bilibili.com')) {
    const match = url.match(/\/video\/(BV[\w]+)/);
    if (match) return match[1];
  }
  // YouTube
  if (url.includes('youtube.com')) {
    const match = url.match(/[?&]v=([^&]+)/);
    if (match) return match[1];
  }
  if (url.includes('youtu.be/')) {
    const match = url.match(/youtu\.be\/([^?]+)/);
    if (match) return match[1];
  }
  return '';
}
