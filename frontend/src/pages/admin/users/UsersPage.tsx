import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  Search,
  ShieldAlert,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import Modal from "../../../components/common/Modal";
import {
  listAdminUsers,
  updateOrganizerApproval,
  type AdminUser,
} from "../../../services/adminService";

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [feedback, setFeedback] = useState("");

  const params = useMemo(
    () => ({
      page,
      limit: 15,
      search: search || undefined,
      role: role || undefined,
    }),
    [page, search, role],
  );

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-users", params],
    queryFn: () => listAdminUsers(params),
  });

  const approvalMutation = useMutation({
    mutationFn: ({ id, approved }: { id: string; approved: boolean }) =>
      updateOrganizerApproval(id, approved),
    onSuccess: () => {
      setFeedback("Organizer approval status updated.");
      void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (err) => {
      setFeedback(err instanceof Error ? err.message : "Failed to update organizer approval.");
    },
  });

  const formatDate = (iso: string) => {
    try {
      return new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[.25em] text-[#E31824]">
            COMMUNITY & ACCESS
          </p>
          <h1 className="mt-1 font-display text-4xl font-extrabold uppercase tracking-tight text-slate-900">
            User Management
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Manage customer accounts, verify organizer privileges, and review system access.
          </p>
        </div>
      </div>

      {feedback && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800">
          <div className="flex items-center gap-2">
            <Check size={16} />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback("")}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <section className="rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:p-5">
          <div className="relative flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by customer name, email..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-[#FCF9F4] pl-9 pr-4 text-xs font-medium text-slate-800 outline-none focus:border-[#E31824] focus:bg-white"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setPage(1);
              }}
              aria-label="Filter users by role"
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none focus:border-[#E31824]"
            >
              <option value="">All Roles</option>
              <option value="CUSTOMER">Customer</option>
              <option value="ORGANIZER">Organizer</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </div>

        {isError && (
          <div className="m-5 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
            {error instanceof Error ? error.message : "Could not load users."}
          </div>
        )}

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead>
              <tr className="bg-slate-50/75 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3.5">User Profile</th>
                <th className="px-4 py-3.5">Contact / Phone</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-4 py-3.5">Activity</th>
                <th className="px-4 py-3.5">Joined Date</th>
                <th className="px-4 py-3.5">Account Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }, (_, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    <td colSpan={7} className="px-5 py-4">
                      <div className="h-10 w-full animate-pulse rounded-xl bg-slate-100" />
                    </td>
                  </tr>
                ))
              ) : data?.users && data.users.length > 0 ? (
                data.users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-t border-slate-100 text-xs transition-colors hover:bg-slate-50/60"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="grid size-9 place-items-center rounded-xl bg-slate-100 font-bold text-slate-700">
                          {user.name.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{user.name}</p>
                          <p className="text-[11px] text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-slate-600">
                      {user.phone || "Not provided"}
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                          user.role === "ADMIN"
                            ? "bg-red-50 text-[#E31824]"
                            : user.role === "ORGANIZER"
                              ? "bg-purple-50 text-purple-700"
                              : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-slate-600">
                      <p>{user._count?.bookings || 0} booking(s)</p>
                      {user.role === "ORGANIZER" && (
                        <p className="text-[11px] text-slate-400">
                          {user._count?.events || 0} event(s)
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-slate-500">
                      {formatDate(user.createdAt)}
                    </td>

                    <td className="px-4 py-3.5">
                      {user.role === "ORGANIZER" ? (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            user.organizerApproved
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {user.organizerApproved ? (
                            <>
                              <ShieldCheck size={12} /> Approved
                            </>
                          ) : (
                            <>
                              <ShieldAlert size={12} /> Pending Review
                            </>
                          )}
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-emerald-600">Active</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          title="View user"
                          onClick={() => setSelectedUser(user)}
                          className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                        >
                          <Eye size={15} />
                        </button>

                        {user.role === "ORGANIZER" && (
                          <button
                            disabled={approvalMutation.isPending}
                            onClick={() =>
                              approvalMutation.mutate({
                                id: user.id,
                                approved: !user.organizerApproved,
                              })
                            }
                            className={`rounded-lg border px-2.5 py-1 text-[10px] font-bold transition ${
                              user.organizerApproved
                                ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                                : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            }`}
                          >
                            {user.organizerApproved ? "Revoke Approval" : "Approve Organizer"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-14 text-center">
                    <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-red-50 text-[#E31824]">
                      <Users size={22} />
                    </div>
                    <p className="mt-3 text-sm font-bold text-slate-800">No users found</p>
                    <p className="mt-1 text-xs text-slate-400">
                      Try adjusting your search criteria or role filters.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data?.pagination && data.pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-xs font-medium text-slate-500">
            <span>
              Page {page} of {data.pagination.pages} · {data.pagination.total} total
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <button
                disabled={page >= data.pagination.pages}
                onClick={() => setPage((p) => Math.min(data.pagination.pages, p + 1))}
                className="flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold hover:bg-slate-50 disabled:opacity-40"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* User Details Modal */}
      {selectedUser && (
        <Modal title="User Account Details" onClose={() => setSelectedUser(null)}>
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
              <div className="grid size-12 place-items-center rounded-2xl bg-[#E31824] text-lg font-black text-white">
                {selectedUser.name.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{selectedUser.name}</p>
                <p className="text-slate-500">{selectedUser.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-100 p-3">
                <span className="font-bold text-slate-400 text-[10px] uppercase">Assigned Role</span>
                <p className="mt-1 font-bold text-slate-800">{selectedUser.role}</p>
              </div>
              <div className="rounded-xl border border-slate-100 p-3">
                <span className="font-bold text-slate-400 text-[10px] uppercase">Phone</span>
                <p className="mt-1 font-bold text-slate-800">{selectedUser.phone || "None"}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-100 p-3">
                <span className="font-bold text-slate-400 text-[10px] uppercase">Total Bookings</span>
                <p className="mt-1 text-base font-black text-slate-900">{selectedUser._count?.bookings || 0}</p>
              </div>
              <div className="rounded-xl border border-slate-100 p-3">
                <span className="font-bold text-slate-400 text-[10px] uppercase">Registered Since</span>
                <p className="mt-1 font-bold text-slate-800">{formatDate(selectedUser.createdAt)}</p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
