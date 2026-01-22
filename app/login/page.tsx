"use client";
import { Eye, EyeClosed } from 'lucide-react';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { login } from "@/lib/api";

// Zod schema for login validation
const loginSchema = z.object({
    email: z
        .string()
        .min(1, "Email is required")
        .email("Please enter a valid email address"),
    password: z
        .string()
        .min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        setError("");

        try {
            const result = await login({
                email: data.email,
                password: data.password,
            });

            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));

            // เปลี่ยนจาก /dashboard เป็น /
            router.push("/");  // ← เปลี่ยนตรงนี้
        } catch (err: any) {
            setError(err.message || "Invalid email or password. Please try again.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center md:px-4 md:py-12">
            {/* Login Card */}
            <div className="relative w-full max-w-md">
                {/* Glassmorphism card */}
                <div className="h-[100vh] sm:h-full backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl sm:shadow-2xl pt-32 px-8 sm:p-10">
                    {/* Logo/Brand */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2">
                            Welcome
                        </h1>
                        <p className="text-slate-400 text-sm">
                            Sign in to continue to Jira Mini
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm text-center animate-pulse">
                            {error}
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Email Input */}
                        <div className="space-y-2">
                            <label
                                htmlFor="email"
                                className="block text-xs font-medium"
                            >
                                Email Address
                            </label>
                            <div className="relative">
                                <input
                                    id="email"
                                    type="email"
                                    {...register("email")}
                                    placeholder="you@example.com"
                                    className={`text-xs w-full px-4 py-3 bg-white/5 border rounded-xl placeholder-slate-400 focus:outline-none focus:ring-1 transition-all duration-300 ${errors.email
                                        ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500/50'
                                        : 'border-gray-300 focus:ring-gray-700/50 focus:border-gray-700/50'
                                        }`}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-xs text-red-400 mt-1">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        {/* Password Input */}
                        <div className="space-y-2">
                            <label
                                htmlFor="password"
                                className="block text-xs font-medium"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    {...register("password")}
                                    placeholder="••••••••"
                                    className={`text-xs w-full px-4 py-3 bg-white/5 border rounded-xl placeholder-slate-400 focus:outline-none focus:ring-1 transition-all duration-300 ${errors.password
                                        ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500/50'
                                        : 'border-gray-300 focus:ring-gray-700/50 focus:border-gray-700/50'
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeClosed className='w-4 h-4' stroke="currentColor" />
                                    ) : (
                                        <Eye className='w-4 h-4' stroke="currentColor" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-xs text-red-400 mt-1">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl shadow-lg shadow-gray-500/30 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {isSubmitting ? (
                                <span className="text-sm">Signing in...</span>
                            ) : (
                                <span className="text-sm">Sign In</span>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}