/**
 * Kernel Field Notes style: an asymmetric evidence workbench with explicit
 * diagnostic labels, calibration detail, and restrained Signal Lime focus.
 */
import { useMemo, useState } from "react";
import { area, curveMonotoneX, line, scaleLinear } from "d3";
import {
  Activity, AlertTriangle, ArrowUpRight, BarChart3, Boxes, ChevronDown, ChevronRight,
  CircleHelp, Clock3, Code2, Copy, Cpu, Crosshair, FileSearch, Flame, Gauge,
  Layers3, LayoutDashboard, MemoryStick, MoreHorizontal, Network, Pause, Play,
  Search, Settings2, SlidersHorizontal, TerminalSquare, Waypoints,
} from "lucide-react";
import { toast } from "sonner";

type Process = { pid: string; name: string; memory: string; state: "watching" | "suspect" | "idle" };

const processes: Process[] = [
  { pid: "18422", name: "api-worker", memory: "512 MiB", state: "suspect" },
  { pid: "18297", name: "postgres", memory: "418 MiB", state: "watching" },
  { pid: "18509", name: "nginx", memory: "88 MiB", state: "watching" },
  { pid: "17944", name: "node", memory: "246 MiB", state: "idle" },
];

const memorySeries = [
  { t: "14:00", rss: 338, heap: 172, faults: 4 }, { t: "14:05", rss: 346, heap: 179, faults: 5 },
  { t: "14:10", rss: 351, heap: 182, faults: 4 }, { t: "14:15", rss: 362, heap: 191, faults: 6 },
  { t: "14:20", rss: 371, heap: 204, faults: 5 }, { t: "14:25", rss: 389, heap: 221, faults: 8 },
  { t: "14:30", rss: 404, heap: 238, faults: 7 }, { t: "14:35", rss: 423, heap: 263, faults: 9 },
  { t: "14:40", rss: 447, heap: 291, faults: 10 }, { t: "14:45", rss: 471, heap: 324, faults: 12 },
  { t: "14:50", rss: 494, heap: 352, faults: 11 }, { t: "14:55", rss: 512, heap: 376, faults: 13 },
];

const regions = [
  { name: "[heap]", range: "7f3b8e000000–7f3ba2000000", size: "320 MiB", rss: "286 MiB", share: 89, kind: "anon", flag: "growing" },
  { name: "libc.so.6", range: "7f3bb4373000–7f3bb44ef000", size: "1.48 MiB", rss: "1.42 MiB", share: 96, kind: "file", flag: "stable" },
  { name: "[stack]", range: "7ffe3db38000–7ffe3db59000", size: "132 KiB", rss: "88 KiB", share: 67, kind: "anon", flag: "stable" },
  { name: "libssl.so.3", range: "7f3bb1efc000–7f3bb1f7b000", size: "508 KiB", rss: "508 KiB", share: 100, kind: "file", flag: "stable" },
];

const allocations = [
  { label: "arena 0", value: 82, color: "#c6ff4a" }, { label: "arena 1", value: 46, color: "#9ebf6a" },
  { label: "mmap", value: 29, color: "#f5b65e" }, { label: "tcache", value: 18, color: "#5c7974" },
];

function SectionLabel({ children, right }: { children: string; right?: React.ReactNode }) {
  return <div className="flex items-center gap-3"><span className="observation-tag">{children}</span><span className="tickline" />{right}</div>;
}

