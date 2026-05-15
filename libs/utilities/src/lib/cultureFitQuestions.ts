import { shuffleArray } from "./utils";

export interface CultureFitQuestion {
  id: string;
  question: string;
  category:
    | "values"
    | "teamwork"
    | "leadership"
    | "adaptability"
    | "communication"
    | "growth"
    | "work-life"
    | "diversity";
  difficulty: "easy" | "medium" | "hard";
  answer: {
    structure: string;
    example: string;
    keyPoints: string[];
    tips: string[];
  };
  followUpQuestions?: string[];
  tags: string[];
}

export const cultureFitQuestions: CultureFitQuestion[] = [
  {
    id: "cf-001",
    question:
      "Tell me about a time when you had to work with a difficult team member. How did you handle the situation?",
    category: "teamwork",
    difficulty: "medium",
    answer: {
      structure:
        "Use the STAR method: Situation, Task, Action, Result. Focus on your actions and the positive outcome.",
      example:
        "In my previous role, I worked with a developer who was resistant to code reviews. I scheduled a one-on-one meeting to understand their concerns, explained the benefits of code reviews for team learning, and offered to pair program to demonstrate the value. We established a collaborative review process that improved our code quality and team dynamics.",
      keyPoints: [
        "Demonstrate empathy and understanding",
        "Show problem-solving skills",
        "Focus on collaboration, not conflict",
        "Highlight positive outcomes for the team",
      ],
      tips: [
        "Never speak negatively about the person",
        "Focus on the situation, not personality",
        "Show how you contributed to a solution",
        "Emphasize team success over individual success",
      ],
    },
    followUpQuestions: [
      "How do you handle disagreements in a team setting?",
      "What strategies do you use to build rapport with new team members?",
    ],
    tags: ["teamwork", "conflict resolution", "communication", "collaboration"],
  },
  {
    id: "cf-002",
    question:
      "Describe a situation where you had to adapt to a significant change in your work environment or project requirements.",
    category: "adaptability",
    difficulty: "medium",
    answer: {
      structure:
        "Explain the change, your initial reaction, how you adapted, and the results of your adaptation.",
      example:
        "When our company shifted from waterfall to agile methodology, I initially struggled with the faster pace. I took initiative to learn agile principles, attended training sessions, and adapted my planning approach. I became a champion for agile practices in my team, helping others transition smoothly.",
      keyPoints: [
        "Show flexibility and openness to change",
        "Demonstrate learning agility",
        "Highlight positive attitude during transitions",
        "Show how you help others adapt",
      ],
      tips: [
        "Be honest about initial challenges",
        "Focus on your learning process",
        "Show proactive approach to change",
        "Demonstrate leadership during transitions",
      ],
    },
    followUpQuestions: [
      "How do you stay current with industry changes?",
      "Tell me about a time you had to learn something completely new quickly.",
    ],
    tags: ["adaptability", "change management", "learning", "agility"],
  },
  {
    id: "cf-003",
    question:
      "What does work-life balance mean to you, and how do you maintain it?",
    category: "work-life",
    difficulty: "easy",
    answer: {
      structure:
        "Define your understanding of work-life balance, provide specific examples of how you maintain it, and show awareness of its importance.",
      example:
        "Work-life balance means being fully present and productive at work while maintaining time for personal growth, relationships, and health. I maintain it by setting clear boundaries, using time-blocking techniques, and communicating my availability. For instance, I don't check work emails after 7 PM unless it's urgent, and I take regular breaks during the day to recharge.",
      keyPoints: [
        "Show self-awareness and boundaries",
        "Demonstrate time management skills",
        "Express commitment to both work and personal life",
        "Show respect for others' boundaries",
      ],
      tips: [
        "Be specific about your strategies",
        "Show you understand the company's culture",
        "Demonstrate that you can be productive while maintaining balance",
        "Avoid sounding like you prioritize personal time over work",
      ],
    },
    followUpQuestions: [
      "How do you handle periods of high workload?",
      "What activities do you do outside of work to recharge?",
    ],
    tags: ["work-life balance", "time management", "boundaries", "wellness"],
  },
  {
    id: "cf-004",
    question:
      "Tell me about a time when you failed at something. How did you handle it?",
    category: "growth",
    difficulty: "medium",
    answer: {
      structure:
        "Describe the failure honestly, explain what you learned from it, and show how you applied those lessons to improve.",
      example:
        "I once missed a critical deadline for a client project due to poor time estimation. I immediately communicated the delay to stakeholders, took responsibility, and worked extra hours to deliver quality work. I learned to build buffer time into estimates and now use project management tools to track progress more effectively.",
      keyPoints: [
        "Show vulnerability and honesty",
        "Demonstrate learning from failure",
        "Highlight accountability and responsibility",
        "Show how failure led to improvement",
      ],
      tips: [
        "Choose a failure that shows growth",
        "Focus on lessons learned, not the failure itself",
        "Show how you prevented similar failures",
        "Demonstrate resilience and positive attitude",
      ],
    },
    followUpQuestions: [
      "How do you approach new challenges that might lead to failure?",
      "What's the most important lesson you've learned from a mistake?",
    ],
    tags: ["failure", "learning", "resilience", "growth mindset"],
  },
  {
    id: "cf-005",
    question: "How do you handle feedback, both positive and negative?",
    category: "communication",
    difficulty: "easy",
    answer: {
      structure:
        "Explain your approach to receiving feedback, provide examples of how you've acted on feedback, and show your commitment to continuous improvement.",
      example:
        "I view feedback as a gift that helps me grow. When receiving positive feedback, I acknowledge it graciously and try to understand what specifically led to success. For negative feedback, I listen actively, ask clarifying questions, and create an action plan for improvement. For instance, when my manager suggested I improve my presentation skills, I joined a public speaking group and practiced regularly.",
      keyPoints: [
        "Show openness to feedback",
        "Demonstrate active listening skills",
        "Show commitment to improvement",
        "Provide specific examples of acting on feedback",
      ],
      tips: [
        "Show emotional intelligence",
        "Demonstrate that you seek feedback proactively",
        "Show how you help others with feedback",
        "Express gratitude for feedback",
      ],
    },
    followUpQuestions: [
      "How do you give feedback to others?",
      "Tell me about a time when you disagreed with feedback you received.",
    ],
    tags: ["feedback", "communication", "growth", "emotional intelligence"],
  },
  {
    id: "cf-006",
    question:
      "Describe a time when you had to lead a project or initiative without formal authority.",
    category: "leadership",
    difficulty: "hard",
    answer: {
      structure:
        "Explain the situation, your approach to leading without authority, the challenges you faced, and the outcomes achieved.",
      example:
        "When our team needed to improve our code review process, I took initiative to research best practices, created a proposal, and facilitated team discussions. I built consensus by involving everyone in the decision-making process and leading by example. The new process reduced bugs by 30% and improved team collaboration.",
      keyPoints: [
        "Show initiative and self-motivation",
        "Demonstrate influence without authority",
        "Highlight collaboration and consensus-building",
        "Show measurable results",
      ],
      tips: [
        "Focus on influence and persuasion skills",
        "Show how you built relationships",
        "Demonstrate problem-solving abilities",
        "Highlight team success over personal recognition",
      ],
    },
    followUpQuestions: [
      "How do you motivate team members who don't report to you?",
      "What leadership style do you prefer to work with?",
    ],
    tags: ["leadership", "influence", "initiative", "collaboration"],
  },
  {
    id: "cf-007",
    question:
      "How do you contribute to creating an inclusive and diverse work environment?",
    category: "diversity",
    difficulty: "medium",
    answer: {
      structure:
        "Explain your understanding of diversity and inclusion, provide specific examples of actions you've taken, and show your commitment to ongoing learning.",
      example:
        "I believe diversity strengthens teams and leads to better outcomes. I actively seek diverse perspectives in decision-making, use inclusive language in communications, and mentor colleagues from underrepresented backgrounds. I also participate in diversity training and advocate for inclusive hiring practices in my team.",
      keyPoints: [
        "Show understanding of diversity and inclusion",
        "Provide specific examples of actions taken",
        "Demonstrate ongoing commitment to learning",
        "Show awareness of your own biases",
      ],
      tips: [
        "Be specific about your actions",
        "Show genuine commitment, not just lip service",
        "Demonstrate awareness of privilege and bias",
        "Show how you create psychological safety",
      ],
    },
    followUpQuestions: [
      "How do you handle situations where you witness bias or discrimination?",
      "What steps do you take to ensure your work is accessible to everyone?",
    ],
    tags: ["diversity", "inclusion", "equity", "bias awareness"],
  },
  {
    id: "cf-008",
    question:
      "Tell me about a time when you had to communicate a complex technical concept to a non-technical audience.",
    category: "communication",
    difficulty: "medium",
    answer: {
      structure:
        "Describe the situation, your approach to simplifying the concept, the tools or methods you used, and the outcome.",
      example:
        "I had to explain our new API architecture to the marketing team. I used analogies (comparing APIs to restaurant menus), created visual diagrams, and focused on business benefits rather than technical details. I also prepared a simple demo and encouraged questions. The team understood the concept and became advocates for the new system.",
      keyPoints: [
        "Show ability to simplify complex concepts",
        "Demonstrate audience awareness",
        "Highlight use of analogies and visuals",
        "Show patience and willingness to explain",
      ],
      tips: [
        "Focus on the audience's needs and perspective",
        "Show creativity in communication methods",
        "Demonstrate patience and empathy",
        "Highlight the business value of clear communication",
      ],
    },
    followUpQuestions: [
      "How do you ensure your technical documentation is accessible?",
      "What's your approach to training non-technical team members?",
    ],
    tags: [
      "communication",
      "technical writing",
      "stakeholder management",
      "education",
    ],
  },
  {
    id: "cf-009",
    question: "How do you stay motivated during routine or repetitive tasks?",
    category: "values",
    difficulty: "easy",
    answer: {
      structure:
        "Explain your approach to finding meaning in routine work, provide specific strategies you use, and show how you maintain quality.",
      example:
        "I find motivation by connecting routine tasks to larger goals. For example, when writing tests, I focus on how they prevent bugs and improve user experience. I also gamify repetitive tasks by setting personal challenges, like improving efficiency or finding automation opportunities. I maintain quality by treating each task as an opportunity to learn and improve.",
      keyPoints: [
        "Show ability to find meaning in routine work",
        "Demonstrate strategies for maintaining motivation",
        "Highlight focus on quality and improvement",
        "Show connection to larger goals",
      ],
      tips: [
        "Be honest about the challenge of routine work",
        "Show creativity in finding motivation",
        "Demonstrate commitment to quality",
        "Show how you add value to routine tasks",
      ],
    },
    followUpQuestions: [
      "How do you approach tasks that don't align with your interests?",
      "What strategies do you use to maintain focus during long projects?",
    ],
    tags: ["motivation", "quality", "automation", "continuous improvement"],
  },
  {
    id: "cf-010",
    question:
      "Describe a situation where you had to make a difficult decision with limited information.",
    category: "values",
    difficulty: "hard",
    answer: {
      structure:
        "Explain the situation, your decision-making process, how you gathered available information, and the outcome of your decision.",
      example:
        "When our main server crashed during peak hours, I had to decide between a quick fix that might cause data loss or a longer solution that would extend downtime. I quickly consulted with the team, assessed the risks, and chose the longer solution to protect data integrity. I communicated the decision clearly to stakeholders and implemented the fix successfully.",
      keyPoints: [
        "Show decision-making under pressure",
        "Demonstrate risk assessment skills",
        "Highlight communication during crisis",
        "Show consideration of stakeholders",
      ],
      tips: [
        "Focus on your decision-making process",
        "Show how you gathered available information",
        "Demonstrate consideration of consequences",
        "Highlight communication and transparency",
      ],
    },
    followUpQuestions: [
      "How do you handle situations where there's no clear right answer?",
      "Tell me about a time when you had to make an unpopular decision.",
    ],
    tags: [
      "decision making",
      "crisis management",
      "risk assessment",
      "communication",
    ],
  },
];

