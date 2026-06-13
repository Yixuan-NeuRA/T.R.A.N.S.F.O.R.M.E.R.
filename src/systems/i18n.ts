// ============================================================================
// Lightweight i18n. English is the source language; strings are keyed by their
// English text. Untranslated strings gracefully fall back to English.
// Persisted to localStorage and synced across tabs.
// ============================================================================

import { create } from 'zustand'

export type Lang = 'en' | 'zh'

const KEY = 'transformer.lang'

function load(): Lang {
  try {
    const v = localStorage.getItem(KEY)
    if (v === 'zh' || v === 'en') return v
  } catch {
    /* ignore */
  }
  // No saved choice yet → follow the browser language.
  try {
    if (
      typeof navigator !== 'undefined' &&
      navigator.language &&
      navigator.language.toLowerCase().startsWith('zh')
    ) {
      return 'zh'
    }
  } catch {
    /* ignore */
  }
  return 'en'
}

interface LangStore {
  lang: Lang
  setLang: (l: Lang) => void
  toggle: () => void
}

export const useLang = create<LangStore>((set, get) => ({
  lang: load(),
  setLang: (l) => {
    set({ lang: l })
    try {
      localStorage.setItem(KEY, l)
    } catch {
      /* ignore */
    }
  },
  toggle: () => get().setLang(get().lang === 'en' ? 'zh' : 'en'),
}))

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === KEY && (e.newValue === 'zh' || e.newValue === 'en')) {
      useLang.setState({ lang: e.newValue })
    }
  })
}

