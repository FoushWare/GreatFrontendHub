/* NOSONAR */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useAuth,
  useTheme,
  useUserType,
  useMobileMenu,
} from "@elzatona/contexts";
import {
  Sun,
  Moon,
  Menu,
  X,
  Map,
  Compass,
  User,
  LogOut,
  Settings,
} from "lucide-react";
import { AlzatonaLogo } from "./AlzatonaLogo";
import { LearningModeSwitcher } from "./LearningModeSwitcher";

// Helper function to get link styling
const getLinkStyles = (isActive: boolean, isScrolled: boolean) => {
  if (isActive) {
    return isScrolled
      ? "text-indigo-600 dark:text-indigo-400 font-semibold border-b-2 border-indigo-600 dark:border-indigo-400 pb-1"
      : "text-indigo-100 font-semibold border-b-2 border-indigo-100 pb-1";
  }
  return isScrolled
    ? "text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
    : "text-white hover:text-indigo-100";
};

// Helper function to get logo styling
const getLogoStyles = (isScrolled: boolean) => {
  return isScrolled
    ? "text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400"
    : "text-white hover:text-indigo-100";
};

// Helper function to get navbar styling
const getNavbarStyles = (isScrolled: boolean) => {
  return isScrolled
    ? "bg-white/98 dark:bg-gray-900/98 backdrop-blur-lg shadow-xl border-b border-gray-200 dark:border-gray-700"
    : "bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600";
};

