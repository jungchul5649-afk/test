import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  Bell,
  Box,
  ChevronDown,
  Cpu,
  Database,
  Globe,
  HardDrive,
  LayoutDashboard,
  Lock,
  MemoryStick,
  MoreHorizontal,
  Network,
  Plus,
  RefreshCw,
  Search,
  Server,
  Settings,
  Shield,
  Terminal,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react'

const NAV = [
  { icon: LayoutDashboard, label: '대시보드', active: true },
  { icon: Server, label: '인스턴스', badge: 12 },
  { icon: Box, label: '컨테이너' },
  { icon: Database, label: '데이터베이스' },
  { icon: Network, label: '네트워크' },
  { icon: Globe, label: '도메인 & DNS' },
  { icon: Shield, label: '보안' },
  { icon: Terminal, label: '로그' },
]

const STATS = [
  { icon: Activity, label: '요청 / 초', value: '18.4k', delta: '+12.5%', up: true, tone: 'from-violet-500/20 text-violet-300' },
  { icon: Zap, label: '평균 응답시간', value: '42ms', delta: '-8.1%', up: false, tone: 'from-emerald-500/20 text-emerald-300' },
  { icon: Cpu, label: 'CPU 사용률', value: '63%', delta: '+3.2%', up: true, tone: 'from-sky-500/20 text-sky-300' },
  { icon: Shield, label: '차단된 위협', value: '1,284', delta: '+24%', up: true, tone: 'from-rose-500/20 text-rose-300' },
]

const SERVERS = [
  { name: 'web-prod-01', region: 'Seoul · ap-northeast-2', ip: '10.0.1.12', cpu: 72, mem: 58, status: 'online', os: 'Ubuntu 24.04' },
  { name: 'web-prod-02', region: 'Seoul · ap-northeast-2', ip: '10.0.1.13', cpu: 64, mem: 61, status: 'online', os: 'Ubuntu 24.04' },
  { name: 'api-gateway', region: 'Tokyo · ap-northeast-1', ip: '10.0.2.4', cpu: 41, mem: 37, status: 'online', os: 'Debian 12' },
  { name: 'worker-batch', region: 'Singapore · ap-southeast-1', ip: '10.0.3.9', cpu: 91, mem: 84, status: 'warning', os: 'Rocky 9' },
  { name: 'staging-01', region: 'Frankfurt · eu-central-1', ip: '10.0.4.2', cpu: 0, mem: 0, status: 'offline', os: 'Ubuntu 22.04' },
]

const LOGS = [
  ['12:04:21', 'INFO', 'GET /api/v2/orders 200 · 31ms'],
  ['12:04:22', 'INFO', 'nginx: upstream web-prod-02 healthy'],
  ['12:04:24', 'WARN', 'worker-batch: memory usage above 80%'],
  ['12:04:25', 'INFO', 'POST /api/v2/checkout 201 · 88ms'],
  ['12:04:27', 'INFO', 'certbot: TLS certificate renewed (nimbus.dev)'],
  ['12:04:29', 'ERROR', 'staging-01: health check timeout (5000ms)'],
  ['12:04:31', 'INFO', 'GET /static/app.js 304 · 4ms'],
]

const STATUS = {
  online: { label: '정상', dot: 'bg-emerald-400', text: 'text-emerald-300', ring: 'bg-emerald-400/10 ring-emerald-400/20' },
  warning: { label: '경고', dot: 'bg-amber-400', text: 'text-amber-300', ring: 'bg-amber-400/10 ring-amber-400/20' },
  offline: { label: '중지', dot: 'bg-zinc-500', text: 'text-zinc-400', ring: 'bg-zinc-500/10 ring-zinc-500/20' },
}

const LOG_TONE = { INFO: 'text-sky-400', WARN: 'text-amber-400', ERROR: 'text-rose-400' }

