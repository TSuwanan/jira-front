"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

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

type LoginFormErrors = {
    email?: string;
    password?: string;
};

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<LoginFormErrors>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError("");
        // Clear field error when user starts typing
        if (fieldErrors[name as keyof LoginFormErrors]) {
            setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFieldErrors({});
        setError("");

        // Validate with Zod
        const result = loginSchema.safeParse(formData);
        if (!result.success) {
            const errors: LoginFormErrors = {};
            result.error.issues.forEach((issue) => {
                const field = issue.path[0] as keyof LoginFormErrors;
                if (!errors[field]) {
                    errors[field] = issue.message;
                }
            });
            setFieldErrors(errors);
            return;
        }

        setIsLoading(true);

        try {
            // TODO: Implement actual login API call
            console.log("Login attempt:", formData);

            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // On success, redirect to home
            router.push("/");
        } catch (err) {
            setError("Invalid email or password. Please try again.");
        } finally {
            setIsLoading(false);
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
                    <form onSubmit={handleSubmit} className="space-y-6">
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
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    className={`text-xs w-full px-4 py-3 bg-white/5 border rounded-xl placeholder-slate-500 focus:outline-none focus:ring-1 transition-all duration-300 ${fieldErrors.email ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500/50' : 'border-gray-600 focus:ring-gray-500/50 focus:border-gray-500/50'}`}
                                />
                            </div>
                            {fieldErrors.email && (
                                <p className="text-xs text-red-400 mt-1">{fieldErrors.email}</p>
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
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className={`text-xs w-full px-4 py-3 bg-white/5 border rounded-xl placeholder-slate-500 focus:outline-none focus:ring-1 transition-all duration-300 ${fieldErrors.password ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500/50' : 'border-gray-600 focus:ring-gray-500/50 focus:border-gray-500/50'}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500  transition-colors"
                                >
                                    {showPassword ? (
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                            />
                                        </svg>
                                    ) : (
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                            />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {fieldErrors.password && (
                                <p className="text-xs text-red-400 mt-1">{fieldErrors.password}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl shadow-lg shadow-gray-500/30 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {isLoading ? (
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
