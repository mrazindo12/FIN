"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Radar } from "react-chartjs-2";
import { Award, RefreshCw } from "lucide-react";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface CompetencyData {
  scoreMap: {
    TECHNICAL_SKILLS: number;
    COMMUNICATION: number;
    PROBLEM_SOLVING: number;
    TEAMWORK: number;
    LEADERSHIP: number;
    ADAPTABILITY: number;
  };
  totalCompletedModules: number;
}

export function CompetencyRadarChart() {
  const [data, setData] = useState<CompetencyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCompetency() {
      try {
        const res = await fetch("/api/dashboard/competency");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Error fetching competency data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCompetency();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-center py-10 text-slate-400 text-xs gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-fin-navy" />
        <span>Loading Competency Radar...</span>
      </div>
    );
  }

  const scores = data?.scoreMap || {
    TECHNICAL_SKILLS: 0,
    COMMUNICATION: 0,
    PROBLEM_SOLVING: 0,
    TEAMWORK: 0,
    LEADERSHIP: 0,
    ADAPTABILITY: 0,
  };

  const chartData = {
    labels: [
      "Technical Skills",
      "Communication",
      "Problem Solving",
      "Teamwork",
      "Leadership",
      "Adaptability",
    ],
    datasets: [
      {
        label: "Skill Score (0-100)",
        data: [
          scores.TECHNICAL_SKILLS,
          scores.COMMUNICATION,
          scores.PROBLEM_SOLVING,
          scores.TEAMWORK,
          scores.LEADERSHIP,
          scores.ADAPTABILITY,
        ],
        backgroundColor: "rgba(30, 58, 138, 0.2)",
        borderColor: "#1E3A8A",
        borderWidth: 2,
        pointBackgroundColor: "#D97706",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "#D97706",
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
          label: (context: any) => `Score: ${context.parsed.r}/100`,
        },
      },
    },
    scales: {
      r: {
        angleLines: {
          color: "#E2E8F0",
        },
        grid: {
          color: "#F1F5F9",
        },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          stepSize: 20,
          font: { size: 9 },
          backdropColor: "transparent",
        },
        pointLabels: {
          font: { size: 10, weight: 600 },
          color: "#334155",
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-heading font-bold text-slate-800">
              Competency Radar
            </h3>
            <p className="text-[11px] text-slate-400">
              Skill proficiency vector map ({data?.totalCompletedModules || 0} modules completed)
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md border border-amber-200">
          Live Skill Vectors
        </span>
      </div>

      <div className="h-56 w-full pt-1">
        <Radar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}
