// Master list of skills people can add to their profile, grouped by field.
// Seeded idempotently on boot (skills.service ensureSeeded) — adding an entry
// here and restarting is all it takes to extend the catalog. The eight
// legacy free-form skills the old dashboard offered are kept so existing
// profiles stay valid.
export const SKILL_CATALOG = {
  "Software Development": [
    "Python", "Java", "JavaScript", "TypeScript", "C", "C++", "C#", "Go", "Rust",
    "Kotlin", "Swift", "PHP", "Ruby", "Scala", "Dart", "R", "MATLAB", "Bash / Shell",
    "Data Structures & Algorithms", "DSA", "Object-Oriented Programming",
    "System Design", "Design Patterns", "Competitive Programming", "Operating Systems",
    "Computer Networks", "Compilers", "Embedded Systems", "Low-Level Programming",
    "Software Testing", "Unit Testing", "Test Automation", "Code Review",
    "Git & GitHub", "Agile / Scrum", "Microservices", "REST API Design",
    "GraphQL", "WebSockets", "Websockets", "Backend", "Backend Development",
  ],
  "Web Development": [
    "Frontend", "Frontend Development", "Full-Stack Development", "HTML", "CSS",
    "Tailwind CSS", "Sass", "React", "Next.js", "Vue.js", "Nuxt.js", "Angular",
    "Svelte", "Redux", "Node.js", "Express.js", "NestJS", "Django", "Flask",
    "FastAPI", "Spring Boot", "Laravel", "Ruby on Rails", "ASP.NET", "Three.js",
    "WebGL", "Web Performance", "Progressive Web Apps", "Webpack / Vite",
    "Web Accessibility", "WordPress", "Shopify", "Webflow",
  ],
  "Mobile Development": [
    "Android Development", "iOS Development", "React Native", "Flutter",
    "SwiftUI", "Jetpack Compose", "Ionic", "Xamarin", "Mobile UI Design",
    "App Store Optimization",
  ],
  "AI / Machine Learning": [
    "Machine Learning", "Deep Learning", "Neural Networks", "Natural Language Processing",
    "Computer Vision", "Reinforcement Learning", "Generative AI", "Large Language Models",
    "Prompt Engineering", "LangChain", "RAG (Retrieval-Augmented Generation)",
    "TensorFlow", "PyTorch", "Keras", "Scikit-learn", "Hugging Face", "OpenCV",
    "MLOps", "Model Deployment", "Feature Engineering", "AI Ethics", "Speech Recognition",
    "Recommendation Systems", "Time Series Forecasting", "AutoML",
  ],
  "Data Science & Analytics": [
    "Data Analysis", "Data Science", "Data Visualization", "Statistics", "Probability",
    "Pandas", "NumPy", "Matplotlib", "Tableau", "Power BI", "Looker", "Excel",
    "Advanced Excel", "Google Sheets", "SQL", "A/B Testing", "Business Intelligence",
    "Data Mining", "Data Cleaning", "ETL", "Big Data", "Apache Spark", "Hadoop",
    "Apache Kafka", "Airflow", "dbt", "Data Engineering", "Data Warehousing",
    "Web Scraping",
  ],
  Databases: [
    "MongoDB", "PostgreSQL", "MySQL", "SQLite", "Redis", "Firebase", "Supabase",
    "Elasticsearch", "Cassandra", "DynamoDB", "Neo4j", "Oracle Database",
    "Database Design", "Query Optimization", "Prisma", "Mongoose",
  ],
  "DevOps & Cloud": [
    "DevOps", "Docker", "Kubernetes", "AWS", "Google Cloud Platform", "Microsoft Azure",
    "Terraform", "Ansible", "Jenkins", "GitHub Actions", "CI/CD", "Linux Administration",
    "Nginx", "Prometheus", "Grafana", "Site Reliability Engineering", "Serverless",
    "Cloud Architecture", "Infrastructure as Code", "Monitoring & Observability",
    "Load Balancing", "Vercel", "Netlify", "Cloudflare",
  ],
  Cybersecurity: [
    "Cybersecurity", "Ethical Hacking", "Penetration Testing", "Network Security",
    "Application Security", "Cryptography", "Malware Analysis", "Digital Forensics",
    "Security Operations (SOC)", "Threat Modeling", "OWASP", "Cloud Security",
    "Identity & Access Management", "Incident Response", "Capture The Flag (CTF)",
    "Reverse Engineering",
  ],
  "Blockchain & Web3": [
    "Blockchain", "Solidity", "Smart Contracts", "Ethereum", "Web3.js", "Hardhat",
    "DeFi", "NFTs", "Zero-Knowledge Proofs", "Rust for Blockchain",
  ],
  "IoT, Hardware & Robotics": [
    "Internet of Things", "Arduino", "Raspberry Pi", "Robotics", "ROS",
    "PCB Design", "Circuit Design", "FPGA", "3D Printing", "CAD", "Drones",
    "Sensors & Actuators", "Embedded C",
  ],
  "Game Development": [
    "Game Development", "Unity", "Unreal Engine", "Godot", "Game Design",
    "3D Modeling", "Blender", "Shader Programming", "Level Design",
  ],
  "UI / UX & Design": [
    "UI Design", "UX Design", "UX Research", "Figma", "Adobe XD", "Wireframing",
    "Prototyping", "Design Systems", "Interaction Design", "Graphic Design",
    "Adobe Photoshop", "Adobe Illustrator", "Adobe After Effects", "Motion Design",
    "Video Editing", "Canva", "Brand Identity", "Typography", "Illustration",
    "Product Design",
  ],
  "Product Management": [
    "Product Management", "Product Strategy", "Roadmapping", "User Stories",
    "Product Analytics", "Market Research", "Competitive Analysis", "Go-To-Market",
    "Jira", "Backlog Prioritization", "Customer Discovery", "Product-Led Growth",
  ],
  "Business & Strategy": [
    "Business Strategy", "Business Development", "Business Analysis", "Entrepreneurship",
    "Startup Fundamentals", "Business Modeling", "Pitching", "Fundraising",
    "Financial Modeling", "Market Analysis", "Consulting", "Strategic Planning",
    "Negotiation", "Partnerships", "Business Communication", "Case Studies",
  ],
  "Management & Leadership": [
    "Project Management", "Program Management", "Team Leadership", "People Management",
    "Stakeholder Management", "Risk Management", "Change Management", "Time Management",
    "Decision Making", "Conflict Resolution", "Mentoring", "Coaching", "OKRs",
    "Resource Planning", "PMP", "Kanban", "Lean Six Sigma", "Operations Management",
    "Delegation", "Strategic Thinking",
  ],
  "Human Resources": [
    "Human Resources", "Talent Acquisition", "Recruitment", "Technical Recruiting",
    "Onboarding", "Employee Engagement", "Performance Management", "Compensation & Benefits",
    "HR Analytics", "Learning & Development", "Organizational Development",
    "Employer Branding", "Payroll", "Labor Law Basics", "Diversity & Inclusion",
    "HR Operations", "Workforce Planning", "Culture Building",
  ],
  "Marketing & Growth": [
    "Digital Marketing", "Content Marketing", "SEO", "SEM", "Social Media Marketing",
    "Email Marketing", "Performance Marketing", "Growth Hacking", "Brand Management",
    "Copywriting", "Influencer Marketing", "Marketing Analytics", "Google Analytics",
    "Community Management", "Public Relations", "Event Marketing", "Affiliate Marketing",
    "Marketing Automation", "CRM (HubSpot / Salesforce)",
  ],
  "Sales & Customer Success": [
    "Sales", "B2B Sales", "Inside Sales", "Account Management", "Lead Generation",
    "Cold Outreach", "Customer Success", "Customer Support", "Sales Enablement",
    "Solution Selling", "Client Relationship Management",
  ],
  "Finance & Accounting": [
    "Finance", "Accounting", "Financial Analysis", "Budgeting", "Bookkeeping",
    "Investment Analysis", "Valuation", "Taxation", "Auditing", "Venture Capital",
    "Financial Planning", "Tally", "Fintech",
  ],
  "Operations & Supply Chain": [
    "Supply Chain Management", "Logistics", "Procurement", "Inventory Management",
    "Process Improvement", "Quality Assurance", "Vendor Management", "Operations Research",
  ],
  "Content & Communication": [
    "Technical Writing", "Content Writing", "Blogging", "Storytelling", "Public Speaking",
    "Presentation Skills", "Video Production", "Podcasting", "Photography",
    "Documentation", "Research Writing", "Translation", "Journalism",
  ],
  "Legal, Policy & Research": [
    "Legal Research", "Intellectual Property", "Data Privacy & GDPR", "Contract Drafting",
    "Compliance", "Public Policy", "Academic Research", "Grant Writing",
  ],
  "Education & Healthcare Tech": [
    "EdTech", "Curriculum Design", "Teaching", "Instructional Design",
    "HealthTech", "Bioinformatics", "Medical Imaging", "Clinical Research",
  ],
  "Soft Skills": [
    "Communication", "Teamwork", "Problem Solving", "Critical Thinking", "Creativity",
    "Adaptability", "Leadership", "Emotional Intelligence", "Networking", "Design Thinking",
    "Collaboration", "Self-Learning",
  ],
};

export const flattenSkillCatalog = () =>
  Object.entries(SKILL_CATALOG).flatMap(([category, names]) =>
    names.map((name) => ({ name, category }))
  );
