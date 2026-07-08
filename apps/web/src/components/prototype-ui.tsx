'use client';

import {
  ArrowLeft,
  Bell,
  ChevronRight,
  CircleUserRound,
  ClipboardList,
  Home,
  LockKeyhole,
  LogOut,
  Menu,
  MessageCircle,
  MessageSquareText,
  Plus,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  UserRound,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import {
  candidateProfile,
  dialogueMessages,
  objectives,
  summary,
  todayMatches,
  viewerProfile,
  type MatchCardView,
} from '../lib/mock-data';
import { A2A_ROUNDS_PER_SIDE, A2A_TOTAL_MESSAGES } from '../../../../packages/shared/src/constants';
import styles from '../app/page.module.css';

const objectiveLabels = [
  { id: 'career', label: '想聊职业', detail: '和正在前进的人对谈' },
  { id: 'mentor', label: '想找 mentor', detail: '找比你早 3-5 年的同行' },
  { id: 'cross', label: '跨界打听', detail: '听不同路径的人怎么判断' },
  { id: 'cofound', label: '找联创', detail: '探索长期合作可能' },
];

const peopleTabs = ['已建立', '潜在'] as const;

const peopleRecords = [
  {
    id: 'sarah',
    profile: {
      ...candidateProfile,
      headline: 'Senior PM @ Stripe',
    },
    status: '已建立',
    href: '/summary/summary_sarah',
  },
  {
    id: 'david',
    profile: {
      name: 'David Liu',
      headline: 'AI 研究员 @ Moonshot',
      avatarUrl: undefined,
      tags: ['ai', 'research'],
      bio: '研究模型评估、Agent 工作流和应用层产品机会。',
    },
    status: '已建立',
    href: '/today',
  },
  {
    id: 'jessie',
    profile: {
      name: 'Jessie Wu',
      headline: 'Growth @ Yiximo',
      avatarUrl: undefined,
      tags: ['growth', 'community'],
      bio: '关注产品增长、社区运营和 AI 工具的真实留存。',
    },
    status: '已建立',
    href: '/empty',
  },
  {
    id: 'daniel',
    profile: todayMatches[1].candidate,
    status: '潜在',
    href: '/today',
  },
] as const;

const chatRecords = [
  {
    id: 'session_sarah',
    title: 'Sarah Chen',
    subtitle: 'A2A Summary 已生成',
    detail: '都在 early-stage AI，并且重视产品判断。',
    href: '/summary/summary_sarah',
    state: 'done',
  },
  {
    id: 'session_daniel',
    title: 'Daniel Liu',
    subtitle: '等待你发出 Invite',
    detail: 'Agent 已草拟开场白，下一轮 14:00。',
    href: '/today',
    state: 'draft',
  },
  {
    id: 'session_live',
    title: 'A2A 进行中',
    subtitle: '第 2 轮 · 预计还要 45 秒',
    detail: '我的 Agent 正在确认对方目标。',
    href: '/a2a/session_sarah',
    state: 'live',
  },
] as const;

interface PrototypeFrameProps {
  children: React.ReactNode;
}

export function PrototypeFrame({ children }: PrototypeFrameProps): JSX.Element {
  return (
    <main className={styles.stage}>
      <section className={styles.board}>
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>Pair · App Interface</p>
          <h1>让 Agent 先替你完成一次高质量对齐。</h1>
          <p>Today、A2A、Summary、公开档案四个核心界面已按 Figma 稿重建为真实组件。</p>
        </div>
        <PhoneShell>{children}</PhoneShell>
      </section>
    </main>
  );
}

function PhoneShell({ children }: PrototypeFrameProps): JSX.Element {
  return (
    <div className={styles.phone}>
      <div className={styles.statusBar}>
        <span>9:41</span>
        <StatusIcons />
      </div>
      {children}
    </div>
  );
}

function StatusIcons(): JSX.Element {
  return (
    <span className={styles.statusIcons} aria-hidden="true">
      <i className={styles.signalIcon}>
        <span />
        <span />
        <span />
      </i>
      <i className={styles.wifiIcon} />
      <i className={styles.batteryIcon} />
    </span>
  );
}

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
}

function Button({ children, onClick, variant = 'primary', className }: ButtonProps): JSX.Element {
  return (
    <button className={`${styles.button} ${styles[variant]} ${className ?? ''}`} onClick={onClick}>
      {children}
    </button>
  );
}

function AgentDot({ thinking = false }: { thinking?: boolean }): JSX.Element {
  return <span className={`${styles.agentDot} ${thinking ? styles.thinking : ''}`} />;
}

function Chip({
  children,
  selected = false,
}: {
  children: React.ReactNode;
  selected?: boolean;
}): JSX.Element {
  return <span className={`${styles.chip} ${selected ? styles.selectedChip : ''}`}>{children}</span>;
}

function ProgressBar({ value }: { value: number }): JSX.Element {
  return (
    <div className={styles.progressTrack}>
      <span className={styles.progressFill} style={{ width: `${value}%` }} />
    </div>
  );
}

