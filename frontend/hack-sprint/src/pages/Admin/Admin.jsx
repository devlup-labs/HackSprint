import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Plus, Code, Trophy, Calendar, DollarSign, Users, BookOpen,
  Settings, CheckCircle, AlertCircle, Info, Star, FileText,
  Target, Award, Images, X, UploadCloud, ImagePlus, Trash2
} from 'lucide-react';
import { API } from '../../backendApis/api';

const ImageDropZone = ({ preview, onFileSelect, onClear, label = "Upload Image", accept = "image/*" }) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const processFile = (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('Image must be under 5MB.'); return; }
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) { alert('Invalid image format.'); return; }
    onFileSelect(file);
  };

  return !preview ? (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => { e.preventDefault(); setIsDragging(false); processFile(e.dataTransfer.files[0]); }}
      onClick={() => inputRef.current?.click()}
      className={`relative flex flex-col items-center justify-center gap-3 w-full h-40 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
        isDragging
          ? 'border-orange-400 bg-orange-400/10'
          : 'border-gray-600 bg-gray-800/40 hover:border-gray-500 hover:bg-gray-800/60'
      }`}
    >
      <UploadCloud className={`w-8 h-8 transition-colors ${isDragging ? 'text-orange-400' : 'text-gray-500'}`} />
      <div className="text-center">
        <p className="text-sm font-medium text-gray-300">{label}</p>
        <p className="text-xs text-gray-500 mt-1">Drag & drop or click to browse</p>
        <p className="text-xs text-gray-600 mt-0.5">JPEG, PNG, GIF, WEBP · Max 5MB</p>
      </div>
      <input ref={inputRef} type="file" className="sr-only" accept={accept} onChange={(e) => processFile(e.target.files[0])} />
    </div>
  ) : (
    <div className="relative group w-full h-40 rounded-xl overflow-hidden border border-gray-700/50">
      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
        <button type="button" onClick={() => inputRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs rounded-lg">
          <ImagePlus className="w-3.5 h-3.5" /> Replace
        </button>
        <button type="button" onClick={onClear} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 text-xs rounded-lg">
          <Trash2 className="w-3.5 h-3.5" /> Remove
        </button>
      </div>
      <input ref={inputRef} type="file" className="sr-only" accept={accept} onChange={(e) => processFile(e.target.files[0])} />
    </div>
  );
};