function MemoryChart({ timeframe }: { timeframe: string }) {
  const [hovered, setHovered] = useState<number | null>(10);
  const width = 780, height = 252, left = 10, right = 10, top = 12, bottom = 34;
  const x = useMemo(() => scaleLinear().domain([0, memorySeries.length - 1]).range([left, width - right]), []);
  const y = useMemo(() => scaleLinear().domain([130, 550]).range([height - bottom, top]), []);
  const rssPath = useMemo(() => line<(typeof memorySeries)[number]>().x((_, i) => x(i)).y(d => y(d.rss)).curve(curveMonotoneX)(memorySeries) || "", [x, y]);
  const heapPath = useMemo(() => line<(typeof memorySeries)[number]>().x((_, i) => x(i)).y(d => y(d.heap)).curve(curveMonotoneX)(memorySeries) || "", [x, y]);
  const fillPath = useMemo(() => area<(typeof memorySeries)[number]>().x((_, i) => x(i)).y0(y(130)).y1(d => y(d.rss)).curve(curveMonotoneX)(memorySeries) || "", [x, y]);
  const active = hovered === null ? memorySeries[memorySeries.length - 1] : memorySeries[hovered];
  const activeX = x(hovered === null ? memorySeries.length - 1 : hovered);
  return (
    <div className="h-full">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div><div className="flex items-center gap-3"><h2 className="text-[1.1rem] font-semibold tracking-tight text-[#f0f5f1]">Resident set growth</h2><span className="mono text-[0.66rem] text-[#7d9087]">{timeframe}</span></div><p className="mt-1.5 text-xs text-[#8b9994]">RSS climbs faster than the working set releases.</p></div>
        <div className="flex items-center gap-4 mono text-[0.66rem] text-[#aab8b2]"><span className="flex items-center gap-1.5"><i className="h-1.5 w-1.5 rounded-full bg-[#c6ff4a]" />RSS</span><span className="flex items-center gap-1.5"><i className="h-1.5 w-1.5 rounded-full bg-[#f5b65e]" />heap committed</span></div>
      </div>
      <div className="relative h-[252px] w-full min-w-0">
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="h-full w-full overflow-visible" aria-label="Resident set and heap committed memory growth chart">
          <defs><linearGradient id="rss-fill" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#c6ff4a" stopOpacity=".15" /><stop offset="1" stopColor="#c6ff4a" stopOpacity="0" /></linearGradient></defs>
          {[150, 250, 350, 450, 550].map(v => <g key={v}><line x1={left} x2={width-right} y1={y(v)} y2={y(v)} stroke="rgba(212,230,219,.11)" strokeDasharray="2 5" /><text x={width-1} y={y(v)+3} textAnchor="end" fill="#74837e" fontSize="9" fontFamily="IBM Plex Mono">{v}</text></g>)}
          <path d={fillPath} fill="url(#rss-fill)" />
          <path d={rssPath} fill="none" stroke="#c6ff4a" strokeWidth="2" />
          <path d={heapPath} fill="none" stroke="#f5b65e" strokeWidth="1.5" strokeDasharray="4 5" />
          {memorySeries.map((d, i) => <g key={d.t} onMouseEnter={() => setHovered(i)} className="cursor-crosshair"><rect x={x(i)-((width-right-left)/(memorySeries.length-1))/2} y={0} width={(width-right-left)/(memorySeries.length-1)} height={height-bottom} fill="transparent" /><circle cx={x(i)} cy={y(d.rss)} r={hovered === i ? 4.5 : 0} fill="#0b1114" stroke="#c6ff4a" strokeWidth="2" /></g>)}
          <line x1={activeX} x2={activeX} y1={top} y2={height-bottom} stroke="rgba(198,255,74,.35)" strokeDasharray="3 5" className="signal-cursor" />
          {memorySeries.filter((_, i) => i % 2 === 0).map((d, i) => <text key={d.t} x={x(i*2)} y={height-10} textAnchor="middle" fill="#71807a" fontSize="9" fontFamily="IBM Plex Mono">{d.t}</text>)}
        </svg>
        <div className="pointer-events-none absolute right-11 top-2 rounded border border-[#c6ff4a]/30 bg-[#10191d]/95 px-2.5 py-1.5 shadow-lg mono text-[0.65rem] text-[#d9ffd0]"><span className="block text-[#91a29b]">{active.t}</span><span>RSS&nbsp;&nbsp;{active.rss} MiB</span><span className="ml-3 text-[#f5b65e]">heap {active.heap}</span></div>
      </div>
    </div>
  );
}

