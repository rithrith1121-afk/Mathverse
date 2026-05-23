export interface MathLevel {
  id: string;
  name: string;
  badge: "Basic" | "Intermediate" | "Advanced" | "Expert" | "Applied" | "Quantum";
  badgeColor: string;
  description: string;
  progress: number; // 0 to 100
  topics: string[];
  icon: string; // lucide icon name
}

export interface UserState {
  email: string | null;
  currentLevel: MathLevel | null;
  onboarded: boolean;
  score: number;
  solvedProblems: number;
}

export interface SolvedProblem {
  id: string;
  problemText: string;
  solution: string;
  level: string;
  timestamp: string;
}

export interface PracticeQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export const mathLevels: MathLevel[] = [
  {
    id: "class-1-5",
    name: "Class 1-5",
    badge: "Basic",
    badgeColor: "text-primary bg-primary/10 border-primary/20",
    description: "Foundation, Arithmetic, Basic Geometry",
    progress: 25,
    topics: ["Addition & Subtraction", "Multiplication Table", "Fractions", "Simple Shapes", "Measurements"],
    icon: "calculate"
  },
  {
    id: "class-6-8",
    name: "Class 6-8",
    badge: "Intermediate",
    badgeColor: "text-[rgb(225,182,255)] bg-[rgba(225,182,255,0.1)] border-[rgba(225,182,255,0.2)]",
    description: "Pre-Algebra, Statistics, Ratios",
    progress: 0,
    topics: ["Ratios & Proportions", "Negative Numbers", "Linear Equations", "Simple Probability", "Exponents"],
    icon: "architecture"
  },
  {
    id: "class-9-10",
    name: "Class 9-10",
    badge: "Advanced",
    badgeColor: "text-[rgb(225,182,255)] bg-[rgba(225,182,255,0.1)] border-[rgba(225,182,255,0.2)]",
    description: "Algebra, Trigonometry, Probability",
    progress: 0,
    topics: ["Quadratic Equations", "Trigonometric Identities", "Similarity & Congruence", "Statistics", "Polynomials"],
    icon: "functions"
  },
  {
    id: "class-11-12",
    name: "Class 11-12",
    badge: "Expert",
    badgeColor: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    description: "Calculus, Vectors, 3D Geometry",
    progress: 0,
    topics: ["Limits & Derivatives", "Integrals", "Three Dimensional Geometry", "Permutations", "Complex Numbers"],
    icon: "timeline"
  },
  {
    id: "diploma",
    name: "Diploma",
    badge: "Applied",
    badgeColor: "text-[rgb(0,220,224)] bg-[rgba(0,220,224,0.1)] border-[rgba(0,220,224,0.2)]",
    description: "Applied Mathematics, Technical Calculus",
    progress: 0,
    topics: ["Applied Limits", "Numerical Methods", "Fourier Series", "Complex Analysis", "Vector Calculus"],
    icon: "school"
  },
  {
    id: "eng-math",
    name: "Engineering Mathematics",
    badge: "Quantum",
    badgeColor: "text-[#00FBFF] bg-[#00FBFF]/10 border-[#00FBFF]/30",
    description: "Differential Equations, Linear Algebra, Transforms",
    progress: 0,
    topics: ["Matrices & Eigenvalues", "Laplace Transforms", "Partial Differential Equations", "Multiple Integrals", "Z-Transforms"],
    icon: "memory"
  }
];
