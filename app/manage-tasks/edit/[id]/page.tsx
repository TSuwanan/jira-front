"use client";

import Layout from "@/components/layouts/Layout";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { editTask, getTask, clearAuth, getToken, getProjectMembers, getProjects, User, Project, getUser } from "@/lib/api";
import taskPriorities from "@/constants/task-priority.js";

// Define Zod Schema
const taskSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    status: z.string().min(1, "Status is required"),
    priority: z.string().min(1, "Priority is required"),
    project_id: z.string().min(1, "Project is required"),
    assignee_id: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

export default function EditTaskPage() {
    const router = useRouter();
    const params = useParams();
    const taskId = params.id as string;

    const [members, setMembers] = useState<User[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [loadingPage, setLoadingPage] = useState(true);
    const isFirstLoad = useRef(true);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<TaskFormData>({
        resolver: zodResolver(taskSchema),
        defaultValues: {
            title: "",
            description: "",
            status: "T",
            priority: "",
            project_id: "",
            assignee_id: "",
        },
    });

    const selectedProjectId = watch("project_id");

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = getToken();
                const user = getUser();

                if (!token || !user || user.role_id !== 1) {
                    if (!token) clearAuth();
                    router.push(token ? "/" : "/login");
                    return;
                }

                // Fetch task and projects in parallel
                const [taskData, projectsResult] = await Promise.all([
                    getTask(token, taskId),
                    getProjects(token, 1, 100),
                ]);

                setProjects(projectsResult.data);

                // Fetch members for the task's project
                if (taskData.project_id) {
                    const membersResult = await getProjectMembers(token, taskData.project_id);
                    setMembers(membersResult);
                }

                // Populate form
                reset({
                    title: taskData.title || "",
                    description: taskData.description || "",
                    status: taskData.status || "T",
                    priority: taskData.priority || "",
                    project_id: taskData.project_id ? taskData.project_id.toString() : "",
                    assignee_id: taskData.assignee_id ? taskData.assignee_id.toString() : "",
                });

            } catch (err) {
                console.error("Failed to fetch data:", err);
            } finally {
                setLoadingPage(false);
            }
        };
        fetchData();
    }, [router, taskId, reset]);

    // Update members when project selection changes manually
    useEffect(() => {
        if (loadingPage) return;

        // Skip the first run because it's handled by fetchData
        if (isFirstLoad.current) {
            isFirstLoad.current = false;
            return;
        }

        const fetchMembers = async () => {
            if (!selectedProjectId) {
                setMembers([]);
                setValue("assignee_id", "");
                return;
            }

            try {
                setLoadingMembers(true);
                const token = getToken();
                if (!token) return;

                const membersResult = await getProjectMembers(token, selectedProjectId);
                setMembers(membersResult);

                // Reset assignee as the project has changed
                setValue("assignee_id", "");
            } catch (err) {
                console.error("Failed to fetch project members:", err);
                setMembers([]);
            } finally {
                setLoadingMembers(false);
            }
        };
        fetchMembers();
    }, [selectedProjectId, loadingPage, setValue]);

    const onSubmit = async (data: TaskFormData) => {
        try {
            const token = getToken();
            if (!token) {
                clearAuth();
                router.push("/login");
                return;
            }

            const payload: any = { ...data };
            if (!payload.assignee_id) {
                delete payload.assignee_id;
            }

            await editTask(token, taskId, payload);
            router.push("/manage-tasks");
        } catch (error) {
            console.error("Failed to edit task:", error);
            alert(error instanceof Error ? error.message : "Failed to edit task");
        }
    };

    if (loadingPage) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <Layout children={
            <div className="space-y-6">
                <h1 className="text-xl font-bold">Edit Task</h1>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 bg-white shadow-lg px-6 py-12 rounded-xl w-full lg:w-1/2">

                    {/* Project */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="project_id" className="text-[10px] font-bold uppercase tracking-widest">Project <span className="text-red-600">*</span></label>
                        <select
                            id="project_id"
                            {...register("project_id")}
                            className={`text-xs w-full px-4 py-2 bg-white/5 border rounded-lg placeholder-slate-400 focus:outline-none focus:ring-1 transition-all duration-300 ${errors.project_id ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500/50' : 'border-gray-300 focus:ring-gray-700/50 focus:border-gray-700/50'}`}
                        >
                            <option value="">Select Project</option>
                            {projects.map((project) => (
                                <option key={project.id} value={project.id}>
                                    {project.name} ({project.project_code})
                                </option>
                            ))}
                        </select>
                        {errors.project_id && <p className="text-[10px] text-red-500 font-medium tracking-wider uppercase">{errors.project_id.message}</p>}
                    </div>

                    {/* Title */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="title" className="text-[10px] font-bold uppercase tracking-widest">Title <span className="text-red-600">*</span></label>
                        <input
                            type="text"
                            id="title"
                            {...register("title")}
                            placeholder="Enter Task Title"
                            className={`text-xs w-full px-4 py-2 bg-white/5 border rounded-lg placeholder-slate-400 focus:outline-none focus:ring-1 transition-all duration-300 ${errors.title ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500/50' : 'border-gray-300 focus:ring-gray-700/50 focus:border-gray-700/50'}`}
                        />
                        {errors.title && <p className="text-[10px] text-red-500 font-medium tracking-wider uppercase">{errors.title.message}</p>}
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="description" className="text-[10px] font-bold uppercase tracking-widest">Description</label>
                        <textarea
                            id="description"
                            {...register("description")}
                            placeholder="Enter Description"
                            rows={4}
                            className={`text-xs w-full px-4 py-2 bg-white/5 border rounded-lg placeholder-slate-400 focus:outline-none focus:ring-1 transition-all duration-300 ${errors.description ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500/50' : 'border-gray-300 focus:ring-gray-700/50 focus:border-gray-700/50'}`}
                        />
                        {errors.description && <p className="text-[10px] text-red-500 font-medium tracking-wider uppercase">{errors.description.message}</p>}
                    </div>

                    {/* Status & Priority */}
                    <div className="grid grid-cols-1 gap-4">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="priority" className="text-[10px] font-bold uppercase tracking-widest">Priority <span className="text-red-600">*</span></label>
                            <select
                                id="priority"
                                {...register("priority")}
                                className={`text-xs w-full px-4 py-2 bg-white/5 border rounded-lg placeholder-slate-400 focus:outline-none focus:ring-1 transition-all duration-300 ${errors.priority ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500/50' : 'border-gray-300 focus:ring-gray-700/50 focus:border-gray-700/50'}`}
                            >
                                <option value="">Select Priority</option>
                                {taskPriorities.map((priority: any) => (
                                    <option key={priority.id} value={priority.code}>{priority.name}</option>
                                ))}
                            </select>
                            {errors.priority && <p className="text-[10px] text-red-500 font-medium tracking-wider uppercase">{errors.priority.message}</p>}
                        </div>
                    </div>

                    {/* Assignee */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="assignee_id" className="text-[10px] font-bold uppercase tracking-widest">Assignee</label>
                        <select
                            id="assignee_id"
                            {...register("assignee_id")}
                            disabled={!selectedProjectId || loadingMembers}
                            className={`text-xs w-full px-4 py-2 bg-white/5 border rounded-lg placeholder-slate-400 focus:outline-none focus:ring-1 transition-all duration-300 ${errors.assignee_id ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500/50' : 'border-gray-300 focus:ring-gray-700/50 focus:border-gray-700/50'} disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            <option value="">
                                {!selectedProjectId
                                    ? "Select a project first"
                                    : loadingMembers
                                        ? "Loading members..."
                                        : members.length === 0
                                            ? "No members in this project"
                                            : "Select Assignee"}
                            </option>
                            {members.map((member) => (
                                <option key={member.id} value={member.id}>
                                    {member.full_name} ({member.user_code})
                                </option>
                            ))}
                        </select>
                        {errors.assignee_id && <p className="text-[10px] text-red-500 font-medium tracking-wider uppercase">{errors.assignee_id.message}</p>}
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
                </form>
            </div>
        } />
    );
}
