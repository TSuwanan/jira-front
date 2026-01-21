"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

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
            <div className="flex items-center justify-between px-4 md:px-8 xl:px-20 py-3 md:py-5 lg:py-5">
                <div className="flex items-center">
                    {/* {showBackButton && isMobile && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="mr-3 p-2 transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 hover:bg-gray-100 dark:hover:bg-gray-800"
                            onClick={handleBack}
                        >
                            <ArrowLeft className="w-5 h-5 transition-transform duration-200 ease-in-out" />
                        </Button>
                    )} */}
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold text-base md:text-lg lg:text-xl transition-colors duration-150 ease-out"
                        style={{
                            transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                    >
                        Jira Task
                        <span className="text-xs">(Mini)</span>
                    </Link>
                </div>
                {/* <Button
                    variant="outline"
                    className="px-6 py-2 text-sm font-medium rounded-full cursor-pointer"
                    onClick={handleDone}
                >
                    {t("account_settings.done")}
                </Button> */}
            </div>
        </div>
    );
}