export function LoginRoute(): JSX.Element {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function login(): void {
    setLoading(true);
    window.setTimeout(() => router.push('/onboarding'), 240);
  }

  return (
    <PrototypeFrame>
      <div className={styles.screen}>
        <LoginFlightIllustration />
        <div className={styles.titleBlock}>
          <h2>每个职场人都有一个 Agent</h2>
          <p>帮你看人、破冰、初步对齐</p>
        </div>
        <div className={styles.loginSpacer} />
        <p className={styles.caption}>coffee chat 从认识对的人开始</p>
        <Button onClick={login}>{loading ? '登录中...' : '微信一键登录'}</Button>
        <Button variant="secondary" onClick={login}>
          用 Google 登录
        </Button>
        <button className={styles.textLink} onClick={login}>
          已有账号？登录
        </button>
      </div>
    </PrototypeFrame>
  );
}

type OnboardingStep = 'identity' | 'reading' | 'profile' | 'objectives' | 'mode';

export function OnboardingRoute(): JSX.Element {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>('identity');
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>(['mentor']);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (step !== 'reading') {
      return undefined;
    }

    const timer = window.setTimeout(() => setStep('profile'), 1800);
    return () => window.clearTimeout(timer);
  }, [step]);

  useToastTimer(toast, setToast);

  function toggleObjective(id: string): void {
    setSelectedObjectives((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }

      if (current.length >= 3) {
        setToast('最多先选 3 个目标');
        return current;
      }

      return [...current, id];
    });
  }

  return (
    <PrototypeFrame>
      {step === 'identity' && <IdentityScreen onNext={() => setStep('reading')} />}
      {step === 'reading' && <ReadingScreen progress={58} />}
      {step === 'profile' && <ProfileScreen onNext={() => setStep('objectives')} />}
      {step === 'objectives' && (
        <ObjectivesScreen
          selected={selectedObjectives}
          onToggle={toggleObjective}
          onNext={() => {
            if (selectedObjectives.length === 0) {
              setToast('至少选择 1 个目标');
              return;
            }

            setStep('mode');
          }}
        />
      )}
      {step === 'mode' && <ModeScreen onNext={() => router.push('/today')} />}
      {toast && <div className={styles.toast}>{toast}</div>}
    </PrototypeFrame>
  );
}

function IdentityScreen({ onNext }: { onNext: () => void }): JSX.Element {
  return (
    <div className={styles.screen}>
      <div className={styles.titleBlock}>
        <h2>让你的 Agent 先读懂你</h2>
        <p>30 秒内基于你的公开资料生成一份档案，你可以改任意字段</p>
      </div>
      <label className={styles.inputLabel}>
        <span>公开资料</span>
        <input value="https://linkedin.com/in/jingfei" readOnly />
      </label>
      <SourceIllustration />
      <Button onClick={onNext}>让 Agent 读</Button>
    </div>
  );
}

function ReadingScreen({ progress }: { progress: number }): JSX.Element {
  return (
    <div className={styles.screen}>
      <div className={styles.titleBlockCenter}>
        <h2>这是 Agent 看到的你</h2>
      </div>
      <AgentOrbitIllustration />
      <ul className={styles.checkList}>
        <li>正在分析 12 篇内容...</li>
        <li>正在提炼你的关键标签...</li>
        <li>构建中...</li>
      </ul>
      <ProgressBar value={progress} />
    </div>
  );
}

function ProfileScreen({ onNext }: { onNext: () => void }): JSX.Element {
  return (
    <div className={styles.screen}>
      <div className={styles.titleBlockCenter}>
        <h2>这是 Agent 看到的你</h2>
      </div>
      <ProfileCard profile={viewerProfile} />
      <div className={styles.inlineAction}>
        <span>Agent 置信度较高</span>
        <button onClick={onNext}>改一改</button>
      </div>
      <Button onClick={onNext}>下一步</Button>
    </div>
  );
}

interface ObjectivesScreenProps {
  selected: string[];
  onToggle: (id: string) => void;
  onNext: () => void;
}

function ObjectivesScreen({ selected, onToggle, onNext }: ObjectivesScreenProps): JSX.Element {
  return (
    <div className={styles.screen}>
      <div className={styles.titleBlock}>
        <h2>你想用 Pair 找什么样的人？</h2>
        <p>选 1-3 项，之后随时可改</p>
      </div>
      <div className={styles.optionList}>
        {objectiveLabels.map((item) => (
          <button
            key={item.id}
            className={`${styles.optionCard} ${selected.includes(item.id) ? styles.optionActive : ''}`}
            onClick={() => onToggle(item.id)}
          >
            <span>{item.label}</span>
            <small>{item.detail}</small>
          </button>
        ))}
      </div>
      <Button onClick={onNext}>下一步</Button>
    </div>
  );
}

function ModeScreen({ onNext }: { onNext: () => void }): JSX.Element {
  return (
    <div className={styles.screen}>
      <div className={styles.titleBlock}>
        <h2>Agent 和对方 Agent 谈的时候，你想...</h2>
      </div>
      <div className={styles.modeCard}>
        <div>
          <AgentDot />
          <strong>托付型 · 推荐</strong>
        </div>
        <p>让 Agent 谈完，我看摘要决定见不见</p>
        <ul>
          <li>更省心，1-2 分钟出结果</li>
          <li>适合大多数职场破冰场景</li>
        </ul>
      </div>
      <div className={styles.optionCard}>
        <span>参与型</span>
        <small>每一条 Agent 发言我先审一下</small>
      </div>
      <Button onClick={onNext}>完成注册</Button>
    </div>
  );
}

