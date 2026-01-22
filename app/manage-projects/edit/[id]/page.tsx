"use client";

import Layout from "@/components/layouts/Layout";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { z } from "zod";

// Define Zod Schema
const projectSchema = z.object({
    project_name: z.string().min(1, "Project Name is required"),
});

type ProjectFormErrors = {
    [key: string]: string | undefined;
};

export default function EditProjectPage() {
    const router = useRouter();
    const params = useParams();
    const projectId = params.id;

    const [formData, setFormData] = useState({
        project_name: "",
        description: "",
    });
    const [errors, setErrors] = useState<ProjectFormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Load project data
    useEffect(() => {
        const loadProjectData = async () => {
            try {
                // Simulate API call to fetch project data
                await new Promise((resolve) => setTimeout(resolve, 500));

                // Mock data - replace with actual API call
                const mockProject = {
                    project_name: `Project ${projectId}`,
                    description: `Description for project ${projectId}`,
                };

                setFormData(mockProject);
            } catch (error) {
                console.error("Failed to load project data", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadProjectData();
    }, [projectId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setErrors({});

        // Validate
        const result = projectSchema.safeParse(formData);

        if (!result.success) {
            const newErrors: ProjectFormErrors = {};
            result.error.issues.forEach((issue) => {
                const path = issue.path[0] as string;
                newErrors[path] = issue.message;
            });
            setErrors(newErrors);
            setIsSubmitting(false);
            return;
        }

        try {
            // Simulate API Call
            console.log("Updating Project ID:", projectId);
            console.log("Submitting Data:", formData);
            await new Promise((resolve) => setTimeout(resolve, 1000));
            // Redirect back
            router.push("/manage-projects");
        } catch (error) {
            console.error("Failed to update project", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
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
                <h1 className="text-xl font-bold">Edit Project (ID: {projectId})</h1>
                <div className="flex flex-col gap-6 bg-white shadow-lg px-6 py-12 rounded-xl w-full lg:w-1/2">
                    {/* Project Name */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="project_name" className="text-xs font-semibold text-gray-900">
                            Project Name <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="text"
                            name="project_name"
                            value={formData.project_name}
                            onChange={handleChange}
                            placeholder="Enter Project Name"
                            className={`text-xs w-full px-4 py-2 bg-white/5 border rounded-lg placeholder-slate-400 focus:outline-none focus:ring-1 transition-all duration-300 ${errors.project_name ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500/50' : 'border-gray-300 focus:ring-gray-700/50 focus:border-gray-700/50'}`}
                        />
                        {errors.project_name && <p className="text-xs text-red-500">{errors.project_name}</p>}
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="description" className="text-xs font-semibold text-gray-900">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Enter Description"
                            rows={4}
                            className={`text-xs w-full px-4 py-2 bg-white/5 border rounded-lg placeholder-slate-400 focus:outline-none focus:ring-1 transition-all duration-300 ${errors.description ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500/50' : 'border-gray-300 focus:ring-gray-700/50 focus:border-gray-700/50'}`}
                        />
                        {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => router.back()}
                            className="px-4 py-2 border border-gray-900 hover:bg-gray-800 hover:text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-xs font-semibold text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>
        } />
    );
}
