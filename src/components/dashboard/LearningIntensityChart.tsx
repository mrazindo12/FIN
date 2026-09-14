"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Zap, RefreshCw } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface IntensityData {
  weeklyCompletions: Array<{
    weekLabel: string;
    completionsCount: number;
  }>;
  totalCompletions: number;
}

export function LearningIntensityChart() {
  const [data, setData] = useState<IntensityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchIntensity() {
      try {
        const res = await fetch("/api/dashboard/learning-intensity");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Error fetching learning intensity:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchIntensity();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-center py-10 text-slate-400 text-xs gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-fin-navy" />
        <span>Loading Learning Intensity Chart...</span>
      </div>
    );
  }

  const list = data?.weeklyCompletions || [];
  const labels = list.map((item) => item.weekLabel);
  const counts = list.map((item) => item.completionsCount);

  const chartData = {
    labels: labels.length > 0 ? labels : ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Modules Completed",
        data: counts.length > 0 ? counts : [0, 0, 0, 0],
        fill: true,
        backgroundColor: "rgba(147, 51, 234, 0.1)",
        borderColor: "#9333EA",
        borderWidth: 2,
        tension: 0.3,
        pointBackgroundColor: "#9333EA",
        pointBorderColor: "#ffffff",
        pointRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `Completions: ${context.parsed.y}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          font: { size: 10 },
        },
        grid: {
          color: "#F1F5F9",
        },
      },
      x: {
        ticks: {
          font: { size: 10 },
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-heading font-bold text-slate-800">
              Learning Intensity
            </h3>
            <p className="text-[11px] text-slate-400">
              Weekly module completion velocity ({data?.totalCompletions || 0} total)
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md border border-purple-200">
          Live Streak Velocity
        </span>
      </div>

      <div className="h-56 w-full pt-1">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}
