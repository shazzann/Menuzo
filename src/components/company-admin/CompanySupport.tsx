import { mockTickets } from '@/data/companyAdminData';
import {
  Ticket, MessageSquare, Search, Filter, Plus, Clock, AlertTriangle,
  CheckCircle2, XCircle, ChevronRight, Send, Headphones,
} from 'lucide-react';
import { useState } from 'react';

const priorityColors: Record<string, string> = {
  low: 'bg-slate-500/10 text-slate-500',
  medium: 'bg-blue-500/10 text-blue-500',
  high: 'bg-amber-500/10 text-amber-500',
  critical: 'bg-red-500/10 text-red-500',
};

const statusIcons: Record<string, React.ReactNode> = {
  open: <Clock className="w-3.5 h-3.5 text-amber-500" />,
  'in-progress': <AlertTriangle className="w-3.5 h-3.5 text-blue-500" />,
  resolved: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />,
  closed: <XCircle className="w-3.5 h-3.5 text-slate-500" />,
};

export function CompanySupport() {
  const [activeView, setActiveView] = useState<'tickets' | 'chat'>('tickets');
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  const summaryStats = [
    { label: 'Open', value: 12, color: 'text-amber-500' },
    { label: 'In Progress', value: 5, color: 'text-blue-500' },
    { label: 'Resolved', value: 34, color: 'text-emerald-500' },
    { label: 'Avg Response', value: '2.4h', color: 'text-violet-500' },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Support Center</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage tickets, live chat, and messages</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-muted/30 rounded-xl p-1 gap-0.5">
            <button
              onClick={() => setActiveView('tickets')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeView === 'tickets' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Ticket className="w-4 h-4" /> Tickets
            </button>
            <button
              onClick={() => setActiveView('chat')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeView === 'chat' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <MessageSquare className="w-4 h-4" /> Live Chat
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium shadow-lg shadow-primary/25 hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" />
            New Ticket
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {summaryStats.map((stat) => (
          <div key={stat.label} className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-4 text-center">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {activeView === 'tickets' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Ticket List */}
          <div className="lg:col-span-2 bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl">
            <div className="p-4 border-b border-border/50">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search tickets..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-muted/30 border border-border/50 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <button className="p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="divide-y divide-border/30">
              {mockTickets.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket.id)}
                  className={`w-full text-left p-4 hover:bg-muted/10 transition-colors ${
                    selectedTicket === ticket.id ? 'bg-muted/20' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {statusIcons[ticket.status]}
                      <span className="text-xs font-mono text-muted-foreground">{ticket.id}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${priorityColors[ticket.priority]}`}>
                      {ticket.priority}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold mb-1">{ticket.subject}</h4>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{ticket.shopName}</span>
                    <span>Last reply: {ticket.lastReply}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Ticket Detail / Priority Queue */}
          <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-5">
            <h3 className="text-lg font-semibold mb-4">Priority Queue</h3>
            <div className="space-y-3">
              {mockTickets
                .filter((t) => t.status === 'open' || t.status === 'in-progress')
                .sort((a, b) => {
                  const order = { critical: 0, high: 1, medium: 2, low: 3 };
                  return order[a.priority] - order[b.priority];
                })
                .map((ticket) => (
                  <div key={ticket.id} className="p-3 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${priorityColors[ticket.priority]}`}>
                        {ticket.priority}
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium">{ticket.subject}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{ticket.shopName} • {ticket.lastReply}</p>
                  </div>
                ))}
            </div>

            <div className="mt-6 p-4 rounded-xl bg-muted/10 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <Headphones className="w-5 h-5 text-primary" />
                <h4 className="text-sm font-semibold">Support Stats</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Resolution Rate</span>
                  <span className="font-semibold text-emerald-500">94.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Satisfaction</span>
                  <span className="font-semibold text-emerald-500">4.8/5.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg Resolution Time</span>
                  <span className="font-semibold">6.2h</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Live Chat View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Chat List */}
          <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl">
            <div className="p-4 border-b border-border/50">
              <h3 className="text-sm font-semibold">Active Chats</h3>
            </div>
            <div className="divide-y divide-border/30">
              {[
                { name: 'Kamal Perera', shop: 'Colombo Spice Garden', message: 'How do I add videos?', time: '2m', unread: 3 },
                { name: 'Samira Hussain', shop: 'Beach Bites Galle', message: 'Theme issue on mobile', time: '15m', unread: 1 },
                { name: 'Dinesh Bandara', shop: 'Ella Mountain Café', message: 'Thanks for the help!', time: '1h', unread: 0 },
              ].map((chat, i) => (
                <button key={i} className="w-full text-left p-4 hover:bg-muted/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-sm font-bold">
                        {chat.name.charAt(0)}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-card" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">{chat.name}</p>
                        <span className="text-[11px] text-muted-foreground">{chat.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{chat.message}</p>
                    </div>
                    {chat.unread > 0 && (
                      <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl flex flex-col">
            <div className="p-4 border-b border-border/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold">
                K
              </div>
              <div>
                <p className="text-sm font-medium">Kamal Perera</p>
                <p className="text-xs text-emerald-500">Online</p>
              </div>
            </div>
            <div className="flex-1 p-4 space-y-4 min-h-[300px]">
              <div className="flex justify-start">
                <div className="max-w-[70%] p-3 rounded-2xl rounded-bl-sm bg-muted/30 text-sm">
                  Hi, how do I add videos to my menu items?
                </div>
              </div>
              <div className="flex justify-end">
                <div className="max-w-[70%] p-3 rounded-2xl rounded-br-sm bg-primary text-primary-foreground text-sm">
                  Hello Kamal! You can add videos from the menu item editor. Click on the media tab and upload your video file.
                </div>
              </div>
              <div className="flex justify-start">
                <div className="max-w-[70%] p-3 rounded-2xl rounded-bl-sm bg-muted/30 text-sm">
                  What formats are supported?
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-border/50">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-muted/30 border border-border/50 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
