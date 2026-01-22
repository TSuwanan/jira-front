"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Menu, LogOut } from 'lucide-react';
import { useEffect, useState } from "react";
import MenuForMobile from "./MenuForMobile";

interface User {
    id: string;
    user_code: string;
    email: string;
    full_name: string;
    role_id: number;
}

interface HeaderProps {
    onDone?: () => void;
    showBackButton?: boolean;
    backPath?: string;
}

export default function Header({
    onDone,
    showBackButton = false,
    backPath = "/account-settings",
}: HeaderProps) {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    const handleBack = () => {
        router.push(backPath);
    };

    const handleDone = () => {
        if (onDone) {
            onDone(); // Call the custom onDone handler if provided
        } else {
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            <div
                className={`fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 dark:border-gray-700 dark:border-b shadow-sm transition-all duration-200 ease-in-out`}
            >
                <div className="flex items-center justify-between px-4 lg:px-8 xl:px-10 py-3 md:py-5 lg:py-5">
                    <div className="flex items-center gap-2">
                        <button onClick={toggleMobileMenu} className="lg:hidden">
                            <Menu className="w-4 h-4 transition-transform duration-200 ease-in-out" />
                        </button>
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold text-base md:text-lg lg:text-xl transition-colors duration-150 ease-out"
                            style={{
                                transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                            }}
                        >
                            <div>
                                <span className="text-sm sm:text-lg">Jira Task</span>
                                <span className="text-xs"> (Mini)</span>
                            </div>
                        </Link>
                    </div>
                    <div className="flex items-center gap-3">
                        {user && (
                            <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 ">
                                {user.full_name}
                            </span>
                        )}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-2 sm:px-4 text-xs md:text-sm font-semibold rounded-lg hover:text-red-700 transition-colors cursor-pointer"
                        >
                            <LogOut className="w-3 h-3 md:w-4 md:h-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Component */}
            <MenuForMobile isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
        </>
    );
}
