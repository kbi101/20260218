import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { 
  Plus, 
  Scissors, 
  Trash2, 
  Edit2, 
  CheckCircle2,
  Wand2,
  Copy,
  Save,
  Check
} from 'lucide-react';
import ConfirmModal from '../../components/ConfirmModal';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import styles from './ResumeSnippets.module.css';
import type { ResumeSnippet, Resume } from '../../types';

interface ResumeSnippetsProps {
  personId?: number;
  availableResumes: Resume[];
}

const ResumeSnippets: React.FC<ResumeSnippetsProps> = ({ personId = 2, availableResumes }) => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [currentSnippet, setCurrentSnippet] = useState<Partial<ResumeSnippet>>({});
  const [selectedSnippetIds, setSelectedSnippetIds] = useState<number[]>([]);
  const [jobDescription, setJobDescription] = useState('');
  const [composedResume, setComposedResume] = useState('');
  const [extractFromResumeId, setExtractFromResumeId] = useState<number | ''>('');
  const [manualPrompt, setManualPrompt] = useState<string | null>(null);
  const [manualJson, setManualJson] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [snippetToDelete, setSnippetToDelete] = useState<number | null>(null);

  const { data: snippets = [], isLoading } = useQuery<ResumeSnippet[]>({
    queryKey: ['snippets', personId],
    queryFn: async () => (await axios.get(`/api/persons/${personId}/snippets`)).data
  });

  const snippetMutation = useMutation({
    mutationFn: async (snippet: Partial<ResumeSnippet>) => {
      const url = `/api/persons/${personId}/snippets`;
      return axios.post(url, snippet);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['snippets', personId] });
      setIsEditing(false);
      setCurrentSnippet({});
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => axios.delete(`/api/persons/${personId}/snippets/${id}`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['snippets', personId] });
      setSelectedSnippetIds(prev => prev.filter(sid => sid !== id));
    }
  });

  const extractMutation = useMutation({
    mutationFn: async (id: number) => {
      const resume = availableResumes.find(r => r.id === id);
      if (!resume) throw new Error('Resume not found');
      try {
        return await axios.post(`/api/persons/${personId}/snippets/extract`, { resumeContent: resume.content });
      } catch (err: any) {
        if (err.response?.status === 429) {
          setManualPrompt(err.response.data.prompt);
          throw new Error('QUOTA_EXCEEDED');
        }
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['snippets', personId] });
      setExtractFromResumeId('');
      alert('Resumes broken down into snippets successfully!');
    },
    onError: (err: any) => {
      if (err.message !== 'QUOTA_EXCEEDED') {
        alert('Extraction failed: ' + err.message);
      }
    }
  });

  const manualSaveMutation = useMutation({
    mutationFn: async () => {
      return axios.post(`/api/persons/${personId}/snippets/manual-save`, manualJson, {
        headers: { 'Content-Type': 'text/plain' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['snippets', personId] });
      setManualPrompt(null);
      setManualJson('');
      alert('Manual extraction saved successfully!');
    },
    onError: (err: any) => {
      alert('Failed to save manual result: ' + (err.response?.data?.message || err.message));
    }
  });

  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [newResumeName, setNewResumeName] = useState('');

  const saveResumeMutation = useMutation({
    mutationFn: async (name: string) => {
      console.log('Starting save mutation with name:', name);
      console.log('Composed resume length:', composedResume.length);
      const payload = {
        personId,
        name,
        content: composedResume
      };
      console.log('Payload:', payload);
      const response = await axios.post('/api/resumes', payload);
      console.log('Save response:', response.data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes', personId] });
      setSaveModalOpen(false);
      setNewResumeName('');
      alert('Resume version saved!');
    },
    onError: (err: any) => {
      alert('Failed to save resume: ' + (err.response?.data?.message || err.message));
    }
  });

  const handleSaveClick = () => {
    setNewResumeName(`Tailored Resume - ${new Date().toLocaleDateString()}`);
    setSaveModalOpen(true);
  };

  const confirmSave = () => {
    if (!newResumeName.trim()) {
      alert('Please enter a name');
      return;
    }
    saveResumeMutation.mutate(newResumeName);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(composedResume);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const composeMutation = useMutation({
    mutationFn: async () => {
      return axios.post(`/api/persons/${personId}/snippets/compose`, {
        jobDescription,
        snippetIds: selectedSnippetIds
      });
    },
    onSuccess: (response) => {
      setComposedResume(response.data);
    }
  });

  const handleEdit = (snippet: ResumeSnippet) => {
    setCurrentSnippet(snippet);
    setIsEditing(true);
  };

  const toggleSnippetSelection = (id: number) => {
    setSelectedSnippetIds(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleSaveSnippet = (e: React.FormEvent) => {
    e.preventDefault();
    snippetMutation.mutate(currentSnippet);
  };

  const openDeleteConfirm = (id: number) => {
    setSnippetToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const executeDelete = () => {
    if (snippetToDelete) {
      deleteMutation.mutate(snippetToDelete);
    }
  };

  if (isLoading) return <div>Loading snippets...</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h2>Resume Snippets</h2>
          <p className={styles.selectionInfo}>{selectedSnippetIds.length} selected for composition</p>
        </div>
        <div className={styles.actions}>
           <select 
             className={styles.secondaryButton}
             value={extractFromResumeId}
             onChange={(e) => setExtractFromResumeId(e.target.value === '' ? '' : Number(e.target.value))}
           >
             <option value="">Extract from Resume...</option>
             {availableResumes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
           </select>
           <button 
             className={styles.secondaryButton} 
             onClick={() => extractFromResumeId && extractMutation.mutate(Number(extractFromResumeId))}
             disabled={!extractFromResumeId || extractMutation.isPending}
           >
             <Scissors size={16} />
             <span>{extractMutation.isPending ? 'Extracting...' : 'Extract'}</span>
           </button>
            <button className={styles.primaryButton} onClick={() => { setCurrentSnippet({ type: 'EXPERIENCE' }); setIsEditing(true); }}>
              <Plus size={16} />
              <span>Add Snippet</span>
            </button>
        </div>
      </header>

      <div className={styles.snippetGrid}>
        {[...snippets]
          .sort((a, b) => {
            const getYear = (d: any) => {
              if (!d || typeof d !== 'string') return 0;
              const years = d.match(/\d{4}/g);
              return years ? Math.max(...years.map(Number)) : 0;
            };
            return getYear(b.duration) - getYear(a.duration);
          })
          .map(snippet => (
            <div 
              key={snippet.id} 
              className={`${styles.snippetCard} ${selectedSnippetIds.includes(snippet.id!) ? styles.selectedCard : ''}`}
              onClick={() => toggleSnippetSelection(snippet.id!)}
            >
              <div className={styles.snippetBadge}>{(snippet.type || 'EXPERIENCE').replace('_', ' ')}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 className={styles.snippetName}>{snippet.name}</h3>
                  <div className={styles.snippetSubhead}>
                    {snippet.company && <span className={styles.company}>{snippet.company}</span>}
                    {snippet.role && <span className={styles.role}>{snippet.role}</span>}
                  </div>
                </div>
                {selectedSnippetIds.includes(snippet.id!) && <CheckCircle2 size={16} color="var(--primary)" />}
              </div>
            <span className={styles.duration}>{snippet.duration}</span>
            <p className={styles.briefing}>{snippet.briefing}</p>
            <div className={styles.tags}>
              {snippet.technicalStacks && snippet.technicalStacks.split(',').map((tech, i) => (
                <span key={i} className={styles.tag}>{tech.trim()}</span>
              ))}
            </div>
            {snippet.roi && (
              <div className={styles.roiSection}>
                <strong>Impact:</strong> {snippet.roi}
              </div>
            )}
            <div className={styles.snippetActions}>
              <button 
                className={styles.iconBtn} 
                onClick={(e) => { e.stopPropagation(); handleEdit(snippet); }}
              >
                <Edit2 size={14} />
              </button>
              <button 
                className={`${styles.iconBtn} ${styles.deleteBtn}`}
                onClick={(e) => { e.stopPropagation(); openDeleteConfirm(snippet.id!); }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <section className={styles.compositionArea}>
        <h3>Compose Tailored Resume</h3>
        <div className={styles.formGroup}>
          <label>Target Job Description</label>
          <textarea 
            className={styles.jdInput}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the target job description here..."
          />
        </div>
        <button 
          className={styles.primaryButton} 
          onClick={() => composeMutation.mutate()}
          disabled={composeMutation.isPending || (selectedSnippetIds.length === 0 && snippets.length === 0)}
        >
          <Wand2 size={16} />
          <span>{composeMutation.isPending ? 'Composing...' : selectedSnippetIds.length > 0 ? 'Compose from Selected' : 'Auto-Select & Compose from All'}</span>
        </button>

        {composedResume && (
          <>
            <div className={styles.composeResult}>
               <div 
                 dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(composedResume) as string) }}
               />
            </div>
            <div className={styles.resultActions}>
              <button 
                className={styles.secondaryButton} 
                onClick={handleCopy}
              >
                {isCopied ? <Check size={16} /> : <Copy size={16} />}
                <span>{isCopied ? 'Copied' : 'Copy Markdown'}</span>
              </button>
              <button 
                className={styles.primaryButton} 
                onClick={handleSaveClick}
                disabled={saveResumeMutation.isPending}
              >
                <Save size={16} />
                <span>{saveResumeMutation.isPending ? 'Saving...' : 'Save as New Version'}</span>
              </button>
            </div>

            {saveModalOpen && (
              <div className={styles.modalBackdrop}>
                <div className={styles.modalContent}>
                  <h3 style={{ marginBottom: '1.5rem' }}>Save Tailored Resume</h3>
                  <div className={styles.formGroup}>
                    <label>Version Name</label>
                    <input 
                      type="text" 
                      value={newResumeName}
                      onChange={(e) => setNewResumeName(e.target.value)}
                      placeholder="e.g. Senior Architect - Meta"
                      autoFocus
                    />
                  </div>
                  <div className={styles.buttonRow}>
                    <button className={styles.secondaryButton} onClick={() => setSaveModalOpen(false)}>
                      Cancel
                    </button>
                    <button 
                      className={styles.primaryButton} 
                      onClick={confirmSave}
                      disabled={saveResumeMutation.isPending}
                    >
                      {saveResumeMutation.isPending ? 'Saving...' : 'Confirm Save'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* Manual Extraction Fallback Modal */}
      {manualPrompt && (
        <div className={styles.modalBackdrop}>
          <div className={`${styles.modalContent} ${styles.manualModal}`}>
            <h3>AI Quota Reached: Manual Extraction Required</h3>
            <p>Your cloud AI quota has been exhausted. To ensure high-fidelity extraction (including ROI/Impact), please perform this step manually:</p>
            
            <div className={styles.manualInstruction}>
              <ol>
                <li>Copy the prompt below.</li>
                <li>Paste it into your preferred high-capacity AI (e.g., ChatGPT Plus, Gemini Pro Online).</li>
                <li>Copy the **JSON Array** result from the AI.</li>
                <li>Paste that JSON into the box below and click "Save Manual Result".</li>
              </ol>
            </div>

            <div className={styles.formGroup}>
              <label>AI Prompt (Copy this)</label>
              <textarea readOnly value={manualPrompt} className={styles.promptTextarea} />
              <button 
                className={styles.secondaryButton}
                onClick={() => { navigator.clipboard.writeText(manualPrompt); alert('Prompt copied!'); }}
              >
                Copy Prompt
              </button>
            </div>

            <div className={styles.formGroup} style={{ marginTop: '1.5rem' }}>
              <label>AI JSON Response (Paste here)</label>
              <textarea 
                placeholder="[ { 'type': 'EXPERIENCE', ... }, ... ]"
                value={manualJson}
                onChange={e => setManualJson(e.target.value)}
                className={styles.manualJsonInput}
              />
            </div>

            <div className={styles.buttonRow}>
              <button className={styles.secondaryButton} onClick={() => setManualPrompt(null)}>Cancel</button>
              <button 
                className={styles.primaryButton}
                onClick={() => manualSaveMutation.mutate()}
                disabled={manualSaveMutation.isPending || !manualJson.trim()}
              >
                {manualSaveMutation.isPending ? 'Saving...' : 'Save Manual Result'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditing && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <h3>{currentSnippet.id ? 'Edit Snippet' : 'New Snippet'}</h3>
            <form onSubmit={handleSaveSnippet} className={styles.formGrid}>
              <div className={styles.formGridRow}>
                <div className={styles.formGroup}>
                  <label>Type</label>
                  <select
                    className={styles.typeSelect}
                    value={currentSnippet.type || 'EXPERIENCE'}
                    onChange={e => setCurrentSnippet(prev => ({ ...prev, type: e.target.value as any }))}
                  >
                    <option value="SUMMARY">Executive Summary</option>
                    <option value="COMMUNICATION">Contact / Communication</option>
                    <option value="CORE_COMPETENCY">Core Competency</option>
                    <option value="EDUCATION">Education</option>
                    <option value="LEADERSHIP">Leadership & Standards</option>
                    <option value="EXPERIENCE">Experience / Project</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Project / Section Name</label>
                  <input 
                    value={currentSnippet.name || ''} 
                    onChange={e => setCurrentSnippet(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className={styles.formGridRow}>
                <div className={styles.formGroup}>
                  <label>Company</label>
                  <input 
                    value={currentSnippet.company || ''} 
                    onChange={e => setCurrentSnippet(prev => ({ ...prev, company: e.target.value }))}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Role</label>
                  <input 
                    value={currentSnippet.role || ''} 
                    onChange={e => setCurrentSnippet(prev => ({ ...prev, role: e.target.value }))}
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Duration</label>
                <input 
                  value={currentSnippet.duration || ''} 
                  onChange={e => setCurrentSnippet(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="e.g. 2022 - 2023"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Briefing</label>
                <textarea 
                  value={currentSnippet.briefing || ''} 
                  onChange={e => setCurrentSnippet(prev => ({ ...prev, briefing: e.target.value }))}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Technical Stacks (comma separated)</label>
                <input 
                  value={currentSnippet.technicalStacks || ''} 
                  onChange={e => setCurrentSnippet(prev => ({ ...prev, technicalStacks: e.target.value }))}
                />
              </div>
              <div className={styles.formGroup}>
                <label>ROI / Achievements</label>
                <textarea 
                  value={currentSnippet.roi || ''} 
                  onChange={e => setCurrentSnippet(prev => ({ ...prev, roi: e.target.value }))}
                />
              </div>
              <div className={styles.buttonRow}>
                <button type="button" className={styles.secondaryButton} onClick={() => setIsEditing(false)}>Cancel</button>
                <button type="submit" className={styles.primaryButton}>Save Snippet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={executeDelete}
        title="Delete Snippet?"
        message="Are you sure you want to delete this snippet? This action cannot be undone and may affect future resume generations."
        confirmText="Delete Snippet"
      />
    </div>
  );
};

export default ResumeSnippets;
