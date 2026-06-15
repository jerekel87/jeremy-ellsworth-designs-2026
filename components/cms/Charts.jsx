import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip,
} from "recharts";

const YELLOW = "#FFF600";
const GRID = "rgba(255, 255, 255, 0.06)";
const TICK = { fill: "#6b6c75", fontSize: 11, fontFamily: "inherit" };

function ChartTooltip({ active, payload, label, suffix }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="cms-tip">
      {label ? <span className="cms-tip__label">{label}</span> : null}
      <strong>{payload[0].value.toLocaleString()}{suffix || ""}</strong>
    </div>
  );
}

export function LiveSpark({ data, dataKey = "active", suffix = " active" }) {
  return (
    <div className="cms-spark">
      <ResponsiveContainer width="100%" height={78}>
        <AreaChart data={data} margin={{ top: 6, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="cmsSpark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={YELLOW} stopOpacity={0.3} />
              <stop offset="100%" stopColor={YELLOW} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="time" hide />
          <Tooltip content={<ChartTooltip suffix={suffix} />} cursor={false} />
          <Area
            type="monotone" dataKey={dataKey}
            stroke={YELLOW} strokeWidth={2}
            fill="url(#cmsSpark)"
            activeDot={{ r: 3.5, fill: YELLOW, stroke: "#121214", strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TrafficChart({ data, dataKey = "visitors", suffix = " visitors" }) {
  return (
    <div className="cms-chart">
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 12, right: 12, bottom: 4, left: 0 }}>
          <defs>
            <linearGradient id="cmsTraffic" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={YELLOW} stopOpacity={0.24} />
              <stop offset="100%" stopColor={YELLOW} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis
            dataKey="date" tick={TICK} tickLine={false} axisLine={false}
            interval="preserveStartEnd" minTickGap={48} dy={6}
          />
          <YAxis
            tick={TICK} tickLine={false} axisLine={false} width={42}
            allowDecimals={false}
            tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(v % 1000 ? 1 : 0)}k` : v)}
          />
          <Tooltip
            content={<ChartTooltip suffix={suffix} />}
            cursor={{ stroke: "rgba(255, 246, 0, 0.35)", strokeDasharray: "4 4" }}
          />
          <Area
            type="monotone" dataKey={dataKey}
            stroke={YELLOW} strokeWidth={2.5}
            fill="url(#cmsTraffic)"
            activeDot={{ r: 4.5, fill: YELLOW, stroke: "#121214", strokeWidth: 2 }}
            animationDuration={1200}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