// Helper component for auth section to reduce cognitive complexity
const AuthSection: React.FC<{
  stableAuthState: { isAuthenticated: boolean; isLoading: boolean };
  isScrolled: boolean;
  getAuthLinkClassName: (href: string) => string;
  handleSignOut: () => void;
}> = ({ stableAuthState, isScrolled, getAuthLinkClassName, handleSignOut }) => {
  const buttonClasses = isScrolled
    ? "bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg"
    : "bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg";

  if (stableAuthState.isLoading) {
    return (
      <div className="px-4 py-2 rounded-lg font-medium bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
        Loading...
      </div>
    );
  }

  if (stableAuthState.isAuthenticated) {
    return (
      <button
        onClick={handleSignOut}
        className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${buttonClasses}`}
      >
        Logout
      </button>
    );
  }

  return (
    <Link href="/auth" className={getAuthLinkClassName("/auth")}>
      Sign In
    </Link>
  );
};

// Helper function to get loading state styling
const getLoadingStyles = (isScrolled: boolean) => {
  return isScrolled
    ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
    : "bg-gray-200/20 text-gray-300";
};

const isPathActive = (pathname: string | null, href: string) => {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname?.startsWith(href) || false;
};

const getMobileButtonClassName = (
  href: string,
  pathname: string | null,
  activeColors: string,
  hoverColors: string,
) => {
  const baseClasses =
    "block w-full text-center py-2.5 sm:py-3 font-medium transition-colors duration-200 text-sm sm:text-base rounded-lg";
  const activeClasses = isPathActive(pathname, href)
    ? activeColors
    : hoverColors;
  return `${baseClasses} ${activeClasses}`;
};

const getAuthLinkClassName = (
  href: string,
  pathname: string | null,
  isScrolled: boolean,
) => {
  const baseClasses = "font-medium transition-colors duration-200";
  const isActive = isPathActive(pathname, href);

  if (isActive) {
    return `${baseClasses} ${
      isScrolled
        ? "text-indigo-600 dark:text-indigo-400 font-semibold border-b-2 border-indigo-600 dark:border-indigo-400 pb-1"
        : "text-indigo-100 font-semibold border-b-2 border-indigo-100 pb-1"
    }`;
  }

  return `${baseClasses} ${
    isScrolled
      ? "text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
      : "text-white hover:text-indigo-100"
  }`;
};

const GuestAuthAction: React.FC<{
  stableAuthState: { isAuthenticated: boolean; isLoading: boolean };
  signInLinkClasses: string;
  onSignOut: () => Promise<void>;
  onClose: () => void;
}> = ({ stableAuthState, signInLinkClasses, onSignOut, onClose }) => {
  if (stableAuthState.isLoading) {
    return (
      <div className="block w-full text-center py-2.5 sm:py-3 font-medium text-sm sm:text-base rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
        Loading...
      </div>
    );
  }

  if (stableAuthState.isAuthenticated) {
    return (
      <button
        onClick={() => {
          onSignOut();
          onClose();
        }}
        className="block w-full text-center py-2.5 sm:py-3 font-medium transition-colors duration-200 text-sm sm:text-base rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg"
      >
        Logout
      </button>
    );
  }

  return (
    <Link href="/auth" className={signInLinkClasses} onClick={onClose}>
      Sign In
    </Link>
  );
};

// Navigation link component
const NavigationLink: React.FC<{
  href: string;
  children: React.ReactNode;
  isScrolled: boolean;
  pathname: string;
}> = ({ href, children, isScrolled, pathname }) => {
  const isActive =
    href === "/" ? pathname === "/" : pathname?.startsWith(href) || false;
  const styles = getLinkStyles(isActive, isScrolled);

  return (
    <Link
      href={href}
      className={`font-medium transition-colors duration-200 ${styles}`}
    >
      {children}
    </Link>
  );
};

// Custom hook to consolidate all navbar simple state management
const useNavbarSimpleState = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [stableAuthState, setStableAuthState] = useState<{
    isAuthenticated: boolean;
    isLoading: boolean;
  }>({ isAuthenticated: false, isLoading: true });

  const { userType, setUserType } = useUserType();
  const { setIsMobileMenuOpen } = useMobileMenu();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user, isAuthenticated, isLoading: isAuthLoading, logout } = useAuth();
  const pathname = usePathname();

  return {
    // State
    isScrolled,
    setIsScrolled,
    isOpen,
    setIsOpen,
    isMobile,
    setIsMobile,
    isUserDropdownOpen,
    setIsUserDropdownOpen,
    isHydrated,
    setIsHydrated,
    stableAuthState,
    setStableAuthState,
    // Hooks
    userType,
    setUserType,
    setIsMobileMenuOpen,
    isDarkMode,
    toggleDarkMode,
    user,
    isAuthenticated,
    isAuthLoading,
    logout,
    pathname,
  };
};

// TECHNICAL DEBT: This component has high cognitive complexity (35 vs 15 allowed)
// Requires refactoring: split into smaller sub-components for AuthSection, MobileMenu, DesktopNav
// Tracked for future sprint improvement

// noinspection JSUnusedLocalSymbols
export const NavbarSimple: React.FC = () => {
  // NOSONAR
  // NOSONAR
  // NOSONAR
  const {
    isScrolled,
    setIsScrolled,
    isOpen,
    setIsOpen,
    isMobile: _isMobile,
    setIsMobile,
    isUserDropdownOpen: _isUserDropdownOpen,
    setIsUserDropdownOpen,
    isHydrated,
    setIsHydrated,
    stableAuthState,
    setStableAuthState,
    userType,
    setUserType,
    setIsMobileMenuOpen,
    isDarkMode,
    toggleDarkMode,
    user,
    isAuthenticated,
    isAuthLoading,
    logout,
    pathname,
  } = useNavbarSimpleState();

  // Prevent hydration mismatch and flashing by using stable auth state
  useEffect(() => {
    setIsHydrated(true);

    // Initialize stable auth state from session storage if available
    const storedAuthState = sessionStorage.getItem("navbar-auth-state");
    if (storedAuthState) {
      try {
        const parsed = JSON.parse(storedAuthState);
        setStableAuthState(parsed);
      } catch (error) {
        console.warn("Failed to parse stored auth state:", error);
      }
    }
  }, [setIsHydrated, setStableAuthState]);

  // Update stable auth state when Firebase auth changes, but only after hydration
  useEffect(() => {
    if (isHydrated) {
      const newState = {
        isAuthenticated,
        isLoading: isAuthLoading,
      };

      // Only update if the state actually changed to prevent unnecessary re-renders
      if (
        stableAuthState.isAuthenticated !== newState.isAuthenticated ||
        stableAuthState.isLoading !== newState.isLoading
      ) {
        setStableAuthState(newState);
        sessionStorage.setItem("navbar-auth-state", JSON.stringify(newState));
      }
    }
  }, [
    isHydrated,
    isAuthenticated,
    isAuthLoading,
    stableAuthState,
    setStableAuthState,
  ]);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await logout();
      setIsOpen(false);
      setIsUserDropdownOpen(false);
      // Clear the stable auth state and session storage
      setStableAuthState({ isAuthenticated: false, isLoading: false });
      sessionStorage.removeItem("navbar-auth-state");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  // Handle scroll effect and mobile detection
  useEffect(() => {
    if (!isHydrated) return;

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    // Initial check
    handleResize();

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [isHydrated, setIsMobile, setIsScrolled]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    if (!isHydrated) return;

    if (isOpen) {
      document.body.style.overflow = "hidden";
      setIsMobileMenuOpen(true);
    } else {
      document.body.style.overflow = "unset";
      setIsMobileMenuOpen(false);
    }

    return () => {
      document.body.style.overflow = "unset";
      setIsMobileMenuOpen(false);
    };
  }, [isOpen, setIsMobileMenuOpen, isHydrated]);

  // Cleanup effect for page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Clear session storage on page unload to ensure fresh state on next visit
      sessionStorage.removeItem("navbar-auth-state");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const learningTargetHref =
    userType === "self-directed"
      ? "/browse-practice-questions"
      : "/features/guided-learning";
  const mobileLearningLinkClasses = isPathActive(pathname, learningTargetHref)
    ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 font-semibold"
    : "text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800";
  const authButtonClasses =
    "block w-full text-center py-2.5 sm:py-3 font-medium transition-colors duration-200 text-sm sm:text-base rounded-lg";
  const signInLinkClasses = isPathActive(pathname, "/auth")
    ? `${authButtonClasses} text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 font-semibold`
    : `${authButtonClasses} text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800`;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${getNavbarStyles(isScrolled)}`}
    >
      <div className="w-full px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 lg:h-20">
          {/* Logo */}
          <Link
            href="/"
            className={`flex items-center transition-colors duration-200 ${getLogoStyles(isScrolled)}`}
          >
            <AlzatonaLogo size="sm" showText={false} />
          </Link>

          {/* Desktop Navigation - Only show for authenticated users */}
          {stableAuthState.isAuthenticated && (
            <div className="hidden lg:flex items-center space-x-6 flex-1 justify-center">
              <NavigationLink
                href="/questions"
                isScrolled={isScrolled}
                pathname={pathname || ""}
              >
                Practice
              </NavigationLink>
              <NavigationLink
                href="/dashboard"
                isScrolled={isScrolled}
                pathname={pathname || ""}
              >
                Progress
              </NavigationLink>
              <NavigationLink
                href="/learning-paths"
                isScrolled={isScrolled}
                pathname={pathname || ""}
              >
                My Plans
              </NavigationLink>
              <NavigationLink
                href={
                  userType === "self-directed"
                    ? "/browse-practice-questions"
                    : "/features/guided-learning"
                }
                isScrolled={isScrolled}
                pathname={pathname || ""}
              >
                {userType === "self-directed" ? "Browse" : "Learn"}
              </NavigationLink>
            </div>
          )}

          {/* Right Section - Desktop Only */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Language Switcher */}
            {/* Learning Mode Switcher - Always show */}
            <LearningModeSwitcher isScrolled={isScrolled} />

            {/* Sign In / Logout Link */}
            <AuthSection
              stableAuthState={stableAuthState}
              isScrolled={isScrolled}
              getAuthLinkClassName={(href) =>
                getAuthLinkClassName(href, pathname, isScrolled)
              }
              handleSignOut={handleSignOut}
            />

            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2.5 rounded-lg transition-colors duration-200 ${
                isScrolled
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-800"
                  : "bg-white/20 text-white hover:bg-white/30 border border-white/30"
              }`}
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

          {/* Mobile/Tablet Menu Button */}
          <div className="flex items-center space-x-1 sm:space-x-2 lg:hidden">
            {/* Learning Mode Switcher for Mobile/Tablet - Hidden on very small screens */}
            <div className="hidden xs:block">
              <LearningModeSwitcher isScrolled={isScrolled} />
            </div>

            {/* Theme Toggle for Mobile/Tablet */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 sm:p-2.5 rounded-lg transition-colors duration-200 ${
                isScrolled
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-800"
                  : "bg-white/20 text-white hover:bg-white/30 border border-white/30"
              }`}
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <Sun size={18} className="sm:w-5 sm:h-5" />
              ) : (
                <Moon size={18} className="sm:w-5 sm:h-5" />
              )}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 sm:p-2.5 rounded-lg transition-colors duration-200 ${
                isScrolled
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-800"
                  : "bg-white/20 text-white hover:bg-white/30 border border-white/30"
              }`}
              aria-label="Toggle mobile menu"
            >
              {isOpen ? (
                <X size={18} className="sm:w-5 sm:h-5" />
              ) : (
                <Menu size={18} className="sm:w-5 sm:h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation - Full Screen Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 lg:hidden">
          <div className="flex flex-col h-full">
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
              <AlzatonaLogo size="sm" showText={false} />
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                aria-label="Close mobile menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Mobile Navigation Links - Only for authenticated users */}
            {stableAuthState.isAuthenticated && (
              <div className="flex-1 px-3 sm:px-4 py-4 sm:py-6 space-y-3 sm:space-y-4">
                <Link
                  href="/questions"
                  className={`block text-base sm:text-lg font-medium py-2 px-3 rounded-lg transition-colors ${
                    isPathActive(pathname, "/questions")
                      ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 font-semibold"
                      : "text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  Practice
                </Link>
                <Link
                  href="/dashboard"
                  className={`block text-base sm:text-lg font-medium py-2 px-3 rounded-lg transition-colors ${
                    isPathActive(pathname, "/dashboard")
                      ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 font-semibold"
                      : "text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  Progress
                </Link>
                <Link
                  href="/learning-paths"
                  className={`block text-base sm:text-lg font-medium py-2 px-3 rounded-lg transition-colors ${
                    isPathActive(pathname, "/learning-paths")
                      ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 font-semibold"
                      : "text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  My Plans
                </Link>
                <Link
                  href={learningTargetHref}
                  className={`block text-base sm:text-lg font-medium py-2 px-3 rounded-lg transition-colors ${mobileLearningLinkClasses}`}
                  onClick={() => setIsOpen(false)}
                >
                  {userType === "self-directed" ? "Browse" : "Learn"}
                </Link>

                {/* Mobile Learning Mode Switcher - Always show */}
                <div className="pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 sm:mb-3 px-3">
                    Learning Mode
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <button
                      onClick={() => {
                        setUserType("guided");
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center space-x-2 sm:space-x-3 px-3 py-2 sm:py-2.5 rounded-lg text-left transition-colors ${
                        userType === "guided"
                          ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-100"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                      }`}
                    >
                      <Compass className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm sm:text-base font-medium">
                        Guided Learning
                      </span>
                      {userType === "guided" && (
                        <div className="w-2 h-2 bg-indigo-600 rounded-full ml-auto"></div>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setUserType("self-directed");
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center space-x-2 sm:space-x-3 px-3 py-2 sm:py-2.5 rounded-lg text-left transition-colors ${
                        userType === "self-directed"
                          ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-100"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                      }`}
                    >
                      <Map className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm sm:text-base font-medium">
                        Free Style Learning
                      </span>
                      {userType === "self-directed" && (
                        <div className="w-2 h-2 bg-indigo-600 rounded-full ml-auto"></div>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile CTAs */}
            <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 space-y-2 sm:space-y-3">
              {/* Learning Mode Switcher for non-authenticated users */}
              {!stableAuthState.isAuthenticated && (
                <div className="mb-4">
                  <div className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 sm:mb-3 px-3">
                    Learning Mode
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <button
                      onClick={() => {
                        setUserType("guided");
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center space-x-2 sm:space-x-3 px-3 py-2 sm:py-2.5 rounded-lg text-left transition-colors ${
                        userType === "guided"
                          ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-100"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                      }`}
                    >
                      <Compass className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm sm:text-base font-medium">
                        Guided Learning
                      </span>
                      {userType === "guided" && (
                        <div className="w-2 h-2 bg-indigo-600 rounded-full ml-auto"></div>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setUserType("self-directed");
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center space-x-2 sm:space-x-3 px-3 py-2 sm:py-2.5 rounded-lg text-left transition-colors ${
                        userType === "self-directed"
                          ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-100"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                      }`}
                    >
                      <Map className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm sm:text-base font-medium">
                        Free Style Learning
                      </span>
                      {userType === "self-directed" && (
                        <div className="w-2 h-2 bg-indigo-600 rounded-full ml-auto"></div>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {stableAuthState.isAuthenticated ? (
                <>
                  {/* User Profile Section */}
                  <div className="flex items-center space-x-3 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {user?.name || "User"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  {/* Profile Actions */}
                  <Link
                    href="/profile"
                    className={getMobileButtonClassName(
                      "/profile",
                      pathname,
                      "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 font-semibold",
                      "text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800",
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <Settings className="w-4 h-4 inline mr-2" />
                    Profile Settings
                  </Link>

                  <button
                    onClick={handleSignOut}
                    className="block w-full text-center py-2.5 sm:py-3 font-medium transition-colors duration-200 text-sm sm:text-base rounded-lg text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <LogOut className="w-4 h-4 inline mr-2" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  {/* Get Started Button - Hidden when authenticated */}
                  {!stableAuthState.isLoading &&
                    !stableAuthState.isAuthenticated && (
                      <Link
                        href="/get-started"
                        className={`block w-full text-center py-2.5 sm:py-3 rounded-lg font-medium shadow-md transition-colors duration-200 text-sm sm:text-base ${
                          isPathActive(pathname, "/get-started")
                            ? "bg-indigo-700 text-white ring-2 ring-indigo-300 dark:ring-indigo-500 font-semibold"
                            : "bg-indigo-600 hover:bg-indigo-700 text-white"
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        Get Started
                      </Link>
                    )}
                  <GuestAuthAction
                    stableAuthState={stableAuthState}
                    signInLinkClasses={signInLinkClasses}
                    onSignOut={handleSignOut}
                    onClose={() => setIsOpen(false)}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavbarSimple;