export function TodayRoute(): JSX.Element {
  const router = useRouter();
  const [matches, setMatches] = useState<MatchCardView[]>(todayMatches);
  const [activeMatch, setActiveMatch] = useState<MatchCardView>(todayMatches[0]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useToastTimer(toast, setToast);

  function sendMatch(match: MatchCardView): void {
    setActiveMatch(match);
    setDrawerOpen(false);
    router.push('/a2a/session_sarah');
  }

  return (
    <PrototypeFrame>
      <div className={styles.appScreen}>
        <header className={styles.appHeader}>
          <div>
            <h2>下午好，jingfei</h2>
            <p>
              <AgentDot /> Agent · 扫了 247 人 ·<br />3 位待你事 · 下一轮 14:00
            </p>
          </div>
        </header>
        <section className={styles.todayContent}>
          <p className={styles.sectionLabel}>今日匹配</p>
          <MatchCard
            match={matches[0]}
            featured
            onOpen={() => {
              setActiveMatch(matches[0]);
              setDrawerOpen(true);
            }}
            onPass={() => {
              setMatches((current) => (current.slice(1).length ? current.slice(1) : todayMatches));
              setToast('已跳过，Agent 会调整下一轮推荐');
            }}
            onRewrite={() => {
              setToast('已换一种更自然的开场');
            }}
            onSend={() => sendMatch(matches[0])}
          />
          {matches.slice(1).map((match) => (
            <CompactMatchCard
              key={match.id}
              match={match}
              onOpen={() => {
                setActiveMatch(match);
                setDrawerOpen(true);
              }}
            />
          ))}
        </section>
        <button
          className={styles.fab}
          aria-label="new match"
          onClick={() => setToast('已加入下一轮扫描队列')}
        >
          <Plus size={26} />
        </button>
        <BottomNav active="Today" />
      </div>
      {drawerOpen && (
        <MatchDrawer
          match={activeMatch}
          onClose={() => setDrawerOpen(false)}
          onSend={() => sendMatch(activeMatch)}
        />
      )}
      {toast && <div className={styles.toast}>{toast}</div>}
    </PrototypeFrame>
  );
}

interface MatchCardProps {
  match: MatchCardView;
  featured?: boolean;
  onOpen: () => void;
  onPass: () => void;
  onRewrite: () => void;
  onSend: () => void;
}

function MatchCard({
  match,
  featured = false,
  onOpen,
  onPass,
  onRewrite,
  onSend,
}: MatchCardProps): JSX.Element {
  return (
    <article className={`${styles.matchCard} ${featured ? styles.matchFeatured : ''}`}>
      <button className={styles.matchMain} onClick={onOpen}>
        <div className={styles.matchTop}>
          <div>
            <h3>{match.candidate.name}</h3>
            <p>{match.candidate.headline}</p>
          </div>
          <span className={styles.expiryBadge}>
            <ClockGlyph /> {match.expiresInHours}h
          </span>
        </div>
        <div className={styles.chips}>
          {match.candidate.tags.map((tag) => (
            <Chip key={tag}>#{tag}</Chip>
          ))}
        </div>
        <p className={styles.matchReason}>
          <strong>Why ta:</strong>
          <span>{match.whyMatch}</span>
        </p>
        <p className={styles.agentDraft}>
          <strong>Agent drafted:</strong>
          <span>“{match.activeIntro}”</span>
        </p>
      </button>
      <div className={styles.cardActions}>
        <Button className={styles.smallButton} onClick={onSend}>
          发出
        </Button>
        <Button className={styles.smallButton} variant="secondary" onClick={onRewrite}>
          改写
        </Button>
        <Button className={styles.smallButton} variant="ghost" onClick={onPass}>
          Pass
        </Button>
      </div>
    </article>
  );
}

function CompactMatchCard({
  match,
  onOpen,
}: {
  match: MatchCardView;
  onOpen: () => void;
}): JSX.Element {
  return (
    <button className={styles.compactMatchCard} onClick={onOpen}>
      <div>
        <h3>{match.candidate.name}</h3>
        <p>{match.candidate.headline}</p>
      </div>
      <span className={styles.doubleChevron}>
        <ChevronRight size={18} />
        <ChevronRight size={18} />
      </span>
    </button>
  );
}

interface MatchDrawerProps {
  match: MatchCardView;
  onClose: () => void;
  onSend: () => void;
}

function MatchDrawer({ match, onClose, onSend }: MatchDrawerProps): JSX.Element {
  return (
    <div className={styles.drawerLayer}>
      <button className={styles.drawerScrim} onClick={onClose} aria-label="close drawer" />
      <aside className={styles.drawer}>
        <div className={styles.drawerHeader}>
          <button onClick={onClose} aria-label="back">
            <ArrowLeft size={18} />
          </button>
          <button onClick={onClose} aria-label="menu">
            <Menu size={18} />
          </button>
        </div>
        <ProfileCard profile={match.candidate} />
        <div className={styles.detailBlock}>
          <p className={styles.sectionLabel}>建议话题</p>
          {match.topics.map((topic) => (
            <p key={topic}>· {topic}</p>
          ))}
        </div>
        <Button onClick={onSend}>发出 Invite</Button>
      </aside>
    </div>
  );
}

export function A2ARoute({ sessionId = 'session_sarah' }: { sessionId?: string }): JSX.Element {
  const router = useRouter();
  const [visibleMessages, setVisibleMessages] = useState(1);
  const messages = dialogueMessages;
  const totalMessages = A2A_TOTAL_MESSAGES;
  const progress = useMemo(
    () => Math.min(100, Math.round((visibleMessages / totalMessages) * 100)),
    [totalMessages, visibleMessages],
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setVisibleMessages((current) => {
        if (current >= messages.length) {
          window.clearInterval(timer);
          window.setTimeout(() => router.push('/summary/summary_sarah'), 700);
          return current;
        }

        return current + 1;
      });
    }, 1050);

    return () => window.clearInterval(timer);
  }, [messages.length, router, sessionId]);

  const shown = messages.slice(0, visibleMessages);
  const candidateName = 'Sarah';

  return (
    <PrototypeFrame>
      <div className={styles.appScreen}>
        <header className={styles.a2aHeader}>
          <button onClick={() => router.push('/today')} aria-label="back">
            <ArrowLeft size={24} />
          </button>
          <div>
            <strong>双方 Agent 正在对齐</strong>
            <p>预计 1–2 分钟 · 【映射】</p>
          </div>
        </header>
        <section className={styles.a2aMeta}>
          <p>
            两个 Agent · {A2A_ROUNDS_PER_SIDE} 轮对齐 · 第{' '}
            {Math.max(1, Math.ceil(visibleMessages / 2))} 轮
          </p>
        </section>
        <section className={styles.timeline}>
          {shown.map((message) => (
            <article
              key={message.id}
              className={
                message.speakerAgentUserId === 'viewer'
                  ? styles.timelineMine
                  : styles.timelineTheirs
              }
            >
              <p>
                {message.speakerAgentUserId === 'viewer'
                  ? '我的 Agent'
                  : `${candidateName} 的 Agent`}
              </p>
              <span>{message.content}</span>
            </article>
          ))}
          {visibleMessages < messages.length && (
            <>
              <div className={styles.thinkingLine}>
                <span className={styles.thinkingRing} />
                Agent thinking...
              </div>
              <div className={styles.typingDots}>
                <span />
                <span />
                <span />
              </div>
            </>
          )}
        </section>
        <div className={styles.bottomActions}>
          <p className={styles.countdown}>预计还要 45 秒</p>
          <ProgressBar value={progress} />
          <Button
            variant="secondary"
            onClick={() => {
              router.push('/today');
            }}
          >
            截停对话
          </Button>
          <button className={styles.textLink} onClick={() => router.push('/chats')}>
            切换到参与型 ↗
          </button>
        </div>
      </div>
    </PrototypeFrame>
  );
}

