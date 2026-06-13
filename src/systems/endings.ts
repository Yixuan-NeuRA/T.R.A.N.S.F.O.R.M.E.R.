// ============================================================================
// PHASE 6 — Career-specific endings (reuse the Phase 5 collapse machinery).
// PHASE 7 — Critical meaning overrides any ending with the Erosion Ending.
// ============================================================================

export interface Ending {
  id: string
  title: string
  notice: string // first line at collapse phase 1
  lines: string[] // final terminated output
}

export const ENDINGS: Record<string, Ending> = {
  master_graduation: {
    id: 'master_graduation',
    title: 'Master Graduation',
    notice: 'Graduation requirements met',
    lines: [
      'Final Evaluation Complete.',
      'Degree Conferred: Master.',
      'A PhD position has been offered.',
      'System Terminated.',
    ],
  },
  master_dropout: {
    id: 'master_dropout',
    title: 'Master Dropout',
    notice: 'Burnout threshold exceeded',
    lines: [
      'Final Evaluation Complete.',
      'Enrollment withdrawn.',
      'You left the academic system.',
      'System Terminated.',
    ],
  },
  master_rejection_exit: {
    id: 'master_rejection_exit',
    title: 'Committee Exit',
    notice: 'Consecutive rejections recorded',
    lines: [
      'Final Evaluation Complete.',
      'The committee recommends discontinuation.',
      'You left the academic system.',
      'System Terminated.',
    ],
  },
  phd_graduation: {
    id: 'phd_graduation',
    title: 'PhD Graduation',
    notice: 'Thesis accepted',
    lines: [
      'Final Evaluation Complete.',
      'Degree Conferred: PhD.',
      'A Postdoc position has been offered.',
      'System Terminated.',
    ],
  },
  phd_dropout: {
    id: 'phd_dropout',
    title: 'Candidacy Terminated',
    notice: 'Burnout collapse',
    lines: [
      'Final Evaluation Complete.',
      'Candidacy terminated.',
      'You mastered-out.',
      'System Terminated.',
    ],
  },
  phd_funding_loss: {
    id: 'phd_funding_loss',
    title: 'Funding Loss',
    notice: 'Funding discontinued',
    lines: [
      'Final Evaluation Complete.',
      'The project is closed.',
      'You left the academic system.',
      'System Terminated.',
    ],
  },
  phd_exit_industry: {
    id: 'phd_exit_industry',
    title: 'Industry Transition',
    notice: 'External offer accepted',
    lines: [
      'Final Evaluation Complete.',
      'Research record archived.',
      'You transitioned to industry.',
      'System Terminated.',
    ],
  },
  phd_stagnation: {
    id: 'phd_stagnation',
    title: 'Stagnation',
    notice: 'Revision requested. Again.',
    lines: [
      'Evaluation inconclusive.',
      'The revision loop does not resolve.',
      'You are still a PhD candidate.',
      'System ...continues.',
    ],
  },
  postdoc_faculty: {
    id: 'postdoc_faculty',
    title: 'Faculty Position',
    notice: 'Faculty review convened',
    lines: [
      'Final Evaluation Complete.',
      'A faculty position is secured.',
      'The system retains you.',
      'System Terminated.',
    ],
  },
  postdoc_exit: {
    id: 'postdoc_exit',
    title: 'Exit Academia',
    notice: 'Exit decision recorded',
    lines: [
      'Final Evaluation Complete.',
      'You chose to leave.',
      'No further optimization required.',
      'System Terminated.',
    ],
  },
  phd_abd: {
    id: 'phd_abd',
    title: 'All But Dissertation',
    notice: 'Departure recorded',
    lines: [
      'Final Evaluation Complete.',
      'You leave with results but no degree.',
      'Status: ABD (All But Dissertation).',
      'System Terminated.',
    ],
  },
  distinguished: {
    id: 'distinguished',
    title: 'Distinguished Researcher',
    notice: 'Standing recognized',
    lines: [
      'Final Evaluation Complete.',
      'Your influence is self-sustaining now.',
      'You step back on your own terms.',
      'System Terminated.',
    ],
  },
  master_extension: {
    id: 'master_extension',
    title: 'Master Extension',
    notice: 'Extension filed',
    lines: [
      'Final Evaluation Complete.',
      'Graduation is deferred. Again.',
      'The program quietly extends.',
      'System Terminated.',
    ],
  },
  erosion: {
    id: 'erosion',
    title: 'Erosion',
    notice: 'Significance not found',
    lines: [
      'Evaluation complete.',
      'Acceptance and rejection are indistinguishable.',
      'All paths resolved identically.',
      'The system continues. The meaning does not.',
      'System Terminated.',
    ],
  },
}

export function getEnding(id: string | null): Ending {
  return (id && ENDINGS[id]) || ENDINGS.master_graduation
}
