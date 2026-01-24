"use client";

import Layout from "@/components/layouts/Layout";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { getTask, updateTaskStatus, clearAuth, getToken, Task, getUser } from "@/lib/api";
import { Loader2, CheckCircle2, ChevronLeft, Calendar, User, Briefcase, Tag } from "lucide-react";
import { formatDate } from "@/lib/format";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const submissionSchema = z.object({
    comment: z.string().min(1, "Submission Comment is required"),
});

type SubmissionFormData = z.infer<typeof submissionSchema>;

export default function CompleteTaskPage() {
    const router = useRouter();
    const params = useParams();
    const taskId = params.id as string;

    const [task, setTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SubmissionFormData>({
        resolver: zodResolver(submissionSchema),
        defaultValues: {
            comment: "",
        },
    });

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

    const onSubmit = async (data: SubmissionFormData) => {
        try {
            const token = getToken();
            if (!token) {
                alert("No token found");
                return;
            }

            await updateTaskStatus(token, taskId, "D", data.comment);
            router.push("/manage-tasks");
        } catch (err) {
            console.error("Failed to complete task:", err);
            alert(err instanceof Error ? err.message : "Failed to confirm task completion");
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
            <div className="w-full lg:w-2xl px-4 pb-14 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header */}
                <header className="space-y-8 border-b border-gray-100 pb-4">
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
                    <h1 className="text-2xl font-light text-gray-900 tracking-tight leading-tight">
                        {task.status === 'D' ? 'Task' : 'Complete'} <span className="font-medium">Deliverables</span>
                    </h1>
                    <p className="text-gray-500 max-w-lg leading-relaxed text-sm">
                        {task.status === 'D'
                            ? "This task has been successfully completed and finalized. You can review the details below."
                            : "You are about to finalize this task. Please review the details below before confirming delivery."}
                    </p>
                </header>

                {/* Details Card */}
                <div className="bg-white border border-gray-100 rounded-3xl p-8 md:p-10 space-y-12 shadow-sm">
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
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 ">
                    {task.status !== 'D' ? (
                        <>
                            <div className="w-full space-y-4">
                                <label className="text-[10px] font-bold uppercase tracking-widest">Submission Comment <span className="text-red-600">*</span></label>
                                <textarea
                                    {...register("comment")}
                                    placeholder="Add a comment about your work..."
                                    rows={4}
                                    className={`text-xs w-full px-4 py-2 bg-white/5 border rounded-xl placeholder-slate-400 focus:outline-none focus:ring-1 transition-all duration-300 ${errors.comment ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500/50' : 'border-gray-300 focus:ring-gray-700/50 focus:border-gray-700/50'}`}
                                />
                                {errors.comment && <p className="text-[10px] text-red-500 font-medium tracking-wider uppercase">{errors.comment.message}</p>}
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => router.back()}
                                    className="px-4 py-2 border border-gray-900 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-xs font-semibold text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? "Saving..." : "Save"}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="w-full space-y-4">
                            <label className="text-[10px] font-bold uppercase tracking-widest">Comment</label>
                            <div>
                                <p className="text-xs w-full px-4 py-8 bg-gray-50 border border-gray-50 rounded-xl placeholder-slate-400 focus:outline-none transition-all duration-300">{task.comments?.content}</p>
                            </div>
                            <div className="flex flex-col gap-0">
                                <div>
                                    <span className="text-[10px] text-gray-500 font-medium tracking-wider uppercase"> Commented by: </span>
                                    <span className="text-[10px] text-gray-500 font-medium tracking-wider uppercase">{task.comments?.user_name}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-500 font-medium tracking-wider uppercase"> Commented on: </span>
                                    <span className="text-[10px] text-gray-500 font-medium tracking-wider uppercase">{formatDate(task.comments?.created_at)}</span>
                                </div>
                            </div>


                        </div>
                    )}
                </form>
            </div>
        </Layout>
    );
}
