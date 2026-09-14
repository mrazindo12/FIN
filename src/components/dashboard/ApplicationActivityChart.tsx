"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { BarChart2, RefreshCw } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ActivityData {
  statusCounts: {
    PENDING_PAYMENT: number;
    APPLIED: number;
    REVIEW: number;
    INTERVIEW: number;
    OFFER: number;
    REJECTED: number;
  };
  totalApplications: number;
}

export function ApplicationActivityChart() {
  const [data, setData] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivity() {
      try {
        const res = await fetch("/api/dashboard/activity");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Error fetching activity chart data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchActivity();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-center py-10 text-slate-400 text-xs gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-fin-navy" />
        <span>Loading Application Activity Chart...</span>
      </div>
    );
  }

  const counts = data?.statusCounts || {
    PENDING_PAYMENT: 0,
    APPLIED: 0,
    REVIEW: 0,
    INTERVIEW: 0,
    OFFER: 0,
    REJECTED: 0,
  };

  const hasData = (data?.totalApplications || 0) > 0;

  const chartData = {
    labels: [
      "Pending Payment",
      "Submitted",
      "In Review",
      "Interviewing",
      "Offer",
      "Rejected",
    ],
    datasets: [
      {
        label: "Applications",
        data: [
          counts.PENDING_PAYMENT,
          counts.APPLIED,
          counts.REVIEW,
          counts.INTERVIEW,
          counts.OFFER,
          counts.REJECTED,
        ],
        backgroundColor: [
          "#F59E0B", // Pending Payment (Amber)
          "#3B82F6", // Submitted (Blue)
          "#A855F7", // Review (Purple)
          "#6366F1", // Interview (Indigo)
          "#10B981", // Offer (Emerald)
          "#EF4444", // Rejected (Rose)
        ],
        borderRadius: 6,
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
          label: (context: any) => `Applications: ${context.parsed.y}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
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
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-heading font-bold text-slate-800">
              Application Activity
            </h3>
            <p className="text-[11px] text-slate-400">Distribution across pipeline stages</p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
          Real DB Metrics
        </span>
      </div>

      {!hasData ? (
        <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <BarChart2 className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
          <p className="text-xs font-semibold text-slate-600">No application activity recorded</p>
          <p className="text-[11px] text-slate-400">Apply to programs to visualize your progress across stages.</p>
        </div>
      ) : (
        <div className="h-52 w-full pt-2">
          <Bar data={chartData} options={chartOptions} />
        </div>
      )}
    </div>
  );
}