export function SummaryRoute({ summaryId: _summaryId = 'summary_sarah' }: { summaryId?: string }): JSX.Element {
  const router = useRouter();
  const [toast, setToast] = useState<string | null>(null);
  const currentSummary = summary;

  useToastTimer(toast, setToast);

  return (
    <PrototypeFrame>
      <div className={styles.appScreen}>
        <header className={styles.a2aHeader}>
          <button onClick={() => router.push('/today')} aria-label="back">
            <ArrowLeft size={24} />
          </button>
        </header>
        <SummaryMark />
        <section className={styles.summaryHero}>
          <p>对齐完成</p>
          <h2>
            对齐度 <span>{currentSummary.alignmentScore}</span> / 10
          </h2>
          <strong>{currentSummary.scoreReason}</strong>
        </section>
        <section className={styles.summaryCards}>
          <article>
            <p>你眼中的 Sarah</p>
            <span>{currentSummary.yourViewOfThem}</span>
          </article>
          <article>
            <p>Sarah 眼中的你</p>
            <span>{currentSummary.theirViewOfYou}</span>
          </article>
        </section>
        <section className={styles.topicGrid}>
          {currentSummary.topics.map((topic) => (
            <Chip key={topic} selected>
              {topic}
            </Chip>
          ))}
        </section>
        <div className={styles.bottomActions}>
          <Button onClick={() => router.push('/feedback')}>安排见面</Button>
          <Button variant="secondary" onClick={() => router.push('/u/jingfei')}>
            我先看看
          </Button>
          <button className={styles.textLink} onClick={() => router.push('/people')}>
            不感兴趣 · 看光靠对话
          </button>
        </div>
      </div>
      {toast && <div className={styles.toast}>{toast}</div>}
    </PrototypeFrame>
  );
}

export function PublicProfileRoute({ slug = 'jingfei' }: { slug?: string }): JSX.Element {
  const router = useRouter();
  const profile = slug === 'sarah' ? candidateProfile : viewerProfile;
  const visibleObjectives = objectives;

  return (
    <PrototypeFrame>
      <div className={styles.publicPage}>
        <header className={styles.publicHeader}>
          <strong>Pair</strong>
          <div>
            <button onClick={() => router.push('/login')}>登录 / 加入</button>
            <button onClick={() => router.back()} aria-label="menu">
              <Menu size={24} />
            </button>
          </div>
        </header>
        <section className={styles.publicCard}>
          <PortraitSketch />
          <h2>{profile.name}</h2>
          <p>{profile.headline}</p>
          <div className={styles.chipsCentered}>
            {profile.tags.map((tag) => (
              <Chip key={tag}>#{tag}</Chip>
            ))}
          </div>
          <span>{profile.bio}</span>
        </section>
        <section className={styles.publicIntent}>
          <p>我想用 Pair 聊</p>
          <ul>
            {visibleObjectives.map((objective) => (
              <li key={`${objective.kind}-${objective.side}`}>{objective.kind}</li>
            ))}
          </ul>
        </section>
        <Button onClick={() => router.push('/login')}>让 Agent 帮我介绍你</Button>
        <div className={styles.qr}>PAIR</div>
      </div>
    </PrototypeFrame>
  );
}

