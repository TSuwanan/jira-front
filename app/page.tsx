"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/layouts/Layout";

interface User {
  id: string;
  user_code: string;
  email: string;
  full_name: string;
  role_id: number;
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // เช็ค token
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    setUser(JSON.parse(userData));
    setLoading(false);
  }, [router]);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-8">
        <h1 className="text-xl font-bold">Dashboard</h1>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">
            Welcome, {user.full_name}!
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">User Code</p>
                <p className="text-lg font-semibold">{user.user_code}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-lg font-semibold">{user.email}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Role</p>
                <p className="text-lg font-semibold">
                  {user.role_id === 1 ? "Admin" : "User"}
                </p>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => router.push("/manage-projects")}
                  className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  <p className="font-semibold text-blue-900">Projects</p>
                  <p className="text-sm text-blue-600">Manage projects</p>
                </button>

                <button
                  onClick={() => router.push("/manage-tasks")}
                  className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors cursor-pointer"
                >
                  <p className="font-semibold text-green-900">Tasks</p>
                  <p className="text-sm text-green-600">View all tasks</p>
                </button>

                <button
                  onClick={() => router.push("/manage-users")}
                  className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer"
                >
                  <p className="font-semibold text-purple-900">Team</p>
                  <p className="text-sm text-purple-600">Team members</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}