function seedSeries(n) {
  let v = 50
  return Array.from({ length: n }, () => {
    v = Math.min(95, Math.max(15, v + (Math.random() - 0.5) * 18))
    return v
  })
}

function TrafficChart({ data }) {
  const w = 600
  const h = 200
  const step = w / (data.length - 1)
  const pts = data.map((v, i) => [i * step, h - (v / 100) * h])
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const area = `${line} L${w},${h} L0,${h} Z`
  const [lx, ly] = pts[pts.length - 1]

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-full w-full overflow-visible">
      <defs>
        <linearGradient id="fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgb(139 92 246)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="rgb(139 92 246)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="stroke" x1="0" x2="1">
          <stop offset="0%" stopColor="rgb(56 189 248)" />
          <stop offset="100%" stopColor="rgb(167 139 250)" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((r) => (
        <line key={r} x1="0" x2={w} y1={h * r} y2={h * r} stroke="rgb(255 255 255 / 0.05)" strokeDasharray="4 6" />
      ))}
      <path d={area} fill="url(#fill)" />
      <path d={line} fill="none" stroke="url(#stroke)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      <circle cx={lx} cy={ly} r="5" fill="rgb(167 139 250)" className="animate-pulse" />
    </svg>
  )
}

function Meter({ value, color }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-14 overflow-hidden rounded-full bg-white/5">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="w-8 text-xs tabular-nums text-zinc-400">{value}%</span>
    </div>
  )
}

function Card({ className = '', children }) {
  return (
    <div className={`rounded-2xl border border-white/[0.06] bg-zinc-900/60 backdrop-blur-xl ${className}`}>{children}</div>
  )
}