export function PeopleRoute(): JSX.Element {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<(typeof peopleTabs)[number]>('已建立');
  const [toast, setToast] = useState<string | null>(null);
  useToastTimer(toast, setToast);

  const visiblePeople = peopleRecords.filter((record) => {
    return record.status === activeTab;
  });

  return (
    <PrototypeFrame>
      <div className={styles.appScreen}>
        <header className={styles.peopleHeader}>
          <h2>我的 Connections</h2>
          <nav className={styles.segmentTabs} aria-label="people filters">
            {peopleTabs.map((tab) => (
              <button
                key={tab}
                className={activeTab === tab ? styles.segmentActive : ''}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </nav>
        </header>

        {visiblePeople.length > 0 ? (
          <section className={styles.peopleList}>
            {visiblePeople.map((record) => (
              <button
                key={record.id}
                className={styles.personRow}
                onClick={() => router.push(record.href)}
              >
                <PortraitSketch compact label={record.profile.name.slice(0, 1)} />
                <span>
                  <strong>{record.profile.name}</strong>
                  <small>{record.profile.headline}</small>
                </span>
              </button>
            ))}
          </section>
        ) : (
          <EmptyPanel
            title="今天还没扫到值得惦的人"
            description="下一轮 14:00，Agent 会继续帮你见缝插针一般地扫 + 过滤。"
            actionLabel="回 Today"
            onAction={() => router.push('/today')}
          />
        )}

        <BottomNav active="People" />
      </div>
      {toast && <div className={styles.toast}>{toast}</div>}
    </PrototypeFrame>
  );
}

export function ChatsRoute(): JSX.Element {
  const router = useRouter();

  return (
    <PrototypeFrame>
      <div className={styles.appScreen}>
        <header className={styles.routeHeader}>
          <h2>Chats</h2>
          <p>Agent 对齐记录，不是真人聊天收件箱。</p>
        </header>
        <section className={styles.chatList}>
          {chatRecords.map((record) => (
            <button
              key={record.id}
              className={styles.chatRow}
              onClick={() => router.push(record.href)}
            >
              <span className={`${styles.chatState} ${styles[`chatState_${record.state}`]}`}>
                {record.state === 'live' ? <AgentDot thinking /> : <MessageSquareText size={18} />}
              </span>
              <span>
                <strong>{record.title}</strong>
                <small>{record.subtitle}</small>
                <em>{record.detail}</em>
              </span>
              <ChevronRight size={20} />
            </button>
          ))}
        </section>
        <BottomNav active="Chats" />
      </div>
    </PrototypeFrame>
  );
}

export function MeRoute(): JSX.Element {
  const router = useRouter();
  const [toast, setToast] = useState<string | null>(null);
  useToastTimer(toast, setToast);

  const settingsItems = [
    { icon: CircleUserRound, label: '我的档案', detail: viewerProfile.headline, action: () => router.push('/u/jingfei') },
    { icon: ClipboardList, label: '我的 objectives', detail: 'mentor · cross_industry', action: () => router.push('/onboarding') },
    { icon: MessageCircle, label: 'A2A 模式偏好', detail: '托付型', action: () => router.push('/onboarding') },
    { icon: Bell, label: '通知设置', detail: '下一轮提醒 14:00', action: () => setToast('通知设置已打开') },
    { icon: SlidersHorizontal, label: '屏蔽列表', detail: '0 人', action: () => setToast('当前没有屏蔽对象') },
    { icon: LockKeyhole, label: '隐私设置', detail: '公开页已脱敏', action: () => router.push('/u/jingfei') },
    { icon: ShieldCheck, label: '关于 Pair', detail: 'Phase 1 prototype', action: () => setToast('Pair · A2A 职场连接平台') },
  ] as const;

  return (
    <PrototypeFrame>
      <div className={styles.appScreen}>
        <header className={styles.routeHeader}>
          <h2>Settings</h2>
        </header>
        <section className={styles.settingsList}>
          {settingsItems.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.label} className={styles.settingsRow} onClick={item.action}>
                <Icon size={24} />
                <span>
                  <strong>{item.label}</strong>
                  <small>{item.detail}</small>
                </span>
                <ChevronRight size={22} />
              </button>
            );
          })}
        </section>
        <button className={styles.logoutButton} onClick={() => router.push('/login')}>
          <LogOut size={18} />
          退出登录
        </button>
        <BottomNav active="Me" />
      </div>
      {toast && <div className={styles.toast}>{toast}</div>}
    </PrototypeFrame>
  );
}

