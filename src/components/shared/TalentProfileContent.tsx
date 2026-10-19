import { Award, BriefcaseBusiness, Check, FileChartColumn, GraduationCap, MapPin, Star } from "lucide-react";

import { InitialsAvatar } from "./InitialsAvatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TalentProfile } from "@/lib/data/types";
import { cn, firstName } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addSkill, rateSkill, useMemberSkills } from "@/lib/data/member-skills";
import type { ProfileProficiency } from "@/lib/data/types";

interface TalentProfileContentProps {
  name: string;
  initials: string;
  title: string;
  location: string;
  bio: string;
  yearsExperience?: number;
  valuesScore?: number;
  rating?: number;
  skills: string[];
  tools?: string[];
  profile?: TalentProfile;
  /** When set, the viewer can rate skills and add skills for this member. */
  editableMemberId?: string;
}

const proficiencyValue = { Basic: 25, Intermediate: 50, Proficient: 75, Expert: 100 };

export function TalentProfileContent(props: TalentProfileContentProps) {
  const profile = props.profile;
  const memberSkills = useMemberSkills(props.editableMemberId ?? "__none__");
  const editable = Boolean(props.editableMemberId);
  const baseSkills = profile?.coreSkills ?? (editable ? props.skills.map((name) => ({ category: "Core skills", name, proficiency: "Proficient" as ProfileProficiency })) : undefined);
  const allSkills = baseSkills ? [...baseSkills, ...(editable ? memberSkills.added : [])] : undefined;
  const ratingFor = (name: string) => editable ? <StarRating value={memberSkills.ratings[name] ?? 0} label={name} onChange={(v) => rateSkill(props.editableMemberId!, name, v)} /> : null;
  const groupedSkills = allSkills?.reduce<Record<string, typeof profile.coreSkills>>((groups, skill) => {
    (groups[skill.category] ??= []).push(skill);
    return groups;
  }, {});

  return (
    <div className="space-y-6 pb-4">
      <div className="flex items-start gap-4 border-b pb-5">
        <InitialsAvatar initials={props.initials} size="lg" />
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold tracking-normal">{firstName(props.name)}</h2>
          <p className="font-medium text-primary">{props.title}</p>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{props.location}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {props.rating && <Badge variant="secondary"><Star className="mr-1 h-3 w-3 fill-warning text-warning" />{props.rating}</Badge>}
            {props.yearsExperience !== undefined && <Badge variant="outline">{props.yearsExperience} years experience</Badge>}
            {profile && <Badge className="bg-success/10 text-success hover:bg-success/10">{profile.availability}</Badge>}
          </div>
        </div>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="grid h-auto w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger><TabsTrigger value="experience">Experience</TabsTrigger><TabsTrigger value="skills">Skills & setup</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="space-y-6 pt-4">
          <ProfileSection title="About"><p className="text-sm leading-relaxed text-muted-foreground">{props.bio}</p></ProfileSection>
          <div className="grid grid-cols-2 gap-3">
            <Metric label="Values assessment" value={props.valuesScore ? `${props.valuesScore}/100` : "Not scored"} />
            <Metric label="Work preference" value={profile?.engagement ?? "Flexible"} />
          </div>
          {profile && <>
            <ProfileSection title="Personal information">
              <div className="grid gap-3 sm:grid-cols-2"><Info label="Nationality" value={profile.nationality} /><LanguageRatings languages={profile.languages} /><Info label="Preferred industry" value={profile.preferredIndustry} /><Info label="Availability" value={profile.availability} /></div>
            </ProfileSection>
            <ProfileSection title="Education">
              <div className="flex gap-3 rounded-md border p-4"><GraduationCap className="mt-0.5 h-5 w-5 text-primary"/><div><p className="font-semibold">{profile.education.degree}</p><p className="text-sm text-muted-foreground">{profile.education.school}</p><p className="mt-1 text-xs text-muted-foreground">{profile.education.location} · Graduated {profile.education.graduation}</p></div></div>
            </ProfileSection>
            <ProfileSection title="Assessments">
              <div className="grid gap-4 lg:grid-cols-2">
                <AssessmentPanel title="Values Assessment" scores={profile.valuesBreakdown} columns="grid-cols-2 sm:grid-cols-3" />
                <AssessmentPanel title="DISC Assessment" scores={profile.disc} columns="grid-cols-2 sm:grid-cols-4" />
              </div>
            </ProfileSection>
          </>}
        </TabsContent>

        <TabsContent value="experience" className="space-y-6 pt-4">
          {profile ? <>
            <ProfileSection title="Professional background"><div className="flex flex-wrap gap-2">{profile.preferredRoles.map((role) => <Badge key={role} variant="secondary">{role}</Badge>)}</div></ProfileSection>
            <ProfileSection title="Work experience"><div className="space-y-3">{profile.experience.map((item) => <div key={`${item.title}-${item.start}`} className="rounded-md border p-4"><div className="flex gap-3"><BriefcaseBusiness className="mt-0.5 h-5 w-5 text-primary"/><div><p className="font-semibold">{item.title}</p><p className="text-sm text-muted-foreground">{item.employer} · {item.location}</p><p className="text-xs text-muted-foreground">{item.start} – {item.end}</p><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.summary}</p></div></div></div>)}</div></ProfileSection>
            <ProfileSection title="Certifications"><div className="space-y-2">{profile.certifications.map((cert) => <div key={cert.title} className="flex gap-3 rounded-md border p-3"><Award className="h-5 w-5 text-primary"/><div><p className="text-sm font-semibold">{cert.title}</p><p className="text-xs text-muted-foreground">{cert.organization} · {cert.completed}</p></div></div>)}</div></ProfileSection>
            <ProfileSection title="Portfolio"><div className="grid gap-2 sm:grid-cols-2">{profile.portfolio.map((item) => <div key={item} className="rounded-md border p-3 text-sm font-medium">{item}</div>)}</div></ProfileSection>
          </> : <p className="text-sm text-muted-foreground">Detailed work history will be available after the interview stage.</p>}
        </TabsContent>

        <TabsContent value="skills" className="space-y-6 pt-4">
          {editable && <AddSkillForm memberId={props.editableMemberId!} />}
          {groupedSkills ? Object.entries(groupedSkills).map(([category, skills]) => <ProfileSection key={category} title={category}><div className="space-y-3">{skills.map((skill) => <Score key={skill.name} label={skill.name} value={proficiencyValue[skill.proficiency]} caption={skill.proficiency} extra={ratingFor(skill.name)}/>)}</div></ProfileSection>) : <ProfileSection title="Core skills"><div className="flex flex-wrap gap-2">{props.skills.map((skill) => <Badge key={skill} variant="secondary">{skill}</Badge>)}</div></ProfileSection>}
          <ProfileSection title="Software & tools"><div className="space-y-3">{profile?.tools.map((tool) => <Score key={tool.name} label={tool.name} value={proficiencyValue[tool.proficiency]} caption={tool.proficiency} extra={ratingFor(tool.name)}/>) ?? <div className="flex flex-wrap gap-2">{props.tools?.map((tool) => <Badge key={tool} variant="outline">{tool}</Badge>)}</div>}</div></ProfileSection>
          {profile && <ProfileSection title="Work setup"><div className="grid gap-3 sm:grid-cols-2"><Info label="Primary device" value={`${profile.workSetup.primaryDevice} · ${profile.workSetup.cpu}`} /><Info label="Memory & storage" value={`${profile.workSetup.ram} · ${profile.workSetup.storage}`} /><Info label="Internet" value={`${profile.workSetup.primaryIsp} + ${profile.workSetup.backupIsp}`} /><Info label="Video & audio" value={`${profile.workSetup.webcam ? "Webcam" : "No webcam"}, ${profile.workSetup.headset ? "headset" : "no headset"}`} /></div></ProfileSection>}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProfileSection({ title, children }: { title: string; children: React.ReactNode }) { return <section className="space-y-3"><div className="flex items-center gap-2"><Check className="h-4 w-4 text-primary"/><h3 className="font-semibold">{title}</h3></div>{children}</section>; }
function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-md border bg-muted/30 p-3"><p className="text-base font-semibold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>; }
function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-md bg-muted/40 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-0.5 text-sm font-medium">{value}</p></div>; }
function Score({ label, value, caption, extra }: { label: string; value: number; caption?: string; extra?: React.ReactNode }) { return <div><div className="mb-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm"><span className="font-medium">{label}</span><span className="flex items-center gap-3">{extra}<span className="text-xs text-muted-foreground">{caption ?? `${value}%`}</span></span></div><Progress value={value} className="h-1.5"/></div>; }

