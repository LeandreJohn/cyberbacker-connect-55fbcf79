import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/PageHeader";
import { InitialsAvatar } from "@/components/shared/InitialsAvatar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/_app/internal/users")({
  head: () => ({ meta: [
    { title: "User Management — Cyberbacker" },
    { name: "description", content: "Manage admin and staff users of the Cyberbacker platform." },
    { property: "og:title", content: "User Management — Cyberbacker" },
    { property: "og:description", content: "Invite, edit and deactivate Cyberbacker admin users." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: UserManagement,
});

const ROLES = ["Superadmin", "Administrator", "Recruiter", "Facilitator", "Support Agent", "Finance Team", "Executive"] as const;
type Role = (typeof ROLES)[number];
interface AdminUser { id: string; name: string; email: string; role: Role; active: boolean; lastActive: string }

const SEED: AdminUser[] = [
  { id: "a1", name: "Leandre John Sabado", email: "leandre@cyberbacker.com", role: "Superadmin", active: true, lastActive: "Just now" },
  { id: "a2", name: "Maria Santos", email: "maria.santos@cyberbacker.com", role: "Recruiter", active: true, lastActive: "12 min ago" },
  { id: "a3", name: "Kevin Reyes", email: "kevin.reyes@cyberbacker.com", role: "Support Agent", active: true, lastActive: "1 hr ago" },
  { id: "a4", name: "Angela Cruz", email: "angela.cruz@cyberbacker.com", role: "Finance Team", active: true, lastActive: "Yesterday" },
  { id: "a5", name: "Daniel Lim", email: "daniel.lim@cyberbacker.com", role: "Executive", active: true, lastActive: "2 days ago" },
  { id: "a6", name: "Rica Flores", email: "rica.flores@cyberbacker.com", role: "Facilitator", active: false, lastActive: "3 weeks ago" },
  { id: "a7", name: "Paolo Garcia", email: "paolo.garcia@cyberbacker.com", role: "Administrator", active: true, lastActive: "5 hrs ago" },
];

const initials = (n: string) => n.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();

function UserManagement() {
  const [users, setUsers] = useState(SEED);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<string>("all");
  const [invite, setInvite] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "Recruiter" as Role });

  const shown = useMemo(() => users.filter((u) => (role === "all" || u.role === role) && `${u.name} ${u.email}`.toLowerCase().includes(query.toLowerCase())), [users, query, role]);
  const update = (id: string, patch: Partial<AdminUser>) => setUsers((list) => list.map((u) => (u.id === id ? { ...u, ...patch } : u)));

  const submitInvite = () => {
    if (!form.name.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) return toast.error("Enter a name and a valid email.");
    setUsers((list) => [...list, { id: `a${Date.now()}`, name: form.name.trim(), email: form.email.trim(), role: form.role, active: true, lastActive: "Invited" }]);
    toast.success(`Invitation sent to ${form.email}`);
    setForm({ name: "", email: "", role: "Recruiter" }); setInvite(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="User Management" description={`${users.filter((u) => u.active).length} active admin users`} actions={<Button onClick={() => setInvite(true)}><UserPlus className="mr-1.5 h-4 w-4" /> Invite admin</Button>} />
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Search name or email" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
            <Select value={role} onValueChange={setRole}><SelectTrigger className="sm:w-48" aria-label="Filter by role"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All roles</SelectItem>{ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead>Last active</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {shown.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell><div className="flex items-center gap-3"><InitialsAvatar initials={initials(u.name)} size="sm" /><div><p className="font-medium">{u.name}</p><p className="text-xs text-muted-foreground">{u.email}</p></div></div></TableCell>
                    <TableCell><Select value={u.role} onValueChange={(v) => { update(u.id, { role: v as Role }); toast.success(`${u.name} is now ${v}`); }}><SelectTrigger className="h-8 w-40" aria-label={`Role for ${u.name}`}><SelectValue /></SelectTrigger><SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select></TableCell>
                    <TableCell><StatusBadge label={u.active ? "Active" : "Deactivated"} tone={u.active ? "success" : "neutral"} /></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.lastActive}</TableCell>
                    <TableCell className="text-right"><Button variant="outline" size="sm" disabled={u.id === "a1"} onClick={() => update(u.id, { active: !u.active })}>{u.active ? "Deactivate" : "Reactivate"}</Button></TableCell>
                  </TableRow>
                ))}
                {shown.length === 0 && <TableRow><TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">No users match your search.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <Dialog open={invite} onOpenChange={setInvite}>
        <DialogContent>
          <DialogHeader><DialogTitle>Invite admin user</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label htmlFor="inv-name">Full name</Label><Input id="inv-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-1.5"><Label htmlFor="inv-email">Email</Label><Input id="inv-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Role</Label><Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as Role })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setInvite(false)}>Cancel</Button><Button onClick={submitInvite}>Send invite</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
