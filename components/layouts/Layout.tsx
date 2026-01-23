"use client";

import {
    ArrowLeft,
    ChevronRight,
    Banknote,
    Globe,
    FolderKanban,
    ClipboardList,
    UsersRound,

} from "lucide-react";
import Header from "./Header";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState, useEffect } from "react";
import { getUser } from "@/lib/api";
// import HeaderSetting from "./HeaderSetting";
// import { useI18n } from "@/contexts/I18nContext";

interface NavigationItem {
    id: string;
    label: string;
    icon: typeof UsersRound;
    route?: string;
}

interface LayoutProps {
    children: ReactNode;
    selectedSection?: string;
    onSectionChange?: (sectionId: string) => void;
    onDone?: () => void;
    navigationItems?: NavigationItem[];
    showBackButton?: boolean;
    backPath?: string;
    hideHeaderOnMobile?: boolean;
}

const createDefaultNavigationItems = (): NavigationItem[] => [
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

export default function Layout({
    children,
    selectedSection = "personal-information",
    onSectionChange,
    onDone,
    navigationItems,
    showBackButton = false,
    backPath = "/account-settings",
}: // hideHeaderOnMobile is currently unused
    LayoutProps) {
    // const { t } = useI18n();
    const router = useRouter();
    const pathname = usePathname();
    const [internalSelectedSection, setInternalSelectedSection] =
        useState(selectedSection);
    const [userRole, setUserRole] = useState<number | null>(null);

    useEffect(() => {
        const user = getUser();
        if (user && user.role_id) {
            setUserRole(user.role_id);
        }
    }, []);

    // Create default navigation items with translations if none provided
    const defaultNavigationItems = createDefaultNavigationItems();

    // Filter items based on role_id
    const filteredNavigationItems = userRole === 2
        ? defaultNavigationItems.filter(item => item.id === "manage-tasks")
        : defaultNavigationItems;

    const finalNavigationItems = navigationItems || filteredNavigationItems;

    const handleSectionChange = (sectionId: string, route?: string) => {
        if (route) {
            router.push(route);
        } else if (onSectionChange) {
            onSectionChange(sectionId);
        } else {
            setInternalSelectedSection(sectionId);
        }
    };

    const isAccountSettingPage = pathname === "/account-settings";

    const handleBack = () => {
        router.push("/");
    };

    // const handleBackToSetting = () => {
    //   router.push("/account-settings");
    // };

    const currentSelectedSection = onSectionChange
        ? selectedSection
        : internalSelectedSection;

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            {/* Header - Hide on mobile if hideHeaderOnMobile is true */}
            <Header
                onDone={onDone}
                showBackButton={showBackButton}
                backPath={backPath}
            />

            <div
                className={`max-w-full mx-auto py-0 pb-8 lg:pt-16`}
            >
                <div className="flex flex-col lg:flex-row lg:gap-6">
                    {/* Sidebar Navigation - Hide on tablet/mobile when hideMenuOnMobile is true */}
                    <div className={`hidden lg:block fixed lg:w-1/5 pl-4 pr-4 xl:pr-8 shadow-xl h-[100vh] `}>
                        <nav className="pt-8 pb-0 pl-0">
                            {finalNavigationItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = item.route ? pathname === item.route : currentSelectedSection === item.id;

                                return (
                                    <button
                                        key={item.id}
                                        data-section-id={item.id}
                                        onClick={() => handleSectionChange(item.id, item.route)}
                                        className={`w-full flex items-center justify-between px-4 py-4 text-left rounded-lg transition-all duration-200 ease-in-out cursor-pointer transform ${isActive
                                            ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold"
                                            : "text-gray-900 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white"
                                            }`}
                                    >
                                        <div className="flex items-center">
                                            <Icon className="w-6 h-6 mr-3" strokeWidth="1.5" />
                                            <span className="text-sm xl:text-base">{item.label}</span>
                                        </div>
                                        {isActive && <ChevronRight className="w-4 h-4" />}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Main Content */}
                    <div className="w-full absolute right-0 lg:w-4/5 h-[100vh]">
                        <div className="px-4 pt-20 md:pt-24 lg:pt-8 ">{children}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