function StarRating({ value, label, onChange }: { value: number; label: string; onChange: (v: number) => void }) {
  return <span className="flex items-center gap-0.5" role="group" aria-label={`Your rating for ${label}`}>{[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" aria-label={`Rate ${label} ${n} of 5`} onClick={() => onChange(n)} className="rounded p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><Star className={cn("h-3.5 w-3.5", n <= value ? "fill-warning text-warning" : "text-muted-foreground/40")} /></button>)}</span>;
}

const PROFICIENCIES: ProfileProficiency[] = ["Basic", "Intermediate", "Proficient", "Expert"];
function AddSkillForm({ memberId }: { memberId: string }) {
  const [name, setName] = useState(""); const [category, setCategory] = useState(""); const [level, setLevel] = useState<ProfileProficiency>("Proficient"); const [error, setError] = useState("");
  const submit = (e: React.FormEvent) => { e.preventDefault(); if (!name.trim()) return setError("Enter a skill name."); if (!addSkill(memberId, { name, category, proficiency: level })) return setError("That skill is already listed."); setName(""); setCategory(""); setError(""); };
  return <form onSubmit={submit} className="space-y-3 rounded-md border bg-muted/30 p-4"><p className="text-sm font-semibold">Add a skill</p><div className="grid gap-2 sm:grid-cols-3"><Input aria-label="Skill name" placeholder="Skill name" value={name} onChange={(e) => setName(e.target.value)} /><Input aria-label="Category" placeholder="Category (optional)" value={category} onChange={(e) => setCategory(e.target.value)} /><Select value={level} onValueChange={(v) => setLevel(v as ProfileProficiency)}><SelectTrigger aria-label="Proficiency"><SelectValue /></SelectTrigger><SelectContent>{PROFICIENCIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>{error && <p className="text-xs text-destructive">{error}</p>}<Button type="submit" size="sm">Add skill</Button></form>;
}

function LanguageRatings({ languages }: { languages: TalentProfile["languages"] }) {
  return <div className="rounded-md bg-muted/40 p-3"><p className="text-xs text-muted-foreground">Languages</p><div className="mt-2 space-y-2">{languages.map(({ language, proficiency }) => <div key={language} className="flex items-center justify-between gap-3"><span className="text-sm font-medium">{language}</span><span className="text-xs font-semibold text-primary">{proficiency}/5</span></div>)}</div></div>;
}

function AssessmentPanel({ title, scores, columns }: { title: string; scores: object; columns: string }) {
  return <div className="rounded-md border p-4"><div className="mb-4 flex items-center gap-2"><FileChartColumn className="h-5 w-5 text-primary"/><h4 className="font-semibold">{title}</h4></div><div className={`grid gap-2 ${columns}`}>{Object.entries(scores).map(([label, value]) => <div key={label} className="rounded-md bg-muted/40 p-3"><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="mt-1 text-xl font-bold">{value}</p></div>)}</div></div>;
}