export function FeedbackRoute(): JSX.Element {
  const router = useRouter();
  const [met, setMet] = useState<boolean | null>(true);
  const [score, setScore] = useState(4);
  const [toast, setToast] = useState<string | null>(null);
  useToastTimer(toast, setToast);

  return (
    <PrototypeFrame>
      <div className={styles.appScreen}>
        <header className={styles.routeHeader}>
          <h2>会后反馈卡</h2>
          <p>帮 Agent 学会下一次怎么替你判断。</p>
        </header>
        <section className={styles.feedbackForm}>
          <p>见到了吗？</p>
          <div className={styles.choiceGrid}>
            <button className={met === true ? styles.choiceActive : ''} onClick={() => setMet(true)}>
              是
            </button>
            <button className={met === false ? styles.choiceActive : ''} onClick={() => setMet(false)}>
              否
            </button>
          </div>
          <p>这次对话后的收益感（1 避坑 - 5 超值）</p>
          <div className={styles.starRow} aria-label="feedback score">
            {[1, 2, 3, 4, 5].map((item) => (
              <button
                key={item}
                className={item <= score ? styles.starActive : ''}
                onClick={() => setScore(item)}
                aria-label={`${item} star`}
              >
                <Star size={34} />
              </button>
            ))}
          </div>
          <label className={styles.feedbackNote}>
            <span>你还想补什么吗？</span>
            <input readOnly value="例如：收获见人 / 方向启发 / 人脉补..." />
          </label>
          <Button onClick={() => setToast('反馈已提交，Agent 会更新推荐偏好')}>提交反馈</Button>
          <Button variant="secondary" onClick={() => router.push('/people')}>
            回 People
          </Button>
        </section>
      </div>
      {toast && <div className={styles.toast}>{toast}</div>}
    </PrototypeFrame>
  );
}

export function EmptyRoute(): JSX.Element {
  const router = useRouter();

  return (
    <PrototypeFrame>
      <div className={styles.appScreen}>
        <EmptyPanel
          title="今天还没扫到值得惦的人"
          description="下一轮 14:00，色彩低饱和地继续见缝插针一般 + 扫描。"
          actionLabel="回 Today"
          onAction={() => router.push('/today')}
        />
        <button className={styles.fab} aria-label="start scan" onClick={() => router.push('/today')}>
          <Plus size={26} />
        </button>
      </div>
    </PrototypeFrame>
  );
}

export function ErrorStateRoute(): JSX.Element {
  const router = useRouter();

  return (
    <PrototypeFrame>
      <div className={styles.appScreen}>
        <section className={styles.errorPanel}>
          <ErrorCloud />
          <h2>加载失败</h2>
          <p>深棕金网络给你整丢。</p>
          <Button onClick={() => router.push('/today')}>重试</Button>
          <button className={styles.textLink} onClick={() => router.push('/today')}>
            返回首页
          </button>
        </section>
      </div>
    </PrototypeFrame>
  );
}

export function PlaceholderRoute({
  active,
  title,
  description,
}: {
  active: 'Today' | 'People' | 'Chats' | 'Me';
  title: string;
  description: string;
}): JSX.Element {
  return (
    <PrototypeFrame>
      <div className={styles.appScreen}>
        <section className={styles.placeholder}>
          <AgentDot />
          <h2>{title}</h2>
          <p>{description}</p>
          <Link className={styles.routeLink} href="/today">
            回到 Today
          </Link>
        </section>
        <BottomNav active={active} />
      </div>
    </PrototypeFrame>
  );
}

export function Demo2ReferenceRoute(): JSX.Element {
  const screens = [
    ['01 登录', '/demo2/01-01-登录.webp'],
    ['02 添加身份', '/demo2/02-02-添加身份.webp'],
    ['03 Agent 抓取 / 档案预览', '/demo2/03-03-Agent-抓取-档案预览.webp'],
    ['04 Objectives 选择', '/demo2/04-04-Objectives-选择.webp'],
    ['05 A2A 模式偏好', '/demo2/05-05-A2A-模式偏好.webp'],
    ['06 Today 主屏', '/demo2/06-06-Today-主屏.webp'],
    ['07 A2A 预览 · 托付型', '/demo2/07-07-A2A-预览-托付型.webp'],
    ['08 A2A Summary 卡片', '/demo2/08-08-A2A-Summary-卡片.webp'],
    ['09 Pair 公开档案 H5', '/demo2/09-09-Pair-公开档案-H5.webp'],
    ['10 人详情 Drawer', '/demo2/10-10-人详情-Drawer.webp'],
    ['11 People 页', '/demo2/11-11-People-页.webp'],
    ['12 Settings', '/demo2/12-12-Settings.webp'],
    ['13 会后反馈卡', '/demo2/13-13-会后反馈卡.webp'],
    ['14 空状态', '/demo2/14-14-空状态.webp'],
    ['15 错误态', '/demo2/15-15-错误态.webp'],
  ] as const;

  return (
    <main className={styles.referencePage}>
      <header>
        <p className={styles.kicker}>PAIR DEMO2 REFERENCE</p>
        <h1>demo 2.html screens</h1>
        <Link className={styles.routeLink} href="/today">
          回到原型
        </Link>
      </header>
      <section className={styles.generatedAssetBlock}>
        <div>
          <p className={styles.kicker}>GENERATED ASSET SHEET</p>
          <h2>Pair hand-drawn illustrations v1</h2>
          <p>用于裁切和替换 demo2 里不清晰的插图区域。</p>
        </div>
        <img src="/generated/pair-illustration-sheet-v1.png" alt="Pair generated illustration sheet" />
      </section>
      <section className={styles.referenceGrid}>
        {screens.map(([title, src]) => (
          <figure key={src}>
            <img src={src} alt={title} />
            <figcaption>{title}</figcaption>
          </figure>
        ))}
      </section>
    </main>
  );
}

