import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type GroupFormValues = {
  name: string;
  wardId: string;
  focus: string;
  tier: "A" | "B" | "C";
  cycleNumber: number;
  readinessScore: number;
  savingsTotal: number;
  repaymentRate: string;
  status: "active" | "pending" | "inactive";
  mentorName: string;
  meetingDay: string;
  formedYear: string;
  contactPhone: string;
  loanBalanceDisplay: string;
  nextDisbursement: string;
};

type Ward = { id: string; name: string };

type GroupFormProps = {
  values: GroupFormValues;
  wards: Ward[];
  onChange: (values: GroupFormValues) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
  loading?: boolean;
};

export function GroupForm({
  values,
  wards,
  onChange,
  onSubmit,
  submitLabel,
  loading,
}: GroupFormProps) {
  const set = <K extends keyof GroupFormValues>(key: K, val: GroupFormValues[K]) =>
    onChange({ ...values, [key]: val });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Group name</Label>
          <Input
            id="name"
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Ward</Label>
          <Select value={values.wardId} onValueChange={(v) => set("wardId", v)} required>
            <SelectTrigger>
              <SelectValue placeholder="Select ward" />
            </SelectTrigger>
            <SelectContent>
              {wards.map((w) => (
                <SelectItem key={w.id} value={w.id}>
                  {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="focus">Enterprise focus</Label>
          <Input
            id="focus"
            value={values.focus}
            onChange={(e) => set("focus", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Tier</Label>
          <Select
            value={values.tier}
            onValueChange={(v) => set("tier", v as GroupFormValues["tier"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["A", "B", "C"] as const).map((t) => (
                <SelectItem key={t} value={t}>
                  Tier {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={values.status}
            onValueChange={(v) => set("status", v as GroupFormValues["status"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="cycle">Cycle number</Label>
          <Input
            id="cycle"
            type="number"
            min={1}
            value={values.cycleNumber}
            onChange={(e) => set("cycleNumber", Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="readiness">Loan readiness (%)</Label>
          <Input
            id="readiness"
            type="number"
            min={0}
            max={100}
            value={values.readinessScore}
            onChange={(e) => set("readinessScore", Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="savings">Savings total (TZS)</Label>
          <Input
            id="savings"
            type="number"
            min={0}
            value={values.savingsTotal}
            onChange={(e) => set("savingsTotal", Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="repayment">Repayment rate</Label>
          <Input
            id="repayment"
            value={values.repaymentRate}
            onChange={(e) => set("repaymentRate", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mentor">Mentor</Label>
          <Input
            id="mentor"
            value={values.mentorName}
            onChange={(e) => set("mentorName", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="meeting">Meeting day</Label>
          <Input
            id="meeting"
            value={values.meetingDay}
            onChange={(e) => set("meetingDay", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="formed">Established year</Label>
          <Input
            id="formed"
            type="number"
            value={values.formedYear}
            onChange={(e) => set("formedYear", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact">Contact phone</Label>
          <Input
            id="contact"
            value={values.contactPhone}
            onChange={(e) => set("contactPhone", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="loan">Loan balance display</Label>
          <Input
            id="loan"
            value={values.loanBalanceDisplay}
            onChange={(e) => set("loanBalanceDisplay", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="disbursement">Next disbursement</Label>
          <Input
            id="disbursement"
            value={values.nextDisbursement}
            onChange={(e) => set("nextDisbursement", e.target.value)}
          />
        </div>
      </div>
      <Button type="submit" disabled={loading} className="rounded-full">
        {submitLabel}
      </Button>
    </form>
  );
}

export function groupToFormValues(group: {
  name: string;
  wardId: string;
  focus: string;
  tier: "A" | "B" | "C";
  cycleNumber: number;
  readinessScore: number;
  savingsTotal: number;
  repaymentRate: string;
  status: string;
  mentorName: string;
  meetingDay: string;
  formedYear: number | null;
  contactPhone: string;
  loanBalanceDisplay: string;
  nextDisbursement: string;
}): GroupFormValues {
  return {
    name: group.name,
    wardId: group.wardId,
    focus: group.focus,
    tier: group.tier,
    cycleNumber: group.cycleNumber,
    readinessScore: group.readinessScore,
    savingsTotal: group.savingsTotal,
    repaymentRate: group.repaymentRate,
    status: group.status as GroupFormValues["status"],
    mentorName: group.mentorName,
    meetingDay: group.meetingDay,
    formedYear: group.formedYear ? String(group.formedYear) : "",
    contactPhone: group.contactPhone,
    loanBalanceDisplay: group.loanBalanceDisplay,
    nextDisbursement: group.nextDisbursement,
  };
}
