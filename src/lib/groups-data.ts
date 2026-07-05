export type Group = {
  name: string;
  ward: string;
  focus: string;
  members: number;
  savings: string;
  savingsNum: number;
  readiness: number;
  tier: "A" | "B" | "C";
  cycle: string;
  repayment: string;
};

export const GROUPS: Group[] = [
  {
    name: "Tujikomboe",
    ward: "Kinondoni",
    focus: "Tailoring & kitenge",
    members: 14,
    savings: "TZS 4.2M",
    savingsNum: 4.2,
    readiness: 86,
    tier: "A",
    cycle: "Cycle 3",
    repayment: "100%",
  },
  {
    name: "Mshikamano",
    ward: "Temeke",
    focus: "Urban farming",
    members: 12,
    savings: "TZS 2.8M",
    savingsNum: 2.8,
    readiness: 72,
    tier: "B",
    cycle: "Cycle 2",
    repayment: "97%",
  },
  {
    name: "Nuru ya Vijana",
    ward: "Ilala",
    focus: "Metal fabrication",
    members: 9,
    savings: "TZS 3.6M",
    savingsNum: 3.6,
    readiness: 78,
    tier: "B",
    cycle: "Cycle 2",
    repayment: "98%",
  },
  {
    name: "Hekima",
    ward: "Ubungo",
    focus: "Mobile services",
    members: 11,
    savings: "TZS 1.4M",
    savingsNum: 1.4,
    readiness: 54,
    tier: "C",
    cycle: "Cycle 1",
    repayment: "92%",
  },
  {
    name: "Amani",
    ward: "Kinondoni",
    focus: "Poultry",
    members: 10,
    savings: "TZS 2.1M",
    savingsNum: 2.1,
    readiness: 68,
    tier: "B",
    cycle: "Cycle 2",
    repayment: "95%",
  },
  {
    name: "Bidii",
    ward: "Temeke",
    focus: "Food vending",
    members: 13,
    savings: "TZS 3.1M",
    savingsNum: 3.1,
    readiness: 74,
    tier: "B",
    cycle: "Cycle 2",
    repayment: "96%",
  },
  {
    name: "Chapakazi",
    ward: "Ilala",
    focus: "Carpentry",
    members: 8,
    savings: "TZS 3.9M",
    savingsNum: 3.9,
    readiness: 82,
    tier: "A",
    cycle: "Cycle 3",
    repayment: "99%",
  },
  {
    name: "Daraja",
    ward: "Ubungo",
    focus: "Digital services",
    members: 12,
    savings: "TZS 2.4M",
    savingsNum: 2.4,
    readiness: 70,
    tier: "B",
    cycle: "Cycle 2",
    repayment: "94%",
  },
  {
    name: "Elimu",
    ward: "Kigamboni",
    focus: "Tutoring",
    members: 9,
    savings: "TZS 1.1M",
    savingsNum: 1.1,
    readiness: 48,
    tier: "C",
    cycle: "Cycle 1",
    repayment: "90%",
  },
  {
    name: "Faraja",
    ward: "Kigamboni",
    focus: "Tailoring & kitenge",
    members: 11,
    savings: "TZS 2.6M",
    savingsNum: 2.6,
    readiness: 71,
    tier: "B",
    cycle: "Cycle 2",
    repayment: "96%",
  },
  {
    name: "Gharama",
    ward: "Kinondoni",
    focus: "Urban farming",
    members: 10,
    savings: "TZS 1.7M",
    savingsNum: 1.7,
    readiness: 58,
    tier: "C",
    cycle: "Cycle 1",
    repayment: "93%",
  },
  {
    name: "Harambee",
    ward: "Temeke",
    focus: "Beauty & salon",
    members: 14,
    savings: "TZS 4.5M",
    savingsNum: 4.5,
    readiness: 88,
    tier: "A",
    cycle: "Cycle 3",
    repayment: "100%",
  },
  {
    name: "Imani",
    ward: "Ilala",
    focus: "Poultry",
    members: 9,
    savings: "TZS 2.0M",
    savingsNum: 2.0,
    readiness: 66,
    tier: "B",
    cycle: "Cycle 2",
    repayment: "95%",
  },
  {
    name: "Jitihada",
    ward: "Ubungo",
    focus: "Metal fabrication",
    members: 8,
    savings: "TZS 3.3M",
    savingsNum: 3.3,
    readiness: 76,
    tier: "B",
    cycle: "Cycle 2",
    repayment: "97%",
  },
  {
    name: "Kazi Njema",
    ward: "Kigamboni",
    focus: "Food vending",
    members: 12,
    savings: "TZS 2.9M",
    savingsNum: 2.9,
    readiness: 73,
    tier: "B",
    cycle: "Cycle 2",
    repayment: "96%",
  },
  {
    name: "Lengo",
    ward: "Kinondoni",
    focus: "Mobile services",
    members: 10,
    savings: "TZS 1.5M",
    savingsNum: 1.5,
    readiness: 52,
    tier: "C",
    cycle: "Cycle 1",
    repayment: "91%",
  },
  {
    name: "Matumaini",
    ward: "Temeke",
    focus: "Digital services",
    members: 11,
    savings: "TZS 3.8M",
    savingsNum: 3.8,
    readiness: 84,
    tier: "A",
    cycle: "Cycle 3",
    repayment: "99%",
  },
  {
    name: "Nguvu",
    ward: "Ilala",
    focus: "Carpentry",
    members: 13,
    savings: "TZS 2.2M",
    savingsNum: 2.2,
    readiness: 69,
    tier: "B",
    cycle: "Cycle 2",
    repayment: "94%",
  },
  {
    name: "Ushirika",
    ward: "Ubungo",
    focus: "Beauty & salon",
    members: 9,
    savings: "TZS 1.3M",
    savingsNum: 1.3,
    readiness: 50,
    tier: "C",
    cycle: "Cycle 1",
    repayment: "90%",
  },
  {
    name: "Vijana Bora",
    ward: "Kigamboni",
    focus: "Tailoring & kitenge",
    members: 12,
    savings: "TZS 4.0M",
    savingsNum: 4.0,
    readiness: 85,
    tier: "A",
    cycle: "Cycle 3",
    repayment: "100%",
  },
  {
    name: "Wema",
    ward: "Kinondoni",
    focus: "Food vending",
    members: 10,
    savings: "TZS 2.5M",
    savingsNum: 2.5,
    readiness: 70,
    tier: "B",
    cycle: "Cycle 2",
    repayment: "95%",
  },
  {
    name: "Zawadi",
    ward: "Temeke",
    focus: "Urban farming",
    members: 11,
    savings: "TZS 1.9M",
    savingsNum: 1.9,
    readiness: 60,
    tier: "C",
    cycle: "Cycle 1",
    repayment: "93%",
  },
  {
    name: "Baraka",
    ward: "Ilala",
    focus: "Mobile services",
    members: 9,
    savings: "TZS 3.4M",
    savingsNum: 3.4,
    readiness: 79,
    tier: "B",
    cycle: "Cycle 2",
    repayment: "98%",
  },
  {
    name: "Neema",
    ward: "Ubungo",
    focus: "Digital services",
    members: 12,
    savings: "TZS 2.7M",
    savingsNum: 2.7,
    readiness: 72,
    tier: "B",
    cycle: "Cycle 2",
    repayment: "96%",
  },
];

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