function ProfileCard({ profile }: { profile: typeof viewerProfile }): JSX.Element {
  return (
    <article className={styles.profileCard}>
      <PortraitSketch compact label={profile.name.slice(0, 1)} />
      <h3>{profile.name}</h3>
      <p>{profile.headline}</p>
      <div className={styles.chipsCentered}>
        {profile.tags.map((tag) => (
          <Chip key={tag}>#{tag}</Chip>
        ))}
      </div>
      <span>{profile.bio}</span>
    </article>
  );
}

function LoginFlightIllustration(): JSX.Element {
  return (
    <div className={styles.loginArt}>
      <svg viewBox="0 0 300 150" role="img" aria-label="Agent flight path">
        <defs>
          <radialGradient id="agentSphere" cx="35%" cy="25%" r="72%">
            <stop offset="0%" stopColor="#e2a14f" />
            <stop offset="100%" stopColor="#b66529" />
          </radialGradient>
        </defs>
        <circle cx="58" cy="92" r="18" fill="url(#agentSphere)" />
        <path
          d="M82 82 C126 42 162 111 203 74 C228 52 246 62 260 28"
          fill="none"
          stroke="#6f6a62"
          strokeDasharray="7 8"
          strokeLinecap="round"
          strokeWidth="1.6"
        />
        <path
          d="M256 30 L266 22 L264 36"
          fill="none"
          stroke="#171512"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}

function SourceIllustration(): JSX.Element {
  return (
    <div className={styles.sourceArt}>
      <svg viewBox="0 0 300 190" role="img" aria-label="Profile source illustration">
        <path
          d="M122 46 C145 38 178 42 194 58 C206 71 203 137 193 150 C178 169 134 166 118 149 C106 137 105 61 122 46Z"
          fill="none"
          stroke="#171512"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
        <path
          d="M132 45 C151 51 183 45 194 62 M120 148 C139 141 169 166 193 148"
          fill="none"
          stroke="#a39e96"
          strokeLinecap="round"
          strokeWidth="1.5"
        />
        <rect x="132" y="82" width="58" height="42" rx="12" fill="#d83d3d" />
        <text x="161" y="109" fill="#fff" fontSize="18" fontWeight="700" textAnchor="middle">
          小红书
        </text>
        <path
          d="M82 88 C96 78 109 79 119 92 M82 88 L58 88 C47 88 39 96 39 107 L39 139 C39 151 48 158 60 158 L96 158 C107 158 114 151 115 140 L116 116"
          fill="none"
          stroke="#171512"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
        <text x="76" y="134" fill="#171512" fontFamily="Georgia,serif" fontSize="34" fontWeight="700" textAnchor="middle">
          in
        </text>
        <circle cx="240" cy="122" r="32" fill="none" stroke="#171512" strokeWidth="2" />
        <path
          d="M211 122 H269 M240 90 C223 105 223 139 240 154 M240 90 C257 105 257 139 240 154 M218 106 C232 112 248 112 262 106 M218 138 C232 132 248 132 262 138"
          fill="none"
          stroke="#171512"
          strokeLinecap="round"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}

function AgentOrbitIllustration(): JSX.Element {
  return (
    <div className={styles.orbitArt}>
      <svg viewBox="0 0 270 210" role="img" aria-label="Agent orbit illustration">
        <defs>
          <radialGradient id="orbitSphere" cx="34%" cy="26%" r="72%">
            <stop offset="0%" stopColor="#e2a14f" />
            <stop offset="100%" stopColor="#b66529" />
          </radialGradient>
        </defs>
        <circle cx="88" cy="120" r="24" fill="url(#orbitSphere)" />
        <path
          d="M39 112 C44 54 111 23 166 45 C218 66 232 123 203 166"
          fill="none"
          stroke="#171512"
          strokeDasharray="18 10"
          strokeLinecap="round"
          strokeWidth="1.8"
        />
        <path
          d="M61 145 C72 177 128 184 157 154 C183 127 169 82 132 75"
          fill="none"
          stroke="#171512"
          strokeLinecap="round"
          strokeWidth="1.8"
        />
        <path
          d="M31 142 C78 198 178 196 219 128"
          fill="none"
          stroke="#a39e96"
          strokeDasharray="7 9"
          strokeLinecap="round"
          strokeWidth="1.4"
        />
        <path
          d="M156 76 L147 69 M156 76 L146 82 M204 164 L217 164 L211 176"
          fill="none"
          stroke="#171512"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
        <circle cx="188" cy="112" r="10" fill="none" stroke="#171512" strokeWidth="1.6" />
      </svg>
    </div>
  );
}

function PortraitSketch({
  compact = false,
  label,
}: {
  compact?: boolean;
  label?: string;
}): JSX.Element {
  if (compact) {
    return (
      <div className={styles.avatarSketch} aria-label={`${label ?? ''} portrait sketch`}>
        <svg viewBox="0 0 72 72" role="img">
          <path
            d="M22 33 C22 20 31 14 43 18 C53 21 57 31 54 43 C51 58 29 59 23 45 C22 41 21 37 22 33Z"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2"
          />
          <path
            d="M21 34 C31 34 36 22 50 29 M28 20 C35 12 50 14 55 29"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.7"
          />
          <path d="M31 38 H32 M43 38 H44" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
          <path
            d="M34 48 C38 51 42 51 46 48"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.7"
          />
          <path
            d="M20 55 C26 62 46 63 54 55"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={styles.portraitSketch} aria-label="hand drawn portrait">
      <svg viewBox="0 0 96 96" role="img">
        <circle cx="48" cy="48" r="38" fill="none" stroke="#e5dfd5" strokeWidth="2" />
        <path
          d="M32 46 C33 31 45 24 59 30 C70 35 73 47 68 61 C63 76 40 76 33 62 C31 58 30 52 32 46Z"
          fill="none"
          stroke="#171512"
          strokeLinecap="round"
          strokeWidth="2"
        />
        <path
          d="M31 48 C44 49 51 36 66 41 M39 31 C50 20 67 27 72 43 M36 70 C43 79 59 79 66 69"
          fill="none"
          stroke="#6f6a62"
          strokeLinecap="round"
          strokeWidth="1.6"
        />
        <path d="M41 51 H42 M57 51 H58" stroke="#171512" strokeLinecap="round" strokeWidth="3" />
        <path d="M46 60 C50 63 54 63 58 60" fill="none" stroke="#171512" strokeLinecap="round" strokeWidth="1.8" />
      </svg>
    </div>
  );
}

function BottomNav({ active }: { active: 'Today' | 'People' | 'Chats' | 'Me' }): JSX.Element {
  const items = [
    { label: 'Today', href: '/today', icon: Home },
    { label: 'People', href: '/people', icon: Users },
    { label: 'Chats', href: '/chats', icon: MessageCircle },
    { label: 'Me', href: '/me', icon: UserRound },
  ] as const;

  return (
    <nav className={styles.bottomNav}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.label}
            href={item.href}
            className={active === item.label ? styles.navActive : ''}
          >
            <Icon size={18} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function ClockGlyph(): JSX.Element {
  return (
    <svg className={styles.clockGlyph} viewBox="0 0 18 18" aria-hidden="true">
      <circle cx="9" cy="9" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M9 5.5 V9 L11.5 10.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

function SummaryMark(): JSX.Element {
  return (
    <div className={styles.summaryMark} aria-hidden="true">
      <AgentDot />
      <svg viewBox="0 0 220 62">
        <path
          d="M18 31 C50 9 83 50 111 30 C143 7 171 51 202 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.6"
        />
        <path
          d="M42 31 C70 20 86 41 111 30 C138 17 151 38 178 29"
          fill="none"
          stroke="currentColor"
          strokeDasharray="4 8"
          strokeLinecap="round"
          strokeWidth="1"
        />
      </svg>
      <AgentDot />
    </div>
  );
}

function EmptyPanel({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}): JSX.Element {
  return (
    <section className={styles.emptyPanel}>
      <MeetingSketch />
      <h2>{title}</h2>
      <p>{description}</p>
      <Button onClick={onAction}>{actionLabel}</Button>
    </section>
  );
}

function MeetingSketch(): JSX.Element {
  return (
    <svg className={styles.meetingSketch} viewBox="0 0 260 190" role="img" aria-label="empty meeting">
      <path
        d="M50 130 C68 104 91 104 108 130 M152 130 C169 104 193 104 210 130"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M67 130 L67 168 M91 130 L96 168 M170 130 L164 168 M194 130 L194 168"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M88 101 C93 80 114 72 129 86 C143 99 137 124 119 129 C101 134 83 121 88 101Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M151 104 C156 84 176 77 190 90 C203 103 197 125 181 130 C164 134 147 122 151 104Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path d="M86 150 H190" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      <circle cx="130" cy="74" r="22" fill="none" stroke="currentColor" strokeDasharray="5 7" strokeWidth="2" />
      <circle cx="130" cy="74" r="13" fill="url(#emptyAgent)" />
      <defs>
        <radialGradient id="emptyAgent" cx="35%" cy="25%" r="72%">
          <stop offset="0%" stopColor="#d29a62" />
          <stop offset="100%" stopColor="#7f5c3b" />
        </radialGradient>
      </defs>
    </svg>
  );
}

function ErrorCloud(): JSX.Element {
  return (
    <svg className={styles.errorCloud} viewBox="0 0 230 170" role="img" aria-label="error state">
      <defs>
        <radialGradient id="errorAgent" cx="35%" cy="25%" r="72%">
          <stop offset="0%" stopColor="#d29a62" />
          <stop offset="100%" stopColor="#7f5c3b" />
        </radialGradient>
      </defs>
      <path
        d="M55 107 C29 106 21 72 45 60 C48 34 81 24 99 43 C116 18 159 29 163 65 C191 61 207 88 191 110 C180 126 148 120 115 120 C92 120 74 126 55 107Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
      />
      <path d="M105 72 L112 79 L119 72 M79 72 L86 79 L93 72" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
      <path d="M97 98 C106 90 118 90 127 98" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
      <circle cx="115" cy="125" r="24" fill="url(#errorAgent)" />
      <path d="M104 124 H126" stroke="#141210" strokeDasharray="2 6" strokeLinecap="round" strokeWidth="3" />
    </svg>
  );
}

function useToastTimer(
  toast: string | null,
  setToast: React.Dispatch<React.SetStateAction<string | null>>,
): void {
  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = window.setTimeout(() => setToast(null), 2000);
    return () => window.clearTimeout(timer);
  }, [setToast, toast]);
}