const GalleryUpload = ({ items, onAdd, onRemove }) => {
  const inputRef = useRef(null);
  const MAX = 10;

  const handleFiles = (files) => {
    const remaining = MAX - items.length;
    if (remaining <= 0) { alert('Maximum 10 gallery images allowed.'); return; }
    const toAdd = [];
    Array.from(files).slice(0, remaining).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) { alert(`${file.name} exceeds 5MB.`); return; }
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) { alert(`${file.name} is not a valid image.`); return; }
      toAdd.push({ file, url: URL.createObjectURL(file) });
    });
    if (toAdd.length) onAdd(toAdd);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
          <Images className="h-4 w-4 text-purple-400" />
          Gallery Images
          <span className="text-xs text-gray-500 font-normal">(optional · max {MAX})</span>
        </label>
        <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${
          items.length >= MAX
            ? 'bg-red-500/10 text-red-400 border-red-500/20'
            : 'bg-gray-700/50 text-gray-400 border-gray-600/30'
        }`}>{items.length}/{MAX}</span>
      </div>

      {items.length < MAX && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
          className="flex flex-col items-center justify-center gap-2 h-24 rounded-xl border-2 border-dashed border-gray-600 bg-gray-800/30 hover:border-purple-500/50 hover:bg-purple-500/5 cursor-pointer transition-all duration-200"
        >
          <Images className="w-5 h-5 text-gray-500" />
          <p className="text-xs text-gray-400">Click or drag images here · {MAX - items.length} remaining</p>
          <input ref={inputRef} type="file" className="sr-only" accept="image/jpeg,image/png,image/gif,image/webp" multiple onChange={(e) => handleFiles(e.target.files)} />
        </div>
      )}

      {items.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {items.map((item, i) => (
            <div key={i} className="relative group aspect-square">
              <img src={item.url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover rounded-lg border border-gray-700/50" />
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={10} />
              </button>
              <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] text-center py-0.5 rounded-b-lg">
                #{i + 1}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Admin = () => {
  const [activeTab, setActiveTab] = useState('devquest');

  const [devQuestForm, setDevQuestForm] = useState({
    points: '', question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: ''
  });

  const [hackathonForm, setHackathonForm] = useState({
    title: '', subTitle: '', description: '', startDate: '', endDate: '',
    refMaterial: '', difficulty: 'Intermediate', category: [], prizeMoney: '',
    techStackUsed: [], overview: '', themes: [], FAQs: [], teams: [], aboutUs: '',
    projectSubmission: [], TandCforHackathon: [], evaluationCriteria: [],
    registeredParticipants: [],
  });

  // Banner: single source of truth
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState('');

  // Gallery: single source of truth — array of { file, url }
  const [galleryItems, setGalleryItems] = useState([]);

  const [customCategory, setCustomCategory] = useState('');
  const [customTechStack, setCustomTechStack] = useState('');
  const [newFAQ, setNewFAQ] = useState({ question: '', answer: '' });
  const [newEvalCriteria, setNewEvalCriteria] = useState('');
  const [newTheme, setNewTheme] = useState('');
  const [newTandC, setNewTandC] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (bannerPreview) URL.revokeObjectURL(bannerPreview);
      galleryItems.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, []);

  const difficultyOptions = ['Expert', 'Advanced', 'Intermediate', 'Beginner'];
  const categoryOptions = ['Web Dev', 'AI/ML', 'Blockchain', 'IoT', 'Other'];
  const techStackOptions = [
    'React', 'Node.js', 'MongoDB', 'Socket.io', 'Python',
    'TensorFlow', 'OpenAI', 'FastAPI', 'Solidity', 'Web3.js',
    'IPFS', 'Arduino', 'PostgreSQL', 'Other'
  ];

  // ── Banner handlers ──────────────────────────────────────────────────────
  const handleBannerSelect = (file) => {
    if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const handleBannerClear = () => {
    if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    setBannerFile(null);
    setBannerPreview('');
  };

  // ── Gallery handlers ─────────────────────────────────────────────────────
  const handleGalleryAdd = (newItems) => setGalleryItems((prev) => [...prev, ...newItems]);

  const handleGalleryRemove = (index) => {
    setGalleryItems((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadGalleryImages = async (hackathonId) => {
    for (const item of galleryItems) {
      const fd = new FormData();
      fd.append('image', item.file);
      fd.append('caption', '');
      await API.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/hackathons/${hackathonId}/gallery`,
        fd,
        { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
    }
  };

  // ── DevQuest submit ──────────────────────────────────────────────────────
  const handleDevQuestSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    alert('DevQuest question added successfully!');
    setDevQuestForm({ points: '', question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' });
    setIsSubmitting(false);
  };

  // ── Hackathon submit ─────────────────────────────────────────────────────
  const handleHackathonSubmit = async (e) => {
    e.preventDefault();
    if (hackathonForm.category.length === 0) { alert("Please select at least one category."); return; }
    if (hackathonForm.techStackUsed.length === 0) { alert("Please select at least one tech."); return; }
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      Object.entries({
        title: hackathonForm.title, subTitle: hackathonForm.subTitle,
        description: hackathonForm.description, startDate: hackathonForm.startDate,
        endDate: hackathonForm.endDate, refMaterial: hackathonForm.refMaterial,
        difficulty: hackathonForm.difficulty, prizeMoney: hackathonForm.prizeMoney,
        overview: hackathonForm.overview, aboutUs: hackathonForm.aboutUs,
      }).forEach(([k, v]) => formData.append(k, v));

      ['category', 'techStackUsed', 'themes', 'FAQs', 'teams',
       'projectSubmission', 'TandCforHackathon', 'evaluationCriteria', 'registeredParticipants'
      ].forEach((field) => formData.append(field, JSON.stringify(hackathonForm[field])));

      formData.append('gallery', JSON.stringify([]));
      if (bannerFile) formData.append('image', bannerFile);

      const response = await API.post(`${import.meta.env.VITE_API_BASE_URL}/api/hackathons`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert(response.data.message || 'Hackathon created successfully!');

      if (galleryItems.length > 0 && response.data.hackathon?._id) {
        await uploadGalleryImages(response.data.hackathon._id);
      }

      // Reset
      setHackathonForm({
        title: '', subTitle: '', description: '', startDate: '', endDate: '',
        refMaterial: '', difficulty: 'Intermediate', category: [], prizeMoney: '',
        techStackUsed: [], overview: '', themes: [], FAQs: [], teams: [], aboutUs: '',
        projectSubmission: [], TandCforHackathon: [], evaluationCriteria: [], registeredParticipants: [],
      });
      handleBannerClear();
      galleryItems.forEach((item) => URL.revokeObjectURL(item.url));
      setGalleryItems([]);
      setCustomCategory(''); setCustomTechStack('');
      setNewFAQ({ question: '', answer: '' }); setNewEvalCriteria('');
      setNewTheme(''); setNewTandC('');
    } catch (error) {
      alert('Failed to create hackathon: ' + (error.response?.data?.error || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...devQuestForm.options];
    newOptions[index] = value;
    setDevQuestForm({ ...devQuestForm, options: newOptions });
  };

  const toggleArrayField = (field, value) => {
    const current = hackathonForm[field];
    if (value === 'Other') {
      if (current.includes('Other')) {
        setHackathonForm({ ...hackathonForm, [field]: current.filter((i) => i !== 'Other' && !i.startsWith('Custom: ')) });
        if (field === 'category') setCustomCategory('');
        if (field === 'techStackUsed') setCustomTechStack('');
      } else {
        setHackathonForm({ ...hackathonForm, [field]: [...current, 'Other'] });
      }
    } else {
      setHackathonForm({ ...hackathonForm, [field]: current.includes(value) ? current.filter((i) => i !== value) : [...current, value] });
    }
  };

  const handleCustomInput = (field, customValue) => {
    if (customValue.trim()) {
      const filtered = hackathonForm[field].filter((i) => !i.startsWith('Custom: '));
      setHackathonForm({ ...hackathonForm, [field]: [...filtered, `Custom: ${customValue.trim()}`] });
    }
  };

  const addFAQ = () => {
    if (newFAQ.question.trim() && newFAQ.answer.trim()) {
      setHackathonForm({ ...hackathonForm, FAQs: [...hackathonForm.FAQs, { ...newFAQ }] });
      setNewFAQ({ question: '', answer: '' });
    }
  };

  const addEvalCriteria = () => {
    if (newEvalCriteria.trim()) {
      setHackathonForm({ ...hackathonForm, evaluationCriteria: [...hackathonForm.evaluationCriteria, newEvalCriteria.trim()] });
      setNewEvalCriteria('');
    }
  };

  const addTheme = () => {
    if (newTheme.trim()) {
      setHackathonForm({ ...hackathonForm, themes: [...hackathonForm.themes, newTheme.trim()] });
      setNewTheme('');
    }
  };

  const addTandC = () => {
    if (newTandC.trim()) {
      setHackathonForm({ ...hackathonForm, TandCforHackathon: [...hackathonForm.TandCforHackathon, newTandC.trim()] });
      setNewTandC('');
    }
  };

  const removeFromArray = (field, index) => {
    setHackathonForm({ ...hackathonForm, [field]: hackathonForm[field].filter((_, i) => i !== index) });
  };

  const getDifficultyColor = (d) => ({ Advanced: 'text-red-400', Expert: 'text-red-800', Intermediate: 'text-yellow-400', Beginner: 'text-green-400' }[d] || 'text-gray-400');
  const getSelectedCount = (arr) => arr.length > 0 ? `(${arr.length} selected)` : '';

  const inputClass = "w-full px-4 py-4 bg-gray-800/80 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all duration-300 hover:border-gray-600";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="fixed inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-orange-500/5" />

      {/* Header */}
      <div className="relative bg-gray-900/90 backdrop-blur-xl border-b border-gray-800/50 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between h-auto sm:h-20 py-4 sm:py-0 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative p-2 sm:p-3 bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl shadow-lg">
                <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-gray-300" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Admin Dashboard</h1>
                <p className="text-xs sm:text-sm text-gray-400 mt-0.5">Manage your platform content</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 px-3 py-2 sm:px-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs sm:text-sm text-gray-300">Welcome back, Admin</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex space-x-2 bg-gray-900/60 p-2 rounded-xl backdrop-blur-sm border border-gray-800/50 shadow-lg">
          {[
            { key: 'devquest', label: 'DevQuest Questions', Icon: Code, color: 'blue' },
            { key: 'hackathon', label: 'Hackathons', Icon: Trophy, color: 'orange' },
          ].map(({ key, label, Icon, color }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`relative flex-1 flex items-center justify-center space-x-3 px-6 py-4 rounded-lg transition-all duration-300 font-medium overflow-hidden ${
                activeTab === key
                  ? `bg-gradient-to-r from-${color}-600 to-${color}-700 text-white shadow-lg shadow-${color}-500/25`
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/70'
              }`}
            >
              {activeTab === key && <div className={`absolute inset-0 bg-gradient-to-r from-${color}-600/20 to-${color}-700/20 animate-pulse`} />}
              <Icon className="h-5 w-5 relative z-10" />
              <span className="relative z-10">{label}</span>
              {activeTab === key && <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-${color}-400 to-${color}-600`} />}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── DevQuest tab ─────────────────────────────────────────────────── */}
        {activeTab === 'devquest' && (
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800/50 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600/10 to-blue-700/10 border-b border-gray-800/50 p-8">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg"><Code className="h-6 w-6 text-white" /></div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Add DevQuest Question</h2>
                  <p className="text-blue-300/80 mt-1">Create engaging coding challenges for developers</p>
                </div>
              </div>
            </div>
            <form onSubmit={handleDevQuestSubmit} className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-300"><Star className="h-4 w-4 text-yellow-400" /><span>Question Points</span></label>
                  <input type="number" required value={devQuestForm.points} onChange={(e) => setDevQuestForm({ ...devQuestForm, points: e.target.value })} className={inputClass.replace('orange', 'blue')} placeholder="Enter points" min="1" />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-300"><CheckCircle className="h-4 w-4 text-green-400" /><span>Correct Answer</span></label>
                  <select value={devQuestForm.correctAnswer} onChange={(e) => setDevQuestForm({ ...devQuestForm, correctAnswer: parseInt(e.target.value) })} className={inputClass.replace('orange', 'blue')}>
                    {[0, 1, 2, 3].map((i) => <option key={i} value={i}>Option {i + 1}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-300"><BookOpen className="h-4 w-4 text-blue-400" /><span>Question</span></label>
                <textarea required value={devQuestForm.question} onChange={(e) => setDevQuestForm({ ...devQuestForm, question: e.target.value })} rows={4} className={inputClass.replace('orange', 'blue') + " resize-none"} placeholder="Enter your question..." />
              </div>
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white">Answer Options</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {devQuestForm.options.map((option, index) => (
                    <div key={index} className="space-y-2">
                      <label className={`flex items-center space-x-2 text-sm font-semibold ${devQuestForm.correctAnswer === index ? 'text-green-400' : 'text-gray-300'}`}>
                        {devQuestForm.correctAnswer === index && <CheckCircle className="h-4 w-4" />}
                        <span>Option {index + 1} {devQuestForm.correctAnswer === index && '(Correct)'}</span>
                      </label>
                      <input type="text" required value={option} onChange={(e) => handleOptionChange(index, e.target.value)} className={`w-full px-4 py-4 bg-gray-800/80 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-300 hover:border-gray-600 ${devQuestForm.correctAnswer === index ? 'border-green-500/50 focus:border-green-500 focus:ring-green-500/30' : 'border-gray-700/50 focus:border-blue-500 focus:ring-blue-500/30'}`} placeholder={`Enter option ${index + 1}`} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-300"><AlertCircle className="h-4 w-4 text-yellow-400" /><span>Explanation (Optional)</span></label>
                <textarea value={devQuestForm.explanation} onChange={(e) => setDevQuestForm({ ...devQuestForm, explanation: e.target.value })} rows={3} className={inputClass.replace('orange', 'blue') + " resize-none"} placeholder="Provide an explanation..." />
              </div>
              <button type="submit" disabled={isSubmitting} className={`w-full px-6 py-5 rounded-xl font-semibold transition-all duration-300 transform flex items-center justify-center space-x-3 shadow-lg text-white ${isSubmitting ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:scale-[1.02] active:scale-[0.98]'}`}>
                {isSubmitting ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Adding...</span></> : <><Plus className="h-5 w-5" /><span>Add DevQuest Question</span></>}
              </button>
            </form>
          </div>
        )}

        {/* ── Hackathon tab ─────────────────────────────────────────────────── */}
        {activeTab === 'hackathon' && (
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800/50 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-orange-600/10 to-orange-700/10 border-b border-gray-800/50 p-8">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl shadow-lg"><Trophy className="h-6 w-6 text-white" /></div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Create Hackathon</h2>
                  <p className="text-orange-300/80 mt-1">Design exciting coding competitions for the community</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleHackathonSubmit} className="p-8 space-y-8">
              {/* Basic info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-300"><Trophy className="h-4 w-4 text-orange-400" /><span>Title</span></label>
                  <input type="text" required value={hackathonForm.title} onChange={(e) => setHackathonForm({ ...hackathonForm, title: e.target.value })} className={inputClass} placeholder="Enter hackathon title" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-300 block">Subtitle</label>
                  <input type="text" required value={hackathonForm.subTitle} onChange={(e) => setHackathonForm({ ...hackathonForm, subTitle: e.target.value })} className={inputClass} placeholder="Enter subtitle" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-300"><BookOpen className="h-4 w-4 text-orange-400" /><span>Description</span></label>
                <textarea required value={hackathonForm.description} onChange={(e) => setHackathonForm({ ...hackathonForm, description: e.target.value })} rows={4} className={inputClass + " resize-none"} placeholder="Describe the hackathon..." />
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-300"><Info className="h-4 w-4 text-blue-400" /><span>Overview</span></label>
                <textarea value={hackathonForm.overview} onChange={(e) => setHackathonForm({ ...hackathonForm, overview: e.target.value })} rows={3} className={inputClass + " resize-none"} placeholder="Provide an overview..." />
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-300"><Users className="h-4 w-4 text-purple-400" /><span>About Us</span></label>
                <textarea value={hackathonForm.aboutUs} onChange={(e) => setHackathonForm({ ...hackathonForm, aboutUs: e.target.value })} rows={3} className={inputClass + " resize-none"} placeholder="Tell participants about your organization..." />
              </div>

              {/* ── Banner Image ─────────────────────────────────────────── */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-300">
                  <FileText className="h-4 w-4 text-orange-400" /><span>Banner Image <span className="text-gray-500 font-normal">(optional)</span></span>
                </label>
                <ImageDropZone
                  preview={bannerPreview}
                  onFileSelect={handleBannerSelect}
                  onClear={handleBannerClear}
                  label="Upload Banner Image"
                />
              </div>

              {/* ── Gallery Images ───────────────────────────────────────── */}
              <div className="pt-2 border-t border-gray-700/50">
                <GalleryUpload
                  items={galleryItems}
                  onAdd={handleGalleryAdd}
                  onRemove={handleGalleryRemove}
                />
              </div>

              {/* Dates + Prize + Difficulty */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { label: 'Start Date', name: 'startDate', icon: Calendar, color: 'green' },
                  { label: 'End Date', name: 'endDate', icon: Calendar, color: 'red' },
                  { label: 'Prize Money', name: 'prizeMoney', icon: DollarSign, color: 'yellow', type: 'number' },
                ].map(({ label, name, icon: Icon, color, type = 'datetime-local' }) => (
                  <div key={name} className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-300"><Icon className={`h-4 w-4 text-${color}-400`} /><span>{label}</span></label>
                    <input type={type} required value={hackathonForm[name]} onChange={(e) => setHackathonForm({ ...hackathonForm, [name]: e.target.value })} className={inputClass} placeholder={type === 'number' ? 'Enter prize amount' : undefined} />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-300"><AlertCircle className="h-4 w-4 text-purple-400" /><span>Difficulty Level</span></label>
                  <select value={hackathonForm.difficulty} onChange={(e) => setHackathonForm({ ...hackathonForm, difficulty: e.target.value })} className={inputClass}>
                    {difficultyOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <p className={`text-sm font-medium ${getDifficultyColor(hackathonForm.difficulty)}`}>Current: {hackathonForm.difficulty}</p>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-300"><BookOpen className="h-4 w-4 text-blue-400" /><span>Reference Material URL</span></label>
                  <input type="url" required value={hackathonForm.refMaterial} onChange={(e) => setHackathonForm({ ...hackathonForm, refMaterial: e.target.value })} className={inputClass} placeholder="https://example.com/resources" />
                </div>
              </div>

              {/* Categories */}
              <CheckboxGroup label="Categories" icon={<Users className="h-4 w-4 text-blue-400" />} count={getSelectedCount(hackathonForm.category)} options={categoryOptions} selected={hackathonForm.category} onToggle={(v) => toggleArrayField('category', v)} showCustom={hackathonForm.category.includes('Other')} customValue={customCategory} onCustomChange={setCustomCategory} onCustomBlur={() => handleCustomInput('category', customCategory)} cols="grid-cols-2 md:grid-cols-4" />

              {/* Tech Stack */}
              <CheckboxGroup label="Tech Stack" icon={<Code className="h-4 w-4 text-green-400" />} count={getSelectedCount(hackathonForm.techStackUsed)} options={techStackOptions} selected={hackathonForm.techStackUsed} onToggle={(v) => toggleArrayField('techStackUsed', v)} showCustom={hackathonForm.techStackUsed.includes('Other')} customValue={customTechStack} onCustomChange={setCustomTechStack} onCustomBlur={() => handleCustomInput('techStackUsed', customTechStack)} cols="grid-cols-2 md:grid-cols-4 lg:grid-cols-6" small />

              {/* Themes */}
              <AddableList label="Themes" icon={<Target className="h-4 w-4 text-blue-400" />} count={hackathonForm.themes.length} value={newTheme} onChange={setNewTheme} onAdd={addTheme} items={hackathonForm.themes} onRemove={(i) => removeFromArray('themes', i)} placeholder="Enter a theme" />

              {/* FAQs */}
              <div className="space-y-4">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-300"><AlertCircle className="h-4 w-4 text-yellow-400" /><span>FAQs ({hackathonForm.FAQs.length})</span></label>
                <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" value={newFAQ.question} onChange={(e) => setNewFAQ({ ...newFAQ, question: e.target.value })} className="w-full px-4 py-3 bg-gray-800/80 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all" placeholder="FAQ Question" />
                    <input type="text" value={newFAQ.answer} onChange={(e) => setNewFAQ({ ...newFAQ, answer: e.target.value })} className="w-full px-4 py-3 bg-gray-800/80 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all" placeholder="FAQ Answer" />
                  </div>
                  <button type="button" onClick={addFAQ} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all flex items-center space-x-2"><Plus className="h-4 w-4" /><span>Add FAQ</span></button>
                  {hackathonForm.FAQs.length > 0 && (
                    <div className="space-y-3 mt-4">
                      {hackathonForm.FAQs.map((faq, i) => (
                        <div key={i} className="p-4 bg-gray-900/50 rounded-lg border border-gray-600/50 flex justify-between items-start">
                          <div className="flex-1"><p className="text-white font-medium text-sm">{faq.question}</p><p className="text-gray-300 text-xs mt-1">{faq.answer}</p></div>
                          <button type="button" onClick={() => removeFromArray('FAQs', i)} className="ml-3 text-red-400 hover:text-red-300 text-sm">Remove</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Eval Criteria */}
              <AddableList label="Evaluation Criteria" icon={<Award className="h-4 w-4 text-blue-400" />} count={hackathonForm.evaluationCriteria.length} value={newEvalCriteria} onChange={setNewEvalCriteria} onAdd={addEvalCriteria} items={hackathonForm.evaluationCriteria} onRemove={(i) => removeFromArray('evaluationCriteria', i)} placeholder="Enter evaluation criteria" />

              {/* T&C */}
              <AddableList label="Terms and Conditions" icon={<FileText className="h-4 w-4 text-red-400" />} count={hackathonForm.TandCforHackathon.length} value={newTandC} onChange={setNewTandC} onAdd={addTandC} items={hackathonForm.TandCforHackathon} onRemove={(i) => removeFromArray('TandCforHackathon', i)} placeholder="Enter terms and conditions" />

              <button type="submit" disabled={isSubmitting} className={`w-full px-6 py-5 rounded-xl font-semibold transition-all duration-300 transform flex items-center justify-center space-x-3 shadow-lg text-white ${isSubmitting ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 hover:scale-[1.02] active:scale-[0.98]'}`}>
                {isSubmitting ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Creating...</span></> : <><Plus className="h-5 w-5" /><span>Create Hackathon</span></>}
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 text-center">
        <p className="text-gray-500 text-sm">Admin Dashboard v2.0 - Built with ❤️ for developers</p>
      </div>
    </div>
  );
};

const CheckboxGroup = ({ label, icon, count, options, selected, onToggle, showCustom, customValue, onCustomChange, onCustomBlur, cols = "grid-cols-2 md:grid-cols-4", small }) => (
  <div className="space-y-4">
    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-300">{icon}<span>{label} {count}</span></label>
    <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
      <div className={`grid ${cols} gap-3`}>
        {options.map((opt) => (
          <label key={opt} className="flex items-center space-x-2 cursor-pointer group p-2 rounded-lg hover:bg-gray-700/30 transition-all">
            <div className="relative">
              <input type="checkbox" checked={selected.includes(opt)} onChange={() => onToggle(opt)} className="w-4 h-4 text-orange-600 bg-gray-700 border-gray-600 rounded focus:ring-orange-500 focus:ring-2" />
              {selected.includes(opt) && <CheckCircle className="absolute -top-1 -right-1 w-2.5 h-2.5 text-green-400" />}
            </div>
            <span className={`text-gray-300 group-hover:text-white transition-colors font-medium ${small ? 'text-xs' : 'text-sm'}`}>{opt}</span>
          </label>
        ))}
      </div>
      {showCustom && (
        <div className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-gray-600/50">
          <input type="text" value={customValue} onChange={(e) => onCustomChange(e.target.value)} onBlur={onCustomBlur} onKeyPress={(e) => e.key === 'Enter' && onCustomBlur()} className="w-full px-4 py-3 bg-gray-800/80 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30" placeholder="Enter custom value..." required />
        </div>
      )}
    </div>
  </div>
);

const AddableList = ({ label, icon, count, value, onChange, onAdd, items, onRemove, placeholder }) => (
  <div className="space-y-4">
    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-300">{icon}<span>{label} ({count})</span></label>
    <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50 space-y-4">
      <div className="flex gap-4">
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), onAdd())} className="flex-1 px-4 py-3 bg-gray-800/80 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all" placeholder={placeholder} />
        <button type="button" onClick={onAdd} className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all flex items-center space-x-2"><Plus className="h-4 w-4" /><span>Add</span></button>
      </div>
      {items.length > 0 && (
        <div className="space-y-2 mt-4">
          {items.map((item, i) => (
            <div key={i} className="p-3 bg-gray-900/50 rounded-lg border border-gray-600/50 flex justify-between items-center">
              <span className="text-gray-300 text-sm">{item}</span>
              <button type="button" onClick={() => onRemove(i)} className="text-red-400 hover:text-red-300 text-sm">Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

export default Admin;