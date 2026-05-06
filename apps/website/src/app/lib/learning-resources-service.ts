// Learning Resources Service
// This service fetches learning resources data for the admin checklist page
// Note: When external APIs are available, this service can be enhanced to use them
// for more reliable and authenticated access to resource data

export interface LearningResource {
  id: number;
  number: number;
  title: string;
  state: "open" | "closed";
  created_at: string;
  updated_at: string;
  closed_at?: string;
  labels: Array<{
    name: string;
    color: string;
  }>;
  assignee?: {
    login: string;
    avatar_url: string;
  };
  user: {
    login: string;
    avatar_url: string;
  };
  html_url: string;
}

export interface LearningResourcesStats {
  total: number;
  open: number;
  closed: number;
  openResources: LearningResource[];
  closedResources: LearningResource[];
  isMockData?: boolean; // Indicates if this is mock data due to API unavailability
}

export class LearningResourcesService {
  private static readonly REPO_OWNER = "FoushWare";
  private static readonly REPO_NAME = "GreatFrontendHub";
  private static readonly API_BASE = "https://api.github.com";

  // Cache for resources data (5 minutes)
  private static cache: {
    data: LearningResourcesStats | null;
    timestamp: number;
  } = { data: null, timestamp: 0 };

  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Fetch learning resources with caching
   */
  static async getResourcesStats(): Promise<LearningResourcesStats> {
    const now = Date.now();

    // Return cached data if still valid
    if (this.cache.data && now - this.cache.timestamp < this.CACHE_DURATION) {
      return this.cache.data;
    }

    try {
      const resources = await this.fetchAllResources();

      // If no resources returned, it means API failed and we should use mock data
      if (resources.length === 0) {
        const mockData = this.getMockData();

        // Cache mock data to prevent repeated API calls
        this.cache.data = mockData;
        this.cache.timestamp = now;

        return mockData;
      }

      const stats = this.processResourcesData(resources);

      // Cache the results
      this.cache.data = stats;
      this.cache.timestamp = now;

      return stats;
    } catch (_error) {
      // Return mock data if API fails (repository private, not found, or network issues)
      const mockData = this.getMockData();

      // Cache mock data to prevent repeated API calls
      this.cache.data = mockData;
      this.cache.timestamp = now;

      return mockData;
    }
  }

  /**
   * Fetch all resources from external API
   */
  private static async fetchAllResources(): Promise<LearningResource[]> {
    const allResources: LearningResource[] = [];
    let page = 1;
    const perPage = 100;

    while (page <= 10) {
      const resources = await this._fetchPage(page, perPage);
      if (resources.length === 0) break;
      allResources.push(...resources);
      page++;
    }
    return allResources;
  }

