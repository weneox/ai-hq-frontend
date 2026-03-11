import { useEffect, useMemo, useState } from "react";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import {
  listTenants,
  listTenantUsers,
  createTenantUser,
  updateTenantUser,
  setTenantUserStatus,
  setTenantUserPassword,
  deleteTenantUser,
} from "../api/tenants.js";

function cx(...arr) {
  return arr.filter(Boolean).join(" ");
}

function roleTone(role) {
  const r = String(role || "").toLowerCase();
  if (r === "owner") return "border-violet-400/20 bg-violet-500/10 text-violet-200";
  if (r === "admin") return "border-sky-400/20 bg-sky-500/10 text-sky-200";
  if (r === "operator") return "border-emerald-400/20 bg-emerald-500/10 text-emerald-200";
  if (r === "marketer") return "border-fuchsia-400/20 bg-fuchsia-500/10 text-fuchsia-200";
  if (r === "analyst") return "border-amber-400/20 bg-amber-500/10 text-amber-200";
  return "border-white/10 bg-white/[0.04] text-slate-200";
}

function statusTone(status) {
  const s = String(status || "").toLowerCase();
  if (s === "active") return "border-emerald-400/20 bg-emerald-500/10 text-emerald-200";
  if (s === "invited") return "border-amber-400/20 bg-amber-500/10 text-amber-200";
  if (s === "disabled") return "border-rose-400/20 bg-rose-500/10 text-rose-200";
  if (s === "removed") return "border-slate-400/20 bg-slate-500/10 text-slate-300";
  return "border-white/10 bg-white/[0.04] text-slate-200";
}

function roleLabel(role) {
  const r = String(role || "").toLowerCase();
  if (r === "owner") return "Owner";
  if (r === "admin") return "Administrator";
  if (r === "operator") return "Operator";
  if (r === "marketer") return "Marketing";
  if (r === "analyst") return "Analyst";
  return "Team member";
}

function statusLabel(status) {
  const s = String(status || "").toLowerCase();
  if (s === "active") return "Active";
  if (s === "invited") return "Pending setup";
  if (s === "disabled") return "Disabled";
  if (s === "removed") return "Removed";
  return "Unknown";
}

function Chip({ children, className = "" }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium",
        className
      )}
    >
      {children}
    </span>
  );
}

const EMPTY_CREATE = {
  email: "",
  full_name: "",
  role: "member",
  status: "invited",
  password: "",
};

const EMPTY_EDIT = {
  id: "",
  email: "",
  full_name: "",
  role: "member",
  status: "invited",
};

