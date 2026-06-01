import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Activity, User as UserIcon, Sparkles, AlertTriangle, ArrowLeft } from 'lucide-react';
import axios from 'axios';

const ScriptInsights = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [script, setScript] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (token) {
      axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        setUserRole(res.data.user.role);
      }).catch(err => console.error('Role fetch failed', err));
    }
    fetchScript();
  }, [id]);

  const fetchScript = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/scripts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const match = response.data.find(s => s.id === parseInt(id));
      if (match) {
        setScript(match);
      } else {
        setError('Script not found.');
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch script.');
      setLoading(false);
    }
  };

  const handleGenerateAiReview = async () => {
    setAiGenerating(true);
    setAiError('');
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/scripts/${id}/ai-review`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Update local state
      setScript({ ...script, aiReview: response.data.review });
      setAiGenerating(false);
    } catch (err) {
      let errorMessage = err.response?.data?.message || 'Failed to generate review.';
      try {
        if (errorMessage.includes('{')) {
          const jsonStr = errorMessage.substring(errorMessage.indexOf('{'));
          const parsed = JSON.parse(jsonStr);
          if (parsed.error && parsed.error.message) {
            errorMessage = parsed.error.message;
          }
        }
      } catch(e) {}
      
      setAiError(errorMessage);
      setAiGenerating(false);
    }
  };

  const isManagement = userRole === 'Admin' || userRole === 'Staff';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-theme-text-muted">
        Loading insights...
      </div>
    );
  }

  if (error || !script) {
    return (
      <div className="py-10 text-center space-y-4">
        <p className="text-red-400 font-bold">{error}</p>
        <button onClick={() => navigate('/dashboard/scripts')} className="text-theme-accent hover:underline">Back to Scripts</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-theme-border-light">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard/scripts')}
            className="p-2 bg-theme-input-bg hover:bg-theme-input-bg-hover rounded-full transition-colors text-theme-text"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-theme-text flex items-center gap-2">
              <Sparkles className="text-indigo-400" size={24} /> 
              AI Insights
            </h2>
            <p className="text-sm text-theme-text-muted mt-1">Analysis for: <span className="font-semibold text-theme-text">{script.title}</span></p>
          </div>
        </div>
      </div>

      {aiError && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-5 rounded-lg text-sm mb-6 flex items-start gap-4 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
          <AlertTriangle size={20} className="shrink-0 mt-0.5 text-red-500" />
          <div>
            <h4 className="font-bold text-red-500 mb-1">Analysis Failed</h4>
            <p className="opacity-90 leading-relaxed font-medium">{aiError}</p>
          </div>
        </div>
      )}

      {script.aiReview ? (
        <div className="space-y-8">
          <div>
            <h4 className="text-sm font-bold text-indigo-400 mb-3 flex items-center gap-2">
              <FileText size={16}/> Summary
            </h4>
            <p className="text-base text-theme-text leading-relaxed bg-theme-input-bg p-6 rounded-lg border border-theme-border-light shadow-sm">
              {script.aiReview.summary}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-bold text-indigo-400 mb-3 flex items-center gap-2">
              <Activity size={16}/> Tone & Genre
            </h4>
            <div className="inline-block bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 px-4 py-2 rounded-full text-sm font-bold border border-indigo-500/20 shadow-sm">
              {script.aiReview.tone}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold text-indigo-400 mb-3 flex items-center gap-2">
              <UserIcon size={16}/> Characters
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {script.aiReview.characters?.map((char, idx) => (
                <div key={idx} className="bg-theme-input-bg p-4 rounded-lg border border-theme-border-light shadow-sm">
                  <div className="font-bold text-base text-theme-text mb-2">{char.name}</div>
                  <div className="text-sm text-theme-text-muted leading-relaxed">{char.description}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold text-indigo-400 mb-3 flex items-center gap-2">
              <Sparkles size={16}/> AI Feedback
            </h4>
            <p className="text-base text-theme-text leading-relaxed bg-theme-input-bg p-6 rounded-lg border border-theme-border-light italic shadow-sm">
              "{script.aiReview.feedback}"
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-theme-input-bg rounded-xl border border-theme-border-light shadow-sm">
          <div className="w-20 h-20 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center mb-6">
            <Sparkles size={40} />
          </div>
          <h4 className="text-xl font-bold text-theme-text mb-3">No Insights Generated</h4>
          <p className="text-base text-theme-text-muted max-w-md mx-auto mb-10 leading-relaxed">
            {isManagement ? "This script hasn't been analyzed yet. Run the AI to extract a plot summary, character list, and feedback." : "The production team hasn't generated AI insights for this script yet."}
          </p>
          
          {isManagement && (
            <button 
              onClick={handleGenerateAiReview}
              disabled={aiGenerating}
              className="flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-all shadow-xl shadow-indigo-500/20"
            >
              {aiGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing PDF...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Generate Magic Review
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ScriptInsights;
