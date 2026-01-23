"use client";

import Layout from "@/components/layouts/Layout";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { editProject, getProject, clearAuth, getToken, getMembers, User, getUser } from "@/lib/api";

// Define Zod Schema
const projectSchema = z.object({
    name: z.string().min(1, "Project Name is required"),
    description: z.string().optional(),
    member_ids: z.array(z.string()).min(1, "At least one member is required"),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export default function EditProjectPage() {
    const router = useRouter();
    const params = useParams();
    const projectId = params.id as string;

    const [users, setUsers] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingProject, setLoadingProject] = useState(true);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ProjectFormData>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            name: "",
            description: "",
            member_ids: [],
        },
    });

    const selectedMemberIds = watch("member_ids");

    const handleCheckboxChange = (userId: string, checked: boolean) => {
        if (checked) {
            setValue("member_ids", [...selectedMemberIds, userId], { shouldValidate: true });
        } else {
            setValue("member_ids", selectedMemberIds.filter(id => id !== userId), { shouldValidate: true });
        }
    };

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

                // Fetch users and project data in parallel
                const [usersResult, projectData] = await Promise.all([
                    getMembers(token),
                    getProject(token, projectId),
                ]);

                setUsers(usersResult);

                // Set form values from project data
                reset({
                    name: projectData.name || "",
                    description: projectData.description || "",
                    member_ids: projectData.members?.map(m => m.id) || [],
                });
            } catch (err) {
                console.error("Failed to fetch data:", err);
                if (err instanceof Error && err.message === "Unauthorized") {
                    clearAuth();
                    router.push("/login");
                }
            } finally {
                setLoadingUsers(false);
                setLoadingProject(false);
            }
        };
        fetchData();
    }, [router, projectId, reset]);

    const onSubmit = async (data: ProjectFormData) => {
        try {
            const token = getToken();
            if (!token) {
                clearAuth();
                router.push("/login");
                return;
            }
            await editProject(token, projectId, data);
            router.push("/manage-projects");
        } catch (error) {
            if (error instanceof Error && error.message === "Unauthorized") {
                clearAuth();
                router.push("/login");
                return;
            }
            console.error("Failed to edit project:", error);
            alert(error instanceof Error ? error.message : "Failed to edit project");
        }
    };

    if (loadingProject) {
        return (
            <Layout children={
                <div className="space-y-6">
                    <h1 className="text-xl font-bold">Edit Project</h1>
                    <div className="flex items-center justify-center h-64">
                        <p className="text-gray-500">Loading project data...</p>
                    </div>
                </div>
            } />
        );
    }

    return (
        <Layout children={
            <div className="space-y-6">
                <h1 className="text-xl font-bold">Edit Project</h1>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 bg-white shadow-lg px-6 py-12 rounded-xl w-full lg:w-1/2">
                    {/* Project Name */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="name" className="text-xs font-semibold text-gray-900">Project Name <span className="text-red-600">*</span></label>
                        <input
                            type="text"
                            id="name"
                            {...register("name")}
                            placeholder="Enter Project Name"
                            className={`text-xs w-full px-4 py-2 bg-white/5 border rounded-lg placeholder-slate-400 focus:outline-none focus:ring-1 transition-all duration-300 ${errors.name ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500/50' : 'border-gray-300 focus:ring-gray-700/50 focus:border-gray-700/50'}`}
                        />
                        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
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

                    {/* Members */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-gray-900">Project Members <span className="text-red-600">*</span></label>
                        <div className={`border rounded-lg p-3 max-h-48 overflow-y-auto ${errors.member_ids ? 'border-red-500' : 'border-gray-300'}`}>
                            {loadingUsers ? (
                                <p className="text-xs text-gray-500">Loading users...</p>
                            ) : users.length === 0 ? (
                                <p className="text-xs text-gray-500">No users found</p>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {users.map((user) => (
                                        <label key={user.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                            <input
                                                type="checkbox"
                                                checked={selectedMemberIds.includes(user.id)}
                                                onChange={(e) => handleCheckboxChange(user.id, e.target.checked)}
                                                className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-500 cursor-pointer"
                                            />
                                            <span className="text-xs text-gray-700">
                                                {user.full_name} <span className="text-gray-400">({user.user_code})</span>
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                        {errors.member_ids && <p className="text-xs text-red-500">{errors.member_ids.message}</p>}
                        {selectedMemberIds.length > 0 && (
                            <p className="text-xs text-gray-500">{selectedMemberIds.length} member(s) selected</p>
                        )}
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
