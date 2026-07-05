import {
  Server, Database, Globe, HardDrive, Cpu, MemoryStick, Activity,
  AlertTriangle, CheckCircle2, RefreshCw, Clock, Zap, Wifi, Shield,
} from 'lucide-react';

export function CompanySystemHealth() {
  const services = [
    { name: 'Web Server', status: 'Operational', uptime: '99.98%', icon: <Server className="w-5 h-5" />, color: 'text-emerald-500' },
    { name: 'Database', status: 'Operational', uptime: '99.99%', icon: <Database className="w-5 h-5" />, color: 'text-emerald-500' },
    { name: 'API Gateway', status: 'Operational', uptime: '99.95%', icon: <Globe className="w-5 h-5" />, color: 'text-emerald-500' },
    { name: 'CDN', status: 'Operational', uptime: '99.99%', icon: <Wifi className="w-5 h-5" />, color: 'text-emerald-500' },
    { name: 'Auth Service', status: 'Operational', uptime: '99.97%', icon: <Shield className="w-5 h-5" />, color: 'text-emerald-500' },
    { name: 'Background Jobs', status: 'Degraded', uptime: '98.2%', icon: <Zap className="w-5 h-5" />, color: 'text-amber-500' },
  ];

  const resourceMetrics = [
    { name: 'CPU Usage', value: 42, max: 100, unit: '%', color: 'bg-blue-500' },
    { name: 'Memory', value: 6.2, max: 16, unit: 'GB', color: 'bg-violet-500' },
    { name: 'Storage', value: 234, max: 500, unit: 'GB', color: 'bg-orange-500' },
    { name: 'Bandwidth', value: 78, max: 100, unit: '%', color: 'bg-emerald-500' },
  ];

  const recentErrors = [
    { time: '14:32:05', level: 'Warning', message: 'High memory usage on worker-3', count: 3 },
    { time: '14:28:12', level: 'Error', message: 'Background job timeout: email-queue', count: 1 },
    { time: '13:45:20', level: 'Warning', message: 'Slow database query detected (>2s)', count: 7 },
    { time: '12:15:33', level: 'Info', message: 'Auto-scaling triggered: +1 instance', count: 1 },
    { time: '10:02:45', level: 'Error', message: 'Failed to connect to SMTP server', count: 2 },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Health</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Monitor server status and performance</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium bg-emerald-500/10 rounded-full px-3 py-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            All Systems Operational
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/30 hover:bg-muted/50 text-sm transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Overall Status */}
      <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Service Status</h3>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Last checked: 30s ago
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {services.map((service) => (
            <div key={service.name} className="flex items-center justify-between p-4 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`${service.color}`}>{service.icon}</div>
                <div>
                  <p className="text-sm font-medium">{service.name}</p>
                  <p className={`text-xs font-medium ${service.color}`}>{service.status}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{service.uptime}</p>
                <p className="text-[11px] text-muted-foreground">uptime</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resource Usage */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {resourceMetrics.map((metric) => {
          const percentage = (metric.value / metric.max) * 100;
          return (
            <div key={metric.name} className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-muted-foreground">{metric.name}</h4>
                <span className={`text-xs font-semibold ${percentage > 80 ? 'text-red-500' : percentage > 60 ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {percentage > 80 ? 'High' : percentage > 60 ? 'Medium' : 'Normal'}
                </span>
              </div>
              <p className="text-2xl font-bold mb-3">
                {metric.value}<span className="text-sm text-muted-foreground ml-1">{metric.unit}</span>
              </p>
              <div className="w-full h-2 rounded-full bg-muted/30 overflow-hidden">
                <div
                  className={`h-full rounded-full ${metric.color} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1.5">
                {metric.value} / {metric.max} {metric.unit}
              </p>
            </div>
          );
        })}
      </div>

      {/* Error Logs + Background Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Error Logs */}
        <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Errors</h3>
            <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-xs font-medium">3 new</span>
          </div>
          <div className="space-y-3">
            {recentErrors.map((error, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/20">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  error.level === 'Error' ? 'bg-red-500' :
                  error.level === 'Warning' ? 'bg-amber-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-semibold ${
                      error.level === 'Error' ? 'text-red-500' :
                      error.level === 'Warning' ? 'text-amber-500' : 'text-blue-500'
                    }`}>
                      {error.level}
                    </span>
                    <span className="text-[11px] text-muted-foreground">{error.time}</span>
                  </div>
                  <p className="text-sm mt-0.5">{error.message}</p>
                  {error.count > 1 && (
                    <span className="text-[11px] text-muted-foreground">Occurred {error.count} times</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Background Jobs */}
        <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-5">
          <h3 className="text-lg font-semibold mb-4">Background Jobs</h3>
          <div className="space-y-3">
            {[
              { name: 'Email Queue', status: 'Running', processed: '1,247/1,250', health: 'Healthy' },
              { name: 'Image Processing', status: 'Running', processed: '89/89', health: 'Healthy' },
              { name: 'Analytics Aggregation', status: 'Running', processed: 'Continuous', health: 'Healthy' },
              { name: 'Subscription Renewal', status: 'Scheduled', processed: 'Next: 2h', health: 'Pending' },
              { name: 'Database Backup', status: 'Completed', processed: 'Last: 6h ago', health: 'Healthy' },
              { name: 'Cache Invalidation', status: 'Running', processed: 'Continuous', health: 'Degraded' },
            ].map((job) => (
              <div key={job.name} className="flex items-center justify-between p-3 rounded-xl bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    job.status === 'Running' ? 'bg-emerald-500 animate-pulse' :
                    job.status === 'Completed' ? 'bg-blue-500' : 'bg-amber-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium">{job.name}</p>
                    <p className="text-xs text-muted-foreground">{job.processed}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                  job.health === 'Healthy' ? 'bg-emerald-500/10 text-emerald-500' :
                  job.health === 'Degraded' ? 'bg-amber-500/10 text-amber-500' :
                  'bg-slate-500/10 text-slate-500'
                }`}>
                  {job.health}
                </span>
              </div>
            ))}
          </div>

          {/* Maintenance Mode */}
          <div className="mt-6 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="text-sm font-medium">Maintenance Mode</p>
                  <p className="text-xs text-muted-foreground">Enable to show maintenance page to users</p>
                </div>
              </div>
              <button className="relative w-11 h-6 rounded-full bg-muted transition-colors">
                <div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
