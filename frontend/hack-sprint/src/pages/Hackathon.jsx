import { useState, useEffect } from "react";
import { HeroSection } from "../hackathon/Hero-section";
import { SidebarNav } from "../hackathon/Sidebar-nav";
import { ContentSection } from "../hackathon/Content-section";
import { SocialShare } from "../hackathon/Social-share";
import { RegistrationForm } from "../hackathon/RegistrationForm";

// --- DUMMY MODE ---
const USE_DUMMY_DATA = true;

const dummyHackathons = [
  {
    _id: "60d21b4667d0d8992e610c85",
    title: "AI-Powered Personal Finance Advisor",
    subTitle:
      "Build an intelligent app to help users manage their finances smarter and faster.",
    description:
      "The AI-Powered Personal Finance Advisor hackathon challenges participants to create innovative tools that bring financial literacy, automation, and personalized financial planning into everyone's hands. Whether it's budget tracking, investment insights, or debt management, your solution should simplify and empower financial decision-making.",
    submissions: [
      { team: "FinBot" },
      { team: "MoneyMinds" },
      { team: "CashFlow AI" },
      { team: "BudgetBuddies" },
      { team: "InvestAI" },
    ],
    startDate: new Date("2025-08-01T00:00:00.000Z"),
    endDate: new Date("2025-09-10T23:59:59.000Z"),
    status: true,
    difficulty: "Advanced",
    category: ["AI/ML", "FinTech", "Blockchain"],
    prizeMoney: 10000,
    techStackUsed: [
      "React",
      "Node.js",
      "Python",
      "TensorFlow",
      "Plaid API",
      "MongoDB",
      "Docker",
    ],
    about: `This hackathon is dedicated to empowering individuals with innovative financial solutions. Participants will dive into real-world financial challenges such as budgeting, credit score improvement, investment guidance, and fraud detection. The goal is to bring cutting-edge AI/ML into personal finance, helping people make smarter money choices. You'll also gain exposure to APIs widely used in FinTech, work with real datasets, and build solutions that can impact millions of users worldwide.

💡 What's in it for you?

Get showcased: The top 3 teams will have their ideas showcased at Elastic{ON} Bengaluru on September 24, in front of hundreds of tech leaders — including Elastic's Leadership.
Elite mentorship: One-on-one sessions with Elastic and AWS experts — get hands-on feedback from AI builders, solution architects, and tech veterans.
Get the spotlight: The top 3 teams will be featured on Elastic's global blog, reaching developers and innovators across the world.
₹6 Lakhs in prizes: Rewards plus visibility — a winning combo to fast-track your future.`,
    rules: `The hackathon is open to teams of 3-5 members, all of whom must be working professionals only. Basic knowledge of Elastic products and AWS LLM is recommended. Teams must be made up of no less than three (3) members and no more than five (5) members.
We do not require to form teams within the same organisation

You can either invite your friends to form a team or you can request other teams to add you as a member.

The idea proposal is an online activity and will start on Jul 18, 2025 05:30 PM IST (Asia/Kolkata) and end at Sep 07, 2025 11:59 PM IST (Asia/Kolkata).

The shortlisted participants will receive details about the venue and timings for the hackathon by 12th September 2025.

The online training for shortlisted participants will be conducted on 15th September 2025.

The shortlisted teams will be invited to Bengaluru for the finale on 18th September 2025.

There are 3 themes of the hackathon, you must submit a hack that is in one of these themes.

During the idea proposal phase you are allowed to edit/resubmit your proposal.

You are expected to come up with new and innovative ideas, any idea that has been copied from somewhere will be disqualified.

Your idea proposal must be developed entirely during the Hackathon duration. You may use open source libraries and other freely available systems / services such as Google Maps, Facebook Connect, Twitter feeds etc.

Please refer to Section 8. Intellectual Property of Hackathon Terms and Conditions for details on ownership.

Pursuant to Elastic's Anti-bribery and Gifts & Entertainment Policy, we ask that you provide a written acknowledgment via email confirming that you have reviewed the potential prize within your organisation and that its acceptance complies with the local anti-bribery laws and policies of your country and employing agency.

By participating in the hackathon, you agree to the terms and conditions of HackerEarth.`,
    judging: `Judging CriteriaSubmissions will be evaluated by a panel of experts from Elastic, AWS, and the developer community. Your solution will be judged on the following criteria:

Innovation (25%)

Novelty of the idea and its use of Generative AI. How original and forward-thinking is the concept?

Technical Implementation (30%)

Effective use of Elasticsearch and other relevant technologies. How well was the solution architected and built?

Impact (20%)

Practical applications and the potential to solve real-world problems. Does it address a meaningful challenge?

User Experience (15%)

Simplicity, design, and usability. Is the experience intuitive, accessible, and well-designed?

Presentation (10%)

Clarity of the demo and pitch. How well is the idea communicated and showcased?`,
    themes: `Hack-the-Impossible
Break logic. Bend rules. Build the unthinkable.

Making the Impossible, Possible. Use Elastic to build a solution that tackles a seemingly impossible challenge.
  
 
Hack-Life
Hack what matters — your mind, habits, and everyday chaos.

Build an innovative solution with Elastic to solve a day-to-day / life problem of your own.

 
Hack-to-the-Future
Build the tools we'll all use in 2030 — today.

Invent ahead of your time. Build solutions the future will thank you for.`,
    prizes: `Main Prizes:
 
Winner
INR 300000
 
1st Runner Up
INR 200000
 
2nd Runner Up
INR 100000`,
    submissionGuide: `To participate in Forge the Future, you'll need to submit a compelling idea that demonstrates your vision, technical depth, and alignment with the Hackathon theme.
Problem Statement

Clearly define the challenge you are addressing. What gap are you trying to bridge? Why does this problem matter?

Solution

Outline your proposed solution — how it works, what makes it effective, and how it will bring value to users, communities, or businesses. Highlight what's innovative about your idea.

Tech Stack

List the technologies you plan to use. Make sure to include how you'll incorporate Elastic — whether it's via Elasticsearch, Kibana, Elastic Observability, or other capabilities from Elastic's AI stack.

Guidelines for Idea Submission

Your idea must align with the Hackathon theme.
It should clearly articulate both the problem and the proposed solution.
Be specific about how Elastic technology will be used to power or enhance your solution.
This Idea Submission will form the foundation of your full project submission if selected for the Hackathon.
Think bold, build real. Let your imagination lead — but keep it rooted in real-world impact.`,
    faqs: [
      {
        question: "Can we do any pre-preparation before the hackathon?",
        answer: "No, you are only expected to start hacking on the hackathon day. However, data preparation is encouraged."
      },
      {
        question: "I already have data or an existing Elastic cluster, can I reuse that?",
        answer: "Yes, you can reuse it. We consider this part of data preparation. You will not be at a disadvantage if you don't have an existing one."
      },
      {
        question: "I do not have any technical background, can I join the hackathon?",
        answer: "At least one member of your team should have a technical background to be able to create an application using Elastic and Amazon Bedrock (and/or Foundation Models). You may find that a diverse team made of product managers or UX practitioners can be beneficial."
      },
      {
        question: "I'm a government employee or represent the government. Can I participate?",
        answer: "Pursuant to Elastic's Anti-bribery and Gifts & Entertainment Policy, we ask that you provide a written acknowledgment via email confirming that you have reviewed the potential prize within your organisation and that its acceptance complies with the local anti-bribery laws and policies of your country and employing agency."
      },
      {
        question: "Are we supposed to make our own travel and accommodation arrangements?",
        answer: "Yes, all participants will be handling their own travel and accommodation."
      },
      {
        question: "Do I need to pay any money to register for the Hackathon?",
        answer: "No. You do not have to pay anything to anyone to register yourself for any Hackathon on HackerEarth."
      },
      {
        question: "Do I need to have any specific qualifications to be a participant for the Hackathon?",
        answer: "If you love to code, you are more than welcome to participate in the Hackathon."
      },
      {
        question: "If it is a team submission, does that mean all team members will have access to work at the same time?",
        answer: "Yes, all team members can log in from their accounts and do application submission on HackerEarth."
      },
      {
        question: "Who will own the IP (Intellectual Property) Rights to the product that I have built?",
        answer: "Please refer to Section 8. Intellectual Property of Hackathon Terms and Conditions for details on ownership."
      }
    ]
  },
];

