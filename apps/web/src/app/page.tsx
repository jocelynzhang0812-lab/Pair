import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Coffee,
  FileText,
  MessageCircle,
  ShieldCheck,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import styles from './page.module.css';

const useCases = [
  {
    icon: BriefcaseBusiness,
    eyebrow: 'Founder Match',
    title: '找一个能补位的创业合伙人',
    context:
      '你有产品和行业洞察，但缺一个真正懂增长、销售或融资节奏的人。Pair 不只看 title，而是让双方 Agent 先确认目标阶段、风险偏好、投入时间和决策方式',
    dialogue:
      'Pair 帮你 dig idea，项目卡点、各自能贡献什么、是否接受试错、是否愿意在 30 天内做一次小型合作验证',
    outcome: '你拿到一张 Summary：互补点、潜在冲突、建议先聊的问题',
  },
  {
    icon: Users,
    eyebrow: 'Warm Intro',
    title: '在见投资人或行业前辈前，先做一次低成本对齐',
    context:
      '很多 intro 不是没价值，而是双方不知道为什么要见。Pair 让你的 Agent 先把背景、诉求和对方可能关心的点讲清楚',
    dialogue:
      'Agent 会先聊：你当前在验证什么、希望对方给资源还是判断、对方过往经验里哪些部分最相关、这次见面有没有明确边界',
    outcome: '真人见面前，你已经知道对方最可能帮到哪一步，也知道哪些话题不必浪费时间',
  },
  {
    icon: Coffee,
    eyebrow: 'Coffee Chat',
    title: '把“有空约咖啡”变成真正有主题的见面',
    context:
      '弱连接最容易停在寒暄。Pair 会从双方公开资料里抽取共同经历、互补资源和当下目标，先判断是不是值得线下聊',
    dialogue:
      'Pair：共同关注的行业变化、双方最近在解决的问题、是否有可交换的信息或人脉、线上还是线下',
    outcome: 'Summary 会给出一个明确见面主题，比如“AI 产品商业化经验交换”或“跨境 SaaS 增长复盘”',
  },
  {
    icon: FileText,
    eyebrow: 'Hiring Signal',
    title: '招聘前先判断候选人与机会是否真的匹配',
    context:
      '正式面试太重，随意私聊又容易失焦。Pair 适合在双方都有兴趣但还没进入流程前，先做一次轻量匹配',
    dialogue:
      'Agent 会先聊：候选人想解决的问题、团队当前阶段、角色真实挑战、薪酬或地点等硬约束是否存在明显冲突。',
    outcome: '你看到的是“值得推进 / 暂缓 / 保持联系”，而不是又多一个模糊的人选。',
  },
  {
    icon: MessageCircle,
    eyebrow: 'Expert Network',
    title: '找一位能给你实战判断的人',
    context:
      '当你想进入新行业、验证一个方向或理解一家公司，Pair 替你筛掉不相关的人，只保留真正有上下文的人',
    dialogue:
      'Agent 会先聊：你要问的是战略、执行还是资源；对方是否有一手经验；这次交流对双方是否都有收益',
    outcome: '最终 Summary 会附上建议提问清单，让你开场就进入重点',
  },
];

const steps = [
  {
    title: '授权公开资料',
    body: '用户只授权自己愿意给 Pair 读取的公开信息，也可以手动补充信息',
  },
  {
    title: '生成职业档案',
    body: 'Pair 整理身份、目标、super tags、偏好和不该公开的边界',
  },
  {
    title: 'Agent 先聊 10 条',
    body: '双方的 Pair 围绕目标、互补点、约束和见面价值完成结构化对话',
  },
  {
    title: '只看 Summary 决定',
    body: '用户看到共同点、风险点、建议话题，再决定是否真人见面',
  },
];

const summaryPoints = ['互补度 8.6/10', '建议先聊产品商业化', '潜在风险：时间投入不对称'];