// English -> Chinese dictionary. Anything missing falls back to English.
const ZH: Record<string, string> = {
  // --- Wizard / start screen ---
  'T.R.A.N.S.F.O.R.M.E.R — Configuration Wizard': 'T.R.A.N.S.F.O.R.M.E.R — 配置向导',
  'Different academic civilizations produce knowledge in fundamentally different ways. Configure your run — this choice is permanent.':
    '不同的学术文明以根本不同的方式生产知识。配置你的这一局——选择一经确定不可更改。',
  Civilization: '文明',
  Discipline: '学科',
  'Career Stage': '职业阶段',
  'Research Environment': '研究环境',
  '# choose a civilization first': '# 请先选择文明',
  'native to this field': '该领域的母语环境',
  '▶ Launch Simulation': '▶ 开始模拟',
  'Select a civilization, discipline and career to continue.':
    '请选择文明、学科与职业以继续。',

  // --- Civilizations ---
  STEM: 'STEM(理工）',
  'Social Science': '社会科学',
  Humanities: '人文',
  Professional: '专业',
  Creative: '创意',
  'Knowledge emerges through experiments, models, and reproducibility.':
    '知识通过实验、模型与可复现性产生。',
  'Knowledge emerges through interpretation of human systems.':
    '知识通过对人类系统的诠释产生。',
  'Knowledge emerges through argument, interpretation, and context.':
    '知识通过论证、诠释与语境产生。',
  'Knowledge exists to influence practice.': '知识是为了影响实践而存在。',
  'Knowledge emerges through creation.': '知识通过创作产生。',

  // --- Disciplines ---
  'Computer Science': '计算机科学',
  'Artificial Intelligence': '人工智能',
  'Physics / Mathematics': '物理 / 数学',
  Engineering: '工程',
  Chemistry: '化学',
  'Life Sciences': '生命科学',
  'Environmental Science': '环境科学',
  Psychology: '心理学',
  Sociology: '社会学',
  'Political Science': '政治学',
  Economics: '经济学',
  Education: '教育学',
  History: '历史学',
  Philosophy: '哲学',
  Literature: '文学',
  Classics: '古典学',
  Medicine: '医学',
  Law: '法学',
  Design: '设计',
  Architecture: '建筑',
  'Media Arts': '媒体艺术',

  // --- Careers ---
  'Master Student': '硕士生',
  'PhD Candidate': '博士候选人',
  'Postdoc Researcher': '博士后',
  'Tutorial · fragile system': '教程 · 脆弱系统',
  'Core game · balanced': '核心 · 平衡',
  'Endgame · endurance': '终局 · 耐力',
  'Learn the system and survive the pressure. Forgiving reviewers, slower burnout, lower reward ceiling.':
    '学习系统并在压力中生存。审稿宽松、倦怠较慢、奖励上限较低。',
  'Survive the system and publish meaningful work. Standard difficulty. Requires 3 accepted papers and a thesis.':
    '在系统中生存并发表有意义的成果。标准难度,需 3 篇录用论文加一篇学位论文。',
  'Survive the productivity system indefinitely. No fixed graduation — you must choose how it ends. Harsh reviewers, fast burnout, high reward scaling.':
    '无限期地在产出系统中生存。没有固定毕业——你必须自己选择如何结束。审稿严苛、倦怠快、奖励缩放高。',

  // --- Status / panels ---
  Day: '天',
  Capacity: '容量',
  Steady: '稳定',
  Strained: '紧张',
  Overloaded: '超载',
  Critical: '危急',
  Network: '网络',
  'Network View': '网络视图',
  Influence: '影响力',
  Collaboration: '合作',
  'Citation graph': '引用图',
  '# no accepted work yet': '# 暂无录用成果',
  'Cited work attracts more citations; influence eases future review.':
    '被引越多越易被引;影响力让未来审稿更宽松。',
  'Field standing': '领域排位',
  You: '你',
  Rank: '排名',
  Advisor: '导师',
  Funding: '经费',
  Comfortable: '充裕',
  Adequate: '尚可',
  Tight: '紧张',
  'Running out': '即将耗尽',
  Devoted: '鼎力支持',
  Supportive: '支持',
  Cordial: '融洽',
  Distant: '疏远',
  '⏳ grant decision pending...': '⏳ 经费审批中……',
  'Grant rejected. Back to the drawing board.': '经费申请被拒。从头再来。',
  'Grant application submitted. The panel will deliberate.':
    '经费申请已提交。评审组将进行评议。',
  'A grant decision is already pending.': '已有一项经费申请在审。',
  'Funding ran out. The lab cannot continue.': '经费耗尽。实验室无法维持。',
  '[field] A collaboration soured — you were scooped on first authorship.':
    '[领域] 一段合作破裂——你的一作被人抢了。',
  Eminent: '泰斗',
  Established: '资深',
  Rising: '上升',
  Unknown: '默默无闻',
  Strong: '紧密',
  Moderate: '中等',
  Weak: '微弱',
  Isolated: '孤立',
  'system interpretation': '系统解读',
  'File Browser': '文件浏览器',
  'File Browser · read-only': '文件浏览器 · 只读',
  Archived: '已归档',
  'No Kernel': '无内核',
  'kernel: healthy': '内核:健康',
  'kernel: terminated': '内核:已终止',
  'kernel: subtle drift': '内核:轻微漂移',
  'kernel: system instability': '内核:系统不稳',
  'kernel: critical breakdown': '内核:严重崩溃',
  'Archive mode — workspace is read-only.': '归档模式——工作区只读。',
  '⏳ awaiting decision... (advance days to hear back)':
    '⏳ 等待裁决中……(推进天数以获知结果)',
  'Researcher capacity': '研究者容量',
  'System Query:\nWhy are you continuing this project?':
    '系统询问:\n你为什么还在继续这个项目?',
  '(it is difficult to feel the difference.)': '(已经很难感觉到差别了。)',

  // --- Daily modifiers ---
  'Focused Day': '专注日',
  'Tired Day': '疲惫日',
  'Coffee Day': '咖啡日',
  'Experiment rewards +50%': '实验消耗 −50%',
  'Energy costs +50%': '精力消耗 +50%',
  'Coffee Break restores +50%': '咖啡恢复 +50%',

  // --- Narrative compression ---
  'You are operating under sustained structural pressure. The system is compressing your available decision space.':
    '你正处于持续的结构性压力之下。系统正在压缩你可用的决策空间。',
  'Your work is no longer interpreted consistently across the system. Meaning has become context-dependent.':
    '你的工作在系统中不再被一致地解读。意义已变得依赖语境。',
  'Your outputs are not yet stabilized within the academic network.':
    '你的产出尚未在学术网络中稳定下来。',
  'Your work is increasingly interpreted through prior reputation rather than content alone.':
    '你的工作越来越多地通过既有声望、而非内容本身被解读。',
  'Evaluation is not converging across reviewers. Outcome depends on venue interpretation variance.':
    '各审稿人的评价无法收敛。结果取决于场域的解读方差。',

  // --- Random events ---
  'You are invited to review for a venue.': '你被邀请为某场域审稿。',
  'A collaboration is proposed over coffee.': '咖啡间提出了一项合作。',
  'An experiment yields an unexpected breakthrough.': '一次实验带来意外突破。',
  'A short sabbatical is granted. You actually rest.': '获批一次短假。你真的休息了。',
  'A grant is awarded.': '拿到一笔经费。',
  'Your advisor praises your recent progress.': '导师表扬了你近期的进展。',
  'You travel to a conference and make connections.': '你去参加会议并结识了人脉。',
  'Administrative duties pile up.': '行政事务堆积如山。',
  'A competing group published your idea first.': '一个竞争团队抢先发表了你的想法。',
  'One of your papers is suddenly widely cited.': '你的一篇论文突然被广泛引用。',

  // --- Endings (titles + lines) ---
  'Master Graduation': '硕士毕业',
  'Master Dropout': '硕士退学',
  'Committee Exit': '委员会劝退',
  'Master Extension': '硕士延期',
  'PhD Graduation': '博士毕业',
  'Candidacy Terminated': '资格终止',
  'Funding Loss': '断经费',
  Stagnation: '停滞',
  'Industry Transition': '转入工业界',
  'All But Dissertation': 'ABD(差一篇论文)',
  'Faculty Position': '教职',
  'Exit Academia': '离开学界',
  'Distinguished Researcher': '功成身退',
  Erosion: '侵蚀',
  'Finalizing academic record...': '正在归档学术记录……',
  'Preparing system shutdown...': '正在准备系统关闭……',
  'Final Evaluation Complete.': '最终评估完成。',
  'Degree Conferred: Master.': '授予学位:硕士。',
  'Degree Conferred: PhD.': '授予学位:博士。',
  'A PhD position has been offered.': '已获得一个博士职位。',
  'A Postdoc position has been offered.': '已获得一个博士后职位。',
  'System Terminated.': '系统已终止。',
  'Enrollment withdrawn.': '学籍注销。',
  'You left the academic system.': '你离开了学术系统。',
  'The committee recommends discontinuation.': '委员会建议终止。',
  'Graduation is deferred. Again.': '毕业再次被推迟。',
  'The program quietly extends.': '项目悄然延期。',
  'Candidacy terminated.': '候选资格终止。',
  'You mastered-out.': '你以硕士身份退出。',
  'The project is closed.': '项目关闭。',
  'Research record archived.': '研究记录归档。',
  'You transitioned to industry.': '你转入了工业界。',
  'Evaluation inconclusive.': '评估无定论。',
  'The revision loop does not resolve.': '返修循环无法终结。',
  'You are still a PhD candidate.': '你仍然是一名博士候选人。',
  'System ...continues.': '系统……仍在继续。',
  'A faculty position is secured.': '获得了一个教职。',
  'The system retains you.': '系统将你留了下来。',
  'You chose to leave.': '你选择了离开。',
  'No further optimization required.': '不再需要进一步优化。',
  'You leave with results but no degree.': '你带着成果离开,却没有学位。',
  'Status: ABD (All But Dissertation).': '状态:ABD(差一篇学位论文)。',
  'Your influence is self-sustaining now.': '你的影响力如今已自我维系。',
  'You step back on your own terms.': '你以自己的方式功成身退。',
  'Acceptance and rejection are indistinguishable.': '录用与拒稿已无从分辨。',
  'All paths resolved identically.': '所有路径殊途同归。',
  'The system continues. The meaning does not.': '系统仍在继续,意义却已不在。',
  'Evaluation complete.': '评估完成。',

  // --- Dev panel chrome ---
  Save: '保存',
  Reset: '重置',

  // --- Action result log lines ---
  'Experiment failed — no usable result.': '实验失败——没有可用结果。',
  'Experiment yielded usable data (+1 data)': '实验得到可用数据(+1 数据)',
  'Experiment — unexpected breakthrough! (+1 data, +meaning)':
    '实验——意外突破!(+1 数据,+意义)',
  'Collected usable data (+1 data)': '采集到可用数据(+1 数据)',
  'Data collection came up empty.': '数据采集一无所获。',
  'A paper proved useful (+1 knowledge)': '一篇论文很有用(+1 知识)',
  'Read papers — nothing stuck.': '读了论文——什么也没记住。',
  'Literature review sparked an idea (+1 idea)': '文献综述激发了灵感(+1 灵感)',
  'Literature review — no new ideas.': '文献综述——没有新想法。',
  'Wrote a usable section (+1 narrative)': '写出一段可用内容(+1 叙事)',
  'Wrote and deleted. Nothing usable.': '写了又删,毫无可用。',
  'Replied to emails': '回复了邮件',
  'A talk inspired you (+2 ideas)': '一场报告启发了你(+2 灵感)',
  'Attended a forgettable talk.': '听了一场乏味的报告。',
  'Networked (+1 reputation)': '社交(+1 声望)',
  'Networked — a collaboration forms (+1 reputation)': '社交——结成一项合作(+1 声望)',
  'Networked — no connection made.': '社交——没建立联系。',
  Slept: '睡觉',
  Rested: '休息',
  'Coffee break taken': '喝了杯咖啡',
  'Deep thought (+1 idea)': '深度思考(+1 灵感)',
  'Pondered, inconclusively.': '冥思苦想,毫无结论。',

  // --- Prefixed log lines (events / system / field) ---
  '[event] You are invited to review for a venue.': '[事件] 你被邀请为某场域审稿。',
  '[event] A collaboration is proposed over coffee.': '[事件] 咖啡间提出了一项合作。',
  '[event] An experiment yields an unexpected breakthrough.': '[事件] 一次实验带来意外突破。',
  '[event] A short sabbatical is granted. You actually rest.':
    '[事件] 获批一次短假。你真的休息了。',
  '[event] A grant is awarded.': '[事件] 拿到一笔经费。',
  '[event] Your advisor praises your recent progress.': '[事件] 导师表扬了你近期的进展。',
  '[event] You travel to a conference and make connections.': '[事件] 你去参加会议并结识了人脉。',
  '[event] Administrative duties pile up.': '[事件] 行政事务堆积如山。',
  '[event] A competing group published your idea first.': '[事件] 一个竞争团队抢先发表了你的想法。',
  '[event] One of your papers is suddenly widely cited.': '[事件] 你的一篇论文突然被广泛引用。',
  '[field] A competing model surpassed your approach.': '[领域] 一个竞争模型超越了你的方法。',
  '[field] Community attention shifted elsewhere.': '[领域] 社区的注意力转向了别处。',

  // --- Reviewer #2 (civilization voices + key overrides) ---
  'Reviewer #2: Limited novelty.': '审稿人2:创新性有限。',
  'Reviewer #2: Methodology is inadequate.': '审稿人2:方法学不充分。',
  'Reviewer #2: Results are not convincing.': '审稿人2:结果不令人信服。',
  'Reviewer #2: The contribution is unclear.': '审稿人2:贡献不明确。',
  'Reviewer #2: The hypothesis is underspecified.': '审稿人2:假设界定不清。',
  'Reviewer #2: Causal inference is weak.': '审稿人2:因果推断薄弱。',
  'Reviewer #2: The effect is not robust.': '审稿人2:效应不稳健。',
  'Reviewer #2: Interpretation is not sufficiently supported.': '审稿人2:解释缺乏充分支撑。',
  'Reviewer #2: The argument is underdeveloped.': '审稿人2:论证不够充分。',
  'Reviewer #2: The scholarly engagement is thin.': '审稿人2:学术对话单薄。',
  'Reviewer #2: The evidence is selective.': '审稿人2:证据有选择性。',
  'Reviewer #2: The interpretation lacks originality.': '审稿人2:诠释缺乏原创性。',
  'Reviewer #2: The contribution to practice is unclear.': '审稿人2:对实践的贡献不明确。',
  'Reviewer #2: Methodological rigor is insufficient.': '审稿人2:方法严谨性不足。',
  'Reviewer #2: The findings are not actionable.': '审稿人2:结论不具可操作性。',
  'Reviewer #2: The framing is not convincing.': '审稿人2:论述框架不令人信服。',
  'Reviewer #2: The concept is not original enough.': '审稿人2:概念不够原创。',
  'Reviewer #2: The process is underexplained.': '审稿人2:过程阐述不足。',
  'Reviewer #2: The execution is uneven.': '审稿人2:完成度参差不齐。',
  'Reviewer #2: The critical reflection is thin.': '审稿人2:批判性反思单薄。',
  'Reviewer #2: Not novel enough.': '审稿人2:不够新颖。',
  'Reviewer #2: Mathematical derivation insufficient.': '审稿人2:数学推导不足。',
  'Reviewer #2: Interpretation is unclear.': '审稿人2:解释不清晰。',
  'Reviewer #2: Identification strategy is insufficient.': '审稿人2:识别策略不足。',
  'Reviewer #2: The argument remains underdeveloped.': '审稿人2:论证仍不充分。',
  'Reviewer #2: Clinical relevance is unclear.': '审稿人2:临床相关性不明确。',
  'Reviewer #2: Insufficient engagement with precedent.': '审稿人2:对先例的探讨不足。',
  'Reviewer #2: Aesthetically interesting, but the contribution is unclear.':
    '审稿人2:在美学上有趣,但贡献不明确。',
}

export function translate(s: string, lang: Lang): string {
  if (lang === 'en') return s
  return ZH[s] ?? s
}

export function useT() {
  const lang = useLang((s) => s.lang)
  return { lang, t: (s: string) => translate(s, lang) }
}
