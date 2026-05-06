// v1.1 - Refactored Enhanced User Dashboard
"use client";

import { useEffect, useLayoutEffect, useState, memo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@elzatona/contexts";
import {
  supabaseClient as supabase,
  isSupabaseAvailable,
} from "../../../../apps/website/src/app/lib/supabase-client";
import {
  BookOpen,
  Target,
  Zap,
  BarChart3,
  Loader2,
  LogOut,
  Star,
  Play,
  ArrowRight,
  Timer,
  Flame,
  Medal,
  ChevronRight,
  Activity,
  RefreshCw,
} from "lucide-react";

// Types
import type { ContinueData } from "../../../../apps/website/src/app/lib/supabase-progress";

interface LocalDashboardStats {
  questionsCompleted: number;
  totalPoints: number;
  dayStreak: number;
  longestStreak: number;
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    unlockedAt: string;
  }>;
}

// -----------------------------------------------------------------------------
// Sub-Components (Extracted for Cognitive Complexity Reduction)
// -----------------------------------------------------------------------------

const StatCard = memo(
  ({ title, value, icon: Icon, colorClass, loading }: any) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <div className={`text-2xl font-bold ${colorClass}`}>
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin inline-block" />
            ) : (
              value
            )}
          </div>
          <div className="text-gray-600 dark:text-gray-400">{title}</div>
        </div>
        <Icon
          className={`w-8 h-8 ${colorClass.replace("text-", "text- opacity-80")}`}
        />
      </div>
    </div>
  ),
);
StatCard.displayName = "StatCard";

const ActionCard = memo(({ card }: { card: any }) => (
  <Link
    href={card.href}
    className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:scale-105"
  >
    <div
      className={`w-16 h-16 bg-gradient-to-r ${card.color} rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}
    >
      <card.icon className="w-8 h-8 text-white" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
      {card.title}
    </h3>
    <p className="text-gray-600 dark:text-gray-400 mb-3">{card.description}</p>
    <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-2">
      {card.stats}
    </div>
    {card.progress !== undefined && (
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${card.progress}%` }}
        />
      </div>
    )}
  </Link>
));
ActionCard.displayName = "ActionCard";

const ContinueCard = memo(({ data }: { data: ContinueData["recentPath"] }) => {
  if (!data) return null;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center">
          <Play className="w-6 h-6 mr-2" /> Continue Where You Left Off
        </h2>
        <span className="text-blue-200 text-sm">Recently accessed</span>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold mb-2">{data.pathName}</h3>
          <p className="text-blue-100 mb-3">
            {data.completedSections?.length || 0} sections completed
          </p>
          <div className="flex items-center space-x-4 text-sm text-blue-200">
            <span className="flex items-center">
              <Timer className="w-4 h-4 mr-1" /> {data.timeSpent}m
            </span>
            <span className="flex items-center">
              <Target className="w-4 h-4 mr-1" /> {data.progress}% complete
            </span>
          </div>
        </div>
        <Link
          href={`/learning-paths/${data.pathId}`}
          className="flex items-center space-x-2 px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-colors font-semibold"
        >
          <span>Continue</span> <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="mt-4 w-full bg-blue-500/30 rounded-full h-2">
        <div
          className="bg-white h-2 rounded-full transition-all duration-500"
          style={{ width: `${data.progress}%` }}
        />
      </div>
    </div>
  );
});
ContinueCard.displayName = "ContinueCard";

// -----------------------------------------------------------------------------
// Main Component
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// Hooks (Extracted to reduce Cognitive Complexity)
// -----------------------------------------------------------------------------