function Donut({ selected }: { selected: string }) {
  const values = [46, 29, 14, 11]; const colors = ["#c6ff4a", "#7c9f92", "#f5b65e", "#3d5354"]; let cursor = -90;
  return <div className="flex items-center gap-5"><svg width="126" height="126" viewBox="0 0 126 126" className="shrink-0" aria-label="Memory composition donut chart"><circle cx="63" cy="63" r="48" fill="none" stroke="#1b292d" strokeWidth="14" />{values.map((value, i) => { const start = cursor; const end = cursor + value * 3.6 - 2.4; cursor += value * 3.6; const startP = [63 + 48*Math.cos(start*Math.PI/180),63 + 48*Math.sin(start*Math.PI/180)]; const endP = [63 + 48*Math.cos(end*Math.PI/180),63 + 48*Math.sin(end*Math.PI/180)]; return <path key={i} d={`M ${startP[0]} ${startP[1]} A 48 48 0 ${end-start>180?1:0} 1 ${endP[0]} ${endP[1]}`} fill="none" stroke={colors[i]} strokeWidth="14" strokeLinecap="butt" />; })}<text x="63" y="59" textAnchor="middle" fill="#edf6ee" fontFamily="IBM Plex Mono" fontSize="16" fontWeight="600">512</text><text x="63" y="75" textAnchor="middle" fill="#81918b" fontFamily="IBM Plex Mono" fontSize="8">MiB RSS</text></svg><div className="min-w-0 space-y-2.5 mono text-[0.65rem]">{[["heap","235 MiB",colors[0]],["file-backed","148 MiB",colors[1]],["anonymous","71 MiB",colors[2]],["stack + other","58 MiB",colors[3]]].map(([label,value,color]) => <div key={label as string} className="flex items-center justify-between gap-5"><span className="flex items-center gap-2 whitespace-nowrap text-[#91a19a]"><i className="h-1.5 w-1.5" style={{ background: color as string }} />{label}</span><span className="text-[#dce6df]">{value}</span></div>)}<span className="block pt-1 text-[#6f8079]">scope: {selected}</span></div></div>;
}