export default function App() {
  const [series, setSeries] = useState(() => seedSeries(40))
  const [range, setRange] = useState('24h')
  const [query, setQuery] = useState('')

  useEffect(() => {
    const id = setInterval(() => {
      setSeries((s) => {
        const last = s[s.length - 1]
        const next = Math.min(95, Math.max(15, last + (Math.random() - 0.5) * 18))
        return [...s.slice(1), next]
      })
    }, 1500)
    return () => clearInterval(id)
  }, [])

  const servers = useMemo(
    () => SERVERS.filter((s) => s.name.includes(query.toLowerCase()) || s.region.toLowerCase().includes(query.toLowerCase())),
    [query],
  )

  return (
    <div className="relative min-h-screen bg-zinc-950 font-sans text-zinc-100 antialiased">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[480px] w-[480px] rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute -right-32 top-1/3 h-[420px] w-[420px] rounded-full bg-sky-500/10 blur-[120px]" />
      </div>

      <div className="relative flex">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-white/[0.06] bg-zinc-950/60 px-4 py-6 backdrop-blur-xl lg:flex">
          <div className="flex items-center gap-2.5 px-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-sky-500 shadow-lg shadow-violet-500/30">
              <Server className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight">Nimbus</p>
              <p className="text-[11px] text-zinc-500">Server Console</p>
            </div>
          </div>

          <button className="mt-6 flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 text-left text-sm transition hover:bg-white/[0.06]">
            <div>
              <p className="text-[11px] text-zinc-500">프로젝트</p>
              <p className="font-medium">commerce-prod</p>
            </div>
            <ChevronDown className="h-4 w-4 text-zinc-500" />
          </button>

          <nav className="mt-6 space-y-1">
            {NAV.map(({ icon: Icon, label, active, badge }) => (
              <a
                key={label}
                href="#"
                className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                  active ? 'bg-white/[0.07] text-white' : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? 'text-violet-400' : ''}`} />
                <span className="flex-1">{label}</span>
                {badge && <span className="rounded-md bg-violet-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-violet-300">{badge}</span>}
              </a>
            ))}
          </nav>

          <div className="mt-auto rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-sky-500/5 p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <HardDrive className="h-4 w-4 text-violet-300" /> 스토리지
            </div>
            <p className="mt-2 text-xs text-zinc-400">
              <span className="font-semibold text-zinc-200">684 GB</span> / 1 TB 사용 중
            </p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
              <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-violet-500 to-sky-400" />
            </div>
            <button className="mt-3 w-full rounded-lg bg-white/10 py-1.5 text-xs font-medium transition hover:bg-white/15">플랜 업그레이드</button>
          </div>

          <a href="#" className="mt-4 flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200">
            <Settings className="h-4 w-4" /> 설정
          </a>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-white/[0.06] bg-zinc-950/70 px-4 py-4 backdrop-blur-xl sm:px-8">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="서버, 리전 검색…"
                className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] py-2 pl-9 pr-14 text-sm placeholder:text-zinc-500 focus:border-violet-500/50 focus:outline-none focus:ring-4 focus:ring-violet-500/10"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-white/10 px-1.5 text-[10px] text-zinc-500">⌘K</kbd>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button className="relative grid h-9 w-9 place-items-center rounded-xl border border-white/[0.06] bg-white/[0.03] text-zinc-400 hover:text-white">
                <Bell className="h-4 w-4" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-zinc-950" />
              </button>
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-300 to-rose-400" />
            </div>
          </header>

          <div className="space-y-6 px-4 py-8 sm:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-emerald-300">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  모든 시스템 정상 작동 중
                </div>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">안녕하세요, 관리자님 👋</h1>
                <p className="mt-1 text-sm text-zinc-400">오늘 인프라 현황을 한눈에 확인하세요.</p>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.07]">
                  <RefreshCw className="h-4 w-4" /> 새로고침
                </button>
                <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-violet-500/25 transition hover:brightness-110">
                  <Plus className="h-4 w-4" /> 새 서버 배포
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {STATS.map(({ icon: Icon, label, value, delta, up, tone }) => (
                <Card key={label} className="group relative overflow-hidden p-5 transition hover:border-white/10">
                  <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${tone.split(' ')[0]} to-transparent blur-2xl transition group-hover:scale-125`} />
                  <div className="relative flex items-center justify-between">
                    <div className={`grid h-10 w-10 place-items-center rounded-xl bg-white/[0.04] ring-1 ring-white/[0.06] ${tone.split(' ')[1]}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`flex items-center gap-1 text-xs font-medium ${up ? 'text-emerald-400' : 'text-sky-400'}`}>
                      {up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                      {delta}
                    </span>
                  </div>
                  <p className="relative mt-4 text-sm text-zinc-400">{label}</p>
                  <p className="relative mt-1 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
                </Card>
              ))}
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              <Card className="p-6 xl:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-semibold">실시간 트래픽</h2>
                    <p className="text-xs text-zinc-500">전체 엔드포인트 · 초당 요청 수</p>
                  </div>
                  <div className="flex rounded-lg bg-white/[0.04] p-1 text-xs">
                    {['1h', '24h', '7d', '30d'].map((r) => (
                      <button
                        key={r}
                        onClick={() => setRange(r)}
                        className={`rounded-md px-3 py-1 transition ${range === r ? 'bg-white/10 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-6 h-56">
                  <TrafficChart data={series} />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4 border-t border-white/[0.06] pt-4 text-sm">
                  {[
                    ['인바운드', '2.4 GB/s'],
                    ['아웃바운드', '1.1 GB/s'],
                    ['가동률', '99.98%'],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <p className="text-xs text-zinc-500">{k}</p>
                      <p className="mt-0.5 font-medium tabular-nums">{v}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="flex flex-col p-6">
                <h2 className="font-semibold">리소스 사용량</h2>
                <p className="text-xs text-zinc-500">클러스터 전체 평균</p>
                <div className="mt-6 space-y-5">
                  {[
                    { icon: Cpu, label: 'CPU', value: 63, detail: '48 / 76 vCPU', color: 'from-violet-500 to-fuchsia-500' },
                    { icon: MemoryStick, label: '메모리', value: 54, detail: '138 / 256 GB', color: 'from-sky-500 to-cyan-400' },
                    { icon: HardDrive, label: '디스크 I/O', value: 31, detail: '412 MB/s', color: 'from-emerald-500 to-teal-400' },
                    { icon: Network, label: '대역폭', value: 78, detail: '7.8 / 10 Gbps', color: 'from-amber-500 to-orange-400' },
                  ].map(({ icon: Icon, label, value, detail, color }) => (
                    <div key={label}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-zinc-300">
                          <Icon className="h-4 w-4 text-zinc-500" /> {label}
                        </span>
                        <span className="text-xs text-zinc-500">{detail}</span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5">
                        <div className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700`} style={{ width: `${value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-auto flex items-center gap-3 rounded-xl bg-white/[0.03] p-3 pt-3 ring-1 ring-white/[0.06]">
                  <Lock className="h-4 w-4 text-emerald-400" />
                  <p className="text-xs text-zinc-400">
                    SSL 인증서 <span className="text-zinc-200">12개</span> 모두 유효
                  </p>
                </div>
              </Card>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              <Card className="overflow-hidden xl:col-span-2">
                <div className="flex items-center justify-between px-6 py-5">
                  <div>
                    <h2 className="font-semibold">인스턴스</h2>
                    <p className="text-xs text-zinc-500">{servers.length}개 서버</p>
                  </div>
                  <a href="#" className="text-xs font-medium text-violet-300 hover:text-violet-200">전체 보기 →</a>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] whitespace-nowrap text-sm">
                    <thead>
                      <tr className="border-y border-white/[0.06] text-left text-xs text-zinc-500">
                        <th className="px-4 py-3 font-medium">이름</th>
                        <th className="px-4 py-3 font-medium">상태</th>
                        <th className="px-4 py-3 font-medium">CPU</th>
                        <th className="px-4 py-3 font-medium">메모리</th>
                        <th className="px-4 py-3 font-medium">IP</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {servers.map((s) => {
                        const st = STATUS[s.status]
                        return (
                          <tr key={s.name} className="border-b border-white/[0.04] transition last:border-0 hover:bg-white/[0.02]">
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <div className="grid h-9 w-9 place-items-center rounded-lg bg-white/[0.04] ring-1 ring-white/[0.06]">
                                  <Server className="h-4 w-4 text-zinc-400" />
                                </div>
                                <div>
                                  <p className="font-medium">{s.name}</p>
                                  <p className="text-xs text-zinc-500">{s.region}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ring-1 ${st.ring} ${st.text}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} /> {st.label}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <Meter value={s.cpu} color={s.cpu > 85 ? 'bg-amber-400' : 'bg-violet-400'} />
                            </td>
                            <td className="px-4 py-4">
                              <Meter value={s.mem} color={s.mem > 80 ? 'bg-amber-400' : 'bg-sky-400'} />
                            </td>
                            <td className="px-4 py-4 font-mono text-xs text-zinc-400">{s.ip}</td>
                            <td className="px-4 py-4 text-right">
                              <button className="rounded-md p-1.5 text-zinc-500 hover:bg-white/5 hover:text-zinc-200">
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card className="flex flex-col overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-zinc-400" />
                    <h2 className="text-sm font-semibold">라이브 로그</h2>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                  </div>
                </div>
                <div className="flex-1 space-y-2 bg-black/30 p-5 font-mono text-[12px] leading-relaxed">
                  {LOGS.map(([t, lvl, msg], i) => (
                    <div key={i} className="flex gap-3">
                      <span className="shrink-0 text-zinc-600">{t}</span>
                      <span className={`w-11 shrink-0 font-medium ${LOG_TONE[lvl]}`}>{lvl}</span>
                      <span className="text-zinc-300">{msg}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 pt-1 text-violet-300">
                    <span>❯</span>
                    <span className="h-4 w-2 animate-pulse bg-violet-300" />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
