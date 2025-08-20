import { useState } from "react";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Clock, Calendar, Code, Users, ChevronDown, ChevronRight } from "lucide-react";

export const ContentSection = ({ activeSection, hackathon }) => {
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const formatDateTime = (date) =>
    new Date(date).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const SectionCard = ({ children, className = "" }) => (
    <div
      className={`bg-gradient-to-br from-green-500/10 to-green-400/5 border-green-500 backdrop-blur-sm rounded-xl border border-green-500 p-6 ${className}`}
    >
      {children}
    </div>
  );

  const toggleFAQ = (index) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <div className="space-y-8">
            {/* description */}
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-text-primary leading-relaxed">
                {hackathon.description}
              </p>
            </div>

            {/* timeline */}
            <SectionCard>
              <h4 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2  border-green-100">
                <Clock className="w-5 h-5 text-green-400" />
                Event Timeline
              </h4>
              <div className="space-y-4  border-green-500">
                <div className="flex items-start gap-4">
                  <div className="w-3 h-3 bg-green-400 rounded-full mt-2 shadow-lg shadow-green-400/50"></div>
                  <div>
                    <div className="font-medium text-foreground">
                      Registration & Start
                    </div>
                    <div className="text-text-secondary">
                      {formatDateTime(hackathon.startDate)}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full mt-2 shadow-lg shadow-green-500/50"></div>
                  <div>
                    <div className="font-medium text-foreground">
                      Submission Deadline
                    </div>
                    <div className="text-text-secondary">
                      {formatDateTime(hackathon.endDate)}
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* key info cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <SectionCard className="bg-gradient-to-br from-green-500/10 to-green-400/5 border-green-100">
                <h4 className="font-bold text-blue-400 mb-3 flex items-center gap-2">
                  <Code className="w-5 h-5 text-green-400" />
                  Difficulty Level
                </h4>
                <Badge className="bg-green-500/20 text-green-400 border-green-100">
                  {hackathon.difficulty}
                </Badge>
              </SectionCard>

              <SectionCard className="bg-gradient-to-br from-green-500/10 to-green-400/5 border-green-100">
                <h4 className="font-bold text-blue-400 mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-400" />
                  Categories
                </h4>
                <div className="flex flex-wrap gap-2">
                  {hackathon.category?.map((cat, i) => (
                    <Badge
                      key={i}
                      className="bg-green-500/20 text-green-400 border-green-100"
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
              </SectionCard>
            </div>

            {/* tech stack */}
            <SectionCard>
              <h4 className="text-xl font-bold text-blue-400 mb-4">
                Recommended Tech Stack
              </h4>
              <div className="flex flex-wrap gap-3">
                {hackathon.techStackUsed?.map((tech, i) => (
                  <span
                    key={i}
                    className="bg-surface text-text-primary border border-green-500 px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-500/10 transition-colors duration-200"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </SectionCard>
          </div>
        );

      case "themes":
        return (
          <div className="space-y-6">
            <div className="prose prose-lg max-w-none">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Event Themes
              </h3>
              <div className="bg-gradient-to-r from-green-500/10 to-green-400/10 border border-green-500 rounded-xl p-6">
                <p className="text-lg text-blue-400 text-bold whitespace-pre-line">
                  {hackathon.themes || "No themes information provided."}
                </p>
              </div>
            </div>
          </div>
        );

      case "prizes":
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Prize Distribution
            </h3>
            <div className="bg-gradient-to-br from-green-500/10 to-green-400/10 border border-green-500 rounded-xl p-6">
              <div className="text-lg text-blue-400 whitespace-pre-line">
                {hackathon.prizes || "No prize information provided."}
              </div>
            </div>
          </div>
        );

      case "submission-guide":
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              How to Submit
            </h3>
            <SectionCard>
              <div className="text-blue-400 whitespace-pre-line leading-relaxed">
                {hackathon.submissionGuide || "No submission guide provided."}
              </div>
            </SectionCard>
          </div>
        );

      case "judging":
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Judging Criteria
            </h3>
            <SectionCard>
              <div className="text-blue-400 leading-relaxed">
                {hackathon.judging || "No judging criteria provided."}
              </div>
            </SectionCard>
          </div>
        );

      case "rules":
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Rules & Guidelines
            </h3>
            <SectionCard>
              <div className="text-blue-400 whitespace-pre-line leading-relaxed">
                {hackathon.rules || "No rules provided."}
              </div>
            </SectionCard>
          </div>
        );

      case "faqs":
        const faqs = hackathon.faqs || [];

        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h3>
            <div className="space-y-4">
              {faqs.length > 0 ? (
                faqs.map((faq, idx) => {
                  const isExpanded = expandedFAQ === idx;
                  
                  return (
                    <div key={idx} className="border border-green-500 rounded-lg bg-[#0b0e1c] overflow-hidden">
                      <button
                        onClick={() => toggleFAQ(idx)}
                        className="w-full p-4 text-left hover:bg-green-500/5 transition-colors duration-200 flex items-center justify-between group"
                      >
                        <p className="font-semibold text-lg text-blue-400 pr-4">
                          {faq.question}
                        </p>
                        <div className="flex-shrink-0 text-green-400 group-hover:text-green-300 transition-colors duration-200">
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronRight className="w-5 h-5" />
                          )}
                        </div>
                      </button>
                      
                      {isExpanded && faq.answer && (
                        <div className="px-4 pb-4 border-t border-green-500/30">
                          <p className="text-white leading-relaxed pt-3">
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-text-secondary">No FAQs provided.</p>
              )}
            </div>
          </div>
        );

      case "about":
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              About This Event
            </h3>
            <SectionCard className="bg-gradient-to-br from-surface/50 to-green-500/5 border-green-500">
              <div className="text-blue-400 whitespace-pre-line leading-relaxed">
                {hackathon.about || "No about information provided."}
              </div>
            </SectionCard>
          </div>
        );

      case "discussion":
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-blue-400 mb-4">
              Community Discussion
            </h3>
            <div className="bg-surface/50 backdrop-blur-sm border border-green-500 rounded-xl p-8 text-center">
              <div className="text-text-secondary mb-4">
                <Users className="w-16 h-16 mx-auto mb-4 text-green-400/50" />
                <p className="text-lg">
                  Join the conversation with fellow participants!
                </p>
                <p className="text-sm mt-2">Discussion feature coming soon...</p>
              </div>
              <Button className="border border-green-500 text-green-400 hover:bg-green-500/10">
                Join Discord Community
              </Button>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <p className="text-text-secondary">Section not found.</p>
          </div>
        );
    }
  };

  return (
    <main className="flex-1 p-6 md:p-8 bg-background">
      <div className="max-w-5xl mx-auto">{renderContent()}</div>
    </main>
  );
};