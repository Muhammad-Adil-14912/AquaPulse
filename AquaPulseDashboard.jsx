import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Home, Activity, Droplets, LineChart as LineChartIcon, AlertTriangle, Wrench, MapPin, Zap,
  Settings as SettingsIcon, Workflow, Info, Bell, UserCircle2, Menu, X, ChevronRight, ChevronDown,
  CheckCircle2, XCircle, Sun, Battery, Gauge, Radio, Cloud, Cpu, Server, Wifi, WifiOff, Thermometer,
  Waves, Layers, ShieldCheck, ShieldAlert, PlayCircle, RotateCcw, TrendingUp, TrendingDown, Minus,
  Download, FileText, CircleDot, SlidersHorizontal, Calendar, ArrowDown, BadgeCheck, AlertOctagon,
  PlugZap, Signal
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, BarChart, Bar
} from "recharts";

/* =========================================================================
   AQUA PULSE — Smart Water Purification & Quality Monitoring System
   SIH 2026 · Problem Statement SIH26040 · Theme: Clean & Green Technology
   ========================================================================= */

/* ---------------------------- Static reference data ---------------------------- */

const PARAM_META = {
  ph: {
    key: "ph", label: "pH", unit: "", icon: Droplets, decimals: 1,
    normal: [6.5, 8.5], warn: [6.0, 9.0],
    info: "pH shows how acidic or alkaline the water is. A neutral value near 7 is considered ideal for drinking water.",
  },
  tds: {
    key: "tds", label: "TDS", unit: "ppm", icon: Layers, decimals: 0,
    normal: [0, 500], warn: [500, 1000],
    info: "TDS (Total Dissolved Solids) indicates the amount of dissolved material in water. It does not identify a specific contaminant.",
  },
  turbidity: {
    key: "turbidity", label: "Turbidity", unit: "NTU", icon: Waves, decimals: 1,
    normal: [0, 5], warn: [5, 10],
    info: "Turbidity measures how cloudy the water is, caused by suspended particles. Lower values mean clearer water.",
  },
  temperature: {
    key: "temperature", label: "Temperature", unit: "°C", icon: Thermometer, decimals: 1,
    normal: [10, 35], warn: [5, 40],
    info: "Water temperature can influence taste, disinfection efficiency and biological activity in the storage tank.",
  },
};

const RAW_BASELINE = { ph: 6.3, tds: 920, turbidity: 18, temperature: 27 };
const TREATED_BASELINE = { ph: 7.1, tds: 280, turbidity: 1.2, temperature: 26.4 };

const PIPELINE_STAGES = [
  { id: "sediment", label: "Sediment Filter", icon: SlidersHorizontal },
  { id: "carbon", label: "Activated Carbon", icon: CircleDot },
  { id: "ufro", label: "UF / RO", icon: Layers },
  { id: "uv", label: "UV Disinfection", icon: ShieldCheck },
];

const FILTERS = [
  { id: "sediment", name: "Sediment Filter", health: 82, hours: 1240, status: "Good", replace: "~45 days" },
  { id: "carbon", name: "Activated Carbon", health: 71, hours: 980, status: "Good", replace: "~30 days" },
  { id: "ufro", name: "UF / RO Membrane", health: 56, hours: 2100, status: "Maintenance Approaching", replace: "~10 days" },
  { id: "uv", name: "UV Module", health: 91, hours: 640, status: "Good", replace: "~60 days" },
];

const DEVICES = [
  { id: "UNIT-001", village: "Village Bhilwara", area: "Rural Zone", status: "online", quality: "normal", ph: 7.1, tds: 270, turbidity: 1.1, lastUpdate: "12s ago", alerts: 0, x: 22, y: 34 },
  { id: "UNIT-002", village: "Rampur Mining Belt", area: "Mining-Affected Zone", status: "alert", quality: "critical", ph: 6.4, tds: 940, turbidity: 16, lastUpdate: "2m ago", alerts: 2, x: 58, y: 22 },
  { id: "UNIT-003", village: "Kothari Village", area: "Rural Zone", status: "online", quality: "normal", ph: 7.0, tds: 295, turbidity: 1.4, lastUpdate: "30s ago", alerts: 0, x: 40, y: 62 },
  { id: "UNIT-004", village: "Sindri Colliery Outpost", area: "Mining-Affected Zone", status: "offline", quality: "unknown", ph: null, tds: null, turbidity: null, lastUpdate: "3h ago", alerts: 1, x: 74, y: 55 },
  { id: "UNIT-005", village: "Devgarh Hamlet", area: "Rural Zone", status: "online", quality: "warning", ph: 6.6, tds: 540, turbidity: 4.8, lastUpdate: "44s ago", alerts: 1, x: 15, y: 74 },
];

const INITIAL_ALERTS = [
  { id: 1, severity: "critical", title: "High TDS detected", unit: "Unit #002 · Rampur Mining Belt", value: "940 ppm", time: "14:32", action: "Purification cycle required", status: "active" },
  { id: 2, severity: "warning", title: "Filter maintenance approaching", unit: "Unit #003 · UF / RO membrane", value: "56% health", time: "12:10 PM", action: "Schedule membrane replacement", status: "active" },
  { id: 3, severity: "warning", title: "Connectivity degraded", unit: "Unit #004 · Sindri Colliery Outpost", value: "Offline 3h", time: "11:02 AM", action: "Check GSM / LoRa link", status: "active" },
  { id: 4, severity: "info", title: "Scheduled calibration completed", unit: "Unit #001 · Village Bhilwara", value: "—", time: "09:00 AM", action: "No action needed", status: "active" },
  { id: 5, severity: "resolved", title: "Turbidity spike auto-resolved", unit: "Unit #001 · Village Bhilwara", value: "Back to 1.1 NTU", time: "Yesterday", action: "Resolved after auto-backwash", status: "resolved" },
];

