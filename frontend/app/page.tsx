 'use client';

import { Button } from '../components/ui/button';
import { toast } from 'sonner';

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white">Recruitment Management</h1>
        <p className="mt-2 text-sm text-slate-300">
          Manage clients, job vacancies, agencies and candidates with role-based access control.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() =>
            toast.success('Logged in successfully', {
              description: 'This is a sample toast integrated at the root level.'
            })
          }
        >
          Show success toast
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.error('Permission denied', {
              description: 'This action requires additional permissions.'
            })
          }
        >
          Show error toast
        </Button>
      </div>
    </div>
  );
}
