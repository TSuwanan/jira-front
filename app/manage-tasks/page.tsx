"use client";

import Layout from "@/components/layouts/Layout";
import { Trash, ChevronLeft, ChevronRight, Loader2, Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { getTasks, Task, clearAuth, getToken, getUser, updateTaskStatus, deleteTask } from "@/lib/api";
import { useDebounce } from "@/hooks/useDebounce";
import { formatDate } from "@/lib/format";
import taskStatuses from "@/constants/task-status.js";
import taskPriorities from "@/constants/task-priority.js";

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

// Helper function to get priority name by code
const getPriorityName = (code: string | undefined) => {
    if (!code) return "N/A";
    const priority = taskPriorities.find(p => p.code === code);
    return priority?.name || code;
};

// Helper function to get priority style by code
const getPriorityStyle = (code: string | undefined) => {
    switch (code) {
        case 'H': // High
            return 'text-red-600 bg-red-50 border border-red-100';
        case 'M': // Medium
            return 'text-orange-600 bg-orange-50 border border-orange-100';
        case 'L': // Low
        default:
            return 'text-blue-600 bg-blue-50 border border-blue-100';
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
    const [statusFilter, setStatusFilter] = useState("");
    const prevSearchRef = useRef(debouncedSearch);

    const fetchTasks = async (page: number = 1, search: string = "", status: string = "") => {
        try {
            setLoading(true);
            setError(null);
            const token = getToken();
            if (!token) {
                clearAuth();
                router.push("/login");
                return;
            }
            const result = await getTasks(token, page, ITEMS_PER_PAGE, search, status);
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

    const handleSubmitTask = async (taskId: string) => {
        try {
            const token = getToken();
            if (!token) return;

            await updateTaskStatus(token, taskId, "D"); // Set to Done
            // Refresh tasks
            fetchTasks(currentPage, debouncedSearch, statusFilter);
        } catch (err) {
            console.error("Failed to submit task:", err);
            alert("Failed to submit task");
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!confirm("Are you sure you want to delete this task?")) return;

        try {
            const token = getToken();
            if (!token) return;

            await deleteTask(token, taskId);
            // Refresh tasks
            fetchTasks(currentPage, debouncedSearch, statusFilter);
        } catch (err) {
            console.error("Failed to delete task:", err);
            alert("Failed to delete task");
        }
    };

    // Set user role on mount
    useEffect(() => {
        const user = getUser();
        if (user) {
            setUserRole(user.role_id);
        }
    }, []);

    // Fetch tasks when page, search, or status changes
    useEffect(() => {
        // If search or status changed, reset to page 1
        if (prevSearchRef.current !== debouncedSearch) {
            prevSearchRef.current = debouncedSearch;
            if (currentPage !== 1) {
                setCurrentPage(1);
                return; // Will fetch when currentPage updates
            }
        }
        fetchTasks(currentPage, debouncedSearch, statusFilter);
    }, [currentPage, debouncedSearch, statusFilter]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
        );
    }

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
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="text-xs px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-700/50 focus:border-gray-700/50"
                        >
                            <option value="">All Statuses</option>
                            {taskStatuses.map(status => (
                                <option key={status.id} value={status.code}>{status.name}</option>
                            ))}
                        </select>

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
                                    <th className="border-t border-b border-gray-200 p-3 w-[10%] text-left font-medium text-gray-500">Task ID</th>
                                    <th className="border-t border-b border-gray-200 p-3 w-[20%] text-left font-medium text-gray-500">Task Title</th>
                                    <th className="border-t border-b border-gray-200 p-3 w-[15%] text-left font-medium text-gray-500">Project</th>
                                    <th className="border-t border-b border-gray-200 p-3 w-[10%] text-center font-medium text-gray-500">Priority</th>
                                    <th className="border-t border-b border-gray-200 p-3 w-[10%] text-center font-medium text-gray-500">Status</th>
                                    <th className="border-t border-b border-gray-200 p-3 w-[13%] text-left font-medium text-gray-500">Assignee</th>
                                    <th className="border-t border-b border-gray-200 p-3 w-[13%] text-center font-medium text-gray-500">Created At</th>
                                    <th className="border-t border-b border-gray-200 p-3 w-[15%] text-center font-medium text-gray-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {error ? (
                                    <tr>
                                        <td colSpan={8} className="p-8 text-center">
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
                                        <td colSpan={8} className="p-8 text-center text-sm text-gray-500">
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
                                                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${getPriorityStyle(task.priority)}`}>
                                                    {getPriorityName(task.priority)}
                                                </span>
                                            </td>
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
                                                {task.status === 'D' ? (
                                                    <button
                                                        onClick={() => router.push(`/manage-tasks/complete/${task.id}`)}
                                                        className="px-3 py-1 border border-gray-900 text-gray-900 hover:bg-gray-50 text-[10px] font-bold rounded-full transition-colors cursor-pointer"
                                                    >
                                                        View
                                                    </button>
                                                ) : userRole === 2 ? (
                                                    <button
                                                        onClick={() => router.push(`/manage-tasks/complete/${task.id}`)}
                                                        className="px-3 py-1 bg-gray-900 hover:bg-gray-800 text-[10px] font-bold text-white rounded-full transition-colors cursor-pointer"
                                                    >
                                                        Complete
                                                    </button>
                                                ) : (
                                                    (() => {
                                                        const isDisabled = task.status === 'I';
                                                        return (
                                                            <div className="flex justify-center gap-1">
                                                                <button
                                                                    disabled={isDisabled}
                                                                    className={`p-2 transition-colors ${isDisabled ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:text-gray-900 cursor-pointer'}`}
                                                                    onClick={() => !isDisabled && router.push(`/manage-tasks/edit/${task.id}`)}
                                                                    title={isDisabled ? "Cannot edit task in progress" : "Edit task"}
                                                                >
                                                                    <Edit className="w-4 h-4 mx-auto" strokeWidth="2" />
                                                                </button>
                                                                <button
                                                                    disabled={isDisabled}
                                                                    className={`p-2 transition-colors ${isDisabled ? 'text-gray-300 cursor-not-allowed' : 'text-red-600 hover:text-red-800 cursor-pointer'}`}
                                                                    title={isDisabled ? "Cannot delete task in progress" : "Delete task"}
                                                                    onClick={() => !isDisabled && handleDeleteTask(task.id)}
                                                                >
                                                                    <Trash className="w-4 h-4 mx-auto" />
                                                                </button>
                                                            </div>
                                                        );
                                                    })()
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
