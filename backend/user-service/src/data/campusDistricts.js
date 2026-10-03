import { SKILL_CATALOG } from "./skillCatalog.js";

// The "buildings" on the People campus. Each one is a field, made of one or
// more skill-catalog categories; a person lives in a building when they have
// at least one skill from its categories.
const DEFINITIONS = [
  {
    id: "dev-quarter",
    name: "Dev Quarter",
    tagline: "Web, mobile, backend and games — where things get built.",
    categories: ["Software Development", "Web Development", "Mobile Development", "Game Development"],
  },
  {
    id: "ai-lab",
    name: "AI Lab",
    tagline: "Models, data and everything that learns.",
    categories: ["AI / Machine Learning", "Data Science & Analytics"],
  },
  {
    id: "robotics-workshop",
    name: "Robotics Workshop",
    tagline: "Hardware, IoT and robots you can actually touch.",
    categories: ["IoT, Hardware & Robotics"],
  },
  {
    id: "design-studio",
    name: "Design Studio",
    tagline: "UI, UX and the craft of making things feel good.",
    categories: ["UI / UX & Design"],
  },
  {
    id: "product-boardroom",
    name: "Product Boardroom",
    tagline: "Product, strategy, growth and leading teams.",
    categories: ["Product Management", "Business & Strategy", "Management & Leadership", "Marketing & Growth"],
  },
  {
    id: "cloud-vault",
    name: "Cloud & Security Vault",
    tagline: "Infrastructure, databases, security and Web3.",
    categories: ["DevOps & Cloud", "Databases", "Cybersecurity", "Blockchain & Web3"],
  },
];

export const CAMPUS_DISTRICTS = DEFINITIONS.map((d) => ({
  ...d,
  skills: d.categories.flatMap((c) => SKILL_CATALOG[c] || []),
}));

export const getDistrict = (id) => CAMPUS_DISTRICTS.find((d) => d.id === id);
