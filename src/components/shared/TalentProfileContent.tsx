import { Award, BriefcaseBusiness, Check, FileChartColumn, GraduationCap, MapPin, Plus, Star, ThumbsUp } from "lucide-react";

import { InitialsAvatar } from "./InitialsAvatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TalentProfile } from "@/lib/data/types";
import { firstName } from "@/lib/utils";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { portalQ } from "@/lib/api/queries";
import { toBackendId } from "@/lib/api/reviews";
import { endorseSkill, unendorseSkill } from "@/lib/api/endorsements";

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
  const editable = Boolean(props.editableMemberId);
  const allSkills = profile?.coreSkills;
  const profileSkillNames = [...new Set([...(profile?.coreSkills.map((s) => s.name) ?? props.skills), ...(profile?.tools.map((t) => t.name) ?? props.tools ?? [])])];
  const groupedSkills = allSkills?.reduce<Record<string, NonNullable<typeof allSkills>>>((groups, skill) => {
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
          {groupedSkills ? Object.entries(groupedSkills).map(([category, skills]) => <ProfileSection key={category} title={category}><div className="space-y-3">{skills.map((skill) => <Score key={skill.name} label={skill.name} value={proficiencyValue[skill.proficiency]} caption={skill.proficiency}/>)}</div></ProfileSection>) : <ProfileSection title="Core skills"><div className="flex flex-wrap gap-2">{props.skills.map((skill) => <Badge key={skill} variant="secondary">{skill}</Badge>)}</div></ProfileSection>}
          <ProfileSection title="Software & tools"><div className="space-y-3">{profile?.tools.map((tool) => <Score key={tool.name} label={tool.name} value={proficiencyValue[tool.proficiency]} caption={tool.proficiency}/>) ?? <div className="flex flex-wrap gap-2">{props.tools?.map((tool) => <Badge key={tool} variant="outline">{tool}</Badge>)}</div>}</div></ProfileSection>
          {editable && <EndorsementsSection memberId={props.editableMemberId!} profileSkills={profileSkillNames} />}
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

function EndorsementsSection({ memberId, profileSkills }: { memberId: string; profileSkills: string[] }) {
  let cbId: number;
  try {
    cbId = toBackendId(memberId);
  } catch {
    return null;
  }
  const queryClient = useQueryClient();
  const { data: endorsements = [], isPending } = useQuery(portalQ.endorsements(cbId));
  const [name, setName] = useState(""); const [error, setError] = useState("");
  const apply = (rows: { skill: string; endorsements: number; endorsed_by_me: boolean }[]) => queryClient.setQueryData(["endorsements", cbId], rows);
  const endorse = useMutation({ mutationFn: (skill: string) => endorseSkill(cbId, skill), onSuccess: apply, onError: (e) => toast.error(e instanceof Error ? e.message : "Couldn't endorse the skill") });
  const unendorse = useMutation({ mutationFn: (skill: string) => unendorseSkill(cbId, skill), onSuccess: apply, onError: (e) => toast.error(e instanceof Error ? e.message : "Couldn't remove the endorsement") });
  const available = profileSkills.filter((s) => !endorsements.some((e) => e.skill.toLowerCase() === s.toLowerCase()));
  const submit = (e: React.FormEvent) => { e.preventDefault(); const skill = name.trim(); if (!skill) return setError("Enter a skill name."); if (endorsements.some((x) => x.skill.toLowerCase() === skill.toLowerCase())) return setError("You've already endorsed that skill."); endorse.mutate(skill); setName(""); setError(""); };
  return <section className="space-y-4 rounded-lg border bg-card p-4">
    <div className="flex items-center gap-2"><ThumbsUp className="h-4 w-4 text-primary"/><h3 className="font-semibold">Client endorsements</h3></div>
    <p className="text-xs text-muted-foreground">Endorse the skills you've seen this team member use. Endorsements are separate from their profile skills.</p>
    {isPending ? <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div> : endorsements.length ? <ul className="divide-y rounded-md border">{endorsements.map((skill) => <li key={skill.skill} className="flex items-center justify-between gap-3 p-3">
      <div className="min-w-0"><p className="flex flex-wrap items-center gap-2 text-sm font-semibold">{skill.skill}<Badge variant="outline" className="text-[10px]">{skill.endorsements} endorsement{skill.endorsements === 1 ? "" : "s"}</Badge></p>{skill.endorsed_by_me && <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground"><span className="grid h-5 w-5 place-items-center rounded-full bg-primary/10 text-primary"><ThumbsUp className="h-3 w-3"/></span>Endorsed by you</p></div>
      <Button type="button" variant="secondary" size="sm" className="rounded-full" aria-label={`Remove endorsement for ${skill.skill}`} disabled={unendorse.isPending} onClick={() => skill.endorsed_by_me && unendorse.mutate(skill.skill)}><Check className="mr-1 h-3.5 w-3.5"/>{skill.endorsed_by_me ? "Endorsed" : "Endorse"}</Button>
    </li>)}</ul> : <p className="rounded-md border border-dashed p-3 text-center text-sm text-muted-foreground">No endorsements yet.</p>}
    {available.length > 0 && <div className="space-y-2"><p className="text-xs font-semibold uppercase text-muted-foreground">Endorse a skill</p><div className="flex flex-wrap gap-2">{available.map((skill) => <Button key={skill} type="button" variant="outline" size="sm" className="rounded-full" disabled={endorse.isPending} aria-label={`Endorse ${skill}`} onClick={() => endorse.mutate(skill)}><Plus className="mr-1 h-3.5 w-3.5"/>{skill}</Button>)}</div></div>}
    <form onSubmit={submit} className="space-y-2"><p className="text-xs font-semibold uppercase text-muted-foreground">Add a skill</p><div className="flex gap-2"><Input aria-label="Skill name" placeholder="Skill not on their profile" value={name} onChange={(e) => setName(e.target.value)} /><Button type="submit" size="sm" disabled={endorse.isPending}>Endorse</Button></div>{error && <p className="text-xs text-destructive">{error}</p>}</form>
  </section>;
}

function LanguageRatings({ languages }: { languages: TalentProfile["languages"] }) {
  return <div className="rounded-md bg-muted/40 p-3"><p className="text-xs text-muted-foreground">Languages</p><div className="mt-2 space-y-2">{languages.map(({ language, proficiency }) => <div key={language} className="flex items-center justify-between gap-3"><span className="text-sm font-medium">{language}</span><span className="text-xs font-semibold text-primary">{proficiency}/5</span></div>)}</div></div>;
}

function AssessmentPanel({ title, scores, columns }: { title: string; scores: object; columns: string }) {
  return <div className="rounded-md border p-4"><div className="mb-4 flex items-center gap-2"><FileChartColumn className="h-5 w-5 text-primary"/><h4 className="font-semibold">{title}</h4></div><div className={`grid gap-2 ${columns}`}>{Object.entries(scores).map(([label, value]) => <div key={label} className="rounded-md bg-muted/40 p-3"><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="mt-1 text-xl font-bold">{value}</p></div>)}</div></div>;
}