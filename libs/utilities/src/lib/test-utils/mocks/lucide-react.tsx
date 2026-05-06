/**
 * Mock for lucide-react icons
 * Prevents ESM import issues in Jest tests
 */

import React from "react";

// Export all commonly used icons as simple span elements
export const ArrowRight = () => <span data-testid="arrow-right-icon">→</span>;
export const Play = () => <span data-testid="play-icon">▶</span>;
export const BookOpen = () => <span data-testid="book-icon">📖</span>;
export const Star = () => <span data-testid="star-icon">⭐</span>;
export const MapIcon = () => <span data-testid="map-icon">🗺️</span>;
export { MapIcon as Map };
export const Compass = () => <span data-testid="compass-icon">🧭</span>;
export const Sparkles = () => <span data-testid="sparkles-icon">✨</span>;
export const Zap = () => <span data-testid="zap-icon">⚡</span>;
export const Code = () => <span data-testid="code-icon">💻</span>;
export const Target = () => <span data-testid="target-icon">🎯</span>;
export const CheckCircle = () => <span data-testid="check-icon">✓</span>;
export const Users = () => <span data-testid="users-icon">👥</span>;
export const Award = () => <span data-testid="award-icon">🏆</span>;
export const Trophy = () => <span data-testid="trophy-icon">🏆</span>;
export const ExternalLink = () => <span data-testid="external-icon">🔗</span>;
export const Filter = () => <span data-testid="filter-icon">🔽</span>;
export const X = () => <span data-testid="x-icon">✕</span>;
export const ChevronDown = () => <span data-testid="chevron-down-icon">▼</span>;
export const ChevronLeft = () => <span data-testid="chevron-left-icon">◀</span>;
export const ChevronRight = () => (
  <span data-testid="chevron-right-icon">▶</span>
);
export const Loader2 = () => <span data-testid="loader-icon">⏳</span>;
export const Plus = () => <span data-testid="plus-icon">+</span>;
export const Edit = () => <span data-testid="edit-icon">✏️</span>;
export const Trash2 = () => <span data-testid="trash-icon">🗑️</span>;
export const Eye = () => <span data-testid="eye-icon">👁️</span>;
export const Search = () => <span data-testid="search-icon">🔍</span>;
export const Mail = () => <span data-testid="mail-icon">📧</span>;
export const Calendar = () => <span data-testid="calendar-icon">📅</span>;
export const Activity = () => <span data-testid="activity-icon">📊</span>;
export const MoreVertical = () => <span data-testid="more-icon">⋮</span>;
export const RefreshCw = () => <span data-testid="refresh-icon">🔄</span>;
export const UserPlus = () => <span data-testid="user-plus-icon">➕</span>;
export const Shield = () => <span data-testid="shield-icon">🛡️</span>;
export const Crown = () => <span data-testid="crown-icon">👑</span>;
export const RotateCcw = () => <span data-testid="rotate-icon">↻</span>;
export const ArrowLeft = () => <span data-testid="arrow-left-icon">←</span>;
export const FlipHorizontal = () => <span data-testid="flip-icon">⇄</span>;
export const XCircle = () => <span data-testid="x-circle-icon">❌</span>;
export const Shuffle = () => <span data-testid="shuffle-icon">🔀</span>;
export const EyeOff = () => <span data-testid="eye-off-icon">👁️‍🗨️</span>;
export const Clock = () => <span data-testid="clock-icon">⏰</span>;
export const TrendingUp = () => <span data-testid="trending-icon">📈</span>;
export const Calculator = () => <span data-testid="calculator-icon">🔢</span>;
export const HelpCircle = () => <span data-testid="help-icon">❓</span>;
export const CreditCard = () => <span data-testid="credit-card-icon">💳</span>;
export const FileText = () => <span data-testid="file-icon">📄</span>;
export const Settings = () => <span data-testid="settings-icon">⚙️</span>;
export const Brain = () => <span data-testid="brain-icon">🧠</span>;
export const LayoutDashboard = () => (
  <span data-testid="layout-dashboard-icon">📊</span>
);

// Default export for any other icons
const lucideMock = {
  ArrowRight,
  Play,
  BookOpen,
  Star,
  Map: MapIcon,
  Compass,
  Sparkles,
  Zap,
  Code,
  Target,
  CheckCircle,
  Users,
  Award,
  ExternalLink,
  Filter,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Mail,
  Calendar,
  Activity,
  MoreVertical,
  RefreshCw,
  UserPlus,
  Shield,
  Crown,
  RotateCcw,
  ArrowLeft,
  FlipHorizontal,
  XCircle,
  Shuffle,
  EyeOff,
  Clock,
  TrendingUp,
  Calculator,
  HelpCircle,
  CreditCard,
  FileText,
  Settings,
  Brain,
  LayoutDashboard,
};

export default lucideMock;
