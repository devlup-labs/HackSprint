import { useState } from "react";
import { Button } from "./Button";

// MOVED OUTSIDE: The FormRow component is now defined here, outside of the main component.
// This prevents it from being re-created on every render, preserving input focus.
const FormRow = ({ label, required, children }) => (
  <div className="mb-6">
    <label className="block text-sm font-medium text-text-secondary mb-2">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
  </div>
);

export const RegistrationForm = ({ onBack, onSubmit }) => {
  const [formData, setFormData] = useState({
    fullName: "Ridham Shah (B24CS1064)", // Pre-filled or fetched from user profile
    location: "",
    contactNumber: "",
    experience: "",
    usedElk: "",
    genAiTech: {
      aiSearch: false,
      rag: false,
      kibana: false,
      agents: false,
      none: false,
    },
    elkUsage: "",
    workEmail: "",
    agreeTerms: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox" && name in formData.genAiTech) {
      setFormData((prev) => ({
        ...prev,
        genAiTech: { ...prev.genAiTech, [name]: checked },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.agreeTerms) {
      alert("You must agree to the Terms and Services.");
      return;
    }
    console.log("Form Submitted:", formData);
    // Pass data to parent component for actual submission
    onSubmit(formData);
    alert("Registration submitted successfully!");
  };
  
  // The FormRow component is no longer defined here.

  return (
    <div className="min-h-screen bg-[#101622] p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-3xl mx-auto bg-surface/60 backdrop-blur-sm border border-green-500 rounded-xl p-6 md:p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6 border-b border-green-500/20 pb-4">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Forge the Future</h1>
                <p className="text-sm text-text-secondary">ENDS ON: SEP 07, 2025, 11:59 PM IST (ASIA/KOLKATA)</p>
            </div>
            <button onClick={onBack} className="text-text-secondary hover:text-foreground">&times; Close</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <h3 className="text-lg font-semibold text-green-400 mb-4 border-b border-green-500/20 pb-2">PERSONAL DETAILS</h3>
          
          <FormRow label="Full Name" required>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full bg-[#0b0e1c] border border-green-500 rounded-md p-2 text-foreground focus:ring-2 focus:ring-green-400 outline-none" required />
          </FormRow>

          <div className="grid md:grid-cols-2 gap-6">
            <FormRow label="Current Location" required>
              <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full bg-[#0b0e1c] border border-green-500 rounded-md p-2 text-foreground focus:ring-2 focus:ring-green-400 outline-none" required />
            </FormRow>
            <FormRow label="Contact Number" required>
              <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleChange} className="w-full bg-[#0b0e1c] border border-green-500 rounded-md p-2 text-foreground focus:ring-2 focus:ring-green-400 outline-none" required />
            </FormRow>
          </div>

          <h3 className="text-lg font-semibold text-green-400 mt-8 mb-4 border-b border-green-500/20 pb-2">PROFESSIONAL DETAILS</h3>

          <FormRow label="Years of Work Experience" required>
            <select name="experience" value={formData.experience} onChange={handleChange} className="w-full bg-[#0b0e1c] border border-green-500 rounded-md p-2 text-foreground focus:ring-2 focus:ring-green-400 outline-none" required>
              <option value="">Select Number of Years</option>
              <option value="0-1">0-1 Years</option>
              <option value="1-3">1-3 Years</option>
              <option value="3-5">3-5 Years</option>
              <option value="5+">5+ Years</option>
            </select>
          </FormRow>
          
          <h3 className="text-lg font-semibold text-green-400 mt-8 mb-4 border-b border-green-500/20 pb-2">OTHER DETAILS</h3>

          <FormRow label="Have you worked with the ELK Stack before?" required>
            <select name="usedElk" value={formData.usedElk} onChange={handleChange} className="w-full bg-[#0b0e1c] border border-green-500 rounded-md p-2 text-foreground focus:ring-2 focus:ring-green-400 outline-none" required>
              <option value="">Please make a selection</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </FormRow>

          <FormRow label="What GenAI technologies are you working on?" required>
            <div className="space-y-2 text-foreground">
              {Object.keys(formData.genAiTech).map(tech => (
                <label key={tech} className="flex items-center gap-2">
                  <input type="checkbox" name={tech} checked={formData.genAiTech[tech]} onChange={handleChange} className="h-4 w-4 rounded bg-[#0b0e1c] border-green-500 text-green-500 focus:ring-green-400" />
                  <span>{tech === 'aiSearch' ? 'AI or Semantic search' : tech.charAt(0).toUpperCase() + tech.slice(1)}</span>
                </label>
              ))}
            </div>
          </FormRow>
          
          <FormRow label="What have you used the ELK Stack for in the past?">
            <textarea name="elkUsage" value={formData.elkUsage} onChange={handleChange} rows="3" placeholder="log analysis, real-time monitoring, search engine integration, etc" className="w-full bg-[#0b0e1c] border border-green-500 rounded-md p-2 text-foreground focus:ring-2 focus:ring-green-400 outline-none" />
          </FormRow>
          
          <FormRow label="Please help us with your work email address (Optional)">
            <input type="email" name="workEmail" value={formData.workEmail} onChange={handleChange} className="w-full bg-[#0b0e1c] border border-green-500 rounded-md p-2 text-foreground focus:ring-2 focus:ring-green-400 outline-none" />
          </FormRow>

          <div className="mt-8 text-center">
            <Button type="submit" className="bg-green-500 text-black font-bold px-8 py-3 hover:bg-green-400 transition-colors duration-300">
              SUBMIT
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};