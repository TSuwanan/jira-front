"use client";

import Layout from "@/components/layouts/Layout";
import { Trash, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { getUsers, User, clearAuth, getToken } from "@/lib/api";
import { useDebounce } from "@/hooks/useDebounce";

const ITEMS_PER_PAGE = 10;

export default function ManageUsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 300);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const prevSearchRef = useRef(debouncedSearch);

    const fetchUsers = async (page: number = 1, search: string = "") => {
        try {
            setLoading(true);
            setError(null);
            const token = getToken();
            if (!token) {
                clearAuth();
                router.push("/login");
                return;
            }
            const result = await getUsers(token, page, ITEMS_PER_PAGE, search);
            setUsers(result.data);
            setCurrentPage(result.page);
            setTotalPages(result.totalPages);
            setTotalItems(result.total);
        } catch (err) {
            if (err instanceof Error && err.message === "Unauthorized") {
                clearAuth();
                router.push("/login");
                return;
            }
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    // Fetch users when page or search changes
    useEffect(() => {
        // If search changed, reset to page 1
        if (prevSearchRef.current !== debouncedSearch) {
            prevSearchRef.current = debouncedSearch;
            if (currentPage !== 1) {
                setCurrentPage(1);
                return; // Will fetch when currentPage updates
            }
        }
        fetchUsers(currentPage, debouncedSearch);
    }, [currentPage, debouncedSearch]);

    return (
        <Layout children={
            <div className="space-y-8">
                <h1 className="text-xl font-bold">Manage Users</h1>
                <div className="flex flex-col-reverse sm:flex-row items-end justify-between gap-4">
                    <input
                        type="text"
                        placeholder="Search by employee ID or employee name"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
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
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center">
                                            <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                                            <p className="mt-2 text-sm text-gray-500">Loading users...</p>
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center">
                                            <p className="text-sm text-red-500">{error}</p>
                                            <button
                                                onClick={() => fetchUsers(currentPage, debouncedSearch)}
                                                className="mt-2 text-sm text-gray-600 hover:text-gray-900 underline"
                                            >
                                                Try again
                                            </button>
                                        </td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-sm text-gray-500">
                                            No users found
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-3 text-gray-900 font-medium">{user.user_code}</td>
                                            <td className="p-3 text-gray-600">{user.full_name}</td>
                                            <td className="p-3 text-gray-600">{user.email}</td>
                                            <td className="p-3 text-center">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role_id === 1
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {user.role_id === 1 ? 'Admin' : 'User'}
                                                </span>
                                            </td>
                                            <td className="p-3 text-center">
                                                <button
                                                    className={`transition-colors ${user.role_id === 1
                                                        ? 'text-gray-300 cursor-not-allowed'
                                                        : 'text-red-600 hover:text-red-800 cursor-pointer'}`}
                                                    disabled={user.role_id === 1}
                                                >
                                                    <Trash className="w-4 h-4 mx-auto" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-0 lg:px-4 pb-8">
                    <div className="text-sm text-gray-500">
                        Showing <span className="font-medium text-gray-900">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> to <span className="font-medium text-gray-900">{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}</span> of <span className="font-medium text-gray-900">{totalItems}</span> entries
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors cursor-pointer"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                        >
                            <ChevronLeft className="w-4 h-4 text-gray-600" />
                        </button>
                        <div className="flex items-center space-x-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(page => {
                                    if (totalPages <= 5) return true;
                                    if (page === 1 || page === totalPages) return true;
                                    if (Math.abs(page - currentPage) <= 1) return true;
                                    return false;
                                })
                                .map((page, index, arr) => (
                                    <span key={page} className="flex items-center">
                                        {index > 0 && arr[index - 1] !== page - 1 && (
                                            <span className="px-2 text-gray-400">...</span>
                                        )}
                                        <button
                                            onClick={() => setCurrentPage(page)}
                                            className={`px-3 py-1.5 text-sm font-medium rounded-lg cursor-pointer ${currentPage === page
                                                    ? 'bg-gray-900 text-white'
                                                    : 'text-gray-600 hover:bg-gray-100 transition-colors'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    </span>
                                ))
                            }
                        </div>
                        <button
                            className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors cursor-pointer"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                        >
                            <ChevronRight className="w-4 h-4 text-gray-600" />
                        </button>
                    </div>
                </div>
            </div>
        } />
    );
}