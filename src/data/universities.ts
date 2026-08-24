export interface University {
  id: string;
  name: string;
  location: string;
  country: 'USA' | 'UK' | 'Canada' | 'Singapore' | 'Europe';
  tier: 'Pinnacle / Ivy+' | 'Global Top 30' | 'High-ROI STEM' | 'Selective Direct-Admit';
  acceptanceRate: string;
  portfolioType: 'SlideRoom Maker' | 'Research Preprint' | 'AIF / Technical Form' | 'UCAS Technical Narrative' | 'Direct Video/Paper';
  primaryPortal: string;
  facultyReview: boolean;
  recommendedSpike: string;
  keyDeadlines: string;
  description: string;
}

export const UNIVERSITIES: University[] = [
  {
    id: 'mit',
    name: 'Massachusetts Institute of Technology (MIT)',
    location: 'Cambridge, MA',
    country: 'USA',
    tier: 'Pinnacle / Ivy+',
    acceptanceRate: '~4.5%',
    portfolioType: 'SlideRoom Maker',
    primaryPortal: 'MIT Application Portal + SlideRoom',
    facultyReview: true,
    recommendedSpike: 'Original hardware/software prototype, open-source repository, or novel computational algorithm showing iterative failure analysis.',
    keyDeadlines: 'EA: Nov 1 | RA: Jan 4',
    description: 'Pioneered the Maker Portfolio. Evaluated directly by MIT engineering & EECS faculty members, focusing on unstructured problem-solving and technical craftsmanship.'
  },
  {
    id: 'cmu',
    name: 'Carnegie Mellon University (CMU)',
    location: 'Pittsburgh, PA',
    country: 'USA',
    tier: 'Pinnacle / Ivy+',
    acceptanceRate: '~11% (SCS: <4%)',
    portfolioType: 'SlideRoom Maker',
    primaryPortal: 'Common App + SlideRoom',
    facultyReview: true,
    recommendedSpike: 'Advanced algorithmic implementations, systems programming, or machine learning papers demonstrating discrete math foundations.',
    keyDeadlines: 'ED I: Nov 1 | ED II: Jan 3 | RD: Jan 3',
    description: 'School of Computer Science (SCS) rigorously checks supplementary technical materials and coding repositories for exceptional software design.'
  },
  {
    id: 'stanford',
    name: 'Stanford University',
    location: 'Stanford, CA',
    country: 'USA',
    tier: 'Pinnacle / Ivy+',
    acceptanceRate: '~3.7%',
    portfolioType: 'Research Preprint',
    primaryPortal: 'Common App + Arts/Research SlideRoom',
    facultyReview: true,
    recommendedSpike: 'Peer-reviewed preprints, interdisciplinary AI applications (AI + Bio/Agri/Social), or high-impact entrepreneurial tech solutions.',
    keyDeadlines: 'REA: Nov 1 | RD: Jan 5',
    description: 'Looks for intellectual vitality. Research abstracts and technical supplements are routed to corresponding department mentors for academic validation.'
  },
  {
    id: 'waterloo',
    name: 'University of Waterloo',
    location: 'Waterloo, Ontario',
    country: 'Canada',
    tier: 'High-ROI STEM',
    acceptanceRate: '~15% (CS/SE: <7%)',
    portfolioType: 'AIF / Technical Form',
    primaryPortal: 'OUAC + Admission Information Form (AIF)',
    facultyReview: false,
    recommendedSpike: 'CEMC Euclid & CCC contest distinction, production-grade full-stack apps, and demonstrated self-taught software engineering skills.',
    keyDeadlines: 'Application: Feb 1 | AIF: Mid-Feb',
    description: 'World-renowned co-op program. The AIF requires applicants to detail self-directed programming projects, contest scores, and engineering problem-solving.'
  },
  {
    id: 'imperial',
    name: 'Imperial College London',
    location: 'London',
    country: 'UK',
    tier: 'Global Top 30',
    acceptanceRate: '~11% (Computing: <7%)',
    portfolioType: 'UCAS Technical Narrative',
    primaryPortal: 'UCAS (Course-specific)',
    facultyReview: true,
    recommendedSpike: 'TMUA / ESAT test performance, analysis of foundational papers in distributed systems or deep learning in the personal statement.',
    keyDeadlines: 'UCAS Equal Consideration: Jan 29',
    description: 'Pure academic meritocracy. 80% of the UCAS personal statement must analyze advanced subject readings, computational problem sets, and mathematical rigor.'
  },
  {
    id: 'oxford',
    name: 'University of Oxford',
    location: 'Oxford',
    country: 'UK',
    tier: 'Pinnacle / Ivy+',
    acceptanceRate: '~6% (Computer Science)',
    portfolioType: 'UCAS Technical Narrative',
    primaryPortal: 'UCAS + MAT / Interview',
    facultyReview: true,
    recommendedSpike: 'MAT (Mathematics Admissions Test) mastery, deep exploration of discrete mathematics, logic proofs, and algorithmic problem sets.',
    keyDeadlines: 'Hard Deadline: Oct 15',
    description: 'Tutors evaluate applicants through mathematical entrance tests and technical admissions interviews where candidates live-solve unseen proof problems.'
  },
  {
    id: 'cambridge',
    name: 'University of Cambridge',
    location: 'Cambridge',
    country: 'UK',
    tier: 'Pinnacle / Ivy+',
    acceptanceRate: '~8% (Computer Science)',
    portfolioType: 'UCAS Technical Narrative',
    primaryPortal: 'UCAS + TMUA / College Interview',
    facultyReview: true,
    recommendedSpike: 'TMUA distinction, foundational understanding of computer systems, lambda calculus, or number theory projects.',
    keyDeadlines: 'Hard Deadline: Oct 15',
    description: 'Admissions decisions depend on academic test percentiles and academic interviews evaluating mathematical adaptability under faculty guidance.'
  },
  {
    id: 'uiuc',
    name: 'Univ. of Illinois Urbana-Champaign (UIUC)',
    location: 'Urbana-Champaign, IL',
    country: 'USA',
    tier: 'Global Top 30',
    acceptanceRate: '~25% (Grainger CS: <7%)',
    portfolioType: 'Research Preprint',
    primaryPortal: 'Common App / myIllini',
    facultyReview: false,
    recommendedSpike: 'AP Calculus BC & AP Physics C rigor, USACO Silver/Gold, and published work in computer architecture or data engineering.',
    keyDeadlines: 'EA: Nov 1 | RD: Jan 5',
    description: 'Grainger College of Engineering is direct-admit for CS. Differentiates applicants heavily on demonstrated math mastery and independent technical depth.'
  },
  {
    id: 'georgiatech',
    name: 'Georgia Institute of Technology',
    location: 'Atlanta, GA',
    country: 'USA',
    tier: 'Global Top 30',
    acceptanceRate: '~14% (Out-of-state/Intl: <10%)',
    portfolioType: 'SlideRoom Maker',
    primaryPortal: 'Common App',
    facultyReview: false,
    recommendedSpike: 'Robotics leadership (FIRST/VEX), computational physics modeling, or open-source software with active users.',
    keyDeadlines: 'EA II (Non-Georgia/Intl): Nov 1 | RD: Jan 4',
    description: 'Values students who build functional tools. Looks for deep involvement in STEM competitions, engineering design teams, and independent research.'
  },
  {
    id: 'nus',
    name: 'National University of Singapore (NUS)',
    location: 'Singapore',
    country: 'Singapore',
    tier: 'Pinnacle / Ivy+',
    acceptanceRate: '~6%',
    portfolioType: 'AIF / Technical Form',
    primaryPortal: 'NUS International Portal',
    facultyReview: true,
    recommendedSpike: 'Class 12 Board score 97%+, National Olympiad medal (INMO, INOI, INPhO), and verified international preprints.',
    keyDeadlines: 'Intl Application: Mid-Feb',
    description: 'Ranks top 10 globally in CS. Employs a strict academic filter combined with Exceptional Talent / Outstanding Achievements portfolio reviews.'
  },
  {
    id: 'toronto',
    name: 'University of Toronto',
    location: 'Toronto, Ontario',
    country: 'Canada',
    tier: 'Global Top 30',
    acceptanceRate: '~40% (St. George CS: ~15%)',
    portfolioType: 'Direct Video/Paper',
    primaryPortal: 'OUAC + Faculty Supplemental Video',
    facultyReview: false,
    recommendedSpike: 'Rigorous high school mathematics, strong SAT score (1520+), and structured video presentation on computational challenges solved.',
    keyDeadlines: 'Early Consideration: Nov 7 | Final: Jan 15',
    description: 'Computer Science at the St. George campus requires a mandatory written and video supplemental assessment testing spontaneous problem-solving.'
  },
  {
    id: 'eth',
    name: 'ETH Zurich',
    location: 'Zurich',
    country: 'Europe',
    tier: 'Pinnacle / Ivy+',
    acceptanceRate: '~25% (First Year Reduction Exam: ~50% pass)',
    portfolioType: 'Research Preprint',
    primaryPortal: 'ETH Online Application Portal',
    facultyReview: true,
    recommendedSpike: 'Extreme mathematics and physics proficiency (equivalent to AP Calc BC + Multivariable + Mechanics) + research portfolio.',
    keyDeadlines: 'Application Window: Nov 1 – Dec 15',
    description: 'Europe’s top technical university. Requires rigorous academic prerequisites in STEM subjects with strong value placed on scientific publication.'
  },
  {
    id: 'ucl',
    name: 'University College London (UCL)',
    location: 'London',
    country: 'UK',
    tier: 'Global Top 30',
    acceptanceRate: '~12% (Computer Science: <9%)',
    portfolioType: 'UCAS Technical Narrative',
    primaryPortal: 'UCAS',
    facultyReview: true,
    recommendedSpike: 'STAT (Special Tertiary Admissions Test) / Mathematics depth, self-initiated research projects on algorithms or neural networks.',
    keyDeadlines: 'UCAS Equal Consideration: Jan 29',
    description: 'High weighting on mathematical aptitude and course-specific technical exploration presented in the personal statement.'
  },
  {
    id: 'purdue',
    name: 'Purdue University',
    location: 'West Lafayette, IN',
    country: 'USA',
    tier: 'High-ROI STEM',
    acceptanceRate: '~50% (CS/Engineering: ~20%)',
    portfolioType: 'Research Preprint',
    primaryPortal: 'Common App (Test-Mandatory)',
    facultyReview: false,
    recommendedSpike: '1500+ SAT score with 780+ Math, AP Calculus/Physics mastery, and structured STEM research or maker builds.',
    keyDeadlines: 'EA (Priority for CS): Nov 1 | RD: Jan 15',
    description: 'Strictly direct-admit for Computer Science. Submitting early (Nov 1) with strong math credentials and documented project portfolios is essential.'
  }
];