export const getCultureFitQuestionsByCategory = (
  category: string,
): CultureFitQuestion[] => {
  return cultureFitQuestions.filter(
    (question) => question.category === category,
  );
};

export const getCultureFitQuestionById = (
  id: string,
): CultureFitQuestion | undefined => {
  return cultureFitQuestions.find((question) => question.id === id);
};

export const getRandomCultureFitQuestions = (
  count: number,
): CultureFitQuestion[] => {
  return shuffleArray(cultureFitQuestions).slice(0, count);
};

export const searchCultureFitQuestions = (
  query: string,
): CultureFitQuestion[] => {
  const lowercaseQuery = query.toLowerCase();
  return cultureFitQuestions.filter(
    (question) =>
      question.question.toLowerCase().includes(lowercaseQuery) ||
      question.answer.example.toLowerCase().includes(lowercaseQuery) ||
      question.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery)) ||
      question.category.toLowerCase().includes(lowercaseQuery),
  );
};

export const cultureFitCategories = [
  {
    id: "values",
    name: "Values & Ethics",
    icon: "🎯",
    description: "Core values and ethical decision-making",
  },
  {
    id: "teamwork",
    name: "Teamwork & Collaboration",
    icon: "🤝",
    description: "Working effectively with others",
  },
  {
    id: "leadership",
    name: "Leadership & Influence",
    icon: "👑",
    description: "Leading without authority and influencing others",
  },
  {
    id: "adaptability",
    name: "Adaptability & Change",
    icon: "🔄",
    description: "Handling change and uncertainty",
  },
  {
    id: "communication",
    name: "Communication",
    icon: "💬",
    description: "Clear and effective communication",
  },
  {
    id: "growth",
    name: "Growth & Learning",
    icon: "📈",
    description: "Continuous learning and development",
  },
  {
    id: "work-life",
    name: "Work-Life Balance",
    icon: "⚖️",
    description: "Maintaining healthy boundaries",
  },
  {
    id: "diversity",
    name: "Diversity & Inclusion",
    icon: "🌈",
    description: "Creating inclusive environments",
  },
];