export default function Home() {
  const [selectedProcess, setSelectedProcess] = useState(processes[0]);
  const [timeframe, setTimeframe] = useState("last 60 min");
  const [live, setLive] = useState(true);
  const [activeTab, setActiveTab] = useState("Mappings");
  const [mapFilter, setMapFilter] = useState<"all" | "anon" | "file">("all");
  const filteredRegions = mapFilter === "all" ? regions : regions.filter(r => r.kind === mapFilter);
  const metricCards = [
    { label: "RSS", value: "512", unit: "MiB", delta: "+18.4%", icon: MemoryStick, tone: "lime" },
    { label: "virtual size", value: "1.82", unit: "GiB", delta: "+0.2%", icon: Layers3, tone: "quiet" },
    { label: "minor faults", value: "128", unit: "/ sec", delta: "+32", icon: Flame, tone: "amber" },
    { label: "growth slope", value: "2.9", unit: "MiB / min", delta: "elevated", icon: Activity, tone: "coral" },
  ];

  return (
    <div className="min-h-screen bg-[#0b1114] text-[#e7eeea]">
      <div className="flex min-h-screen">
        <aside className="hidden w-[252px] shrink-0 flex-col border-r border-white/[.09] bg-[#0d1518] lg:flex">
          <div className="flex h-[74px] items-center gap-3 border-b border-white/[.09] px-6">
            <img src="/manus-storage/memscope-logo_9653c556.png" alt="MemScope" className="h-8 w-8 object-contain" />
            <div><div className="font-semibold tracking-[-0.04em] text-[#eff6ef]">mem<span className="text-[#c6ff4a]">scope</span></div><div className="mono mt-0.5 text-[0.55rem] tracking-[0.14em] text-[#6f8079]">LINUX MEMORY TOOLKIT</div></div>
          </div>
          <div className="px-4 pt-5"><div className="mb-2 px-3 mono text-[0.6rem] tracking-[.14em] text-[#67766f]">WORKBENCH</div><nav className="space-y-1"><button className="nav-item active flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm"><LayoutDashboard className="h-4 w-4" />Investigation</button><button onClick={() => toast.info("Comparisons are ready when a second capture is added.")} className="nav-item flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm text-[#899892]"><Waypoints className="h-4 w-4" />Comparisons</button><button onClick={() => toast.info("Saved evidence is available in a future collector-backed session.")} className="nav-item flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm text-[#899892]"><FileSearch className="h-4 w-4" />Evidence log</button></nav></div>
          <div className="mt-7 px-4"><SectionLabel>Observed processes</SectionLabel><div className="mt-3 space-y-1">{processes.map(process => <button key={process.pid} onClick={() => setSelectedProcess(process)} className={`data-row flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left ${selectedProcess.pid === process.pid ? "bg-white/[.055]" : ""}`}><span className={`h-1.5 w-1.5 rounded-full ${process.state === "suspect" ? "bg-[#ff776f]" : process.state === "watching" ? "bg-[#c6ff4a]" : "bg-[#667772]"}`} /><span className="min-w-0 flex-1"><span className="block truncate text-xs font-medium text-[#dce6df]">{process.name}</span><span className="mono block text-[0.59rem] text-[#6f8079]">pid {process.pid} · {process.memory}</span></span>{process.state === "suspect" && <AlertTriangle className="h-3.5 w-3.5 text-[#ff776f]" />}</button>)}</div></div>
          <div className="mt-auto border-t border-white/[.09] p-4"><button onClick={() => toast.info("Collector settings are a prototype control.")} className="nav-item flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-[#899892]"><Settings2 className="h-4 w-4" />Collector settings</button><div className="mx-3 mt-3 flex items-center gap-2 mono text-[0.6rem] text-[#71817a]"><span className="status-live h-1.5 w-1.5 rounded-full bg-[#c6ff4a]" />procfs collector linked</div></div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="flex min-h-[74px] items-center justify-between gap-4 border-b border-white/[.09] bg-[#0d1518]/80 px-5 py-3 backdrop-blur md:px-8">
            <div className="flex min-w-0 items-center gap-3"><img src="/manus-storage/memscope-logo_9653c556.png" alt="" className="h-7 w-7 lg:hidden" /><div className="min-w-0"><div className="flex items-center gap-2"><h1 className="truncate text-sm font-semibold text-[#eaf1eb]">{selectedProcess.name}</h1><span className="mono rounded border border-[#c6ff4a]/20 bg-[#c6ff4a]/[.07] px-1.5 py-0.5 text-[0.58rem] text-[#d9ffc0]">pid {selectedProcess.pid}</span></div><div className="mono mt-1 flex items-center gap-2 text-[0.6rem] text-[#71817a]"><span>host: devbox-07</span><span className="h-1 w-1 rounded-full bg-[#43544e]" /><span>Ubuntu 24.04</span></div></div></div>
            <div className="flex items-center gap-2"><button onClick={() => setLive(!live)} className={`control-button hidden items-center gap-2 rounded-md border px-3 py-2 mono text-[0.65rem] sm:flex ${live ? "border-[#c6ff4a]/35 bg-[#c6ff4a]/[.07] text-[#ddffc9]" : "border-white/15 text-[#9caaa5]"}`}>{live ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}{live ? "Live" : "Paused"}</button><button onClick={() => toast.success("Snapshot copied to evidence log.")} className="control-button flex items-center gap-2 rounded-md border border-white/15 px-3 py-2 mono text-[0.65rem] text-[#bdc9c4]"><Copy className="h-3.5 w-3.5" /><span className="hidden sm:inline">Capture</span></button><button onClick={() => toast.info("MemScope command palette is coming soon.")} className="control-button rounded-md border border-white/15 p-2 text-[#a7b5af]"><MoreHorizontal className="h-4 w-4" /></button></div>
          </header>

          <div className="mx-auto max-w-[1640px] px-4 py-5 md:px-7 md:py-7">
            <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between"><div><SectionLabel>Active investigation / 01</SectionLabel><div className="mt-3 flex items-center gap-3"><h2 className="text-2xl font-semibold tracking-[-.055em] text-[#f0f6f1] md:text-[1.85rem]">Memory drift in <span className="text-[#c6ff4a]">api-worker</span></h2><span className="hidden h-px w-10 bg-[#c6ff4a]/50 md:block" /></div><p className="mt-2 max-w-2xl text-sm text-[#91a099]">The resident working set has risen continuously across the current collection window. Release activity has not matched allocation pressure.</p></div><div className="flex flex-wrap items-center gap-2"><div className="flex rounded-md border border-white/[.12] bg-black/10 p-1">{["last 15 min","last 60 min","last 6 hr"].map(frame => <button key={frame} onClick={() => setTimeframe(frame)} className={`rounded px-2.5 py-1.5 mono text-[0.6rem] transition ${timeframe === frame ? "bg-[#243437] text-[#eaffca]" : "text-[#7f8f89] hover:text-[#c8d3ce]"}`}>{frame}</button>)}</div><button onClick={() => toast.info("Sample interval is fixed at 5 seconds in this prototype.")} className="control-button flex items-center gap-2 rounded-md border border-white/[.12] px-3 py-2 mono text-[0.61rem] text-[#a5b3ad]"><SlidersHorizontal className="h-3.5 w-3.5" />5s interval<ChevronDown className="h-3 w-3" /></button></div></div>

            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metricCards.map(metric => { const Icon = metric.icon; const tone = metric.tone === "lime" ? "text-[#dfffac] bg-[#c6ff4a]/[.08] border-[#c6ff4a]/20" : metric.tone === "amber" ? "text-[#ffd497] bg-[#f5b65e]/[.07] border-[#f5b65e]/20" : metric.tone === "coral" ? "text-[#ffaaa3] bg-[#ff776f]/[.07] border-[#ff776f]/20" : "text-[#b5c4bd] bg-white/[.035] border-white/[.1]"; return <div key={metric.label} className="instrument-panel rounded-lg p-4"><div className="panel-content flex items-start justify-between"><span className="observation-tag">{metric.label}</span><span className={`rounded border p-1.5 ${tone}`}><Icon className="h-3.5 w-3.5" /></span></div><div className="panel-content mt-5 flex items-end justify-between"><div><span className="mono text-[1.6rem] font-medium tracking-[-.06em] text-[#edf5ef]">{metric.value}</span><span className="mono ml-1.5 text-[.64rem] text-[#85948e]">{metric.unit}</span></div><span className={`mono text-[.64rem] ${metric.tone === "coral" ? "text-[#ff9e97]" : metric.tone === "amber" ? "text-[#f5c47f]" : "text-[#a0bc77]"}`}>{metric.delta}</span></div></div>})}</section>

            <section className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1.68fr)_minmax(315px,.72fr)]"><div className="instrument-panel min-h-[376px] rounded-lg p-5 md:p-6"><div className="panel-content h-full"><MemoryChart timeframe={timeframe} /></div></div><div className="instrument-panel rounded-lg p-5"><div className="panel-content"><SectionLabel right={<button onClick={() => toast.info("Memory composition is derived from the most recent procfs sample.")}><CircleHelp className="h-3.5 w-3.5 text-[#71817a]" /></button>}>Memory composition</SectionLabel><div className="mt-6"><Donut selected={selectedProcess.name} /></div><div className="subtle-rule mt-6 pt-4"><div className="flex items-start gap-3"><div className="mt-0.5 rounded border border-[#ff776f]/30 bg-[#ff776f]/10 p-1.5"><AlertTriangle className="h-3.5 w-3.5 text-[#ff8e87]" /></div><div><p className="text-xs font-medium text-[#f2d9d6]">Heap retention is dominant</p><p className="mt-1 text-[.7rem] leading-relaxed text-[#87968f]">46% of RSS remains within anonymous heap pages after observed request completion.</p></div></div></div></div></div></section>

            <section className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1.68fr)_minmax(315px,.72fr)]"><div className="instrument-panel rounded-lg"><div className="panel-content"><div className="flex flex-col justify-between gap-3 border-b border-white/[.09] px-5 py-4 md:flex-row md:items-center"><div className="flex items-center gap-3"><SectionLabel>Address space</SectionLabel><span className="mono text-[.6rem] text-[#697b74]">/proc/{selectedProcess.pid}/smaps</span></div><div className="flex gap-1 rounded border border-white/[.09] bg-black/10 p-1">{[["all","All"],["anon","Anonymous"],["file","File-backed"]].map(([filter,label]) => <button key={filter} onClick={() => setMapFilter(filter as "all" | "anon" | "file")} className={`rounded px-2 py-1.5 mono text-[.58rem] ${mapFilter === filter ? "bg-[#26373a] text-[#e5f7d2]" : "text-[#7f8f89]"}`}>{label}</button>)}</div></div><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left"><thead className="mono text-[.58rem] uppercase tracking-[.12em] text-[#6f8079]"><tr><th className="px-5 py-3 font-medium">region</th><th className="px-4 py-3 font-medium">address range</th><th className="px-4 py-3 font-medium">size</th><th className="px-4 py-3 font-medium">rss</th><th className="px-5 py-3 font-medium">residency</th></tr></thead><tbody>{filteredRegions.map((region, index) => <tr key={region.name} className="data-row border-t border-white/[.065]"><td className="px-5 py-3.5"><div className="flex items-center gap-2"><span className={`h-1.5 w-1.5 ${region.kind === "anon" ? "bg-[#c6ff4a]" : "bg-[#88a5a1]"}`} /><span className="mono text-[.69rem] text-[#e3ece5]">{region.name}</span>{region.flag === "growing" && <span className="rounded border border-[#ff776f]/25 bg-[#ff776f]/[.08] px-1.5 py-0.5 mono text-[.52rem] text-[#ff9d96]">GROWING</span>}</div></td><td className="px-4 py-3.5 mono text-[.62rem] text-[#84938d]">{region.range}</td><td className="px-4 py-3.5 mono text-[.67rem] text-[#c1cec8]">{region.size}</td><td className="px-4 py-3.5 mono text-[.67rem] text-[#c1cec8]">{region.rss}</td><td className="px-5 py-3.5"><div className="flex items-center gap-2"><div className="h-1.5 w-16 overflow-hidden bg-[#233136]"><div className="h-full" style={{ width: `${region.share}%`, background: region.flag === "growing" ? "#ff776f" : "#c6ff4a" }} /></div><span className="mono text-[.58rem] text-[#8d9d96]">{region.share}%</span></div></td></tr>)}</tbody></table></div></div></div><div className="instrument-panel overflow-hidden rounded-lg"><div className="absolute inset-x-0 top-0 h-28 bg-[url('/manus-storage/memscope-page-map_3083b8a2.png')] bg-cover bg-center opacity-35" /><div className="panel-content relative p-5"><SectionLabel>Leak hypothesis</SectionLabel><div className="mt-5 flex items-start justify-between"><div><h3 className="max-w-[16rem] text-[1.1rem] font-semibold leading-tight tracking-[-.035em] text-[#f4e8e6]">Allocator growth is not reaching release sites.</h3><p className="mt-2 max-w-[17rem] text-xs leading-relaxed text-[#9eaaa5]">The current slope persisted through four garbage-collection cycles.</p></div><div className="rounded border border-[#ff776f]/30 bg-[#ff776f]/10 px-2 py-1 mono text-[.58rem] text-[#ffaaa3]">0.87 confidence</div></div><div className="mt-5 border-l border-[#c6ff4a]/50 pl-3"><div className="mono text-[.58rem] text-[#7e8e87]">NEXT CHECK</div><button onClick={() => setActiveTab("Allocation profile")} className="mt-1 flex items-center gap-1 text-left text-xs font-medium text-[#dcffac]">Inspect allocation profile <ArrowUpRight className="h-3.5 w-3.5" /></button></div></div></div></section>

            <section className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1.3fr)]"><div className="instrument-panel rounded-lg p-5"><div className="panel-content"><SectionLabel>Allocation pattern</SectionLabel><div className="mt-4 flex items-end gap-3"><div className="min-w-0 flex-1"><div className="mb-5 flex items-end justify-between"><div><div className="mono text-[1.55rem] font-medium tracking-[-.06em] text-[#eff6f0]">176.3 <span className="text-[.7rem] text-[#83928c]">MiB</span></div><p className="mt-1 text-xs text-[#85948e]">retained after request completion</p></div><div className="rounded border border-[#f5b65e]/20 bg-[#f5b65e]/[.06] px-2 py-1 mono text-[.58rem] text-[#f7c981]">+24.1 MiB / 10m</div></div><div className="space-y-3.5">{allocations.map(item => <div key={item.label} className="flex items-center gap-3"><span className="mono w-14 text-[.6rem] text-[#809089]">{item.label}</span><div className="h-2 flex-1 overflow-hidden bg-[#243135]"><div className="h-full" style={{ width: `${item.value}%`, backgroundColor: item.color }} /></div><span className="mono w-8 text-right text-[.6rem] text-[#b9c5bf]">{item.value}%</span></div>)}</div></div></div><div className="subtle-rule mt-5 flex items-center justify-between pt-3"><span className="mono text-[.58rem] text-[#76867f]">glibc malloc / sampled</span><button onClick={() => setActiveTab("Allocation profile")} className="flex items-center gap-1 mono text-[.61rem] text-[#cfff7b]">View stacks <ChevronRight className="h-3.5 w-3.5" /></button></div></div></div>
              <div className="instrument-panel rounded-lg"><div className="panel-content"><div className="flex items-center gap-1 border-b border-white/[.09] px-4 pt-3">{["Mappings", "Allocation profile", "Page faults"].map(tab => <button key={tab} onClick={() => setActiveTab(tab)} className={`border-b px-3 py-2.5 text-xs font-medium transition ${activeTab === tab ? "border-[#c6ff4a] text-[#e4ffc1]" : "border-transparent text-[#7c8b85] hover:text-[#c8d4cf]"}`}>{tab}</button>)}</div><div className="p-5">{activeTab === "Mappings" && <div className="grid gap-4 sm:grid-cols-2"><div className="rounded border border-white/[.08] bg-black/10 p-3"><div className="mono text-[.58rem] text-[#75847e]">SELECTED REGION</div><div className="mt-2 flex items-center gap-2"><span className="h-2 w-2 bg-[#c6ff4a]" /><span className="mono text-xs text-[#e6eee8]">[heap]</span></div><p className="mt-2 text-[.68rem] leading-relaxed text-[#8c9a94]">286 MiB resident across 73,216 pages. Private dirty pages increased 11.2%.</p></div><div className="rounded border border-white/[.08] bg-black/10 p-3"><div className="mono text-[.58rem] text-[#75847e]">LOOKUP</div><button onClick={() => toast.info("An address lookup would open the symbolic resolver in a collector-backed build.")} className="mt-2 flex items-center gap-2 text-left mono text-[.7rem] text-[#c6ff4a]"><Search className="h-3.5 w-3.5" />0x7f3b9c48a000</button><p className="mt-2 text-[.68rem] text-[#8c9a94]">Last touched 14:55:02.401</p></div></div>}{activeTab === "Allocation profile" && <div className="grid gap-3 sm:grid-cols-3">{[["malloc","47.8%","request_ctx.rs:118"],["calloc","31.4%","serde_json.rs:442"],["mmap","12.1%","buffer_pool.c:291"]].map(([call,share,site]) => <div key={call} className="rounded border border-white/[.08] bg-black/10 p-3"><div className="flex items-center justify-between"><Code2 className="h-3.5 w-3.5 text-[#c6ff4a]" /><span className="mono text-[.64rem] text-[#c7d5ce]">{share}</span></div><div className="mt-3 mono text-[.75rem] text-[#edf4ee]">{call}</div><div className="mt-1 mono text-[.55rem] text-[#74847d]">{site}</div></div>)}</div>}{activeTab === "Page faults" && <div className="flex items-center gap-5"><div className="rounded border border-[#f5b65e]/20 bg-[#f5b65e]/[.06] p-3"><Flame className="h-5 w-5 text-[#f5b65e]" /></div><div><div className="mono text-lg text-[#f4f6e9]">128 <span className="text-[.65rem] text-[#8c9a94]">minor faults / sec</span></div><p className="mt-1 text-xs text-[#8c9a94]">Fault rate tracks allocation churn; no major faults observed.</p></div></div>}</div></div></div>
            </section>

            <footer className="flex flex-col gap-2 py-6 mono text-[.58rem] text-[#65756e] sm:flex-row sm:items-center sm:justify-between"><span>MEMSCOPE / PROTOTYPE · synthetic telemetry only</span><span className="flex items-center gap-2"><Clock3 className="h-3 w-3" />last sample 14:55:07.003 · 5s cadence</span></footer>
          </div>
        </main>
      </div>
    </div>
  );
}

