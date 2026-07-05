import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { submitInterestApplication } from "@/lib/forms/form-fns";
import { GROUPS } from "@/lib/groups-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/apply")({
  head: () => ({
    meta: [
      { title: "Apply to YEE — Youth Economic Empowerment" },
      {
        name: "description",
        content: "Apply to join the Youth Economic Empowerment programme in Tanzania.",
      },
    ],
  }),
  component: ApplyPage,
});

const wards = [...new Set(GROUPS.map((g) => g.ward))].sort();
const focusAreas = [...new Set(GROUPS.map((g) => g.focus))].sort();

function ApplyPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    ward: "",
    age: "",
    focusArea: "",
    motivation: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitInterestApplication({
        data: {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          ward: form.ward,
          age: Number(form.age),
          focusArea: form.focusArea,
          motivation: form.motivation,
        },
      });
      setSubmitted(true);
      toast.success("Application submitted!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen grid place-items-center bg-background p-8">
        <div className="max-w-md text-center">
          <p className="eyebrow text-clay">Application received</p>
          <h1 className="mt-2 font-display text-4xl">Thank you, {form.fullName.split(" ")[0]}!</h1>
          <p className="mt-4 text-muted-foreground">
            We've received your interest in joining YEE. A programme officer will contact you at{" "}
            {form.email} within 5 working days.
          </p>
          <Link
            to="/"
            className="mt-8 inline-flex rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-ink text-cream">
        <div className="container-page flex items-center justify-between py-6">
          <Link to="/" className="font-display text-lg">
            YEE Tanzania
          </Link>
          <Link to="/login" className="text-sm font-semibold text-cream/85 hover:text-sun">
            Staff sign in
          </Link>
        </div>
      </header>

      <div className="container-page py-16 max-w-2xl">
        <p className="eyebrow text-clay">Join YEE</p>
        <h1 className="mt-2 font-display text-4xl">Apply to the programme</h1>
        <p className="mt-3 text-muted-foreground">
          Young entrepreneurs aged 16–35 in Dar es Salaam can apply to join a YEE savings group and
          receive training, mentorship, and enterprise support.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+255 7XX XXX XXX"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                min={16}
                max={35}
                value={form.age}
                onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Ward</Label>
              <Select
                value={form.ward}
                onValueChange={(v) => setForm((f) => ({ ...f, ward: v }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select ward" />
                </SelectTrigger>
                <SelectContent>
                  {wards.map((w) => (
                    <SelectItem key={w} value={w}>
                      {w}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Enterprise focus</Label>
              <Select
                value={form.focusArea}
                onValueChange={(v) => setForm((f) => ({ ...f, focusArea: v }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="What do you want to build?" />
                </SelectTrigger>
                <SelectContent>
                  {focusAreas.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="motivation">Why do you want to join YEE?</Label>
              <Textarea
                id="motivation"
                rows={4}
                value={form.motivation}
                onChange={(e) => setForm((f) => ({ ...f, motivation: e.target.value }))}
                required
              />
            </div>
          </div>
          <Button type="submit" className="rounded-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit application
          </Button>
        </form>
      </div>
    </div>
  );
}
