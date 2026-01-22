"use client";

import Layout from "@/components/layouts/Layout";
import { Trash, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ManageUsersPage() {
    const router = useRouter();
    return (
        <Layout children={
            <div className="space-y-8">
                <h1 className="text-xl font-bold">Manage Users</h1>
                <div className="flex flex-col-reverse sm:flex-row items-end justify-between gap-4">
                    <input type="text" placeholder="Search by employee ID or employee name"
                        className={`text-xs w-full sm:w-[30%] px-4 py-2 bg-white/5 border rounded-lg placeholder-slate-400 focus:outline-none focus:ring-1 transition-all duration-300 border-gray-300 focus:ring-gray-700/50 focus:border-gray-700/50`}
                    />
                    <button className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-xs font-semibold text-white rounded-lg transition-colors cursor-pointer" onClick={() => router.push("/manage-users/add")}>Add User</button>
                </div>
                <div className="px-0 lg:px-4 overflow-x-auto">
                    <div className="">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="border-t border-b border-gray-200 p-3 w-[15%] text-left font-medium text-gray-500">Employee ID</th>
                                    <th className="border-t border-b border-gray-200 p-3 w-[30%] text-left font-medium text-gray-500">Employee Name</th>
                                    <th className="border-t border-b border-gray-200 p-3 w-[30%] text-left font-medium text-gray-500">Email</th>
                                    <th className="border-t border-b border-gray-200 p-3 w-[10%] text-center font-medium text-gray-500">Role</th>
                                    <th className="border-t border-b border-gray-200 p-3 w-[15%] text-center font-medium text-gray-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {/* Dummy data for visualization */}
                                {[...Array(4)].map((_, i) => (
                                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-3 text-gray-900 font-medium">EMP002{4 + i}</td>
                                        <td className="p-3 text-gray-600">User Name {i + 1}</td>
                                        <td className="p-3 text-gray-600">user{i + 1}@example.com</td>
                                        <td className="p-3 text-center"><span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">User</span></td>
                                        <td className="p-3 text-center">
                                            <button className="text-red-600 hover:text-red-600 transition-colors cursor-pointer" ><Trash className="w-4 h-4 mx-auto" /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-0 lg:px-4 pb-8">
                    <div className="text-sm text-gray-500">
                        Showing <span className="font-medium text-gray-900">1</span> to <span className="font-medium text-gray-900">5</span> of <span className="font-medium text-gray-900">12</span> entries
                    </div>
                    <div className="flex items-center space-x-2">
                        <button className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors cursor-pointer" disabled>
                            <ChevronLeft className="w-4 h-4 text-gray-600" />
                        </button>
                        <div className="flex items-center space-x-1">
                            <button className="px-3 py-1.5 text-sm font-medium rounded-lg bg-gray-900 text-white cursor-pointer">1</button>
                            <button className="px-3 py-1.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">2</button>
                            <button className="px-3 py-1.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">3</button>
                            <span className="px-2 text-gray-400">...</span>
                            <button className="px-3 py-1.5 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">10</button>
                        </div>
                        <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                            <ChevronRight className="w-4 h-4 text-gray-600" />
                        </button>
                    </div>
                </div>
            </div>
        } />
    );
}