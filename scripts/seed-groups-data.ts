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

export type Member = {
  name: string;
  age: number;
  sex: "F" | "M";
  role: string;
  education: string;
  contribution: string;
};

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
