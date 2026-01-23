"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { X, UsersRound, FolderKanban, ClipboardList, ChevronRight } from 'lucide-react';
import { getUser } from "@/lib/api";

interface NavigationItem {
    id: string;
    label: string;
    icon: typeof UsersRound;
    route: string;
}

interface MenuForMobileProps {
    isOpen: boolean;
    onClose: () => void;
}

const navigationItems: NavigationItem[] = [
    {
        id: "users",
        label: "Manage Users",
        icon: UsersRound,
        route: "/manage-users",
    },
    {
        id: "projects",
        label: "Manage Projects",
        icon: FolderKanban,
        route: "/manage-projects",
    },
    {
        id: "manage-tasks",
        label: "Manage Tasks",
        icon: ClipboardList,
        route: "/manage-tasks",
    }
];

export default function MenuForMobile({ isOpen, onClose }: MenuForMobileProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [userRole, setUserRole] = useState<number | null>(null);

    useEffect(() => {
        const user = getUser();
        if (user && user.role_id) {
            setUserRole(user.role_id);
        }
    }, [isOpen]);

    const handleNavigate = (route: string) => {
        router.push(route);
        onClose();
    };

    // Filter items based on role_id
    const filteredNavigationItems = userRole === 2
        ? navigationItems.filter(item => item.id === "manage-tasks")
        : navigationItems;

    return (
        <>
            {/* Mobile Sidebar Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Mobile Sidebar */}
            <div
                className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Menu</h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                {/* Navigation Items */}
                <nav className="p-4">
                    {filteredNavigationItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.route;

                        return (
                            <button
                                key={item.id}
                                onClick={() => handleNavigate(item.route)}
                                className={`w-full flex items-center justify-between px-4 py-4 text-left rounded-lg transition-all duration-200 ease-in-out cursor-pointer mb-2 ${isActive
                                    ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold"
                                    : "text-gray-900 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white"
                                    }`}
                            >
                                <div className="flex items-center">
                                    <Icon className="w-5 h-5 mr-3" strokeWidth="1.5" />
                                    <span className="text-sm">{item.label}</span>
                                </div>
                                {isActive && <ChevronRight className="w-4 h-4" />}
                            </button>
                        );
                    })}
                </nav>
            </div>
        </>
    );
}
