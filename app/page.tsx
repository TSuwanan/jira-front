"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/layouts/Layout";
import { clearAuth, getToken, getCurrentUser, User } from "@/lib/api";
import {
  Loader2,
  Briefcase,
  Award,
  Mail,
  Fingerprint,
  ShieldCheck,
  ArrowRight
} from "lucide-react";
import positions from "@/constants/position";
import levels from "@/constants/level";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = getToken();
        if (!token) {
          clearAuth();
          router.push("/login");
          return;
        }

        const userData = await getCurrentUser(token);
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setError("Failed to load user information");
        clearAuth();
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const getPositionName = (user: User) => {
    const pos = positions.find(p => String(p.code) === String(user.position_code));
    return pos ? pos.name : (user.position_code || "N/A");
  };

  const getLevelName = (user: User) => {
    const lvl = levels.find(l => String(l.code) === String(user.level_code));
    return lvl ? lvl.name : (user.level_code || "N/A");
  };

  if (loading) {
    return (
      <div className="min-h-screen h-[100vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !user) return null;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-12 px-4 space-y-16 animate-in fade-in duration-700">

        {/* Simple Header */}
        <header className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Welcome</p>
          <h1 className="text-4xl font-light text-gray-900 tracking-tight">
            Hello, <span className="font-medium">{user.full_name.split(' ')[0]}</span>
          </h1>
          <p className="text-gray-500 max-w-sm leading-relaxed text-sm">
            Everything you need to manage your workspace is right here. Simple. Clean. Effective.
          </p>
        </header>

        {/* Minimal Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12 border-t border-gray-100 pt-12">

          <div className="space-y-10">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-300">Profile Details</h2>

            <div className="space-y-8">
              {/* Position */}
              <div className="flex gap-4">
                <Briefcase className="w-5 h-5 text-gray-400 mt-0.5" strokeWidth={1.5} />
                <div>
                  <p className="text-xs text-gray-400 mb-1">Position & Level</p>
                  <p className="text-sm font-medium text-gray-800">
                    {getPositionName(user)} <span className="text-gray-300 mx-2">|</span> {getLevelName(user)}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex gap-4">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" strokeWidth={1.5} />
                <div>
                  <p className="text-xs text-gray-400 mb-1">Email Address</p>
                  <p className="text-sm font-medium text-gray-800">{user.email}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-10">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-300">Account Access</h2>

            <div className="space-y-8">
              {/* Role */}
              <div className="flex gap-4">
                <ShieldCheck className="w-5 h-5 text-gray-400 mt-0.5" strokeWidth={1.5} />
                <div>
                  <p className="text-xs text-gray-400 mb-1">Permissions</p>
                  <p className="text-sm font-medium text-gray-800">
                    {user.role_id === 1 ? "Administrative Access" : "Standard User"}
                  </p>
                </div>
              </div>

              {/* ID */}
              <div className="flex gap-4">
                <Fingerprint className="w-5 h-5 text-gray-400 mt-0.5" strokeWidth={1.5} />
                <div>
                  <p className="text-xs text-gray-400 mb-1">Unique Identifier</p>
                  <p className="text-sm font-mono text-gray-500">{user.user_code}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Minimal Action */}
        {user.role_id !== 1 && (
          <div className="pt-8">
            <button
              onClick={() => router.push('/manage-tasks')}
              className="group flex items-center gap-3 text-sm font-medium text-gray-900 hover:text-gray-500 transition-colors"
            >
              <span>View your tasks</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        )}

      </div>
    </Layout>
  );
}