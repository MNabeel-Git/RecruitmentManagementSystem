'use client';

import { Bell, LogOut, MoonStar } from 'lucide-react';
import { Button } from '../ui/button';

export function Topbar() {
  return (
    <header className="flex items-center justify-between gap-3 border-b border-slate-800 bg-slate-950/60 px-4 py-3 backdrop-blur">
      <div className="flex flex-col">
        <span className="text-xs uppercase tracking-wide text-slate-400">Recruitment</span>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Toggle dark mode">
          <MoonStar className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </header>
  );
}


