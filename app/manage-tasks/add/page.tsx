"use client";

import Layout from "@/components/layouts/Layout";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { addTask, clearAuth, getToken, getProjectMembers, getProjects, User, Project, getUser } from "@/lib/api";
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

export default function AddTaskPage() {
    const router = useRouter();
    const [members, setMembers] = useState<User[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [loadingProjects, setLoadingProjects] = useState(true);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
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

    // Fetch projects on mount
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const token = getToken();
                const user = getUser();

                if (!token || !user || user.role_id !== 1) {
                    if (!token) clearAuth();
                    router.push(token ? "/" : "/login");
                    return;
                }

                const projectsResult = await getProjects(token, 1, 100);
                setProjects(projectsResult.data);
            } catch (err) {
                console.error("Failed to fetch projects:", err);
            } finally {
                setLoadingProjects(false);
            }
        };
        fetchProjects();
    }, [router]);

    // Fetch members when project is selected
    useEffect(() => {
        const fetchMembers = async () => {
            if (!selectedProjectId) {
                setMembers([]);
                return;
            }

            try {
                setLoadingMembers(true);
                const token = getToken();
                if (!token) {
                    clearAuth();
                    router.push("/login");
                    return;
                }

                const membersResult = await getProjectMembers(token, selectedProjectId);
                setMembers(membersResult);
                // Reset assignee when project changes
                setValue("assignee_id", "");
            } catch (err) {
                console.error("Failed to fetch project members:", err);
                setMembers([]);
            } finally {
                setLoadingMembers(false);
            }
        };
        fetchMembers();
    }, [selectedProjectId, router, setValue]);

    const onSubmit = async (data: TaskFormData) => {
        try {
            const token = getToken();
            if (!token) {
                clearAuth();
                router.push("/login");
                return;
            }
            // Auto-calculate status based on assignee
            const taskData = {
                ...data,
                status: data.assignee_id ? "I" : "T"
            };
            await addTask(token, taskData);
            router.push("/manage-tasks");
        } catch (error) {
            if (error instanceof Error && error.message === "Unauthorized") {
                clearAuth();
                router.push("/login");
                return;
            }
            console.error("Failed to add task:", error);
            alert(error instanceof Error ? error.message : "Failed to create task");
        }
    };

    return (
        <Layout children={
            <div className="space-y-6">
                <h1 className="text-xl font-bold">Add Task</h1>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 bg-white shadow-lg px-6 py-12 rounded-xl w-full lg:w-1/2">

                    {/* Project */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="project_id" className="text-xs font-semibold text-gray-900">Project <span className="text-red-600">*</span></label>
                        <select
                            id="project_id"
                            {...register("project_id")}
                            disabled={loadingProjects}
                            className={`text-xs w-full px-4 py-2 bg-white/5 border rounded-lg placeholder-slate-400 focus:outline-none focus:ring-1 transition-all duration-300 ${errors.project_id ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500/50' : 'border-gray-300 focus:ring-gray-700/50 focus:border-gray-700/50'} disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            <option value="">
                                {loadingProjects ? "Loading projects..." : "Select Project"}
                            </option>
                            {projects.map((project) => (
                                <option key={project.id} value={project.id}>
                                    {project.name} ({project.project_code})
                                </option>
                            ))}
                        </select>
                        {errors.project_id && <p className="text-xs text-red-500">{errors.project_id.message}</p>}
                    </div>
                    {/* Title */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="title" className="text-xs font-semibold text-gray-900">Title <span className="text-red-600">*</span></label>
                        <input
                            type="text"
                            id="title"
                            {...register("title")}
                            placeholder="Enter Task Title"
                            className={`text-xs w-full px-4 py-2 bg-white/5 border rounded-lg placeholder-slate-400 focus:outline-none focus:ring-1 transition-all duration-300 ${errors.title ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500/50' : 'border-gray-300 focus:ring-gray-700/50 focus:border-gray-700/50'}`}
                        />
                        {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="description" className="text-xs font-semibold text-gray-900">Description</label>
                        <textarea
                            id="description"
                            {...register("description")}
                            placeholder="Enter Description"
                            rows={4}
                            className={`text-xs w-full px-4 py-2 bg-white/5 border rounded-lg placeholder-slate-400 focus:outline-none focus:ring-1 transition-all duration-300 ${errors.description ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500/50' : 'border-gray-300 focus:ring-gray-700/50 focus:border-gray-700/50'}`}
                        />
                        {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
                    </div>

                    {/* Status & Priority Row */}
                    <div className="grid grid-cols-1 gap-4">
                        {/* Priority */}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="priority" className="text-xs font-semibold text-gray-900">Priority <span className="text-red-600">*</span></label>
                            <select
                                id="priority"
                                {...register("priority")}
                                className={`text-xs w-full px-4 py-2 bg-white/5 border rounded-lg placeholder-slate-400 focus:outline-none focus:ring-1 transition-all duration-300 ${errors.priority ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500/50' : 'border-gray-300 focus:ring-gray-700/50 focus:border-gray-700/50'}`}
                            >
                                <option value="">Select Priority</option>
                                {taskPriorities.map((priority: { id: string; code: string; name: string }) => (
                                    <option key={priority.id} value={priority.code}>{priority.name}</option>
                                ))}
                            </select>
                            {errors.priority && <p className="text-xs text-red-500">{errors.priority.message}</p>}
                        </div>
                    </div>



                    {/* Assignee */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="assignee_id" className="text-xs font-semibold text-gray-900">Assignee</label>
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
                        {errors.assignee_id && <p className="text-xs text-red-500">{errors.assignee_id.message}</p>}
                    </div>


                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-4 py-2 border border-gray-900 hover:bg-gray-800 hover:text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
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
            </div>} />
    );
}
