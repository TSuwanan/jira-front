"use client";

import Layout from "@/components/layouts/Layout";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import positions from "@/constants/position";
import levels from "@/constants/level";
import { getRoles, Role, createUser, clearAuth, getToken, getUser } from "@/lib/api";

// Define Zod Schema
const userSchema = z.object({
    full_name: z.string().min(1, "Full name is required"),
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    phone_number: z.string().min(1, "Phone number is required"),
    role: z.string().min(1, "Role is required"),
    position_code: z.string().min(1, "Position is required"),
    level_code: z.string().min(1, "Level is required"),
});

type UserFormData = z.infer<typeof userSchema>;

export default function ManageUsersPage() {
    const router = useRouter();
    const [roles, setRoles] = useState<Role[]>([]);
    const [loadingRoles, setLoadingRoles] = useState(true);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            full_name: "",
            email: "",
            phone_number: "",
            role: "",
            position_code: "",
            level_code: "",
        },
    });

    const phoneNumber = watch("phone_number");

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const token = getToken();
                const user = getUser();

                if (!token || !user || user.role_id !== 1) {
                    if (!token) clearAuth();
                    router.push(token ? "/" : "/login");
                    return;
                }
                const data = await getRoles(token);
                setRoles(data);
            } catch (err) {
                console.error("Failed to fetch roles:", err);
            } finally {
                setLoadingRoles(false);
            }
        };
        fetchRoles();
    }, [router]);

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        setValue("phone_number", value, { shouldValidate: true });
    };

    const onSubmit = async (data: UserFormData) => {
        try {
            const token = getToken();
            if (!token) {
                clearAuth();
                router.push("/login");
                return;
            }
            await createUser(token, data);
            router.push("/manage-users");
        } catch (error) {
            if (error instanceof Error && error.message === "Unauthorized") {
                clearAuth();
                router.push("/login");
                return;
            }
            console.error("Failed to add user:", error);
            alert(error instanceof Error ? error.message : "Failed to create user");
        }
    };

    return (
        <Layout children={
            <div className="space-y-6">
                <h1 className="text-xl font-bold">Add User</h1>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 bg-white shadow-lg px-6 py-12 rounded-xl w-full lg:w-1/2">
                    {/* Full Name */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="full_name" className="text-[10px] font-bold uppercase tracking-widest">Full Name<span className="text-red-600">*</span></label>
                        <input
                            type="text"
                            id="full_name"
                            {...register("full_name")}
                            placeholder="Enter Full Name"
                            className={`text-xs w-full px-4 py-2 bg-white/5 border rounded-lg placeholder-slate-400 focus:outline-none focus:ring-1 transition-all duration-300 ${errors.full_name ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500/50' : 'border-gray-300 focus:ring-gray-700/50 focus:border-gray-700/50'}`}
                        />
                        {errors.full_name && <p className="text-[10px] text-red-500 font-medium tracking-wider uppercase">{errors.full_name.message}</p>}
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest">Email<span className="text-red-600">*</span></label>
                        <input
                            type="text"
                            id="email"
                            {...register("email")}
                            placeholder="Enter Email"
                            className={`text-xs w-full px-4 py-2 bg-white/5 border rounded-lg placeholder-slate-400 focus:outline-none focus:ring-1 transition-all duration-300 ${errors.email ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500/50' : 'border-gray-300 focus:ring-gray-700/50 focus:border-gray-700/50'}`}
                        />
                        {errors.email && <p className="text-[10px] text-red-500 font-medium tracking-wider uppercase">{errors.email.message}</p>}
                    </div>

                    {/* Phone Number */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="phone_number" className="text-[10px] font-bold uppercase tracking-widest">Phone Number<span className="text-red-600">*</span></label>
                        <input
                            type="text"
                            id="phone_number"
                            value={phoneNumber}
                            onChange={handlePhoneChange}
                            placeholder="Enter Phone number"
                            className={`text-xs w-full px-4 py-2 bg-white/5 border rounded-lg placeholder-slate-400 focus:outline-none focus:ring-1 transition-all duration-300 ${errors.phone_number ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500/50' : 'border-gray-300 focus:ring-gray-700/50 focus:border-gray-700/50'}`}
                        />
                        {errors.phone_number && <p className="text-[10px] text-red-500 font-medium tracking-wider uppercase">{errors.phone_number.message}</p>}
                    </div>

                    {/* Role */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="role" className="text-[10px] font-bold uppercase tracking-widest">Role<span className="text-red-600">*</span></label>
                        <select
                            id="role"
                            {...register("role")}
                            disabled={loadingRoles}
                            className={`text-xs w-full px-4 py-2 bg-white/5 border rounded-lg placeholder-slate-400 focus:outline-none focus:ring-1 transition-all duration-300 ${errors.role ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500/50' : 'border-gray-300 focus:ring-gray-700/50 focus:border-gray-700/50'} disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            <option className="placeholder-slate-400" value="">
                                {loadingRoles ? "Loading roles..." : "Select Role"}
                            </option>
                            {roles.map((role) => (
                                <option key={role.id} value={role.id}>{role.name}</option>
                            ))}
                        </select>
                        {errors.role && <p className="text-[10px] text-red-500 font-medium tracking-wider uppercase">{errors.role.message}</p>}
                    </div>

                    {/* Position */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="position_code" className="text-[10px] font-bold uppercase tracking-widest">Position<span className="text-red-600">*</span></label>
                        <select
                            id="position_code"
                            {...register("position_code")}
                            className={`text-xs w-full px-4 py-2 bg-white/5 border rounded-lg placeholder-slate-400 focus:outline-none focus:ring-1 transition-all duration-300 ${errors.position_code ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500/50' : 'border-gray-300 focus:ring-gray-700/50 focus:border-gray-700/50'}`}
                        >
                            <option className="placeholder-slate-400" value="">Select Position</option>
                            {positions.map((pos: { id: string; code: string; name: string }) => (
                                <option key={pos.id} value={pos.code}>{pos.name}</option>
                            ))}
                        </select>
                        {errors.position_code && <p className="text-[10px] text-red-500 font-medium tracking-wider uppercase">{errors.position_code.message}</p>}
                    </div>

                    {/* Level */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="level_code" className="text-[10px] font-bold uppercase tracking-widest">Level<span className="text-red-600">*</span></label>
                        <select
                            id="level_code"
                            {...register("level_code")}
                            className={`text-xs w-full px-4 py-2 bg-white/5 border rounded-lg placeholder-slate-400 focus:outline-none focus:ring-1 transition-all duration-300 ${errors.level_code ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500/50' : 'border-gray-300 focus:ring-gray-700/50 focus:border-gray-700/50'}`}
                        >
                            <option className="placeholder-slate-400" value="">Select Level</option>
                            {levels.map((lvl: { id: string; code: string; name: string }) => (
                                <option key={lvl.id} value={lvl.code}>{lvl.name}</option>
                            ))}
                        </select>
                        {errors.level_code && <p className="text-[10px] text-red-500 font-medium tracking-wider uppercase">{errors.level_code.message}</p>}
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