function useDashboardData() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [dashboardStats, setDashboardStats] =
    useState<LocalDashboardStats | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Fetch stats helper
  const fetchStats = async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    else setStatsLoading(true);

    try {
      const res = await fetch("/api/dashboard/stats", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
      });
      const json = await res.json();
      if (json.success) setDashboardStats(json.stats);
    } catch (e) {
      console.error("Failed to load dashboard stats", e);
    } finally {
      setIsRefreshing(false);
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetch("/api/plans")
      .then((r) => r.json())
      .then((j) => setPlans(j.plans || []))
      .catch(() => {});
  }, []);

  useLayoutEffect(() => {
    const pendingIntent = localStorage.getItem(
      "pending_browse_practice_questions_intent",
    );
    if (pendingIntent === "true") {
      localStorage.removeItem("pending_browse_practice_questions_intent");
      router.push("/custom-roadmap");
    }
  }, [router]);

  const handleLogout = async () => {
    setIsSigningOut(true);
    try {
      logout();
      if (isSupabaseAvailable() && supabase?.auth)
        await supabase.auth.signOut();
      localStorage.clear();
      router.push("/");
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleRefresh = () => fetchStats(true);

  return {
    user,
    dashboardStats,
    plans,
    statsLoading,
    isRefreshing,
    isSigningOut,
    handleLogout,
    handleRefresh,
  };
}

// -----------------------------------------------------------------------------
// Main Component
// -----------------------------------------------------------------------------

export default function EnhancedDashboard() {
  const {
    user,
    dashboardStats,
    plans,
    statsLoading,
    isRefreshing,
    isSigningOut,
    handleLogout,
    handleRefresh,
  } = useDashboardData();

  const isLoading = false; // Placeholder if needed

  // Data mapping
  const cards = [
    {
      id: "guided",
      title: "Guided Learning",
      description: "Structured plans",
      icon: Target,
      color: "from-indigo-500 to-purple-600",
      href: "/features/guided-learning",
      stats: "1-7 day plans",
    },
    {
      id: "free",
      title: "Free Style",
      description: "Custom roadmap",
      icon: Zap,
      color: "from-emerald-500 to-teal-600",
      href: "/browse-practice-questions",
      stats: "At your own pace",
    },
    {
      id: "flash",
      title: "Flashcards",
      description: "Review saved questions",
      icon: BookOpen,
      color: "from-amber-500 to-rose-600",
      href: "/flashcards",
      stats: "Personalized review",
    },
    {
      id: "analytics",
      title: "Analytics",
      description: "Track progress",
      icon: BarChart3,
      color: "from-orange-500 to-orange-600",
      href: "/progress",
      stats: "Performance data",
    },
  ];

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold dark:text-white mb-2">
              Welcome back, {user?.name || "Developer"}! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Ready to continue your journey?
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <button
              onClick={handleRefresh}
              className="p-2 text-gray-400 hover:text-white"
            >
              <RefreshCw className={isRefreshing ? "animate-spin" : ""} />
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />{" "}
              <span>{isSigningOut ? "signing out..." : "Sign Out"}</span>
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Questions"
            value={dashboardStats?.questionsCompleted || 0}
            icon={BookOpen}
            colorClass="text-blue-600"
            loading={statsLoading}
          />
          <StatCard
            title="Points"
            value={dashboardStats?.totalPoints || 0}
            icon={Star}
            colorClass="text-purple-600"
            loading={statsLoading}
          />
          <StatCard
            title="Streak"
            value={dashboardStats?.dayStreak || 0}
            icon={Flame}
            colorClass="text-green-600"
            loading={statsLoading}
          />
          <StatCard
            title="Medals"
            value={dashboardStats?.achievements?.length || 0}
            icon={Medal}
            colorClass="text-orange-600"
            loading={statsLoading}
          />
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {cards.map((c) => (
            <ActionCard key={c.id} card={c} />
          ))}
        </div>

        {/* Learning Plans */}
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold dark:text-white mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-purple-500" /> Guided
              Learning Plans
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {plans.map((p) => (
                <Link
                  key={p.id}
                  href={`/features/guided-learning/${p.id}`}
                  className="block p-4 rounded-lg border dark:border-gray-700 hover:border-purple-500 transition-colors"
                >
                  <div className="flex justify-between font-semibold dark:text-white">
                    {p.name} <ChevronRight className="w-5 h-5" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold dark:text-white mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-500" /> Recent
              Activities
            </h3>
            <div className="space-y-4">
              {/* Simplified Activity List */}
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Activities are synced with your progress automatically.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
