/**
 * Sparkline Chart Component
 * Minimal, premium mini-chart for KPI cards
 * Shows 7-day or 30-day trend as a subtle line chart
 */

interface SparklineProps {
  data: number[];
  color?: "teal" | "blue" | "green" | "orange";
  height?: number;
  className?: string;
  showTrend?: boolean;
}

export function Sparkline({
  data,
  color = "teal",
  height = 40,
  className = "",
  showTrend = true,
}: SparklineProps) {
  if (!data || data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const lastValue = data[data.length - 1];
  const firstValue = data[0];
  const trend = lastValue >= firstValue ? "up" : "down";

  // Normalize data to 0-100 range
  const normalizedData = data.map((value) => ((value - min) / range) * 100);

  // SVG dimensions
  const width = 120;
  const viewHeight = 50;
  const padding = 4;

  // Create SVG path for the line
  const points = normalizedData
    .map((value, index) => {
      const x = padding + (index / (data.length - 1)) * (width - padding * 2);
      const y =
        viewHeight - padding - (value / 100) * (viewHeight - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  // Color mapping
  const colorMap = {
    teal: {
      line: "rgba(0, 252, 232, 0.8)",
      fill: "rgba(0, 252, 232, 0.1)",
      label: "text-teal-400",
    },
    blue: {
      line: "rgba(61, 124, 255, 0.8)",
      fill: "rgba(61, 124, 255, 0.1)",
      label: "text-blue-400",
    },
    green: {
      line: "rgba(0, 196, 140, 0.8)",
      fill: "rgba(0, 196, 140, 0.1)",
      label: "text-green-400",
    },
    orange: {
      line: "rgba(255, 185, 56, 0.8)",
      fill: "rgba(255, 185, 56, 0.1)",
      label: "text-amber-400",
    },
  };

  const colors = colorMap[color];

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <svg
        viewBox={`0 0 ${width} ${viewHeight}`}
        width={width}
        height={height}
        className="w-full"
      >
        {/* Fill area under line */}
        <polygon
          points={`${padding},${viewHeight - padding} ${points} ${width - padding},${viewHeight - padding}`}
          fill={colors.fill}
          opacity="0.3"
        />

        {/* Line chart */}
        <polyline
          points={points}
          fill="none"
          stroke={colors.line}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Last point indicator */}
        <circle
          cx={width - padding - 2}
          cy={
            viewHeight -
            padding -
            (normalizedData[normalizedData.length - 1] / 100) *
              (viewHeight - padding * 2)
          }
          r="2"
          fill={colors.line}
        />
      </svg>

      {showTrend && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">7-day trend</span>
          <span
            className={`font-semibold ${trend === "up" ? "text-emerald-400" : "text-rose-400"}`}
          >
            {trend === "up" ? "↑" : "↓"}{" "}
            {Math.abs(((lastValue - firstValue) / firstValue) * 100).toFixed(1)}
            %
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * KPI Card with Sparkline
 * Premium card component showing value + trend chart
 */
interface KPICardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: number;
  trendLabel?: string;
  data?: number[];
  color?: "teal" | "blue" | "green" | "orange";
  icon?: React.ReactNode;
  onClick?: () => void;
}

export function KPICard({
  label,
  value,
  unit,
  trend,
  trendLabel,
  data,
  color = "teal",
  icon,
  onClick,
}: KPICardProps) {
  return (
    <button
      onClick={onClick}
      className="card-glow group relative p-6 text-left transition-all duration-300 hover:scale-105"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="kpi-label">{label}</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="kpi-value">{value}</span>
            {unit && (
              <span className="text-sm text-muted-foreground">{unit}</span>
            )}
          </div>
        </div>
        {icon && (
          <div className="text-2xl opacity-60 group-hover:opacity-100 transition-opacity">
            {icon}
          </div>
        )}
      </div>

      {/* Sparkline */}
      {data && data.length > 0 && (
        <div className="mb-4">
          <Sparkline data={data} color={color} height={35} showTrend={false} />
        </div>
      )}

      {/* Trend Badge */}
      {trend !== undefined && (
        <div className="flex items-center gap-2">
          <span className={`kpi-trend ${trend >= 0 ? "up" : "down"}`}>
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </span>
          {trendLabel && (
            <span className="text-xs text-muted-foreground">{trendLabel}</span>
          )}
        </div>
      )}

      {/* Glow effect on hover */}
      <div
        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{
          boxShadow: "0 0 20px rgba(0, 252, 232, 0.15)",
        }}
      />
    </button>
  );
}
