/**
 * Integration tests for Admin content management page API interactions
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import ContentManagementPage from "./page";

const mockRouterPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

// Mock the content management hook
const mockUseContentManagement = vi.fn();
const mockSetIsNavbarVisible = vi.fn();
vi.mock("./hooks/useContentManagement", () => ({
  useContentManagement: () => mockUseContentManagement(),
}));

vi.mock("@elzatona/contexts", () => ({
  useAdminNavbarVisibility: () => ({
    isNavbarVisible: true,
    setIsNavbarVisible: mockSetIsNavbarVisible,
  }),
}));

// Mock common-ui components to avoid complex rendering
vi.mock("@elzatona/common-ui", () => ({
  Button: ({ children, onClick, ...props }: Record<string, unknown>) => (
    <button onClick={onClick as any} {...(props as any)}>
      {children as any}
    </button>
  ),
  Dialog: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog">{children}</div>
  ),
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-title">{children}</div>
  ),
  DialogDescription: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-description">{children}</div>
  ),
  Input: ({ ...props }: Record<string, unknown>) => (
    <input {...(props as any)} />
  ),
  Label: ({ children, ...props }: Record<string, unknown>) => (
    <label {...(props as any)}>{children as any}</label>
  ),
  Textarea: ({ children, ...props }: Record<string, unknown>) => (
    <textarea {...(props as any)}>{children as any}</textarea>
  ),
  Select: ({ children, value, onValueChange }: Record<string, unknown>) => (
    <select
      value={value as any}
      onChange={(e) => (onValueChange as any)?.(e.target.value)}
      data-testid="select"
    >
      {children as any}
    </select>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  SelectValue: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  SelectItem: ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: string;
  }) => <option value={value}>{children}</option>,
  StatsSection: ({ stats }: { stats: Record<string, number> }) => (
    <div data-testid="stats-section">
      {stats &&
        Object.entries(stats).map(([key, value]) => (
          <div key={key} data-testid={`stat-${key}`}>{`${key}: ${value}`}</div>
        ))}
    </div>
  ),
  SearchAndFilters: ({
    searchTerm,
    onSearchChange,
    filterCardType,
    onFilterChange,
  }: Record<string, unknown>) => (
    <div data-testid="search-filters">
      <input
        data-testid="search-input"
        value={searchTerm as any}
        onChange={(e) => (onSearchChange as any)(e.target.value)}
        placeholder="Search..."
      />
      <select
        data-testid="filter-select"
        value={filterCardType as any}
        onChange={(e) => (onFilterChange as any)(e.target.value)}
      >
        <option value="all">All</option>
        <option value="flashcard">Flashcard</option>
      </select>
    </div>
  ),
  LearningCardsManager: () => <div data-testid="learning-cards-manager" />,
  PlansManager: () => <div data-testid="plans-manager" />,
  TopicsManager: () => <div data-testid="topics-manager" />,
  CategoriesManager: () => <div data-testid="categories-manager" />,
  TopicQuestionsModal: () => <div data-testid="topic-questions-modal" />,
  CategoryFormModal: () => <div data-testid="category-form-modal" />,
  TopicFormModal: () => <div data-testid="topic-form-modal" />,
  DeleteConfirmationModal: () => (
    <div data-testid="delete-confirmation-modal" />
  ),
  CardManagementModal: () => <div data-testid="card-management-modal" />,
  QuestionFormModal: ({
    isOpen,
    readOnly,
    question,
  }: Record<string, unknown>) =>
    isOpen ? (
      <div
        data-testid="question-form-modal"
        data-read-only={readOnly ? "true" : "false"}
        data-question-id={(question as any)?.id ?? ""}
      />
    ) : null,
  CardFormModal: () => <div data-testid="card-form-modal" />,
}));

describe("Admin content management page - Integration", () => {
  const buildHookState = () => ({
    loading: false,
    error: null,
    searchTerm: "",
    setSearchTerm: vi.fn(),
    filterCardType: "all",
    setFilterCardType: vi.fn(),
    stats: {
      cards: 25,
      plans: 5,
      categories: 8,
      topics: 15,
    },
    filteredCards: [],
    filteredPlans: [],
    categories: [],
    topics: [],
    questions: [],
    planQuestions: new Set(),
    expandedCards: new Set(),
    toggleCard: vi.fn(),
    expandedCategories: new Set(),
    toggleCategory: vi.fn(),
    expandedTopics: new Set(),
    toggleTopic: vi.fn(),
    expandedPlans: new Set(),
    togglePlan: vi.fn(),
    expandedPlanCards: new Set(),
    togglePlanCard: vi.fn(),
    expandedPlanCategories: new Set(),
    togglePlanCategory: vi.fn(),
    expandedPlanTopics: new Set(),
    togglePlanTopic: vi.fn(),
    isTopicQuestionsModalOpen: false,
    setIsTopicQuestionsModalOpen: vi.fn(),
    selectedTopic: null,
    selectedPlan: null,
    selectedQuestions: new Set(),
    toggleQuestionSelection: vi.fn(),
    selectAllQuestions: vi.fn(),
    deselectAllQuestions: vi.fn(),
    addSelectedQuestionsToPlan: vi.fn(),
    closeTopicQuestionsModal: vi.fn(),
    isDeleteCardModalOpen: false,
    setIsDeleteCardModalOpen: vi.fn(),
    cardToDelete: null,
    isDeleting: false,
    openDeleteCardModal: vi.fn(),
    closeDeleteCardModal: vi.fn(),
    deleteCard: vi.fn(),
    isCardManagementModalOpen: false,
    setIsCardManagementModalOpen: vi.fn(),
    selectedPlanForCards: null,
    planCards: [],
    availableCards: [],
    isManagingCards: false,
    openCardManagementModal: vi.fn(),
    closeCardManagementModal: vi.fn(),
    addCardToPlan: vi.fn(),
    removeCardFromPlan: vi.fn(),
    toggleCardActiveStatus: vi.fn(),
    openTopicQuestionsModal: vi.fn(),
    createSpacedRepetitionPlans: vi.fn(),
    createCategory: vi.fn(),
    editCategory: vi.fn(),
    removeCategory: vi.fn(),
    createTopic: vi.fn(),
    editTopic: vi.fn(),
    removeTopic: vi.fn(),
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseContentManagement.mockReturnValue(buildHookState());
  });

  it("renders content management page with stats", () => {
    render(<ContentManagementPage />);

    expect(screen.getByTestId("stats-section")).toBeInTheDocument();
    expect(screen.getByTestId("stat-cards")).toHaveTextContent("cards: 25");
    expect(screen.getByTestId("stat-plans")).toHaveTextContent("plans: 5");
  });

  it("renders search and filter components", () => {
    render(<ContentManagementPage />);

    expect(screen.getByTestId("search-filters")).toBeInTheDocument();
    expect(screen.getByTestId("search-input")).toBeInTheDocument();
    expect(screen.getByTestId("filter-select")).toBeInTheDocument();
  });

  it("renders all management sections", () => {
    render(<ContentManagementPage />);

    expect(screen.getByTestId("learning-cards-manager")).toBeInTheDocument();
    expect(screen.getByTestId("plans-manager")).toBeInTheDocument();
    expect(screen.getByTestId("topics-manager")).toBeInTheDocument();
    expect(screen.getByTestId("categories-manager")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    mockUseContentManagement.mockReturnValue({
      ...buildHookState(),
      loading: true,
    });

    render(<ContentManagementPage />);

    expect(screen.getByRole("status")).toBeInTheDocument(); // Loader2 component
  });

  it("displays error message when error occurs", () => {
    mockUseContentManagement.mockReturnValue({
      ...buildHookState(),
      error: "Failed to load content data",
    });

    render(<ContentManagementPage />);

    expect(
      screen.getByText(/Failed to load content data/i),
    ).toBeInTheDocument();
  });

  it("search functionality updates search term", () => {
    const mockSetSearchTerm = vi.fn();
    mockUseContentManagement.mockReturnValue({
      ...buildHookState(),
      setSearchTerm: mockSetSearchTerm,
    });

    render(<ContentManagementPage />);

    const searchInput = screen.getByTestId("search-input");
    fireEvent.change(searchInput, { target: { value: "test search" } });

    expect(mockSetSearchTerm).toHaveBeenCalledWith("test search");
  });

  it("filter functionality updates filter type", () => {
    const mockSetFilterCardType = vi.fn();
    mockUseContentManagement.mockReturnValue({
      ...buildHookState(),
      setFilterCardType: mockSetFilterCardType,
    });

    render(<ContentManagementPage />);

    const filterSelect = screen.getByTestId("filter-select");
    fireEvent.change(filterSelect, { target: { value: "flashcard" } });

    expect(mockSetFilterCardType).toHaveBeenCalledWith("flashcard");
  });

  it("renders modal components when open", () => {
    mockUseContentManagement.mockReturnValue({
      ...buildHookState(),
      isTopicQuestionsModalOpen: true,
      isDeleteCardModalOpen: true,
      isCardManagementModalOpen: true,
    });

    render(<ContentManagementPage />);

    expect(screen.getByTestId("topic-questions-modal")).toBeInTheDocument();
    expect(screen.getByTestId("delete-confirmation-modal")).toBeInTheDocument();
    expect(screen.getByTestId("card-management-modal")).toBeInTheDocument();
  });

  it("passes read-only mode to question modal for view flow", () => {
    mockUseContentManagement.mockReturnValue({
      ...buildHookState(),
      isQuestionModalOpen: true,
      isQuestionReadOnly: true,
      questionToEdit: { id: "q-view-1", title: "View only" },
    });

    render(<ContentManagementPage />);

    const questionModal = screen.getByTestId("question-form-modal");
    expect(questionModal).toHaveAttribute("data-read-only", "true");
    expect(questionModal).toHaveAttribute("data-question-id", "q-view-1");
    expect(mockSetIsNavbarVisible).toHaveBeenCalledWith(true);
  });

  it("passes editable mode to question modal for edit flow", () => {
    mockUseContentManagement.mockReturnValue({
      ...buildHookState(),
      isQuestionModalOpen: true,
      isQuestionReadOnly: false,
      questionToEdit: { id: "q-edit-1", title: "Editable" },
    });

    render(<ContentManagementPage />);

    const questionModal = screen.getByTestId("question-form-modal");
    expect(questionModal).toHaveAttribute("data-read-only", "false");
    expect(questionModal).toHaveAttribute("data-question-id", "q-edit-1");
    expect(mockSetIsNavbarVisible).toHaveBeenCalledWith(true);
  });

  it("keeps navbar visible for create question flow", () => {
    mockUseContentManagement.mockReturnValue({
      ...buildHookState(),
      isQuestionModalOpen: true,
      isQuestionReadOnly: false,
      questionToEdit: null,
      selectedTopicIdForNewQuestion: "topic-1",
    });

    render(<ContentManagementPage />);

    expect(screen.getByTestId("question-form-modal")).toBeInTheDocument();
    expect(mockSetIsNavbarVisible).toHaveBeenCalledWith(true);
  });
});