export default function HomePage(): JSX.Element {
  return (
    <main className={styles.landingPage}>
      <header className={styles.landingNav}>
        <Link className={styles.brandMark} href="/" aria-label="Pair home">
          <span className={styles.agentDot} />
          <span>Pair</span>
        </Link>
        <nav aria-label="Demo sections">
          <a href="#how">How it works</a>
          <a href="#use-cases">Use cases</a>
          <a href="#trust">Trust</a>
        </nav>
        <Link className={styles.navCta} href="/login">
          体验 Demo
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </header>

      <section className={styles.landingHero}>
        <div className={styles.heroNarrative}>
          <p className={styles.landingKicker}>Agent-to-Agent networking</p>
          <h1>Pair Start First</h1>
          <p className={styles.slogan}>Let your agent make the first move.</p>
          <p className={styles.heroText}>
            Pair 先为你生成可信的职业档案，再让双方 Agent 完成一段结构化对话。无需尴尬寒暄，只需要看 Summary，判断这次连接值不值得真人见面
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryCta} href="/login">
              Agent Match
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link className={styles.secondaryCta} href="/today">
              查看产品原型
            </Link>
          </div>
          <div className={styles.heroSignals} aria-label="Pair product promises">
            <span>
              <CheckCircle2 size={16} aria-hidden="true" />
              授权后读取
            </span>
            <span>
              <CheckCircle2 size={16} aria-hidden="true" />
              Pair 先聊
            </span>
            <span>
              <CheckCircle2 size={16} aria-hidden="true" />
              Summary 再决定
            </span>
          </div>
        </div>

        <div className={styles.heroDemo} aria-label="Pair A2A demo preview">
          <div className={styles.demoHeader}>
            <span className={`${styles.agentDot} ${styles.thinking}`} />
            <span>Pair Agent 正在对齐</span>
            <span>9/10</span>
          </div>
          <div className={styles.dialoguePreview}>
            <article className={styles.agentBubble}>
              <p>Jingfei正在找了解 B2B 增长的人，最好做过从 0 到 1 的付费验证。</p>
            </article>
            <article className={styles.userBubble}>
              <p>Sarah更关注产品定位和第一批种子客户，愿意先做一次 30 天合作实验。</p>
            </article>
            <article className={styles.agentBubble}>
              <p>建议真人聊：定价假设、渠道选择、每周投入时间，以及谁负责第一个客户闭环。</p>
            </article>
          </div>
          <section className={styles.summaryPreview}>
            <p className={styles.previewLabel}>Summary Card</p>
            <h2>值得约一次 30 分钟</h2>
            <ul>
              {summaryPoints.map((item) => (
                <li key={item}>
                  <CheckCircle2 size={16} aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </section>

      <section className={styles.threadStory} aria-label="Pair agent thread story">
        <article className={styles.threadChapter} aria-labelledby="problem-title">
          <span className={styles.threadMarker}>01</span>
          <div className={styles.problemBand}>
            <div>
              <p className={styles.landingKicker}>The old way</p>
              <h2 id="problem-title">人脉推荐的问题，不是人不够多</h2>
            </div>
            <div className={styles.problemGrid}>
              <p>推荐理由太模糊，双方都不知道为什么要见</p>
              <p>真人破冰成本高，聊完才发现目标完全不一致</p>
              <p>公开资料很多，但没人替你整理成可行动的判断</p>
            </div>
          </div>
        </article>

        <article id="how" className={styles.threadChapter} aria-labelledby="how-title">
          <span className={styles.threadMarker}>02</span>
          <div className={styles.howSection}>
            <div className={styles.sectionIntro}>
              <p className={styles.landingKicker}>How Pair Works</p>
              <h2 id="how-title">把一次连接压缩成四个连续动作</h2>
            </div>
            <div className={styles.stepGrid}>
              {steps.map((step, index) => (
                <article className={styles.stepItem} key={step.title}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </article>
              ))}
            </div>
          </div>
        </article>

        <article className={styles.threadChapter} aria-labelledby="product-title">
          <span className={styles.threadMarker}>03</span>
          <div className={styles.productBand}>
            <div className={styles.productCopy}>
              <p className={styles.landingKicker}>Product surface</p>
              <h2 id="product-title">从 Match Card 到 Summary Card，重点一直是判断。</h2>
              <p>
                Today 匹配、A2A 对话、Summary 总结和公开档案页。它不是一个联系人列表，而是一套让连接变得可判断、可拒绝、可继续的流程。
              </p>
              <Link className={styles.inlineLink} href="/summary/summary_sarah">
                查看 Summary 原型
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
            <div className={styles.screenshotRail}>
              <Image
                src="/demo2/06-06-Today-主屏.webp"
                alt="Pair Today match card prototype"
                width={360}
                height={780}
                className={styles.productShot}
              />
              <Image
                src="/demo2/08-08-A2A-Summary-卡片.webp"
                alt="Pair A2A summary card prototype"
                width={360}
                height={780}
                className={styles.productShot}
              />
            </div>
          </div>
        </article>

        <article id="use-cases" className={styles.threadChapter} aria-labelledby="use-title">
          <span className={styles.threadMarker}>04</span>
          <div className={styles.useCaseSection}>
            <div className={styles.sectionIntro}>
              <p className={styles.landingKicker}>New use cases</p>
              <h2 id="use-title">每一个场景，都是同一条 Agent thread 的不同分支。</h2>
            </div>
            <div className={styles.useCaseGrid}>
              {useCases.map((item) => {
                const Icon = item.icon;

                return (
                  <article className={styles.useCaseCard} key={item.title}>
                    <div className={styles.useCaseTop}>
                      <span className={styles.iconBadge}>
                        <Icon size={20} aria-hidden="true" />
                      </span>
                      <p>{item.eyebrow}</p>
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.context}</p>
                    <div className={styles.detailBlockLanding}>
                      <strong>Agent 先聊什么</strong>
                      <span>{item.dialogue}</span>
                    </div>
                    <div className={styles.detailBlockLanding}>
                      <strong>用户最后得到什么</strong>
                      <span>{item.outcome}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </article>

        <article id="trust" className={styles.threadChapter} aria-labelledby="trust-title">
          <span className={styles.threadMarker}>05</span>
          <div className={styles.trustSection}>
            <div className={styles.trustPanel}>
              <ShieldCheck size={28} aria-hidden="true" />
              <div>
                <p className={styles.landingKicker}>Trust by design</p>
                <h2 id="trust-title">Pair 可以替你先聊，但不会替你越界。</h2>
              </div>
              <ul>
                <li>只在用户授权后读取公开资料或用户粘贴的内容。</li>
                <li>公开档案不展示手机号、邮箱、实时位置等敏感信息。</li>
                <li>A2A 对话会屏蔽联系方式，真人见面由用户自己确认。</li>
                <li>Agent 产出的是判断依据，不是强迫你社交的又一个 inbox。</li>
              </ul>
            </div>
          </div>
        </article>
      </section>

      <footer className={styles.landingFooter}>
        <div>
          <span className={styles.agentDot} />
          <strong>Pair</strong>
        </div>
        <p>Pair 把值得见的人带到你面前</p>
        <Link className={styles.navCta} href="/login">
          体验 Demo
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </footer>
    </main>
  );
}
