import { useState } from "react";
import { Plus, Shield, Trash2 } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Manager" | "Staff / Check-in Agent" | "Accountant";
  status: "Active" | "Invited";
}

export default function Team() {
  const [team, setTeam] = useState<TeamMember[]>([
    {
      id: "t1",
      name: "Ramesh Kumar",
      email: "ramesh@smasharena.com",
      role: "Manager",
      status: "Active",
    },
    {
      id: "t2",
      name: "Ravi Chandran",
      email: "ravi.c@smasharena.com",
      role: "Staff / Check-in Agent",
      status: "Active",
    },
    {
      id: "t3",
      name: "Divya Balan",
      email: "divya.finance@smasharena.com",
      role: "Accountant",
      status: "Invited",
    },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<TeamMember["role"]>("Staff / Check-in Agent");

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newName) return;
    setTeam([
      ...team,
      {
        id: `t-${Date.now()}`,
        name: newName,
        email: newEmail,
        role: newRole,
        status: "Invited",
      },
    ]);
    setNewName("");
    setNewEmail("");
    setModalOpen(false);
  };

  const handleRemove = (id: string) => {
    setTeam(team.filter((m) => m.id !== id));
  };

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            Team & Staff Access
          </h1>
          <p className="mt-1 text-xs text-[#A1A1AA]">
            Invite ground coordinators, gate ticket scanners, and venue administrators.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#F51D2B] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-[#F51D2B]/20 transition hover:bg-[#ff2b39]"
        >
          <Plus size={15} />
          <span>Invite Team Member</span>
        </button>
      </div>

      {/* Team Table */}
      <div className="rounded-2xl border border-[#292929] bg-[#141414] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#292929] bg-[#1A1A1A]/60 text-[11px] font-semibold text-[#777777]">
                <th className="py-3.5 pl-5">Member Name</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Role & Permissions</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222222]">
              {team.map((member) => (
                <tr key={member.id} className="hover:bg-[#1A1A1A]/40 transition">
                  <td className="py-4 pl-5">
                    <div className="flex items-center gap-3">
                      <div className="grid size-9 place-items-center rounded-full bg-[#1E1E1E] border border-[#292929] font-bold text-white text-xs">
                        {member.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-white">{member.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-[#A1A1AA]">{member.email}</td>
                  <td className="py-4 px-4">
                    <div className="inline-flex items-center gap-1.5 rounded-lg border border-[#292929] bg-[#1A1A1A] px-2.5 py-1 text-[11px] font-medium text-white">
                      <Shield size={12} className="text-[#F51D2B]" />
                      <span>{member.role}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        member.status === "Active"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-amber-500/10 text-amber-400"
                      }`}
                    >
                      {member.status}
                    </span>
                  </td>
                  <td className="py-4 pr-5 text-right">
                    <button
                      onClick={() => handleRemove(member.id)}
                      className="grid size-8 place-items-center rounded-lg border border-[#292929] bg-[#1A1A1A] text-red-400 hover:bg-red-500/10 transition ml-auto"
                      title="Remove Member"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Member Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#292929] bg-[#141414] p-6 text-xs">
            <h3 className="text-base font-bold text-white">Invite Team Member</h3>
            <p className="mt-1 text-[#A1A1AA]">
              Assign permissions for staff members to manage turf slots or scan QR tickets at the gate.
            </p>
            <form onSubmit={handleAddMember} className="mt-5 space-y-4">
              <div>
                <label className="block text-[#A1A1AA] mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Suresh Kumar"
                  className="w-full rounded-xl border border-[#292929] bg-[#1A1A1A] p-2.5 text-white outline-none focus:border-[#F51D2B]"
                />
              </div>
              <div>
                <label className="block text-[#A1A1AA] mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="suresh@company.com"
                  className="w-full rounded-xl border border-[#292929] bg-[#1A1A1A] p-2.5 text-white outline-none focus:border-[#F51D2B]"
                />
              </div>
              <div>
                <label className="block text-[#A1A1AA] mb-1.5">Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as TeamMember["role"])}
                  className="w-full rounded-xl border border-[#292929] bg-[#1A1A1A] p-2.5 text-white outline-none focus:border-[#F51D2B]"
                >
                  <option value="Staff / Check-in Agent">Staff / Check-in Agent (Entry Scanner)</option>
                  <option value="Manager">Manager (Listings & Bookings)</option>
                  <option value="Accountant">Accountant (Payouts & Reports)</option>
                </select>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-[#292929] bg-[#1A1A1A] px-4 py-2 text-white hover:bg-[#252525]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#F51D2B] px-5 py-2 font-bold text-white hover:bg-[#ff2b39]"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
