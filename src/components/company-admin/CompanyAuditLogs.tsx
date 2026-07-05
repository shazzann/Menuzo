import {
  Search, Filter, Download, Calendar, User, Monitor, Globe,
  Shield, Clock, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

const mockAuditLogs = [
  { id: 'AL-001', date: '2026-07-05 14:32', admin: 'Super Admin', action: 'Shop Suspended', target: 'Matara Hoppers Corner', device: 'Chrome / Windows', ip: '192.168.1.105', status: 'Success' },
  { id: 'AL-002', date: '2026-07-05 13:18', admin: 'Super Admin', action: 'Plan Updated', target: 'Kandy Royal Kitchen', device: 'Chrome / Windows', ip: '192.168.1.105', status: 'Success' },
  { id: 'AL-003', date: '2026-07-05 12:45', admin: 'Admin (Priya)', action: 'Coupon Created', target: 'WELCOME20', device: 'Safari / macOS', ip: '10.0.0.52', status: 'Success' },
  { id: 'AL-004', date: '2026-07-05 11:20', admin: 'Super Admin', action: 'Shop Verified', target: 'Ella Mountain Café', device: 'Chrome / Windows', ip: '192.168.1.105', status: 'Success' },
  { id: 'AL-005', date: '2026-07-05 10:05', admin: 'Admin (Priya)', action: 'Theme Published', target: 'Ocean Breeze', device: 'Safari / macOS', ip: '10.0.0.52', status: 'Success' },
  { id: 'AL-006', date: '2026-07-04 18:30', admin: 'Super Admin', action: 'Login', target: '-', device: 'Chrome / Windows', ip: '192.168.1.105', status: 'Success' },
  { id: 'AL-007', date: '2026-07-04 16:45', admin: 'Admin (Kamal)', action: 'API Key Generated', target: 'Production Key', device: 'Firefox / Linux', ip: '172.16.0.10', status: 'Success' },
  { id: 'AL-008', date: '2026-07-04 14:20', admin: 'Super Admin', action: 'Failed Login Attempt', target: '-', device: 'Unknown', ip: '203.45.67.89', status: 'Failed' },
  { id: 'AL-009', date: '2026-07-04 12:15', admin: 'Super Admin', action: 'Broadcast Sent', target: 'All Active Shops', device: 'Chrome / Windows', ip: '192.168.1.105', status: 'Success' },
  { id: 'AL-010', date: '2026-07-04 09:30', admin: 'Admin (Priya)', action: 'Support Ticket Resolved', target: 'T-1004', device: 'Safari / macOS', ip: '10.0.0.52', status: 'Success' },
];

export function CompanyAuditLogs() {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = mockAuditLogs.filter(
    (log) =>
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.admin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.target.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track all admin actions and system events</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/30 hover:bg-muted/50 text-sm transition-colors">
            <Calendar className="w-4 h-4" /> Date Range
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Actions', value: '1,247', color: 'text-blue-500' },
          { label: 'Today', value: '34', color: 'text-emerald-500' },
          { label: 'Failed Actions', value: '3', color: 'text-red-500' },
          { label: 'Active Admins', value: '4', color: 'text-violet-500' },
        ].map((stat) => (
          <div key={stat.label} className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-4 text-center">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by action, admin, or target..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/30 border border-border/50 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <button className="p-2.5 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/20">
                <th className="text-left text-xs font-semibold text-muted-foreground py-3 px-4">Date & Time</th>
                <th className="text-left text-xs font-semibold text-muted-foreground py-3 px-4">Admin</th>
                <th className="text-left text-xs font-semibold text-muted-foreground py-3 px-4">Action</th>
                <th className="text-left text-xs font-semibold text-muted-foreground py-3 px-4">Target</th>
                <th className="text-left text-xs font-semibold text-muted-foreground py-3 px-4">Device</th>
                <th className="text-left text-xs font-semibold text-muted-foreground py-3 px-4">IP Address</th>
                <th className="text-left text-xs font-semibold text-muted-foreground py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id} className="border-b border-border/30 hover:bg-muted/10 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{log.date}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-[10px] font-bold">
                        {log.admin.charAt(0)}
                      </div>
                      <span className="text-sm font-medium">{log.admin}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm">{log.action}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{log.target}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <Monitor className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{log.device}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs font-mono text-muted-foreground">{log.ip}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                      log.status === 'Success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-border/50">
          <span className="text-xs text-muted-foreground">Showing 1-10 of 1,247 entries</span>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors">
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            {[1, 2, 3, '...', 125].map((page, i) => (
              <button
                key={i}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                  page === 1 ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted/50'
                }`}
              >
                {page}
              </button>
            ))}
            <button className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors">
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
