'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BriefcaseBusiness, LayoutDashboard, ShieldCheck, UserCircle2, Users } from 'lucide-react';
import { cn } from '../../lib/utils';

const items = [
  {
    label: 'Overview',
    href: '/',
    icon: LayoutDashboard
  },
  {
    label: 'Admin',
    href: '/admin',
    icon: ShieldCheck
  },
  {
    label: 'Employee',
    href: '/employee',
    icon: BriefcaseBusiness
  },
  {
    label: 'Agency',
    href: '/agency',
    icon: Users
  }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 border-r border-slate-800 bg-slate-950/40 px-3 py-4 hidden md:flex md:flex-col">
      <div className="mb-6 flex items-center gap-2 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600 text-white">
          <UserCircle2 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight text-white">RMS</p>
          <p className="text-[11px] text-slate-400">Recruitment platform</p>
        </div>
      </div>
      <nav className="space-y-1 text-sm">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2 rounded-md px-2 py-2 transition-colors',
                active
                  ? 'bg-slate-800 text-sky-400'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-sky-300'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}


