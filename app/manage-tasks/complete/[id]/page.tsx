"use client";

import Layout from "@/components/layouts/Layout";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { getTask, updateTaskStatus, clearAuth, getToken, Task, getUser } from "@/lib/api";
import { Loader2, CheckCircle2, ChevronLeft, Calendar, User, Briefcase, Tag } from "lucide-react";
import { formatDate } from "@/lib/format";

export default function CompleteTaskPage() {
    const router = useRouter();
    const params = useParams();
    const taskId = params.id as string;

    const [task, setTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchTaskData = async () => {
            try {
                const token = getToken();
                const user = getUser();
                if (!token || !user) {
                    clearAuth();
                    router.push("/login");
                    return;
                }

                const data = await getTask(token, taskId);
                setTask(data);
            } catch (err) {
                console.error("Failed to fetch task:", err);
                setError("Task not found or unauthorized");
            } finally {
                setLoading(false);
            }
        };
        fetchTaskData();
    }, [taskId, router]);

    const handleConfirmComplete = async () => {
        try {
            setIsSubmitting(true);
            const token = getToken();
            if (!token) return;

            await updateTaskStatus(token, taskId, "D"); // Set to Done
            router.push("/manage-tasks");
        } catch (err) {
            console.error("Failed to complete task:", err);
            alert("Failed to confirm task completion");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen h-[100vh] flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
        );
    }

    if (error || !task) {
        return (
            <Layout>
                <div className="max-w-xl mx-auto py-20 text-center space-y-4">
                    <p className="text-red-500">{error || "Something went wrong"}</p>
                    <button
                        onClick={() => router.back()}
                        className="text-sm font-medium text-gray-900 underline"
                    >
                        Go Back
                    </button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-2xl mx-auto py-12 px-4 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* Back Link */}
                <button
                    onClick={() => router.back()}
                    className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Back to Tasks
                </button>

                {/* Header */}
                <header className="space-y-4 border-b border-gray-100 pb-12">
                    <div className="flex items-center justify-between">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider">
                            <Tag className="w-3 h-3" />
                            {task.task_code}
                        </div>
                        {task.status === 'D' && (
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-wider">
                                <CheckCircle2 className="w-3 h-3" />
                                Completed
                            </div>
                        )}
                    </div>
                    <h1 className="text-4xl font-light text-gray-900 tracking-tight leading-tight">
                        {task.status === 'D' ? 'Task' : 'Complete'} <span className="font-medium">Deliverables</span>
                    </h1>
                    <p className="text-gray-500 max-w-lg leading-relaxed text-sm">
                        {task.status === 'D'
                            ? "This task has been successfully completed and finalized. You can review the details below."
                            : "You are about to finalize this task. Please review the details below before confirming delivery."}
                    </p>
                </header>

                {/* Details Card */}
                <div className="bg-white border border-gray-100 rounded-3xl p-8 md:p-10 space-y-10 shadow-sm">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Task Title</label>
                        <h2 className="text-xl font-medium text-gray-900">{task.title}</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Project */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-gray-400">
                                <Briefcase className="w-4 h-4" strokeWidth={1.5} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Project</span>
                            </div>
                            <p className="text-sm font-medium text-gray-700">{task.project_name || "N/A"}</p>
                        </div>

                        {/* Date */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-gray-400">
                                <Calendar className="w-4 h-4" strokeWidth={1.5} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Assigned On</span>
                            </div>
                            <p className="text-sm font-medium text-gray-700">{formatDate(task.created_at)}</p>
                        </div>
                    </div>

                    {/* Description */}
                    {task.description && (
                        <div className="space-y-4 pt-4 border-t border-gray-50">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Notes / Requirements</span>
                            <p className="text-sm text-gray-500 leading-relaxed italic">
                                "{task.description}"
                            </p>
                        </div>
                    )}
                </div>

                {/* Action Section */}
                <div className="flex flex-col items-center gap-6 pt-8">
                    {task.status !== 'D' ? (
                        <>
                            <button
                                onClick={handleConfirmComplete}
                                disabled={isSubmitting}
                                className="group relative inline-flex items-center justify-center gap-3 px-12 py-4 bg-gray-900 text-white rounded-full font-medium text-sm hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-gray-200"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <CheckCircle2 className="w-5 h-5" />
                                )}
                                <span>Finalize Delivery</span>
                            </button>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                                Confirming will notify the manager and lock the task status.
                            </p>
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-2">
                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                            </div>
                            <p className="text-sm font-medium text-gray-900 uppercase tracking-widest">Submission Confirmed</p>
                            <p className="text-xs text-gray-400">This record is for viewing purposes only.</p>
                        </div>
                    )}
                </div>

            </div>
        </Layout>
    );
}