export const findGroupBySlug = (slug: string) => GROUPS.find((g) => slugify(g.name) === slug);

// Deterministic pseudo-random for stable demo data per group
function seeded(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 10000) / 10000;
  };
}

const FIRST_F = [
  "Amina",
  "Neema",
  "Zainab",
  "Rehema",
  "Fatuma",
  "Grace",
  "Halima",
  "Joyce",
  "Mwajuma",
  "Sophia",
  "Tumaini",
  "Upendo",
  "Salma",
  "Rukia",
];
const FIRST_M = [
  "Juma",
  "Baraka",
  "Emmanuel",
  "Hamisi",
  "Ibrahim",
  "Kelvin",
  "Musa",
  "Peter",
  "Rajabu",
  "Salim",
  "Yusuf",
  "Godfrey",
  "Isaya",
  "Rashid",
];
const LAST = [
  "Mwakyusa",
  "Kimaro",
  "Mushi",
  "Kessy",
  "Msigwa",
  "Chuwa",
  "Mnyika",
  "Shayo",
  "Kileo",
  "Mrema",
  "Lyimo",
  "Mollel",
  "Massawe",
  "Mfinanga",
];
const ROLES = [
  "Chairperson",
  "Secretary",
  "Treasurer",
  "Loan officer",
  "Member",
  "Member",
  "Member",
  "Member",
];
const EDU = ["Primary", "Secondary", "VETA", "Tertiary"];
const TRAININGS = [
  "Financial literacy",
  "Entrepreneurship",
  "GBV prevention",
  "SRHR",
  "Digital skills",
  "Life skills",
  "Market linkages",
];

export type Member = {
  name: string;
  age: number;
  sex: "F" | "M";
  role: string;
  education: string;
  contribution: string;
};

export function getGroupDetails(group: Group) {
  const rand = seeded(group.name);
  const members: Member[] = Array.from({ length: group.members }).map((_, i) => {
    const sex: "F" | "M" = rand() < 0.62 ? "F" : "M";
    const first = (sex === "F" ? FIRST_F : FIRST_M)[Math.floor(rand() * FIRST_F.length)];
    const last = LAST[Math.floor(rand() * LAST.length)];
    const age = 18 + Math.floor(rand() * 17);
    const role = i < 4 ? ROLES[i] : "Member";
    const education = EDU[Math.floor(rand() * EDU.length)];
    const contribution = `TZS ${50 + Math.floor(rand() * 350)}K`;
    return { name: `${first} ${last}`, age, sex, role, education, contribution };
  });

  const trainings = TRAININGS.map((t) => ({
    name: t,
    completed: Math.max(4, group.members - Math.floor(rand() * 5)),
    date: `${["Feb", "Mar", "Apr", "May", "Jun", "Jul"][Math.floor(rand() * 6)]} 2026`,
  }));

  const meetingDay = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][
    Math.floor(rand() * 6)
  ];
  const formedYear = 2022 + Math.floor(rand() * 3);

  return {
    members,
    trainings,
    meta: {
      formed: `${meetingDay} · Est. ${formedYear}`,
      meetingDay,
      mentor: `${FIRST_F[Math.floor(rand() * FIRST_F.length)]} ${LAST[Math.floor(rand() * LAST.length)]}`,
      location: `${group.ward}, Dar es Salaam`,
      nextDisbursement: `${["Aug", "Sep", "Oct"][Math.floor(rand() * 3)]} 2026`,
      loanBalance: `TZS ${(0.4 + rand() * 2).toFixed(1)}M`,
      contact: `+255 7${Math.floor(10 + rand() * 89)} ${Math.floor(100 + rand() * 899)} ${Math.floor(100 + rand() * 899)}`,
    },
  };
}
