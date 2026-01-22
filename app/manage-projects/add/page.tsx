"use client";

import Layout from "@/components/layouts/Layout";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import positions from "@/constants/position";
import levels from "@/constants/level";

// Define Zod Schema
const userSchema = z.object({
    project_name: z.string().min(1, "Project Name is required"),
});

type UserFormErrors = {
    [key: string]: string | undefined;
};

export default function AddProjectPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        project_name: "",
        description: "",
    });
    const [errors, setErrors] = useState<UserFormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Clear error when user starts typing/selecting
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setErrors({});

        // Validate
        const result = userSchema.safeParse(formData);

        if (!result.success) {
            const newErrors: UserFormErrors = {};
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
            console.log("Submitting Data:", formData);
            await new Promise((resolve) => setTimeout(resolve, 1000));
            // Redirect back
            router.push("/manage-users");
        } catch (error) {
            console.error("Failed to add user", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Layout children={
            <div className="space-y-6">
                <h1 className="text-xl font-bold">Add Project</h1>
                <div className="flex flex-col gap-6 bg-white shadow-lg px-6 py-12 rounded-xl w-full lg:w-1/2">
                    {/* First Name */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="project_name" className="text-xs font-semibold text-gray-900">Project Name <span className="text-red-600">*</span></label>
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

                    {/* Last Name */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="description" className="text-xs font-semibold text-gray-900">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            placeholder="Enter Description"
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
                            {isSubmitting ? "Saving..." : "Save"}
                        </button>
                    </div>
                </div>
            </ div>} />
    );
}