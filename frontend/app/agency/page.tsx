'use client';

import { BriefcaseBusiness, FileUser, Users } from 'lucide-react';
import { Button } from '../../components/ui/button';

export default function AgencyDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
            Agency workspace
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Submit and manage candidates for assigned job vacancies only.
          </p>
        </div>
        <Button size="sm" className="hidden md:inline-flex">
          <FileUser className="mr-2 h-4 w-4" />
          Add candidate
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Jobs</p>
              <p className="mt-1 text-xl font-semibold text-white">Assigned roles</p>
            </div>
            <div className="rounded-full bg-violet-600/10 p-2 text-violet-500">
              <BriefcaseBusiness className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            View only vacancies your agency is allowed to source for.
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Candidates</p>
              <p className="mt-1 text-xl font-semibold text-white">Submissions</p>
            </div>
            <div className="rounded-full bg-emerald-600/10 p-2 text-emerald-500">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Track candidate status and feedback from employees.
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Templates</p>
              <p className="mt-1 text-xl font-semibold text-white">Job requirements</p>
            </div>
            <div className="rounded-full bg-sky-600/10 p-2 text-sky-500">
              <FileUser className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            See the candidate data schema required for each vacancy.
          </p>
        </div>
      </div>
    </div>
  );
}