export default function AdminTeam() {
  const [tenants, setTenants] = useState([]);
  const [tenantKey, setTenantKey] = useState("");
  const [users, setUsers] = useState([]);
  const [loadingTenants, setLoadingTenants] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [creating, setCreating] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [removingId, setRemovingId] = useState("");
  const [query, setQuery] = useState("");
  const [createForm, setCreateForm] = useState(EMPTY_CREATE);
  const [editForm, setEditForm] = useState(EMPTY_EDIT);
  const [passwordUserId, setPasswordUserId] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadTenants() {
    setLoadingTenants(true);
    try {
      const rows = await listTenants();
      setTenants(Array.isArray(rows) ? rows : []);
      if (!tenantKey && rows?.[0]?.tenant_key) {
        setTenantKey(rows[0].tenant_key);
      }
    } catch (e) {
      setError(String(e?.message || e || "Unable to load workspaces"));
      setTenants([]);
    } finally {
      setLoadingTenants(false);
    }
  }

  async function loadUsers(key) {
    if (!key) {
      setUsers([]);
      return;
    }

    setLoadingUsers(true);
    setError("");
    try {
      const rows = await listTenantUsers(key);
      setUsers(Array.isArray(rows) ? rows : []);
    } catch (e) {
      setError(String(e?.message || e || "Unable to load users"));
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }

  useEffect(() => {
    loadTenants();
  }, []);

  useEffect(() => {
    if (tenantKey) {
      loadUsers(tenantKey);
      setEditForm(EMPTY_EDIT);
      setPasswordUserId("");
      setNewPassword("");
    }
  }, [tenantKey]);

  const filteredUsers = useMemo(() => {
    const q = String(query || "").trim().toLowerCase();
    if (!q) return users;

    return users.filter((u) => {
      const hay = [u?.user_email, u?.full_name, u?.role, u?.status]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return hay.includes(q);
    });
  }, [users, query]);

  function patchCreate(key, value) {
    setCreateForm((p) => ({ ...p, [key]: value }));
  }

  function patchEdit(key, value) {
    setEditForm((p) => ({ ...p, [key]: value }));
  }

  function startEdit(user) {
    setEditForm({
      id: String(user?.id || ""),
      email: String(user?.user_email || ""),
      full_name: String(user?.full_name || ""),
      role: String(user?.role || "member"),
      status: String(user?.status || "invited"),
    });
  }

  async function handleCreateUser() {
    setCreating(true);
    setError("");
    setSuccess("");

    try {
      if (!tenantKey) throw new Error("Please select a workspace");
      if (!createForm.email.trim()) throw new Error("Email address is required");
      if (!createForm.full_name.trim()) throw new Error("Full name is required");

      const res = await createTenantUser(tenantKey, {
        user_email: createForm.email.trim().toLowerCase(),
        full_name: createForm.full_name.trim(),
        role: createForm.role,
        status: createForm.status,
        password: createForm.password || undefined,
      });

      setSuccess(`${res?.user?.user_email || "User"} has been created`);
      setCreateForm(EMPTY_CREATE);
      await loadUsers(tenantKey);
    } catch (e) {
      setError(String(e?.message || e || "Unable to create user"));
    } finally {
      setCreating(false);
    }
  }

  async function handleSaveEdit() {
    setSavingEdit(true);
    setError("");
    setSuccess("");

    try {
      if (!tenantKey) throw new Error("Please select a workspace");
      if (!editForm.id) throw new Error("Please select a user");

      const res = await updateTenantUser(tenantKey, editForm.id, {
        user_email: editForm.email.trim().toLowerCase(),
        full_name: editForm.full_name.trim(),
        role: editForm.role,
        status: editForm.status,
      });

      setSuccess(`${res?.user?.user_email || "User"} has been updated`);
      await loadUsers(tenantKey);
    } catch (e) {
      setError(String(e?.message || e || "Unable to save changes"));
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleQuickStatus(userId, status) {
    setError("");
    setSuccess("");

    try {
      if (!tenantKey) throw new Error("Please select a workspace");
      const res = await setTenantUserStatus(tenantKey, userId, status);
      setSuccess(`${res?.user?.user_email || "User"} status has been updated`);
      await loadUsers(tenantKey);
    } catch (e) {
      setError(String(e?.message || e || "Unable to update status"));
    }
  }

  async function handleSetPassword() {
    setSavingPassword(true);
    setError("");
    setSuccess("");

    try {
      if (!tenantKey) throw new Error("Please select a workspace");
      if (!passwordUserId) throw new Error("Please select a user");
      if (!newPassword) throw new Error("A new password is required");
      if (newPassword.length < 8) {
        throw new Error("Password must be at least 8 characters");
      }

      const res = await setTenantUserPassword(tenantKey, passwordUserId, newPassword);
      setSuccess(`${res?.user?.user_email || "User"} password has been updated`);
      setNewPassword("");
      await loadUsers(tenantKey);
    } catch (e) {
      setError(String(e?.message || e || "Unable to update password"));
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleDelete(userId) {
    setRemovingId(userId);
    setError("");
    setSuccess("");

    try {
      if (!tenantKey) throw new Error("Please select a workspace");
      await deleteTenantUser(tenantKey, userId);
      setSuccess("User has been deleted");

      if (editForm.id === userId) {
        setEditForm(EMPTY_EDIT);
      }
      if (passwordUserId === userId) {
        setPasswordUserId("");
        setNewPassword("");
      }

      await loadUsers(tenantKey);
    } catch (e) {
      setError(String(e?.message || e || "Unable to delete user"));
    } finally {
      setRemovingId("");
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-1">
          <div className="text-xl font-semibold text-slate-900 dark:text-white">
            Team Management
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Manage team members, access levels, and passwords for each workspace.
          </div>
        </div>
      </Card>

      {error ? (
        <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {success}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <section className="space-y-5">
          <Card className="p-5">
            <div className="mb-4">
              <div className="text-base font-semibold text-slate-900 dark:text-white">
                Workspace Selection
              </div>
              <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Choose the workspace you want to manage.
              </div>
            </div>

            {loadingTenants ? (
              <div className="text-sm text-slate-400">Loading workspaces...</div>
            ) : (
              <select
                value={tenantKey}
                onChange={(e) => setTenantKey(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none"
              >
                <option value="">Select workspace</option>
                {tenants.map((t) => (
                  <option key={t.tenant_key} value={t.tenant_key}>
                    {t.company_name || t.tenant_key} ({t.tenant_key})
                  </option>
                ))}
              </select>
            )}
          </Card>

          <Card className="p-5">
            <div className="mb-4">
              <div className="text-base font-semibold text-slate-900 dark:text-white">
                Add New User
              </div>
              <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Create a new login for the selected workspace.
              </div>
            </div>

            <div className="space-y-4">
              <Input
                value={createForm.email}
                onChange={(e) => patchCreate("email", e.target.value)}
                placeholder="Email address"
              />
              <Input
                value={createForm.full_name}
                onChange={(e) => patchCreate("full_name", e.target.value)}
                placeholder="Full name"
              />

              <select
                value={createForm.role}
                onChange={(e) => patchCreate("role", e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none"
              >
                <option value="owner">Owner</option>
                <option value="admin">Administrator</option>
                <option value="operator">Operator</option>
                <option value="member">Team member</option>
                <option value="marketer">Marketing</option>
                <option value="analyst">Analyst</option>
              </select>

              <select
                value={createForm.status}
                onChange={(e) => patchCreate("status", e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none"
              >
                <option value="invited">Pending setup</option>
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </select>

              <Input
                type="password"
                value={createForm.password}
                onChange={(e) => patchCreate("password", e.target.value)}
                placeholder="Initial login password"
              />

              <div className="flex justify-end">
                <Button onClick={handleCreateUser} disabled={creating || !tenantKey}>
                  {creating ? "Creating..." : "Create User"}
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-4">
              <div className="text-base font-semibold text-slate-900 dark:text-white">
                Edit User Details
              </div>
              <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Select a user from the list and update their account details.
              </div>
            </div>

            <div className="space-y-4">
              <Input
                value={editForm.email}
                onChange={(e) => patchEdit("email", e.target.value)}
                placeholder="Email address"
                disabled={!editForm.id}
              />
              <Input
                value={editForm.full_name}
                onChange={(e) => patchEdit("full_name", e.target.value)}
                placeholder="Full name"
                disabled={!editForm.id}
              />

              <select
                value={editForm.role}
                onChange={(e) => patchEdit("role", e.target.value)}
                disabled={!editForm.id}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none disabled:opacity-50"
              >
                <option value="owner">Owner</option>
                <option value="admin">Administrator</option>
                <option value="operator">Operator</option>
                <option value="member">Team member</option>
                <option value="marketer">Marketing</option>
                <option value="analyst">Analyst</option>
              </select>

              <select
                value={editForm.status}
                onChange={(e) => patchEdit("status", e.target.value)}
                disabled={!editForm.id}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none disabled:opacity-50"
              >
                <option value="invited">Pending setup</option>
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
                <option value="removed">Removed</option>
              </select>

              <div className="flex justify-end">
                <Button
                  variant="secondary"
                  onClick={handleSaveEdit}
                  disabled={savingEdit || !editForm.id}
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-4">
              <div className="text-base font-semibold text-slate-900 dark:text-white">
                Reset User Password
              </div>
              <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Set a new login password for an existing user.
              </div>
            </div>

            <div className="space-y-4">
              <select
                value={passwordUserId}
                onChange={(e) => setPasswordUserId(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none"
              >
                <option value="">Select user</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name || u.user_email} ({u.user_email})
                  </option>
                ))}
              </select>

              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New login password"
              />

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={handleSetPassword}
                  disabled={savingPassword || !tenantKey}
                >
                  {savingPassword ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </div>
          </Card>
        </section>

        <section className="space-y-5">
          <Card className="p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <div className="text-base font-semibold text-slate-900 dark:text-white">
                  Team Members
                </div>
                <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Users in the selected workspace
                </div>
              </div>

              <Chip className="border-white/10 bg-white/[0.04] text-slate-200">
                {users.length}
              </Chip>
            </div>

            <div className="mb-4">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by email, name, role, or status"
              />
            </div>

            <div className="max-h-[980px] space-y-3 overflow-auto pr-1">
              {loadingUsers ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">
                  Loading users...
                </div>
              ) : !tenantKey ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">
                  Select a workspace to view users.
                </div>
              ) : filteredUsers.length ? (
                filteredUsers.map((user) => {
                  const activeEdit = editForm.id === user.id;
                  const activePassword = passwordUserId === user.id;

                  return (
                    <div
                      key={user.id}
                      className={cx(
                        "rounded-2xl border p-4 transition",
                        activeEdit || activePassword
                          ? "border-sky-400/30 bg-sky-500/10"
                          : "border-white/10 bg-white/[0.03]"
                      )}
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-white">
                            {user.full_name || "-"}
                          </div>
                          <div className="mt-1 truncate text-sm text-slate-400">
                            {user.user_email}
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <Chip className={roleTone(user.role)}>
                              {roleLabel(user.role)}
                            </Chip>
                            <Chip className={statusTone(user.status)}>
                              {statusLabel(user.status)}
                            </Chip>
                          </div>

                          <div className="mt-3 text-xs text-slate-500">
                            Created on{" "}
                            {user.created_at ? new Date(user.created_at).toLocaleString() : "-"}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" onClick={() => startEdit(user)}>
                            Edit
                          </Button>

                          <Button
                            variant="outline"
                            onClick={() => {
                              setPasswordUserId(user.id);
                              setNewPassword("");
                            }}
                          >
                            Change Password
                          </Button>

                          {user.status !== "active" ? (
                            <Button
                              variant="outline"
                              onClick={() => handleQuickStatus(user.id, "active")}
                            >
                              Activate
                            </Button>
                          ) : null}

                          {user.status !== "disabled" ? (
                            <Button
                              variant="outline"
                              onClick={() => handleQuickStatus(user.id, "disabled")}
                            >
                              Disable
                            </Button>
                          ) : null}

                          <Button
                            variant="secondary"
                            onClick={() => handleDelete(user.id)}
                            disabled={removingId === user.id}
                          >
                            {removingId === user.id ? "Deleting..." : "Delete"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">
                  No users found.
                </div>
              )}
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}