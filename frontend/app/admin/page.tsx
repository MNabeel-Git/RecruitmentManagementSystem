'use client';

import { BriefcaseBusiness, ShieldCheck, Users } from 'lucide-react';
import { Button } from '../../components/ui/button';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
            Admin dashboard
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Manage users, roles, permissions and system configuration.
          </p>
        </div>
        <Button size="sm" className="hidden md:inline-flex">
          <ShieldCheck className="mr-2 h-4 w-4" />
          Security settings
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Users</p>
              <p className="mt-1 text-xl font-semibold text-white">Employees & agencies</p>
            </div>
            <div className="rounded-full bg-sky-600/10 p-2 text-sky-500">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Create and assign roles, control system access and onboarding.
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Roles</p>
              <p className="mt-1 text-xl font-semibold text-white">RBAC policies</p>
            </div>
            <div className="rounded-full bg-emerald-600/10 p-2 text-emerald-500">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Configure role-based permissions for recruitment operations.
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Jobs</p>
              <p className="mt-1 text-xl font-semibold text-white">Global overview</p>
            </div>
            <div className="rounded-full bg-violet-600/10 p-2 text-violet-500">
              <BriefcaseBusiness className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Monitor open vacancies and agencies assigned across clients.
          </p>
        </div>
      </div>
    </div>
  );
}