  /**
   * Internal helper to fetch a single page of resources.
   */
  private static async _fetchPage(
    page: number,
    perPage: number,
  ): Promise<LearningResource[]> {
    const url = `${this.API_BASE}/repos/${this.REPO_OWNER}/${this.REPO_NAME}/issues?state=all&per_page=${perPage}&page=${page}`;
    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/vnd.github.v3+json",
          ...(process.env.NEXT_PUBLIC_GITHUB_TOKEN && {
            Authorization: `token ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
          }),
        },
      });

      if (!response.ok) return [];
      return await response.json();
    } catch {
      return [];
    }
  }

  /**
   * Process raw resources data into statistics
   */
  private static processResourcesData(
    resources: LearningResource[],
  ): LearningResourcesStats {
    const openResources = resources.filter(
      (resource) => resource.state === "open",
    );
    const closedResources = resources.filter(
      (resource) => resource.state === "closed",
    );

    return {
      total: resources.length,
      open: openResources.length,
      closed: closedResources.length,
      openResources: openResources.slice(0, 10), // Latest 10 open resources
      closedResources: closedResources.slice(0, 10), // Latest 10 closed resources
    };
  }

  /**
   * Get learning resources data organized by categories
   */
  private static getMockData(): LearningResourcesStats {
    const learningResources = [
      // Security Resources
      {
        id: 1,
        title: "Content Security Policy (CSP)",
        url: "https://vercel.com/guides/understanding-xss-attacks#set-a-content-security-policy-(csp)",
        category: "Security",
        completed: false,
      },
      {
        id: 2,
        title: "Understanding cookies for security 🍪",
        url: "https://vercel.com/guides/understanding-cookies",
        category: "Security",
        completed: false,
      },
      {
        id: 3,
        title: "Configure React/Next.js with CSP",
        url: "https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy",
        category: "Security",
        completed: false,
      },
      {
        id: 4,
        title: "SameSite attribute",
        url: "https://vercel.com/guides/understanding-the-samesite-attribute",
        category: "Security",
        completed: false,
      },
      {
        id: 5,
        title: "Referrer Policy (noreferrer, noopener)",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy",
        category: "Security",
        completed: false,
      },
      {
        id: 6,
        title: "CORS Visualized (Lydia Hallie)",
        url: "https://dev.to/lydiahallie/cs-visualized-cors-5b8h",
        category: "Security",
        completed: false,
      },
      {
        id: 7,
        title: "Open Redirect Vulnerability",
        url: "https://www.youtube.com/watch?v=4Jk_I-cw4WE&list=PLI_rLWXMqpSl_TqX9bbisW-d7tDqcVvOJ&index=2",
        category: "Security",
        completed: false,
      },
      {
        id: 8,
        title: "HTTP Parameters Pollution",
        url: "https://www.youtube.com/watch?v=QVZBl8yxVX0&list=PLI_rLWXMqpSl_TqX9bbisW-d7tDqcVvOJ&index=2",
        category: "Security",
        completed: false,
      },
      {
        id: 9,
        title: "Insecure Direct Object Reference (IDOR)",
        url: "https://www.youtube.com/watch?v=rloqMGcPMkI&list=PLI_rLWXMqpSl_TqX9bbisW-d7tDqcVvOJ&index=3",
        category: "Security",
        completed: false,
      },
      {
        id: 10,
        title: "XML External Entities (XXE)",
        url: "https://www.youtube.com/watch?v=gjm6VHZa_8s&list=PLI_rLWXMqpSl_TqX9bbisW-d7tDqcVvOJ&index=4",
        category: "Security",
        completed: false,
      },

      // Performance Resources
      {
        id: 11,
        title: "Core Web Vitals [Fireship Video]",
        url: "https://www.youtube.com/watch?v=0fONene3OIA",
        category: "Performance",
        completed: false,
      },
      {
        id: 12,
        title: "Web Vitals Extension",
        url: "https://chromewebstore.google.com/detail/web-vitals/ahfhijdlegdabablpippeagghigmibma",
        category: "Performance",
        completed: false,
      },
      {
        id: 13,
        title: "Performance measurement with CLI: unlighthouse",
        url: "https://unlighthouse.dev/",
        category: "Performance",
        completed: false,
      },
      {
        id: 14,
        title: "Performance optimization by Hady Osmany",
        url: "https://www.youtube.com/watch?v=AQqFZ5t8uNc",
        category: "Performance",
        completed: false,
      },

      // HTML Resources
      {
        id: 15,
        title: "Normal document flow and positioning",
        url: "https://www.youtube.com/watch?v=yqxb4clxszg",
        category: "HTML",
        completed: false,
      },

      // CSS Resources
      {
        id: 16,
        title: "Stacking context",
        url: "https://www.youtube.com/watch?v=uS8l4YRXbaw",
        category: "CSS",
        completed: false,
      },
      {
        id: 17,
        title: "CSS layouts",
        url: "https://www.youtube.com/watch?v=i1FeOOhNnwU",
        category: "CSS",
        completed: false,
      },
      {
        id: 18,
        title: "Masonry layout",
        url: "https://hackernoon.com/how-to-build-a-masonry-layout-using-css?ref=dailydev",
        category: "CSS",
        completed: false,
      },

      // API Resources
      {
        id: 19,
        title: "HTTP Long Polling vs Server Sent Events vs Websockets",
        url: "https://www.youtube.com/watch?v=1cFyfT0m3bA",
        category: "API",
        completed: false,
      },

      // Interview Questions
      {
        id: 20,
        title: "Promise vs Observable difference",
        url: "https://stackoverflow.com/questions/37364973/what-is-the-difference-between-promises-and-observables",
        category: "Interview",
        completed: false,
      },
      {
        id: 21,
        title: "Promise methods: all, race, any, settled",
        url: "https://dev.to/shameel/javascript-promise-all-vs-allsettled-and-race-vs-any-3foj",
        category: "Interview",
        completed: false,
      },
      {
        id: 22,
        title: "What is Reactive Programming?",
        url: "https://www.youtube.com/watch?v=Bme_RiT9CK4",
        category: "Interview",
        completed: false,
      },
      {
        id: 23,
        title: "Event Loop explanation",
        url: "https://dev.to/lydiahallie/javascript-visualized-event-loop-3dif",
        category: "Interview",
        completed: false,
      },
      {
        id: 24,
        title: "Lydia Hallie JavaScript questions repository",
        url: "https://github.com/lydiahallie/javascript-questions/tree/master",
        category: "Interview",
        completed: false,
      },
      {
        id: 25,
        title: "React Interview Questions",
        url: "https://github.com/sudheerj/reactjs-interview-questions",
        category: "Interview",
        completed: false,
      },
      {
        id: 26,
        title: "Rendering patterns in React (10 patterns)",
        url: "https://www.youtube.com/watch?v=Dkx5ydvtpCA&t=9s",
        category: "Interview",
        completed: false,
      },
      {
        id: 27,
        title: "Rendering patterns React (Lydia Hallie)",
        url: "https://www.patterns.dev/posts/rendering-patterns",
        category: "Interview",
        completed: false,
      },

      // TypeScript Resources
      {
        id: 28,
        title: "Difference between const and readonly in TypeScript",
        url: "https://stackoverflow.com/questions/46561155/difference-between-const-and-readonly-in-typescript",
        category: "TypeScript",
        completed: false,
      },
      {
        id: 29,
        title: "Utility Types in TypeScript",
        url: "https://timmousk.com/blog/typescript-utility-types/#picktype-keys",
        category: "TypeScript",
        completed: false,
      },
      {
        id: 30,
        title: "SOLID Principles in TypeScript",
        url: "https://www.jmalvarez.dev/posts/open-closed-principle",
        category: "TypeScript",
        completed: false,
      },

      // JavaScript Articles
      {
        id: 31,
        title: "Async and defer with HTML",
        url: "https://dev.to/fidalmathew/async-vs-defer-in-javascript-which-is-better-26gm?ref=dailydev",
        category: "JavaScript",
        completed: false,
      },
      {
        id: 32,
        title: "Object access properties",
        url: "https://dmitripavlutin.com/access-object-properties-javascript/",
        category: "JavaScript",
        completed: false,
      },
      {
        id: 33,
        title: "AHA Programming",
        url: "https://kentcdodds.com/blog/aha-programming",
        category: "JavaScript",
        completed: false,
      },
      {
        id: 34,
        title: "Wrong Abstraction",
        url: "https://sandimetz.com/blog/2016/1/20/the-wrong-abstraction",
        category: "JavaScript",
        completed: false,
      },
      {
        id: 35,
        title: "Event Loop Visualization",
        url: "https://dev.to/lydiahallie/javascript-visualized-event-loop-3dif",
        category: "JavaScript",
        completed: false,
      },
      {
        id: 36,
        title: "7 Shorthand Optimization Tricks",
        url: "https://tapajyoti-bose.medium.com/7-shorthand-optimization-tricks-every-javascript-developer-should-know-bf4e136d4497",
        category: "JavaScript",
        completed: false,
      },
      {
        id: 37,
        title: "Event Propagation",
        url: "https://www.freecodecamp.org/news/a-simplified-explanation-of-event-propagation-in-javascript-f9de7961a06e/",
        category: "JavaScript",
        completed: false,
      },
      {
        id: 38,
        title: "SWR vs React Query vs Axios vs Fetch",
        url: "https://www.smashingmagazine.com/2020/06/introduction-swr-react-hooks-remote-data-fetching/",
        category: "JavaScript",
        completed: false,
      },
      {
        id: 39,
        title: "Difference Between Types and Interface in TypeScript",
        url: "https://stackoverflow.com/questions/37233735/interfaces-vs-types-in-typescript",
        category: "JavaScript",
        completed: false,
      },

      // React Resources
      {
        id: 40,
        title: "When to use SWR, React Query, or RTK Query",
        url: "https://react-query.tanstack.com/",
        category: "React",
        completed: false,
      },
      {
        id: 41,
        title: "Creating a React App from Scratch",
        url: "https://reactjs.org/docs/getting-started.html",
        category: "React",
        completed: false,
      },
      {
        id: 42,
        title: "Increasing Performance in React",
        url: "https://reactjs.org/docs/optimizing-performance.html",
        category: "React",
        completed: false,
      },
      {
        id: 43,
        title: "18 Tips for a Better React Code Review",
        url: "https://pagepro.co/blog/18-tips-for-a-better-react-code-review-ts-js/",
        category: "React",
        completed: false,
      },
      {
        id: 44,
        title: "JavaScript Patterns with Lidia Hallie",
        url: "https://javascriptpatterns.vercel.app/patterns/design-patterns/singleton-pattern",
        category: "React",
        completed: false,
      },
      {
        id: 45,
        title: "Render Prop - Kent C. Dodds",
        url: "https://kentcdodds.com/blog?q=render+prop",
        category: "React",
        completed: false,
      },
      {
        id: 46,
        title: "Props pattern - patterns.dev",
        url: "https://www.patterns.dev/posts/render-props-pattern",
        category: "React",
        completed: false,
      },
      {
        id: 47,
        title: "Prop Getter - Kent C. Dodds",
        url: "https://kentcdodds.com/blog/how-to-give-rendering-control-to-users-with-prop-getters",
        category: "React",
        completed: false,
      },
      {
        id: 48,
        title: "Module Pattern",
        url: "https://www.patterns.dev/posts/module-pattern",
        category: "React",
        completed: false,
      },
      {
        id: 49,
        title: "IoC (Inversion of Control)",
        url: "https://kentcdodds.com/blog/inversion-of-control",
        category: "React",
        completed: false,
      },

      // Testing Resources
      {
        id: 50,
        title: "Static Testing",
        url: "https://kentcdodds.com/blog/eliminate-an-entire-category-of-bugs-with-a-few-simple-tools",
        category: "Testing",
        completed: false,
      },
      {
        id: 51,
        title: "Why I never use shallow rendering",
        url: "https://www.youtube.com/watch?v=zkpwdw_JWBg",
        category: "Testing",
        completed: false,
      },
      {
        id: 52,
        title: "Stop Mocking Fetch",
        url: "https://kentcdodds.com/blog/stop-mocking-fetch",
        category: "Testing",
        completed: false,
      },

      // React 18 Resources
      {
        id: 53,
        title: "React 18 Release Notes",
        url: "https://reactjs.org/blog/2022/03/29/react-v18.html",
        category: "React 18",
        completed: false,
      },
      {
        id: 54,
        title: "React 18 Upgrade Guide",
        url: "https://reactjs.org/blog/2022/03/08/react-18-upgrade-guide.html",
        category: "React 18",
        completed: false,
      },
      {
        id: 55,
        title: "React 18 Suspense",
        url: "https://reactjs.org/docs/concurrent-mode-suspense.html",
        category: "React 18",
        completed: false,
      },

      // Great Frontend Interview Questions
      {
        id: 56,
        title: "Top 30 ReactJS Interview Questions",
        url: "https://www.greatfrontend.com/blog/top-30-reactjs-interview-questions-and-answers",
        category: "Great Frontend",
        completed: false,
      },
      {
        id: 57,
        title: "10 Must-Know JavaScript Coding Interview Questions",
        url: "https://www.greatfrontend.com/blog/10-must-know-javascript-coding-interview-questions",
        category: "Great Frontend",
        completed: false,
      },
      {
        id: 58,
        title: "Basic JavaScript Interview Questions for Freshers",
        url: "https://www.greatfrontend.com/blog/basic-javascript-interview-questions-and-answers-for-freshers",
        category: "Great Frontend",
        completed: false,
      },
      {
        id: 59,
        title: "Practice 50 React Coding Interview Questions",
        url: "https://www.greatfrontend.com/blog/practice-50-react-coding-interview-questions-with-solutions",
        category: "Great Frontend",
        completed: false,
      },
      {
        id: 60,
        title: "50 Essential ReactJS Interview Questions",
        url: "https://www.greatfrontend.com/blog/50-essential-reactjs-interviews-questions",
        category: "Great Frontend",
        completed: false,
      },
      {
        id: 61,
        title: "30 Essential React Hooks Interview Questions",
        url: "https://www.greatfrontend.com/blog/30-essential-react-hooks-interview-questions-you-must-know",
        category: "Great Frontend",
        completed: false,
      },
      {
        id: 62,
        title: "50 Must-Know HTML CSS and JavaScript Interview Questions",
        url: "https://www.greatfrontend.com/blog/50-must-know-html-css-and-javascript-interview-questions-by-ex-interviewers",
        category: "Great Frontend",
        completed: false,
      },
      {
        id: 63,
        title: "30 Basic to Advanced React Interview Questions",
        url: "https://www.greatfrontend.com/blog/30-basic-to-advanced-react-interview-questions-with-solutions",
        category: "Great Frontend",
        completed: false,
      },
      {
        id: 64,
        title: "50 Must-Know JavaScript Interview Questions",
        url: "https://www.greatfrontend.com/blog/50-must-know-javascript-interview-questions-by-ex-interviewers",
        category: "Great Frontend",
        completed: false,
      },
      {
        id: 65,
        title: "100 React Interview Questions",
        url: "https://www.greatfrontend.com/blog/100-react-interview-questions-straight-from-ex-interviewers",
        category: "Great Frontend",
        completed: false,
      },

      // Blogs
      {
        id: 66,
        title: "Great Frontend Latest Blog",
        url: "https://www.greatfrontend.com/blog/latest",
        category: "Blogs",
        completed: false,
      },
      {
        id: 67,
        title: "Kent C. Dodds Blog",
        url: "https://kentcdodds.com/",
        category: "Blogs",
        completed: false,
      },

      // Additional Topics
      {
        id: 68,
        title: "Function Generators",
        url: "https://www.youtube.com/watch?v=IJ6EgdiI_wU&t=1s",
        category: "Advanced Topics",
        completed: false,
      },
      {
        id: 69,
        title: "for...of loop",
        url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of",
        category: "Advanced Topics",
        completed: false,
      },
      {
        id: 70,
        title: "bfcache",
        url: "https://developer.chrome.com/docs/web-platform/deprecating-unload?ref=dailydev",
        category: "Advanced Topics",
        completed: false,
      },
      {
        id: 71,
        title: "Atomic Design",
        url: "https://bradfrost.com/blog/post/atomic-web-design/",
        category: "Advanced Topics",
        completed: false,
      },
      {
        id: 72,
        title: "Why use BEM",
        url: "https://www.youtube.com/watch?v=SLjHSVwXYq4",
        category: "Advanced Topics",
        completed: false,
      },
      {
        id: 73,
        title: "Edge Computing",
        url: "https://www.youtube.com/watch?v=yOP5-3_WFus",
        category: "Advanced Topics",
        completed: false,
      },
      {
        id: 74,
        title: "Domain Driven Design",
        url: "https://github.com/FoushWare/frontend_bookmarks",
        category: "Advanced Topics",
        completed: false,
      },
      {
        id: 75,
        title: "Monorepo vs Polyrepo",
        url: "https://medhatdawoud.net/blog/using-monorepos-is-not-that-bad-case-study",
        category: "Advanced Topics",
        completed: false,
      },
      {
        id: 76,
        title: "Social Login with React + RESTful API",
        url: "https://alexanderleon.medium.com/implement-social-authentication-with-react-restful-api-9b44f4714fa",
        category: "Advanced Topics",
        completed: false,
      },
      {
        id: 77,
        title: "Next.js 13 + Antd 5 App Router flickering problem",
        url: "https://github.com/sagemathinc/cocalc/issues/6320",
        category: "Advanced Topics",
        completed: false,
      },
      {
        id: 78,
        title: "Arabic Advanced Git",
        url: "https://www.youtube.com/playlist?list=PLDSsH9x1gRyHlHT1gizpNbGqAUpit77XH",
        category: "Advanced Topics",
        completed: false,
      },
      {
        id: 79,
        title: "MDX-Deck: Slide decks powered by Markdown and React",
        url: "https://kentcdodds.com/blog/mdx-deck-slide-decks-powered-by-markdown-and-react",
        category: "Advanced Topics",
        completed: false,
      },
      {
        id: 80,
        title: "Build tools for web development",
        url: "https://webpack.js.org/",
        category: "Advanced Topics",
        completed: false,
      },
      {
        id: 81,
        title: "Frontend Design Helper Websites",
        url: "https://www.linkedin.com/feed/update/urn:li:activity:6995829940541644800/",
        category: "Advanced Topics",
        completed: false,
      },
      {
        id: 82,
        title: "JS Interview Questions",
        url: "https://www.linkedin.com/feed/update/urn:li:activity:6995420810395992064/",
        category: "Advanced Topics",
        completed: false,
      },
      {
        id: 83,
        title: "Repository for JS topics and questions",
        url: "https://github.com/didicodes/javascript-dev-bookmarks?tab=readme-ov-file",
        category: "Advanced Topics",
        completed: false,
      },
      {
        id: 84,
        title: "My frontend bookmarks",
        url: "https://github.com/FoushWare/frontend_bookmarks",
        category: "Advanced Topics",
        completed: false,
      },
      {
        id: 85,
        title: "Patterns.dev",
        url: "https://www.patterns.dev/",
        category: "Advanced Topics",
        completed: false,
      },
      {
        id: 86,
        title: "HTML CSS JS questions",
        url: "https://www.greatfrontend.com/blog/50-must-know-html-css-and-javascript-interview-questions-by-ex-interviewers",
        category: "Advanced Topics",
        completed: false,
      },
      {
        id: 87,
        title: "The Senior dev YouTube",
        url: "https://www.youtube.com/@TheSeniorDev",
        category: "Advanced Topics",
        completed: false,
      },
      {
        id: 88,
        title: "Understanding what rendering is",
        url: "https://reactjs.org/docs/reconciliation.html",
        category: "Advanced Topics",
        completed: false,
      },
    ];

    const openResources = learningResources.filter(
      (resource) => !resource.completed,
    );
    const closedResources = learningResources.filter(
      (resource) => resource.completed,
    );

    return {
      total: learningResources.length,
      open: openResources.length,
      closed: closedResources.length,
      isMockData: true,
      openResources: openResources.map((resource, _index) => ({
        id: resource.id,
        number: resource.id,
        title: resource.title,
        state: "open" as const,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-12-01T00:00:00Z",
        labels: [
          {
            name: resource.category,
            color: this.getCategoryColor(resource.category),
          },
        ],
        user: { login: "FoushWare", avatar_url: "" },
        html_url: resource.url,
      })),
      closedResources: closedResources.map((resource, _index) => ({
        id: resource.id,
        number: resource.id,
        title: resource.title,
        state: "closed" as const,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-12-01T00:00:00Z",
        closed_at: "2024-12-01T00:00:00Z",
        labels: [
          {
            name: resource.category,
            color: this.getCategoryColor(resource.category),
          },
        ],
        user: { login: "FoushWare", avatar_url: "" },
        html_url: resource.url,
      })),
    };
  }

  /**
   * Get color for category labels
   */
  private static getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      Security: "d73a4a",
      Performance: "0075ca",
      HTML: "e99695",
      CSS: "7057ff",
      API: "008672",
      Interview: "fbca04",
      TypeScript: "3178c6",
      JavaScript: "f9d0c4",
      React: "61dafb",
      Testing: "0e8a16",
      "React 18": "1f883d",
      "Great Frontend": "b60205",
      Blogs: "c5def5",
      "Advanced Topics": "d4c5f9",
    };
    return colors[category] || "6f42c1";
  }

  /**
   * Get resource priority based on labels
   */
  static getResourcePriority(
    resource: LearningResource,
  ): "Critical" | "High" | "Medium" | "Low" {
    const labels = resource.labels.map((label) => label.name.toLowerCase());

    if (labels.includes("critical") || labels.includes("urgent")) {
      return "Critical";
    }
    if (labels.includes("high") || labels.includes("bug")) {
      return "High";
    }
    if (labels.includes("medium") || labels.includes("enhancement")) {
      return "Medium";
    }
    return "Low";
  }

  /**
   * Format issue creation date
   */
  static formatIssueDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
}
