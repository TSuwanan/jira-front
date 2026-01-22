"use client";

import Layout from "@/components/layouts/Layout";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import positions from "@/constants/position";
import levels from "@/constants/level";

// Define Zod Schema
const userSchema = z.object({
    full_name: z.string().min(1, "Full name is required"),
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    phone_number: z.string().min(1, "Phone number is required"),
    role: z.string().min(1, "Role is required"),
    position_code: z.string().min(1, "Position is required"),
    level_code: z.string().min(1, "Level is required"),
});

type UserFormErrors = {
    [key: string]: string | undefined;
};

export default function ManageUsersPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone_number: "",
        role: "",
        position_code: "",
        level_code: "",
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
                <h1 className="text-xl font-bold">Add User</h1>
                <div className="flex flex-col gap-6 bg-white shadow-lg px-6 py-12 rounded-xl w-full lg:w-1/2">
                    {/* Full Name */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="full_name" className="text-xs font-semibold text-gray-900">Full Name<span className="text-red-600">*</span></label>
                        <input
                            type="text"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            placeholder="Enter Full Name"
                            className={`text-xs w-full px-4 py-2 bg-white/5 border rounded-lg placeholder-slate-400 focus:outline-none focus:ring-1 transition-all duration-300 ${errors.full_name ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500/50' : 'border-gray-300 focus:ring-gray-700/50 focus:border-gray-700/50'}`}
                        />
                        {errors.full_name && <p className="text-xs text-red-500">{errors.full_name}</p>}
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="email" className="text-xs font-semibold text-gray-900">Email<span className="text-red-600">*</span></label>
                        <input
                            type="text"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter Email"
                            className={`text-xs w-full px-4 py-2 bg-white/5 border rounded-lg placeholder-slate-400 focus:outline-none focus:ring-1 transition-all duration-300 ${errors.email ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500/50' : 'border-gray-300 focus:ring-gray-700/50 focus:border-gray-700/50'}`}
                        />
                        {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                    </div>
                    {/* Phone Number */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="phone_number" className="text-xs font-semibold text-gray-900">Phone Number<span className="text-red-600">*</span></label>
                        <input
                            type="text"
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={handleChange}
                            placeholder="Enter Phone number"
                            className={`text-xs w-full px-4 py-2 bg-white/5 border rounded-lg placeholder-slate-400 focus:outline-none focus:ring-1 transition-all duration-300 ${errors.email ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500/50' : 'border-gray-300 focus:ring-gray-700/50 focus:border-gray-700/50'}`}
                        />
                        {errors.phone_number && <p className="text-xs text-red-500">{errors.phone_number}</p>}
                    </div>

                    {/* Role */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="role" className="text-xs font-semibold text-gray-900">Role<span className="text-red-600">*</span></label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className={`text-xs w-full px-4 py-2 bg-white/5 border rounded-lg placeholder-slate-400 focus:outline-none focus:ring-1 transition-all duration-300 ${errors.role ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500/50' : 'border-gray-300 focus:ring-gray-700/50 focus:border-gray-700/50'}`}
                        >
                            <option className="placeholder-slate-400" value="">Select Role</option>
                            <option value="admin">Admin</option>
                            <option value="user">User</option>
                        </select>
                        {errors.role && <p className="text-xs text-red-500">{errors.role}</p>}
                    </div>

                    {/* Position */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="position_code" className="text-xs font-semibold text-gray-900">Position<span className="text-red-600">*</span></label>
                        <select
                            name="position_code"
                            value={formData.position_code}
                            onChange={handleChange}
                            className={`text-xs w-full px-4 py-2 bg-white/5 border rounded-lg placeholder-slate-400 focus:outline-none focus:ring-1 transition-all duration-300 ${errors.position_code ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500/50' : 'border-gray-300 focus:ring-gray-700/50 focus:border-gray-700/50'}`}
                        >
                            <option className="placeholder-slate-400" value="">Select Position</option>
                            {positions.map((pos) => (
                                <option key={pos.id} value={pos.code}>{pos.name}</option>
                            ))}
                        </select>
                        {errors.position_code && <p className="text-xs text-red-500">{errors.position_code}</p>}
                    </div>

                    {/* Level */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="level_code" className="text-xs font-semibold text-gray-900">Level<span className="text-red-600">*</span></label>
                        <select
                            name="level_code"
                            value={formData.level_code}
                            onChange={handleChange}
                            className={`text-xs w-full px-4 py-2 bg-white/5 border rounded-lg placeholder-slate-400 focus:outline-none focus:ring-1 transition-all duration-300 ${errors.level_code ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500/50' : 'border-gray-300 focus:ring-gray-700/50 focus:border-gray-700/50'}`}
                        >
                            <option className="placeholder-slate-400" value="">Select Level</option>
                            {levels.map((lvl) => (
                                <option key={lvl.id} value={lvl.code}>{lvl.name}</option>
                            ))}
                        </select>
                        {errors.level_code && <p className="text-xs text-red-500">{errors.level_code}</p>}
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