const NAV_MAIN = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "live", label: "Live Monitoring", icon: Activity },
  { id: "purification", label: "Purification", icon: Droplets },
  { id: "analytics", label: "Analytics", icon: LineChartIcon },
  { id: "alerts", label: "Alerts", icon: AlertTriangle },
  { id: "filters", label: "Filter Health", icon: Wrench },
  { id: "devices", label: "Devices & Locations", icon: MapPin },
  { id: "energy", label: "Energy", icon: Zap },
];
const NAV_MORE = [
  { id: "architecture", label: "Architecture", icon: Workflow },
  { id: "project", label: "Project Info", icon: Info },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

/* ---------------------------- Helpers ---------------------------- */

function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
function jitter(v, amt) { return v + (Math.random() - 0.5) * amt; }
function round(v, d) { const m = Math.pow(10, d); return Math.round(v * m) / m; }

function paramStatus(key, value) {
  const meta = PARAM_META[key];
  if (value == null || Number.isNaN(value)) return "offline";
  const [nlo, nhi] = meta.normal;
  const [wlo, whi] = meta.warn;
  if (value >= nlo && value <= nhi) return "normal";
  if (value >= wlo && value <= whi) return "warning";
  return "critical";
}

function statusTone(status) {
  switch (status) {
    case "normal": case "good": case "online": case "resolved": case "active-good":
      return { text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-500", solid: "bg-emerald-600" };
    case "warning": case "maintenance": case "alert-mild":
      return { text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", dot: "bg-amber-500", solid: "bg-amber-500" };
    case "critical": case "alert":
      return { text: "text-red-700", bg: "bg-red-50", border: "border-red-200", dot: "bg-red-500", solid: "bg-red-600" };
    case "info":
      return { text: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", dot: "bg-blue-500", solid: "bg-blue-600" };
    default:
      return { text: "text-slate-600", bg: "bg-slate-100", border: "border-slate-200", dot: "bg-slate-400", solid: "bg-slate-400" };
  }
}

function statusLabel(status) {
  switch (status) {
    case "normal": return "NORMAL";
    case "warning": return "WARNING";
    case "critical": return "CRITICAL";
    case "offline": return "NO DATA";
    default: return status.toUpperCase();
  }
}

function makeSeries(n, base, vol, seed = 1) {
  let v = base;
  const out = [];
  for (let i = 0; i < n; i++) {
    v = clamp(v + (Math.random() - 0.5) * vol, base - vol * 3, base + vol * 3);
    out.push({ i, v: round(v, 2) });
  }
  return out;
}

function downloadCSV(filename, rows) {
  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ---------------------------- Brand & Logo ---------------------------- */

function WaterDropU({ className = "", theme = "dark", size = "md" }) {
  const isDark = theme === "dark";
  const sizeStyles = {
    sm: { height: "0.85em", width: "0.72em", verticalAlign: "-0.07em" },
    md: { height: "0.92em", width: "0.76em", verticalAlign: "-0.09em" },
    lg: { height: "0.96em", width: "0.80em", verticalAlign: "-0.10em" },
  }[size] || { height: "0.92em", width: "0.76em", verticalAlign: "-0.09em" };

  return (
    <span
      className={`inline-flex items-center justify-center relative mx-[0.04em] select-none group/drop align-baseline ${className}`}
      title="Aqua Pulse"
    >
      <svg
        viewBox="0 0 24 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={sizeStyles}
        className="inline-block overflow-visible transition-all duration-300 group-hover/drop:scale-110 group-hover/drop:-translate-y-0.5 animate-water-glow"
      >
        <defs>
          <linearGradient id="apDropGrad" x1="12" y1="2" x2="12" y2="25" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <radialGradient id="apDropCore" cx="12" cy="18" r="7" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
          </radialGradient>
          <filter id="apDropShadow" x="-30%" y="-20%" width="160%" height="150%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#06b6d4" floodOpacity={isDark ? "0.6" : "0.35"} />
          </filter>
        </defs>

        {/* Ambient radial core glow */}
        <circle cx="12" cy="17.5" r="6.5" fill="url(#apDropCore)" opacity="0.75" />

        {/* Droplet Body substituting 'U' */}
        <path
          d="M 12 2 C 12 2 4.5 12 4.5 17.5 C 4.5 21.642 7.858 25 12 25 C 16.142 25 19.5 21.642 19.5 17.5 C 19.5 12 12 2 12 2 Z"
          fill="url(#apDropGrad)"
          filter="url(#apDropShadow)"
        />

        {/* Pulse / Vital Rhythm Line within the droplet */}
        <path
          d="M 6.8 17.5 L 9 17.5 L 10.3 14.8 L 11.8 20.6 L 13.2 14.2 L 14.4 17.5 L 17.2 17.5"
          stroke="#ffffff"
          strokeWidth="1.35"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.95"
        />

        {/* Specular gloss highlight along left shoulder */}
        <path
          d="M 7.5 14 C 6.8 16 7 18.2 8.2 20.2"
          stroke="#ffffff"
          strokeWidth="1.3"
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* Apex gleam reflection */}
        <ellipse cx="12" cy="5" rx="1" ry="1.5" fill="#ffffff" opacity="0.85" />
      </svg>
      <span className="sr-only">u</span>
    </span>
  );
}

function Logo({ compact = false, theme = "dark", size = "md", className = "" }) {
  const isDark = theme === "dark";

  return (
    <div className={`flex items-center gap-3 select-none group ${className}`}>
      {/* Eye-catching Emblem */}
      <div className="relative shrink-0">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 via-teal-500 to-blue-600 p-[1.5px] shadow-lg shadow-cyan-500/25 group-hover:shadow-cyan-400/40 transition-all duration-300 group-hover:scale-105">
          <div className={`w-full h-full rounded-[14px] flex items-center justify-center relative overflow-hidden backdrop-blur-sm ${
            isDark ? "bg-gradient-to-br from-slate-950/90 to-blue-950/90" : "bg-gradient-to-br from-blue-900 to-slate-900"
          }`}>
            {/* Ambient liquid glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(56,189,248,0.45),transparent_70%)]" />

            {/* Water Droplet + Pulse Icon */}
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-cyan-300 relative z-10 drop-shadow-[0_0_6px_rgba(34,211,238,0.7)]" fill="none">
              <defs>
                <linearGradient id="apEmblemDrop" x1="12" y1="2.5" x2="12" y2="22.5" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="60%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#0d9488" />
                </linearGradient>
              </defs>
              <path
                d="M 12 2.5 C 12 2.5 5 11 5 16 A 7 7 0 0 0 19 16 C 19 11 12 2.5 12 2.5 Z"
                fill="url(#apEmblemDrop)"
              />
              <path
                d="M 6.8 16.5 L 9 16.5 L 10.3 13.8 L 11.8 19.5 L 13.2 13.2 L 14.4 16.5 L 17.2 16.5"
                stroke="#ffffff"
                strokeWidth="1.45"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <ellipse cx="12" cy="5.5" rx="0.9" ry="1.3" fill="#ffffff" opacity="0.85" />
            </svg>
          </div>
        </div>
        {/* Glowing Live IoT Status Pip */}
        <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className={`relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 ${isDark ? "border-blue-900" : "border-white"}`} />
        </span>
      </div>

      {/* Brand Typography with Droplet replacing 'u' */}
      {!compact && (
        <div className="leading-tight">
          <div className="flex items-center text-lg tracking-tight font-extrabold">
            <span className={isDark ? "text-white" : "text-slate-900"}>
              Aqua
            </span>
            <span className="mx-1.5 text-cyan-400 font-light opacity-50">·</span>
            <span className="inline-flex items-center tracking-wider font-black">
              <span className={isDark ? "text-white" : "text-slate-900"}>P</span>
              <WaterDropU theme={theme} size={size} />
              <span className={isDark ? "bg-gradient-to-r from-teal-200 via-cyan-200 to-sky-300 bg-clip-text text-transparent" : "text-slate-900"}>
                LSE
              </span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10.5px] font-medium tracking-wide text-cyan-200/80 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400/90 animate-pulse" />
            <span className="uppercase tracking-wider text-[9.5px] text-cyan-300/90 font-semibold">Clean Tech IoT</span>
            <span className={isDark ? "text-white/30" : "text-slate-300"}>•</span>
            <span className={isDark ? "text-blue-200/75 truncate" : "text-slate-500 truncate"}>Purification &amp; Monitoring</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Pill({ tone = "default", children, icon: Icon, className = "" }) {
  const t = statusTone(tone);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${t.bg} ${t.text} ${t.border} ${className}`}>
      {Icon ? <Icon className="w-3.5 h-3.5" /> : <span className={`w-1.5 h-1.5 rounded-full ${t.dot}`} />}
      {children}
    </span>
  );
}

function InfoTip({ text }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-block align-middle">
      <button
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full border border-slate-300 text-slate-500 text-xs hover:bg-slate-100 hover:border-slate-400"
        aria-label="More information"
      >
        i
      </button>
      {open && (
        <span className="absolute z-30 left-1/2 -translate-x-1/2 top-6 w-56 rounded-lg bg-slate-900 text-white text-xs leading-snug p-3 shadow-xl">
          {text}
        </span>
      )}
    </span>
  );
}

function TrendArrow({ direction }) {
  if (direction === "up") return <TrendingUp className="w-3.5 h-3.5 text-red-500" />;
  if (direction === "down") return <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />;
  return <Minus className="w-3.5 h-3.5 text-slate-400" />;
}

function PageHeader({ eyebrow, title, description, right }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
      <div>
        {eyebrow && <div className="text-xs font-medium text-teal-700 mb-1">{eyebrow}</div>}
        <h1 className="text-xl md:text-2xl font-semibold text-slate-900 tracking-tight">{title}</h1>
        {description && <p className="text-sm text-slate-500 mt-1 max-w-2xl">{description}</p>}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}

function Card({ className = "", children }) {
  return <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</div>;
}

function DemoDataNote({ children = "Demo / estimated data — not from a connected sensor." }) {
  return (
    <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
      <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

/* ---------------------------- Metric Card ---------------------------- */

function MetricCard({ paramKey, value, trend }) {
  const meta = PARAM_META[paramKey];
  const Icon = meta.icon;
  const status = paramStatus(paramKey, value);
  const tone = statusTone(status);
  const display = value == null ? "--" : value.toFixed(meta.decimals);
  return (
    <Card className="p-4 md:p-5 relative overflow-hidden">
      <div className={`absolute top-0 left-0 h-1 w-full ${tone.solid}`} />
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 text-slate-500">
          <div className={`w-8 h-8 rounded-lg ${tone.bg} flex items-center justify-center`}>
            <Icon className={`w-4 h-4 ${tone.text}`} />
          </div>
          <span className="text-sm font-medium text-slate-600">{meta.label}</span>
        </div>
        <InfoTip text={meta.info} />
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-3xl font-semibold text-slate-900 tabular-nums">{display}</span>
        <span className="text-sm text-slate-400 font-medium">{meta.unit}</span>
      </div>
      <div className="mt-2.5 flex items-center justify-between">
        <Pill tone={status}>{statusLabel(status)}</Pill>
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <TrendArrow direction={trend} />
          <span>last 10 min</span>
        </div>
      </div>
    </Card>
  );
}

/* ---------------------------- Sidebar ---------------------------- */

function NavList({ items, activePage, onNavigate }) {
  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const Icon = item.icon;
        const active = activePage === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              active ? "bg-white/10 text-white" : "text-blue-200/80 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span className={`w-1 h-5 rounded-full ${active ? "bg-teal-400" : "bg-transparent"}`} />
            <Icon className="w-5 h-5 shrink-0" />
            <span className="truncate">{item.label}</span>
            {active && <ChevronRight className="w-4 h-4 ml-auto text-teal-300" />}
          </button>
        );
      })}
    </nav>
  );
}

function Sidebar({ activePage, onNavigate, mobileOpen, setMobileOpen }) {
  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}
      <aside
        className={`fixed z-50 lg:z-auto top-0 left-0 h-full w-64 bg-blue-900 flex flex-col transition-transform lg:translate-x-0 lg:static lg:h-auto ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 pt-5 pb-4">
          <Logo />
          <button className="lg:hidden text-blue-200" onClick={() => setMobileOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-4 pb-4">
          <div className="rounded-xl bg-white/5 px-3 py-2.5 space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              System Online
            </div>
            <div className="flex items-center gap-2 text-xs text-blue-200/80">
              <MapPin className="w-3.5 h-3.5" />
              Mining-Affected Rural Zone
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-4">
          <NavList items={NAV_MAIN} activePage={activePage} onNavigate={(id) => { onNavigate(id); setMobileOpen(false); }} />
          <div className="mt-5 mb-2 px-3 text-xs font-semibold tracking-wide text-blue-300/60">MORE</div>
          <NavList items={NAV_MORE} activePage={activePage} onNavigate={(id) => { onNavigate(id); setMobileOpen(false); }} />
        </div>
        <div className="px-4 py-4 border-t border-white/10 text-xs text-blue-300/60">
          SIH 2026 · PS ID SIH26040
        </div>
      </aside>
    </>
  );
}

/* ---------------------------- Top bar ---------------------------- */

function TopBar({ title, dataMode, setDataMode, setMobileOpen, notifCount, notifOpen, setNotifOpen, alerts }) {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="flex items-center gap-3 px-4 md:px-7 h-16">
        <button className="lg:hidden text-slate-600" onClick={() => setMobileOpen(true)}>
          <Menu className="w-6 h-6" />
        </button>
        <div className="lg:hidden flex items-center">
          <Logo compact theme="light" />
        </div>
        <div className="hidden lg:block">
          <div className="text-base font-semibold text-slate-900">{title}</div>
        </div>
        <div className="flex-1" />
        <div className="hidden md:flex items-center rounded-full border border-slate-200 p-0.5 bg-slate-50 text-xs font-medium">
          <button
            onClick={() => setDataMode("live")}
            className={`px-3 py-1.5 rounded-full transition-colors ${dataMode === "live" ? "bg-blue-900 text-white" : "text-slate-500"}`}
          >
            LIVE
          </button>
          <button
            onClick={() => setDataMode("demo")}
            className={`px-3 py-1.5 rounded-full transition-colors ${dataMode === "demo" ? "bg-teal-600 text-white" : "text-slate-500"}`}
          >
            DEMO
          </button>
        </div>
        <Pill tone={dataMode === "demo" ? "warning" : "normal"} className="hidden sm:inline-flex">
          {dataMode === "demo" ? "DEMO DATA" : "LIVE HARDWARE DATA"}
        </Pill>
        <div className="relative">
          <button onClick={() => setNotifOpen((o) => !o)} className="relative w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600">
            <Bell className="w-5 h-5" />
            {notifCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-semibold">
                {notifCount}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl p-2 z-40">
              <div className="px-2 py-1.5 text-xs font-semibold text-slate-500">Recent alerts</div>
              {alerts.filter((a) => a.status === "active").slice(0, 5).map((a) => {
                const tone = statusTone(a.severity);
                return (
                  <div key={a.id} className="flex items-start gap-2 px-2 py-2 rounded-lg hover:bg-slate-50">
                    <span className={`mt-1 w-1.5 h-1.5 rounded-full ${tone.dot}`} />
                    <div className="text-xs">
                      <div className="font-medium text-slate-800">{a.title}</div>
                      <div className="text-slate-400">{a.unit} · {a.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <button className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
          <UserCircle2 className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
}

/* =========================================================================
   PAGE: DASHBOARD
   ========================================================================= */

function BeforeAfterColumn({ label, data, status, note }) {
  const tone = statusTone(status);
  return (
    <div className={`flex-1 rounded-xl border ${tone.border} ${tone.bg} p-4`}>
      <div className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wide">{label}</div>
      <div className="space-y-2">
        {Object.keys(PARAM_META).map((k) => {
          const meta = PARAM_META[k];
          return (
            <div key={k} className="flex items-center justify-between text-sm">
              <span className="text-slate-500">{meta.label}</span>
              <span className="font-semibold text-slate-800 tabular-nums">
                {data[k].toFixed(meta.decimals)} {meta.unit}
              </span>
            </div>
          );
        })}
      </div>
      <div className={`mt-3 flex items-center gap-1.5 text-xs font-medium ${tone.text}`}>
        {status === "critical" || status === "warning" ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
        {note}
      </div>
    </div>
  );
}

function PipelineMini({ pipelineActive }) {
  return (
    <div className="flex items-center gap-1.5 md:gap-2 overflow-x-auto pb-1">
      {["source", ...PIPELINE_STAGES.map((s) => s.id), "treated"].map((id, idx, arr) => {
        if (id === "source" || id === "treated") {
          return (
            <React.Fragment key={id}>
              <div className="flex flex-col items-center shrink-0 w-16">
                <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center">
                  <Droplets className="w-4 h-4 text-blue-700" />
                </div>
                <span className="text-xs text-slate-500 mt-1 text-center leading-tight">{id === "source" ? "Raw Water" : "Treated Water"}</span>
              </div>
              {idx < arr.length - 1 && <ArrowDown className="w-3.5 h-3.5 text-slate-300 -rotate-90 shrink-0" />}
            </React.Fragment>
          );
        }
        const stage = PIPELINE_STAGES.find((s) => s.id === id);
        const Icon = stage.icon;
        const active = pipelineActive[id];
        return (
          <React.Fragment key={id}>
            <div className="flex flex-col items-center shrink-0 w-16">
              <div className={`w-9 h-9 rounded-full border flex items-center justify-center ${active ? "bg-teal-50 border-teal-300" : "bg-slate-100 border-slate-200"}`}>
                <Icon className={`w-4 h-4 ${active ? "text-teal-700" : "text-slate-400"}`} />
              </div>
              <span className="text-xs text-slate-500 mt-1 text-center leading-tight">{stage.label}</span>
            </div>
            {idx < arr.length - 1 && <ArrowDown className="w-3.5 h-3.5 text-slate-300 -rotate-90 shrink-0" />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function DashboardPage({ raw, treated, trends, pipelineActive, dataMode, secondsAgo, demoRunning, demoStep, demoMessage, startDemo, resetDemo }) {
  const treatedStatuses = Object.keys(PARAM_META).map((k) => paramStatus(k, treated[k]));
  const worst = treatedStatuses.includes("critical") ? "critical" : treatedStatuses.includes("warning") ? "warning" : "normal";
  const rawWorst = "critical";

  return (
    <div>
      <div className="rounded-2xl bg-gradient-to-br from-blue-900 to-blue-950 text-white p-6 md:p-8 mb-6 relative overflow-hidden">
        <svg className="absolute right-0 bottom-0 opacity-20" width="260" height="140" viewBox="0 0 260 140" fill="none">
          <path d="M0 90 Q 30 60 60 90 T 120 90 T 180 90 T 260 90 V140 H0 Z" fill="#5eead4" />
          <path d="M0 110 Q 30 85 60 110 T 120 110 T 180 110 T 260 110 V140 H0 Z" fill="#2dd4bf" />
        </svg>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 backdrop-blur-sm mb-3 shadow-inner">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-400" />
              </span>
              <div className="flex items-center text-xs font-bold tracking-wider text-white">
                <span>Aqua</span>
                <span className="mx-1 text-cyan-400/60">·</span>
                <span className="inline-flex items-center tracking-wider font-black">
                  <span>P</span>
                  <WaterDropU size="sm" />
                  <span className="bg-gradient-to-r from-teal-200 to-cyan-300 bg-clip-text text-transparent">LSE</span>
                </span>
              </div>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-teal-300/90 bg-teal-400/15 px-1.5 py-0.5 rounded">
                SIH 2026
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Intelligent Water Purification &amp; Quality Monitoring</h1>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Pill tone="normal" icon={CheckCircle2}>SYSTEM OPERATIONAL</Pill>
              <span className="text-xs text-blue-200/70">Last updated {secondsAgo}s ago</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={startDemo}
              disabled={demoRunning}
              className="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-blue-950 font-semibold rounded-xl px-4 py-2.5 text-sm transition-colors"
            >
              <PlayCircle className="w-4 h-4" /> Start SIH Demo
            </button>
            <button
              onClick={resetDemo}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white rounded-xl px-4 py-2.5 text-sm transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          </div>
        </div>
        {demoMessage && (
          <div className="relative z-10 mt-4 inline-flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 text-sm">
            <Activity className="w-4 h-4 text-teal-300 animate-pulse" />
            Step {Math.min(demoStep + 1, 10)}/10 — {demoMessage}
          </div>
        )}
      </div>

      {dataMode === "live" && (
        <div className="mb-6">
          <DemoDataNote>Live hardware not currently paired to this dashboard. Showing the last synced snapshot. Switch to DEMO to preview a full live simulation.</DemoDataNote>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-slate-800">Water Quality Overview — Treated Output</h2>
          <Pill tone={worst}>{worst === "normal" ? "ALL PARAMETERS NORMAL" : "ATTENTION NEEDED"}</Pill>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.keys(PARAM_META).map((k) => (
            <MetricCard key={k} paramKey={k} value={treated[k]} trend={trends[k]} />
          ))}
        </div>
      </div>

      <Card className="p-5 md:p-6 mb-6">
        <h2 className="text-base font-semibold text-slate-800 mb-1">Purification Effectiveness</h2>
        <p className="text-sm text-slate-500 mb-4">How incoming raw water compares to the treated output right now.</p>
        <div className="flex flex-col md:flex-row items-stretch gap-3">
          <BeforeAfterColumn label="Raw Water (Inlet)" data={raw} status={rawWorst} note="Requires treatment" />
          <div className="flex md:flex-col items-center justify-center gap-1 text-teal-600 shrink-0 py-2 md:py-0 md:px-2">
            <Droplets className="w-5 h-5 animate-bounce" />
            <span className="text-xs font-medium text-slate-400 hidden md:block rotate-90 md:rotate-0">Purification</span>
          </div>
          <BeforeAfterColumn label="Treated Water (Outlet)" data={treated} status={worst} note={worst === "normal" ? "Within configured limits" : "Monitor closely"} />
        </div>
      </Card>

      <Card className="p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-800">Purification Pipeline</h2>
          <Pill tone={Object.values(pipelineActive).every(Boolean) ? "normal" : "warning"} icon={Activity}>
            {Object.values(pipelineActive).every(Boolean) ? "Purification Active" : "Stage Sequence Running"}
          </Pill>
        </div>
        <PipelineMini pipelineActive={pipelineActive} />
      </Card>
    </div>
  );
}

/* =========================================================================
   PAGE: LIVE MONITORING
   ========================================================================= */

const RANGES = [
  { id: "1h", label: "Last 1 Hour", n: 30 },
  { id: "6h", label: "Last 6 Hours", n: 36 },
  { id: "24h", label: "24 Hours", n: 48 },
  { id: "7d", label: "7 Days", n: 42 },
  { id: "30d", label: "30 Days", n: 30 },
];

function LiveMonitoringPage({ treated, dataMode }) {
  const [range, setRange] = useState("1h");
  const [param, setParam] = useState("tds");

  const series = useMemo(() => {
    const r = RANGES.find((x) => x.id === range);
    const out = {};
    Object.keys(PARAM_META).forEach((k) => {
      const base = TREATED_BASELINE[k];
      const vol = k === "tds" ? 60 : k === "turbidity" ? 1.2 : k === "ph" ? 0.35 : 1.1;
      out[k] = makeSeries(r.n, base, vol);
    });
    return out;
  }, [range]);

  const stats = useMemo(() => {
    const out = {};
    Object.keys(PARAM_META).forEach((k) => {
      const vals = series[k].map((p) => p.v);
      const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
      const min = Math.min(...vals);
      const max = Math.max(...vals);
      const trend = vals[vals.length - 1] < vals[0] ? "down" : vals[vals.length - 1] > vals[0] ? "up" : "flat";
      out[k] = { avg, min, max, trend };
    });
    return out;
  }, [series]);

  return (
    <div>
      <PageHeader
        eyebrow="Real-time"
        title="Live Monitoring"
        description="Track pH, TDS, turbidity and temperature as the system reads them from the sensor array."
        right={
          <div className="flex flex-wrap gap-1.5">
            {RANGES.map((r) => (
              <button
                key={r.id}
                onClick={() => setRange(r.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  range === r.id ? "bg-blue-900 text-white border-blue-900" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        }
      />
      {dataMode === "live" && <div className="mb-5"><DemoDataNote>No live hardware paired — charts show the last demo simulation for reference.</DemoDataNote></div>}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-5">
        {Object.keys(PARAM_META).map((k) => {
          const meta = PARAM_META[k];
          const s = stats[k];
          const active = param === k;
          return (
            <button
              key={k}
              onClick={() => setParam(k)}
              className={`text-left rounded-2xl border p-4 transition-colors ${active ? "border-teal-400 bg-teal-50/50 ring-1 ring-teal-300" : "border-slate-200 bg-white hover:border-slate-300"}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">{meta.label}</span>
                <TrendArrow direction={s.trend} />
              </div>
              <div className="text-2xl font-semibold text-slate-900 tabular-nums">{treated[k].toFixed(meta.decimals)}<span className="text-sm text-slate-400 ml-1">{meta.unit}</span></div>
              <div className="mt-2 text-xs text-slate-500 space-y-0.5">
                <div>Average: {s.avg.toFixed(meta.decimals)} {meta.unit}</div>
                <div>Min {s.min.toFixed(meta.decimals)} · Max {s.max.toFixed(meta.decimals)}</div>
              </div>
            </button>
          );
        })}
      </div>

      <Card className="p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-800">{PARAM_META[param].label} — {RANGES.find((r) => r.id === range).label}</h2>
          <Pill tone={stats[param].trend === "down" ? "normal" : stats[param].trend === "up" ? "warning" : "info"}>
            {stats[param].trend === "down" ? "Improving" : stats[param].trend === "up" ? "Rising" : "Stable"}
          </Pill>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series[param]} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="fillParam" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f6" />
              <XAxis dataKey="i" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={40} />
              <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12, border: "1px solid #e2e8f0" }} />
              <Area type="monotone" dataKey="v" stroke="#0d9488" strokeWidth={2} fill="url(#fillParam)" isAnimationActive={true} animationDuration={600} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

/* =========================================================================
   PAGE: PURIFICATION
   ========================================================================= */

function PurificationPage({ raw, treated, pipelineActive }) {
  return (
    <div>
      <PageHeader eyebrow="Treatment train" title="Purification" description="A modular, four-stage purification train converts raw inlet water into treated output within configured safety limits." />

      <Card className="p-5 md:p-6 mb-6">
        <h2 className="text-base font-semibold text-slate-800 mb-4">Purification Effectiveness</h2>
        <div className="flex flex-col md:flex-row items-stretch gap-3">
          <BeforeAfterColumn label="Raw Water" data={raw} status="critical" note="Requires treatment" />
          <div className="flex md:flex-col items-center justify-center gap-1 text-teal-600 shrink-0 py-2 md:py-0 md:px-2">
            <Droplets className="w-6 h-6 animate-bounce" />
          </div>
          <BeforeAfterColumn label="Treated Water" data={treated} status={paramStatus("tds", treated.tds)} note="Within configured limits" />
        </div>
      </Card>

      <Card className="p-5 md:p-6">
        <h2 className="text-base font-semibold text-slate-800 mb-1">Purification Pipeline</h2>
        <p className="text-sm text-slate-500 mb-5">Water passes through each modular stage in sequence before reaching the storage tank.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {PIPELINE_STAGES.map((stage) => {
            const Icon = stage.icon;
            const active = pipelineActive[stage.id];
            const tone = statusTone(active ? "normal" : "offline");
            return (
              <div key={stage.id} className={`rounded-xl border p-4 ${tone.border} ${tone.bg}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg bg-white flex items-center justify-center border ${tone.border}`}>
                    <Icon className={`w-5 h-5 ${tone.text}`} />
                  </div>
                  <Pill tone={active ? "normal" : "offline"}>{active ? "ACTIVE" : "STANDBY"}</Pill>
                </div>
                <div className="text-sm font-semibold text-slate-800">{stage.label}</div>
                <div className="text-xs text-slate-500 mt-1">
                  {stage.id === "sediment" && "Removes coarse particles and silt."}
                  {stage.id === "carbon" && "Adsorbs organics, odour and chlorine by-products."}
                  {stage.id === "ufro" && "Fine filtration for dissolved solids and microbes."}
                  {stage.id === "uv" && "Disinfects remaining microorganisms with UV light."}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3 text-slate-300">
          <PipelineMini pipelineActive={pipelineActive} />
        </div>
      </Card>
    </div>
  );
}

/* =========================================================================
   PAGE: ANALYTICS
   ========================================================================= */

function AnalyticsPage() {
  const [fromDate, setFromDate] = useState("2026-08-01");
  const [toDate, setToDate] = useState("2026-09-01");
  const [metric, setMetric] = useState("tds");

  const days = 20;
  const chartData = useMemo(() => {
    const rawSeries = makeSeries(days, RAW_BASELINE[metric], metric === "tds" ? 60 : metric === "turbidity" ? 2 : metric === "ph" ? 0.2 : 1);
    const treatedSeries = makeSeries(days, TREATED_BASELINE[metric], metric === "tds" ? 20 : metric === "turbidity" ? 0.4 : metric === "ph" ? 0.1 : 0.5);
    return rawSeries.map((r, i) => ({ i: i + 1, raw: r.v, treated: treatedSeries[i].v }));
  }, [metric]);

  const summary = {
    hours: 742,
    alerts: 18,
    tdsReduction: "69%",
    turbidityReduction: "92%",
    cycles: 214,
  };

  return (
    <div>
      <PageHeader
        eyebrow="Historical"
        title="Analytics"
        description="Derived analytics calculated from stored sensor readings. Values here are system measurements, not laboratory certifications."
        right={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="outline-none text-slate-600 bg-transparent" />
              <span className="text-slate-300">→</span>
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="outline-none text-slate-600 bg-transparent" />
            </div>
            <button
              onClick={() => downloadCSV(`aquapulse_${metric}_${fromDate}_${toDate}.csv`, [["index", "raw", "treated"], ...chartData.map((d) => [d.i, d.raw, d.treated])])}
              className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-slate-300"
            >
              <Download className="w-3.5 h-3.5" /> Export Data
            </button>
            <button
              onClick={() => alert(`Report generated for ${fromDate} to ${toDate}.\nTotal monitoring hours: ${summary.hours}\nAlerts: ${summary.alerts}\nAvg TDS reduction: ${summary.tdsReduction}`)}
              className="flex items-center gap-1.5 bg-blue-900 rounded-lg px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-800"
            >
              <FileText className="w-3.5 h-3.5" /> Generate Report
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        {[
          { label: "Monitoring Hours", value: summary.hours, icon: Activity },
          { label: "Alerts Raised", value: summary.alerts, icon: AlertTriangle },
          { label: "Avg TDS Reduction", value: summary.tdsReduction, icon: Layers },
          { label: "Avg Turbidity Reduction", value: summary.turbidityReduction, icon: Waves },
          { label: "Purification Cycles", value: summary.cycles, icon: Droplets },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <s.icon className="w-4 h-4 text-teal-600 mb-2" />
            <div className="text-xl font-semibold text-slate-900 tabular-nums">{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </Card>
        ))}
      </div>

      <Card className="p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-base font-semibold text-slate-800">Raw vs Treated — {PARAM_META[metric].label}</h2>
          <div className="flex gap-1.5">
            {Object.keys(PARAM_META).map((k) => (
              <button
                key={k}
                onClick={() => setMetric(k)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border ${metric === k ? "bg-teal-600 text-white border-teal-600" : "bg-white text-slate-600 border-slate-200"}`}
              >
                {PARAM_META[k].label}
              </button>
            ))}
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f6" />
              <XAxis dataKey="i" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={40} />
              <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12, border: "1px solid #e2e8f0" }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="raw" name="Raw Water" stroke="#dc2626" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="treated" name="Treated Water" stroke="#0d9488" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

/* =========================================================================
   PAGE: ALERTS
   ========================================================================= */

function AlertsPage({ alerts, onAcknowledge }) {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? alerts : alerts.filter((a) => a.severity === filter);

  const counts = {
    critical: alerts.filter((a) => a.severity === "critical" && a.status === "active").length,
    warning: alerts.filter((a) => a.severity === "warning" && a.status === "active").length,
    info: alerts.filter((a) => a.severity === "info" && a.status === "active").length,
    resolved: alerts.filter((a) => a.status === "resolved").length,
  };

  return (
    <div>
      <PageHeader eyebrow="Alert center" title="Alerts" description="Sensor, filter, water-quality and connectivity alerts across all connected units." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { key: "critical", label: "Critical", tone: "critical", icon: AlertOctagon },
          { key: "warning", label: "Warning", tone: "warning", icon: AlertTriangle },
          { key: "info", label: "Information", tone: "info", icon: Info },
          { key: "resolved", label: "Resolved", tone: "resolved", icon: CheckCircle2 },
        ].map((c) => (
          <button key={c.key} onClick={() => setFilter(filter === c.key ? "all" : c.key)}>
            <Card className={`p-4 text-left ${filter === c.key ? "ring-2 ring-teal-400" : ""}`}>
              <div className="flex items-center justify-between">
                <c.icon className={`w-4 h-4 ${statusTone(c.tone).text}`} />
                <span className="text-xl font-semibold text-slate-900">{counts[c.key]}</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">{c.label}</div>
            </Card>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((a) => {
          const tone = statusTone(a.severity);
          return (
            <Card key={a.id} className="p-4 md:p-5">
              <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
                <div className="flex items-center gap-3 md:w-64 shrink-0">
                  <div className={`w-9 h-9 rounded-lg ${tone.bg} flex items-center justify-center border ${tone.border}`}>
                    <AlertTriangle className={`w-4 h-4 ${tone.text}`} />
                  </div>
                  <Pill tone={a.severity}>{a.severity.toUpperCase()}</Pill>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-slate-800 text-sm">{a.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{a.unit} · {a.time} {a.value !== "—" && `· ${a.value}`}</div>
                  <div className="text-xs text-slate-500 mt-1">Action: {a.action}</div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {a.status === "active" && (
                    <button onClick={() => onAcknowledge(a.id)} className="px-3 py-1.5 rounded-lg bg-blue-900 text-white text-xs font-medium hover:bg-blue-800">
                      Acknowledge
                    </button>
                  )}
                  <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:border-slate-300">
                    View Details
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
        {filtered.length === 0 && <div className="text-center text-slate-400 text-sm py-10">No alerts in this category.</div>}
      </div>
    </div>
  );
}

/* =========================================================================
   PAGE: FILTER HEALTH
   ========================================================================= */

function FilterHealthPage() {
  return (
    <div>
      <PageHeader eyebrow="Consumables" title="Filter Health" description="Estimated remaining life for each purification-stage consumable." />
      <div className="mb-5"><DemoDataNote>Filter-health percentages are demo / estimated data. Actual values require dedicated hardware sensors (pressure, flow-decay, or cycle counters) connected to each stage.</DemoDataNote></div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FILTERS.map((f) => {
          const status = f.health >= 70 ? "good" : f.health >= 40 ? "maintenance" : "critical";
          const tone = statusTone(status);
          return (
            <Card key={f.id} className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-slate-800 text-sm">{f.name}</span>
                <Pill tone={status}>{f.status.toUpperCase()}</Pill>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-3xl font-semibold text-slate-900 tabular-nums w-20">{f.health}%</div>
                <div className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full rounded-full ${tone.solid} transition-all duration-700`} style={{ width: `${f.health}%` }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                <div>
                  <div className="text-slate-400">Operating hours</div>
                  <div className="font-medium text-slate-700">{f.hours.toLocaleString()} h</div>
                </div>
                <div>
                  <div className="text-slate-400">Replacement recommended</div>
                  <div className="font-medium text-slate-700">{f.replace}</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================================
   PAGE: DEVICES & LOCATIONS (list + map)
   ========================================================================= */

function DeviceCard({ d, selected, onSelect }) {
  const tone = statusTone(d.status === "online" ? d.quality : d.status);
  return (
    <button onClick={() => onSelect(d.id)} className="text-left w-full">
      <Card className={`p-4 ${selected ? "ring-2 ring-teal-400" : ""}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-slate-800 text-sm">{d.id}</span>
          <Pill tone={d.status === "online" ? d.quality : d.status}>{d.status === "offline" ? "OFFLINE" : d.status === "alert" ? "ALERT" : "ONLINE"}</Pill>
        </div>
        <div className="text-xs text-slate-500 mb-2">{d.village}</div>
        {d.status !== "offline" ? (
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div><span className="text-slate-400">pH</span><div className="font-medium text-slate-700">{d.ph}</div></div>
            <div><span className="text-slate-400">TDS</span><div className="font-medium text-slate-700">{d.tds}</div></div>
            <div><span className="text-slate-400">NTU</span><div className="font-medium text-slate-700">{d.turbidity}</div></div>
          </div>
        ) : (
          <div className="text-xs text-slate-400">No recent data — connectivity lost</div>
        )}
        <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
          <span>{d.lastUpdate}</span>
          {d.alerts > 0 && <span className="text-red-500 font-medium">{d.alerts} alert{d.alerts > 1 ? "s" : ""}</span>}
        </div>
      </Card>
    </button>
  );
}

function DevicesPage() {
  const [tab, setTab] = useState("list");
  const [selected, setSelected] = useState(DEVICES[0].id);
  const device = DEVICES.find((d) => d.id === selected);
  const markerTone = (d) => (d.status === "offline" ? "offline" : d.status === "alert" ? "critical" : d.quality === "warning" ? "warning" : "normal");

  return (
    <div>
      <PageHeader
        eyebrow="Deployment"
        title="Devices & Locations"
        description="All Aqua Pulse units deployed across rural and mining-affected villages."
        right={
          <div className="flex bg-slate-100 rounded-full p-1 text-xs font-medium">
            <button onClick={() => setTab("list")} className={`px-3 py-1.5 rounded-full ${tab === "list" ? "bg-white shadow-sm text-slate-800" : "text-slate-500"}`}>List</button>
            <button onClick={() => setTab("map")} className={`px-3 py-1.5 rounded-full ${tab === "map" ? "bg-white shadow-sm text-slate-800" : "text-slate-500"}`}>Map</button>
          </div>
        }
      />

      {tab === "list" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {DEVICES.map((d) => (
            <DeviceCard key={d.id} d={d} selected={selected === d.id} onSelect={setSelected} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 p-4 relative h-96 overflow-hidden bg-gradient-to-br from-teal-50 to-blue-50">
            <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(#94a3b8 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
            {DEVICES.map((d) => {
              const tone = statusTone(markerTone(d));
              return (
                <button
                  key={d.id}
                  onClick={() => setSelected(d.id)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group"
                  style={{ left: `${d.x}%`, top: `${d.y}%` }}
                >
                  <span className={`w-4 h-4 rounded-full ${tone.solid} border-2 border-white shadow-md ${selected === d.id ? "ring-4 ring-teal-300" : ""}`} />
                  <span className="mt-1 text-xs font-medium text-slate-600 bg-white/80 rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{d.id}</span>
                </button>
              );
            })}
            <div className="absolute bottom-3 left-3 bg-white/90 rounded-lg px-3 py-2 text-xs space-y-1 shadow-sm">
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Normal</div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Warning</div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> Critical</div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-400" /> Offline</div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-slate-800 text-sm">{device.id}</span>
              <Pill tone={device.status === "online" ? device.quality : device.status}>{device.status.toUpperCase()}</Pill>
            </div>
            <div className="text-xs text-slate-500 mb-1">{device.village}</div>
            <div className="text-xs text-slate-400 mb-4">{device.area}</div>
            {device.status !== "offline" ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">pH</span><span className="font-medium">{device.ph}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">TDS</span><span className="font-medium">{device.tds} ppm</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Turbidity</span><span className="font-medium">{device.turbidity} NTU</span></div>
              </div>
            ) : (
              <div className="text-xs text-slate-400">No live parameters — unit offline.</div>
            )}
            <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400">Last update: {device.lastUpdate}</div>
            {device.alerts > 0 && <div className="mt-2 text-xs font-medium text-red-600">{device.alerts} active alert{device.alerts > 1 ? "s" : ""}</div>}
          </Card>
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   PAGE: ENERGY
   ========================================================================= */

function EnergyPage({ dataMode }) {
  const [energy, setEnergy] = useState({ solar: 78, battery: 82, consumption: 42 });

  useEffect(() => {
    if (dataMode !== "demo") return;
    const t = setInterval(() => {
      setEnergy((e) => ({
        solar: round(clamp(jitter(e.solar, 6), 40, 110), 0),
        battery: round(clamp(jitter(e.battery, 1.2), 55, 96), 0),
        consumption: round(clamp(jitter(e.consumption, 4), 30, 55), 0),
      }));
    }, 3500);
    return () => clearInterval(t);
  }, [dataMode]);

  const runtimeHours = (energy.battery / 100) * (150 / energy.consumption) * 8.5;
  const h = Math.floor(runtimeHours);
  const m = Math.round((runtimeHours - h) * 60);

  return (
    <div>
      <PageHeader eyebrow="Power" title="Energy" description="Aqua Pulse is designed for limited-electricity, off-grid rural deployments." />
      <div className="mb-5"><DemoDataNote>Energy readings are simulated for this prototype. Connect a solar charge controller and battery monitor to report real values.</DemoDataNote></div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <Card className="p-5">
          <Sun className="w-5 h-5 text-amber-500 mb-2" />
          <div className="text-2xl font-semibold text-slate-900">{energy.solar} W</div>
          <div className="text-xs text-slate-500">Solar input</div>
        </Card>
        <Card className="p-5">
          <Battery className="w-5 h-5 text-emerald-600 mb-2" />
          <div className="text-2xl font-semibold text-slate-900">{energy.battery}%</div>
          <div className="text-xs text-slate-500">Battery charge</div>
        </Card>
        <Card className="p-5">
          <Zap className="w-5 h-5 text-blue-700 mb-2" />
          <div className="text-2xl font-semibold text-slate-900">{energy.consumption} W</div>
          <div className="text-xs text-slate-500">Power consumption</div>
        </Card>
        <Card className="p-5">
          <PlugZap className="w-5 h-5 text-teal-600 mb-2" />
          <div className="text-2xl font-semibold text-slate-900">{h}h {m}m</div>
          <div className="text-xs text-slate-500">Estimated runtime</div>
        </Card>
      </div>

      <Card className="p-5 md:p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-semibold text-slate-800">System Power Status</h2>
          <Pill tone="normal" icon={CheckCircle2}>NORMAL</Pill>
        </div>
        <p className="text-sm text-slate-500">Solar generation currently exceeds consumption; battery reserve is healthy for continuous night-time operation.</p>
      </Card>
    </div>
  );
}

/* =========================================================================
   PAGE: SETTINGS (incl. system health)
   ========================================================================= */

const SYSTEM_COMPONENTS = [
  { name: "ESP32 / Controller", icon: Cpu, status: "online" },
  { name: "pH Sensor", icon: Droplets, status: "normal" },
  { name: "Turbidity Sensor", icon: Waves, status: "normal" },
  { name: "TDS Sensor", icon: Layers, status: "normal" },
  { name: "Temperature Sensor", icon: Thermometer, status: "normal" },
  { name: "Water Pump", icon: Gauge, status: "online" },
  { name: "Solenoid Valve", icon: SlidersHorizontal, status: "normal" },
  { name: "UV Module", icon: ShieldCheck, status: "online" },
  { name: "Communication (Wi-Fi/GSM/LoRa)", icon: Radio, status: "online" },
  { name: "Cloud Sync", icon: Cloud, status: "online" },
];

function SettingsPage({ dataMode, setDataMode }) {
  return (
    <div>
      <PageHeader eyebrow="Configuration" title="Settings" description="Data source, notifications and system-component health." />

      <Card className="p-5 md:p-6 mb-6">
        <h2 className="text-base font-semibold text-slate-800 mb-3">Data Source</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDataMode("live")}
            className={`flex-1 flex items-center gap-3 rounded-xl border p-4 text-left ${dataMode === "live" ? "border-blue-900 bg-blue-50" : "border-slate-200"}`}
          >
            <Wifi className="w-5 h-5 text-blue-800" />
            <div>
              <div className="font-medium text-slate-800 text-sm">Live Hardware Data</div>
              <div className="text-xs text-slate-500">Read from connected Aqua Pulse units</div>
            </div>
          </button>
          <button
            onClick={() => setDataMode("demo")}
            className={`flex-1 flex items-center gap-3 rounded-xl border p-4 text-left ${dataMode === "demo" ? "border-teal-500 bg-teal-50" : "border-slate-200"}`}
          >
            <Activity className="w-5 h-5 text-teal-700" />
            <div>
              <div className="font-medium text-slate-800 text-sm">Demo Data</div>
              <div className="text-xs text-slate-500">Realistic simulated values for presentation</div>
            </div>
          </button>
        </div>
      </Card>

      <Card className="p-5 md:p-6 mb-6">
        <h2 className="text-base font-semibold text-slate-800 mb-1">System Safety</h2>
        <p className="text-sm text-slate-500 mb-4">If sensor data becomes abnormal or unavailable, the system enters fail-safe mode and restricts water supply pending verification.</p>
        <div className="flex items-center gap-2">
          <Pill tone="normal" icon={ShieldCheck}>SAFE OPERATION</Pill>
          <span className="text-xs text-slate-400">Aqua Pulse does not claim to guarantee drinking-water safety independent of periodic verification.</span>
        </div>
      </Card>

      <Card className="p-5 md:p-6">
        <h2 className="text-base font-semibold text-slate-800 mb-4">System Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SYSTEM_COMPONENTS.map((c) => {
            const tone = statusTone(c.status);
            return (
              <div key={c.name} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
                <div className="flex items-center gap-3">
                  <c.icon className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-700">{c.name}</span>
                </div>
                <Pill tone={c.status}>{c.status.toUpperCase()}</Pill>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

/* =========================================================================
   PAGE: ARCHITECTURE
   ========================================================================= */

function ArchitecturePage() {
  const steps = [
    { label: "Water Source", icon: Droplets },
    { label: "pH / Turbidity / TDS / Temperature Sensors", icon: Gauge },
    { label: "ESP32 / STM32 Controller", icon: Cpu },
    { label: "Pump + Solenoid Valves", icon: SlidersHorizontal },
    { label: "Sediment Filter", icon: SlidersHorizontal },
    { label: "Activated Carbon", icon: CircleDot },
    { label: "UF / RO", icon: Layers },
    { label: "UV Disinfection", icon: ShieldCheck },
    { label: "Post-Treatment Sensors", icon: Gauge },
    { label: "Communication — Wi-Fi / GSM / LoRa", icon: Signal },
    { label: "Cloud Database", icon: Cloud },
    { label: "Dashboard", icon: LineChartIcon },
    { label: "Alerts / Notifications", icon: Bell },
  ];
  return (
    <div>
      <PageHeader eyebrow="System design" title="Technical Architecture" description="End-to-end data and water flow from source to alerting." />
      <Card className="p-5 md:p-6">
        <div className="space-y-0">
          {steps.map((s, idx) => (
            <div key={s.label}>
              <div className="flex items-center gap-4 py-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                  <s.icon className="w-4 h-4 text-blue-800" />
                </div>
                <span className="text-sm font-medium text-slate-700">{s.label}</span>
              </div>
              {idx < steps.length - 1 && <div className="ml-5 border-l-2 border-dashed border-slate-200 h-4" />}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* =========================================================================
   PAGE: PROJECT INFO
   ========================================================================= */

function ProjectInfoPage() {
  const blocks = [
    { title: "Problem", body: "Rural and mining-affected communities often lack continuous, affordable visibility into drinking-water quality, and rely on manual, infrequent testing that misses sudden contamination events." },
    { title: "Proposed Solution", body: "A modular, low-power IoT unit that continuously senses pH, TDS, turbidity and temperature, purifies water through a four-stage train, and reports live status to a central dashboard for local operators and authorities." },
    { title: "Technology", body: "ESP32/STM32 controller, pH/TDS/turbidity/temperature sensors, pump and solenoid valves, sediment/carbon/UF-RO/UV purification stages, Wi-Fi/GSM/LoRa connectivity, solar-battery power, and a cloud-connected dashboard." },
    { title: "Impact", body: "Earlier detection of unsafe water conditions, reduced dependence on manual testing, and better-targeted maintenance for community water infrastructure." },
    { title: "Benefits", body: "Low power draw suited to solar operation, modular filter stages that can be serviced independently, and a dashboard designed for both technical authorities and non-technical rural operators." },
    { title: "Challenges", body: "Connectivity gaps in remote areas, sensor drift requiring periodic calibration, and the need for durable enclosures in harsh mining environments." },
    { title: "Future Scope", body: "Additional dedicated sensing technologies could be integrated for specific contaminants where required. Current pH, turbidity, TDS and temperature sensors do not directly identify specific heavy metals such as arsenic or lead." },
  ];
  return (
    <div>
      <PageHeader eyebrow="SIH 2026 · Problem Statement SIH26040" title="Aqua Pulse — Project Information" description="Smart Water Purification and Quality Monitoring System for Rural and Mining-Affected Areas." />
      <div className="flex flex-wrap gap-2 mb-6">
        <Pill tone="info">Theme: Clean &amp; Green Technology</Pill>
        <Pill tone="info">Category: Hardware</Pill>
      </div>
      <Card className="p-5 md:p-6 mb-6">
        <h2 className="text-sm font-semibold text-slate-800 mb-2">Purpose</h2>
        <p className="text-sm text-slate-600">Provide portable, modular and intelligent water purification and continuous water-quality monitoring for rural and mining-affected regions.</p>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {blocks.map((b) => (
          <Card key={b.title} className="p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-1.5">{b.title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{b.body}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* =========================================================================
   ROOT APP
   ========================================================================= */

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [dataMode, setDataMode] = useState("demo");

  const [raw, setRaw] = useState({ ...RAW_BASELINE });
  const [treated, setTreated] = useState({ ...TREATED_BASELINE });
  const [trends, setTrends] = useState({ ph: "flat", tds: "down", turbidity: "down", temperature: "flat" });
  const [secondsAgo, setSecondsAgo] = useState(4);
  const [pipelineActive, setPipelineActive] = useState({ sediment: true, carbon: true, ufro: true, uv: true });
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);

  const [demoRunning, setDemoRunning] = useState(false);
  const [demoStep, setDemoStep] = useState(0);

  const DEMO_MESSAGES = [
    "Raw water enters the system.",
    "Sensors detect high turbidity, high TDS and abnormal pH.",
    "System activates purification.",
    "Sediment filtration stage active.",
    "Activated carbon stage active.",
    "UF / RO stage active.",
    "UV disinfection stage active.",
    "Post-treatment sensors measure improved values.",
    "Purification successful.",
    "Before / after comparison ready.",
  ];

  // seconds-since-update ticker
  useEffect(() => {
    const t = setInterval(() => setSecondsAgo((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // background jitter simulation (paused during scripted demo)
  useEffect(() => {
    if (dataMode !== "demo" || demoRunning) return;
    const t = setInterval(() => {
      setTreated((v) => ({
        ph: round(clamp(jitter(v.ph, 0.15), 6.8, 7.6), 1),
        tds: round(clamp(jitter(v.tds, 15), 230, 340), 0),
        turbidity: round(clamp(jitter(v.turbidity, 0.3), 0.5, 2.2), 1),
        temperature: round(clamp(jitter(v.temperature, 0.4), 24, 29), 1),
      }));
      setRaw((v) => ({
        ph: round(clamp(jitter(v.ph, 0.1), 5.9, 6.8), 1),
        tds: round(clamp(jitter(v.tds, 40), 800, 1050), 0),
        turbidity: round(clamp(jitter(v.turbidity, 1.5), 12, 24), 1),
        temperature: round(clamp(jitter(v.temperature, 0.3), 25, 29), 1),
      }));
      setTrends({
        ph: Math.random() > 0.5 ? "flat" : "down",
        tds: Math.random() > 0.4 ? "down" : "flat",
        turbidity: Math.random() > 0.5 ? "down" : "flat",
        temperature: "flat",
      });
      setSecondsAgo(0);
    }, 3000);
    return () => clearInterval(t);
  }, [dataMode, demoRunning]);

  const startDemo = useCallback(() => {
    setDataMode("demo");
    setDemoRunning(true);
    setDemoStep(0);
    setRaw({ ph: 6.3, tds: 920, turbidity: 18, temperature: 27 });
    setTreated({ ph: 6.3, tds: 920, turbidity: 18, temperature: 27 });
    setPipelineActive({ sediment: false, carbon: false, ufro: false, uv: false });
  }, []);

  const resetDemo = useCallback(() => {
    setDemoRunning(false);
    setDemoStep(0);
    setPipelineActive({ sediment: true, carbon: true, ufro: true, uv: true });
    setRaw({ ...RAW_BASELINE });
    setTreated({ ...TREATED_BASELINE });
    setSecondsAgo(0);
  }, []);

  useEffect(() => {
    if (!demoRunning) return;
    if (demoStep >= DEMO_MESSAGES.length) {
      setDemoRunning(false);
      return;
    }
    const t = setTimeout(() => {
      if (demoStep === 3) setPipelineActive((p) => ({ ...p, sediment: true }));
      if (demoStep === 4) { setPipelineActive((p) => ({ ...p, carbon: true })); setTreated((v) => ({ ...v, turbidity: 8, tds: 650 })); }
      if (demoStep === 5) { setPipelineActive((p) => ({ ...p, ufro: true })); setTreated((v) => ({ ...v, tds: 300, ph: 7.0 })); }
      if (demoStep === 6) { setPipelineActive((p) => ({ ...p, uv: true })); }
      if (demoStep === 7) setTreated({ ph: 7.1, tds: 280, turbidity: 1.2, temperature: 26.4 });
      setSecondsAgo(0);
      setDemoStep((s) => s + 1);
    }, 1700);
    return () => clearTimeout(t);
  }, [demoRunning, demoStep]);

  const onAcknowledge = useCallback((id) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status: "resolved", severity: "resolved" } : a)));
  }, []);

  const notifCount = alerts.filter((a) => a.status === "active" && a.severity !== "info").length;
  const pageTitle = [...NAV_MAIN, ...NAV_MORE].find((n) => n.id === activePage)?.label || "Dashboard";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800" style={{ fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif" }}>
      <div className="flex">
        <Sidebar activePage={activePage} onNavigate={setActivePage} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        <div className="flex-1 min-w-0">
          <TopBar
            title={pageTitle}
            dataMode={dataMode}
            setDataMode={setDataMode}
            setMobileOpen={setMobileOpen}
            notifCount={notifCount}
            notifOpen={notifOpen}
            setNotifOpen={setNotifOpen}
            alerts={alerts}
          />
          <main className="px-4 md:px-7 py-6 max-w-7xl">
            {activePage === "dashboard" && (
              <DashboardPage
                raw={raw} treated={treated} trends={trends} pipelineActive={pipelineActive} dataMode={dataMode}
                secondsAgo={secondsAgo} demoRunning={demoRunning} demoStep={demoStep}
                demoMessage={demoRunning ? DEMO_MESSAGES[demoStep] : null}
                startDemo={startDemo} resetDemo={resetDemo}
              />
            )}
            {activePage === "live" && <LiveMonitoringPage treated={treated} dataMode={dataMode} />}
            {activePage === "purification" && <PurificationPage raw={raw} treated={treated} pipelineActive={pipelineActive} />}
            {activePage === "analytics" && <AnalyticsPage />}
            {activePage === "alerts" && <AlertsPage alerts={alerts} onAcknowledge={onAcknowledge} />}
            {activePage === "filters" && <FilterHealthPage />}
            {activePage === "devices" && <DevicesPage />}
            {activePage === "energy" && <EnergyPage dataMode={dataMode} />}
            {activePage === "architecture" && <ArchitecturePage />}
            {activePage === "project" && <ProjectInfoPage />}
            {activePage === "settings" && <SettingsPage dataMode={dataMode} setDataMode={setDataMode} />}
          </main>
        </div>
      </div>
    </div>
  );
}