const Loader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-hero-primary"></div>
      <div
        className="absolute inset-0 w-16 h-16 border-4 border-dashed rounded-full animate-spin border-hero-secondary"
        style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
      ></div>
    </div>
  </div>
);

export default function HackathonDetails() {
  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("overview");

  // --- State for managing views ---
  const [view, setView] = useState("details"); // Can be 'details' or 'form'

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");
      await new Promise((r) => setTimeout(r, 600));
      if (USE_DUMMY_DATA) {
        const found = dummyHackathons[0];
        setHackathon(found);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  // --- Handlers for registration flow ---
  const handleRegister = () => {
    // This function will be called from the HeroSection component
    // when a logged-in and verified user clicks the register button
    setView("form");
  };
  
  const handleFormSubmit = async (formData) => {
    try {
      // In a real app, you'd send the data to a backend API here
      console.log("Submitting registration data to backend:", formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // After successful registration, go back to details view
      setView("details");
      
      // The HeroSection component will handle updating the registration status
      // through its own state management
      
    } catch (error) {
      console.error('Registration error:', error);
      // Handle error appropriately
    }
  };

  // --- Render logic ---
  if (loading) return <Loader />;
  
  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-destructive font-mono text-2xl p-8 text-center">
        {error}
      </div>
    );
    
  // Conditionally render the registration form
  if (view === "form") {
    return <RegistrationForm onBack={() => setView("details")} onSubmit={handleFormSubmit} />;
  }

  // Render the main hackathon details page
  return (
    <div className="min-h-screen bg-[#101622]">
      <HeroSection
        title={hackathon.title}
        subTitle={hackathon.subTitle}
        isActive={hackathon.status}
        startDate={hackathon.startDate}
        endDate={hackathon.endDate}
        participantCount={hackathon.submissions?.length || 0}
        prizeMoney={hackathon.prizeMoney}
        imageUrl="/assets/hackathon-banner.png"
        hackathonId={hackathon._id}
        onRegister={handleRegister}
      />

      <div className="flex">
        <SidebarNav
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
        <ContentSection activeSection={activeSection} hackathon={hackathon} />
        <SocialShare />
      </div>
    </div>
  );
}