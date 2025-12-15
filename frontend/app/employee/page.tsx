'use client';

import { BriefcaseBusiness, Building2, Users } from 'lucide-react';
import { Button } from '../../components/ui/button';

export default function EmployeeDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
            Employee workspace
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Manage clients, job templates, vacancies and candidate pipelines.
          </p>
        </div>
        <Button size="sm" className="hidden md:inline-flex">
          <BriefcaseBusiness className="mr-2 h-4 w-4" />
          New job vacancy
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Clients</p>
              <p className="mt-1 text-xl font-semibold text-white">Assigned accounts</p>
            </div>
            <div className="rounded-full bg-sky-600/10 p-2 text-sky-500">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            View and manage only the clients mapped to your profile.
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Vacancies</p>
              <p className="mt-1 text-xl font-semibold text-white">Active jobs</p>
            </div>
            <div className="rounded-full bg-violet-600/10 p-2 text-violet-500">
              <BriefcaseBusiness className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Track job status, templates and agencies working on each role.
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Candidates</p>
              <p className="mt-1 text-xl font-semibold text-white">Pipeline</p>
            </div>
            <div className="rounded-full bg-emerald-600/10 p-2 text-emerald-500">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Review applicants submitted by agencies across assigned jobs.
          </p>
        </div>
      </div>
    </div>
  );
}


