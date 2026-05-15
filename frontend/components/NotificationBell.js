import { useState, useEffect, useRef } from 'react';
import { HiBell, HiExclamation, HiClock, HiDocumentText } from 'react-icons/hi';
import { api } from '../lib/api';
import Link from 'next/link';

export default function NotificationBell() {
  const [data, setData] = useState(null);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const fetch = () => api.getNotifications().then(setData).catch(() => {});
    fetch();
    const interval = setInterval(fetch, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const total = (data?.counts?.overdue || 0) + (data?.counts?.due_today || 0) + (data?.counts?.pending_docs || 0);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
      >
        <HiBell className="w-5 h-5" />
        {total > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {total > 9 ? '9+' : total}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {!data || total === 0 ? (
              <p className="text-sm text-gray-500 px-4 py-6 text-center">No notifications</p>
            ) : (
              <>
                {data.follow_ups?.filter(n => n.type === 'overdue').map(n => (
                  <Link key={n.id} href={`/leads/${n.lead_id}`} className="flex items-start gap-3 px-4 py-3 hover:bg-red-50 transition-colors border-b border-gray-50" onClick={() => setOpen(false)}>
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <HiExclamation className="w-4 h-4 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{n.lead_name}</p>
                      <p className="text-xs text-red-600">Overdue by {Math.abs(n.days_diff)} day{Math.abs(n.days_diff) !== 1 ? 's' : ''}</p>
                    </div>
                  </Link>
                ))}
                {data.follow_ups?.filter(n => n.type === 'due_today').map(n => (
                  <Link key={n.id} href={`/leads/${n.lead_id}`} className="flex items-start gap-3 px-4 py-3 hover:bg-amber-50 transition-colors border-b border-gray-50" onClick={() => setOpen(false)}>
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <HiClock className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{n.lead_name}</p>
                      <p className="text-xs text-amber-600">Follow-up due today</p>
                    </div>
                  </Link>
                ))}
                {data.pending_documents?.map(d => (
                  <Link key={d.id} href="/documents" className="flex items-start gap-3 px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-50" onClick={() => setOpen(false)}>
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <HiDocumentText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{d.title}</p>
                      <p className="text-xs text-blue-600">Pending verification · {d.property}</p>
                    </div>
                  </Link>
                ))}
              </>
            )}
          </div>

          <div className="px-4 py-2 border-t border-gray-100">
            <Link href="/leads" className="text-xs text-primary-600 hover:underline font-medium" onClick={() => setOpen(false)}>
              View all follow-ups →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
