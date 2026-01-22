"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Menu } from 'lucide-react';


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

    const handleBack = () => {
        router.push(backPath);
    };

    const handleDone = () => {
        if (onDone) {
            onDone(); // Call the custom onDone handler if provided
        } else {
        }
    };

    return (
        <div
            className={`fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 dark:border-gray-700 dark:border-b shadow-sm transition-all duration-200 ease-in-out`}
        >
            <div className="flex items-center justify-between px-4 lg:px-8 xl:px-10 py-3 md:py-5 lg:py-5">
                <div className="flex items-center">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold text-base md:text-lg lg:text-xl transition-colors duration-150 ease-out"
                        style={{
                            transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                    >
                        <Menu className=" block lg:hidden w-4 h-4 transition-transform duration-200 ease-in-out" />
                        <div>
                            <span>Jira Task</span>
                            <span className="text-xs"> (Mini)</span>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
