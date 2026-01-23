"use client";

import Layout from "@/components/layouts/Layout";
import { Trash, ChevronLeft, ChevronRight, Loader2, Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { getTasks, Task, clearAuth, getToken, getUser } from "@/lib/api";
import { useDebounce } from "@/hooks/useDebounce";
import { formatDate } from "@/lib/format";
import taskStatuses from "@/constants/task-status.js";

const ITEMS_PER_PAGE = 10;

// Helper function to get status name by code
const getStatusName = (code: string | undefined) => {
    if (!code) return "N/A";
    const status = taskStatuses.find(s => s.code === code);
    return status?.name || code;
};

// Helper function to get status style by code
const getStatusStyle = (code: string | undefined) => {
    switch (code) {
        case 'D': // Done
            return 'bg-green-100 text-green-800';
        case 'I': // In Progress
            return 'bg-blue-100 text-blue-800';
        case 'T': // Todo
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

export default function ManageTasksPage() {
    const router = useRouter();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 300);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [userRole, setUserRole] = useState<number | null>(null);
    const prevSearchRef = useRef(debouncedSearch);

    const fetchTasks = async (page: number = 1, search: string = "") => {
        try {
            setLoading(true);
            setError(null);
            const token = getToken();
            if (!token) {
                clearAuth();
                router.push("/login");
                return;
            }
            const result = await getTasks(token, page, ITEMS_PER_PAGE, search);
            setTasks(result.data);
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

    // Fetch tasks when page or search changes
    useEffect(() => {
        // Get user role
        const user = getUser();
        if (user) {
            setUserRole(user.role_id);
        }

        // If search changed, reset to page 1
        if (prevSearchRef.current !== debouncedSearch) {
            prevSearchRef.current = debouncedSearch;
            if (currentPage !== 1) {
                setCurrentPage(1);
                return; // Will fetch when currentPage updates
            }
        }
        fetchTasks(currentPage, debouncedSearch);
    }, [currentPage, debouncedSearch]);

    return (
        <Layout children={
            <div className="space-y-8">
                <h1 className="text-xl font-bold">Manage Tasks</h1>
                <div className="flex flex-col-reverse sm:flex-row items-end justify-between gap-4 w-full">
                    <div className="flex items-center gap-2 w-full">
                        <input
                            type="text"
                            placeholder="Search by Task ID"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`text-xs w-full sm:w-[40%] lg:w-[30%] px-4 py-2 bg-white/5 border rounded-lg placeholder-slate-400 focus:outline-none focus:ring-1 transition-all duration-300 border-gray-300 focus:ring-gray-700/50 focus:border-gray-700/50`}
                        />

                    </div>
                    <div className="flex items-center justify-end gap-2 w-full">
                        {userRole !== 2 && (
                            <button className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-xs font-semibold text-white rounded-lg transition-colors cursor-pointer" onClick={() => router.push("/manage-tasks/add")}>Add Task</button>
                        )}
                    </div>
                </div>
                <div className="px-0 lg:px-4 overflow-x-auto">
                    <div className="">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="border-t border-b border-gray-200 p-3 w-[12%] text-left font-medium text-gray-500">Task ID</th>
                                    <th className="border-t border-b border-gray-200 p-3 w-[20%] text-left font-medium text-gray-500">Task Title</th>
                                    <th className="border-t border-b border-gray-200 p-3 w-[15%] text-left font-medium text-gray-500">Project</th>
                                    <th className="border-t border-b border-gray-200 p-3 w-[12%] text-center font-medium text-gray-500">Status</th>
                                    <th className="border-t border-b border-gray-200 p-3 w-[13%] text-left font-medium text-gray-500">Assignee</th>
                                    <th className="border-t border-b border-gray-200 p-3 w-[13%] text-center font-medium text-gray-500">Created At</th>
                                    <th className="border-t border-b border-gray-200 p-3 w-[10%] text-center font-medium text-gray-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center">
                                            <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                                            <p className="mt-2 text-sm text-gray-500">Loading tasks...</p>
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center">
                                            <p className="text-sm text-red-500">{error}</p>
                                            <button
                                                onClick={() => fetchTasks(currentPage, debouncedSearch)}
                                                className="mt-2 text-sm text-gray-600 hover:text-gray-900 underline"
                                            >
                                                Try again
                                            </button>
                                        </td>
                                    </tr>
                                ) : tasks.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-sm text-gray-500">
                                            No tasks found
                                        </td>
                                    </tr>
                                ) : (
                                    tasks.map((task) => (
                                        <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-3 text-gray-900 font-medium">{task.task_code}</td>
                                            <td className="p-3 text-gray-600">{task.title}</td>
                                            <td className="p-3 text-gray-600">{task.project_name || "N/A"}</td>
                                            <td className="p-3 text-center">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusStyle(task.status)}`}>
                                                    {getStatusName(task.status)}
                                                </span>
                                            </td>
                                            <td className="p-3 text-gray-600">{task.assignee_name || "Unassigned"}</td>
                                            <td className="p-3 text-center">
                                                {formatDate(task.created_at)}
                                            </td>
                                            <td className="p-3 text-center">
                                                <button
                                                    className="text-gray-600 p-2 hover:text-gray-900 transition-colors cursor-pointer"
                                                    onClick={() => router.push(`/manage-tasks/edit/${task.id}`)}
                                                >
                                                    <Edit className="w-4 h-4 mx-auto" strokeWidth="2" />
                                                </button>
                                                {userRole !== 2 && (
                                                    <button className="text-red-600 hover:text-red-800 transition-colors cursor-pointer">
                                                        <Trash className="w-4 h-4 mx-auto" />
                                                    </button>
                                                )}
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
