import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Sparkles, Loader2, MessageSquare, Plus, Mail, Phone, Calendar, Clock, Trash2 } from 'lucide-react';
import styles from './LeadForm.module.css';
import type { JobOpportunity, Organization, JobProfile } from '../../types';
import { useUser } from '../../context/UserContext';

interface Communication {
    id: number;
    date: string;
    type: 'NOTE' | 'EMAIL' | 'PHONE' | 'INTERVIEW';
    subject: string;
    body: string;
    fromAddress?: string;
    toAddress?: string;
    localDocUrl?: string;
}

interface LeadFormProps {
  initialData?: Partial<JobOpportunity>;
  onSuccess: () => void;
  onCancel: () => void;
}

const LeadForm: React.FC<LeadFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const queryClient = useQueryClient();
  const { primaryPerson } = useUser();
  const [formData, setFormData] = useState<Partial<JobOpportunity>>({
    status: 'TARGET',
    jobTitle: '',
    jobPostingUrl: '',
    applicationLoginUrl: '',
    applicationLoginInfo: '',
    notes: '',
    preparationNote: '',
    jobRequirements: '',
    ...initialData
  });

  const [isScraping, setIsScraping] = useState(false);

  // Fetch Organizations and Job Profiles for selects
  const { data: organizations = [] } = useQuery<Organization[]>({
    queryKey: ['organizations'],
    queryFn: async () => (await axios.get('/api/organizations')).data
  });

  const { data: profiles = [] } = useQuery<JobProfile[]>({
    queryKey: ['profiles', primaryPerson?.id],
    queryFn: async () => (await axios.get('/api/job-profiles', { params: { personId: primaryPerson?.id } })).data,
    enabled: !!primaryPerson?.id
  });

  // Fetch Communications/Notes for this lead
  const { data: communications = [], refetch: refetchComms } = useQuery<Communication[]>({
    queryKey: ['communications', formData.id],
    queryFn: async () => {
        if (!formData.id) return [];
        return (await axios.get(`/api/communications/opportunity/${formData.id}`)).data;
    },
    enabled: !!formData.id
  });

  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  const mutation = useMutation({
    mutationFn: async (data: Partial<JobOpportunity>) => {
      if (data.id) {
        return axios.put(`/api/job-opportunities/${data.id}`, data);
      }
      return axios.post('/api/job-opportunities', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      onSuccess();
    }
  });

  const addNoteMutation = useMutation({
    mutationFn: async (body: string) => {
        return axios.post('/api/communications', {
            jobOpportunity: { id: formData.id },
            date: new Date().toISOString(),
            type: 'NOTE',
            subject: 'Manual Note',
            body: body
        });
    },
    onSuccess: () => {
        setNewNote('');
        setIsAddingNote(false);
        refetchComms();
    }
  });

  const importGmailMutation = useMutation({
    mutationFn: async () => axios.post(`/api/communications/import-gmail/${formData.id}`),
    onSuccess: () => refetchComms()
  });

  const deleteCommMutation = useMutation({
    mutationFn: async (id: number) => axios.delete(`/api/communications/${id}`),
    onSuccess: () => refetchComms()
  });

  const handleScrape = async () => {
    if (!formData.jobPostingUrl) return;
    setIsScraping(true);
    try {
      const response = await axios.post('/api/scrape', { url: formData.jobPostingUrl });
      const { jobTitle, organizationName, markdownContent } = response.data;
      
      setFormData(prev => {
        const next = { ...prev };
        if (jobTitle) next.jobTitle = jobTitle;
        if (markdownContent) next.jobRequirements = markdownContent;
        
        if (organizationName && organizations.length > 0) {
          const found = organizations.find(org => 
            org.name.toLowerCase() === organizationName.toLowerCase() ||
            org.name.toLowerCase().includes(organizationName.toLowerCase()) ||
            organizationName.toLowerCase().includes(org.name.toLowerCase())
          );
          if (found) {
            next.organization = found;
          }
        }
        return next;
      });
    } catch (error) {
      console.error('Scraping failed', error);
      alert('Failed to scrape job details. Please check the URL.');
    } finally {
      setIsScraping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.organization?.id || !formData.jobProfile?.id) {
      alert('Please select an organization and a job profile.');
      return;
    }
    mutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: 'organization' | 'jobProfile', list: any[], id: string) => {
    const item = list.find(i => i.id === parseInt(id));
    setFormData(prev => ({ ...prev, [name]: item }));
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.row}>
        <div className={styles.field}>
          <label>Organization</label>
          <select 
            className={styles.select}
            value={formData.organization?.id || ''}
            onChange={(e) => handleSelectChange('organization', organizations, e.target.value)}
            required
          >
            <option value="">Select Organization</option>
            {organizations.map(org => (
              <option key={org.id} value={org.id}>{org.name}</option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label>Specific Job Title</label>
          <input 
            className={styles.input}
            name="jobTitle"
            value={formData.jobTitle}
            onChange={handleChange}
            placeholder="e.g. Senior Product Designer"
          />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label>Job Profile (Goal)</label>
          <select 
            className={styles.select}
            value={formData.jobProfile?.id || ''}
            onChange={(e) => handleSelectChange('jobProfile', profiles, e.target.value)}
            required
          >
            <option value="">Select Profile</option>
            {profiles.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label>Status</label>
          <select 
            className={styles.select}
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="TARGET">Target</option>
            <option value="APPLIED">Applied</option>
            <option value="INTERVIEWING">Interviewing</option>
            <option value="OFFERED">Offered</option>
            <option value="REJECTED">Rejected</option>
            <option value="ABORTED">Aborted</option>
          </select>
        </div>
      </div>

      <div className={styles.field}>
        <label>Job Posting URL</label>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <input 
            type="url"
            className={styles.input}
            style={{ flex: 1 }}
            name="jobPostingUrl"
            value={formData.jobPostingUrl}
            onChange={handleChange}
            placeholder="https://linkedin.com/jobs/..."
          />
          <button 
            type="button" 
            className={styles.autoFillBtn}
            onClick={handleScrape}
            disabled={isScraping || !formData.jobPostingUrl}
          >
            {isScraping ? <Loader2 className="spinning" size={16} /> : <Sparkles size={16} />}
            Auto-fill
          </button>
        </div>
      </div>

      <div className={styles.field}>
        <label>Job Specific Requirements (Markdown)</label>
        <textarea 
          className={styles.textarea}
          name="jobRequirements"
          value={formData.jobRequirements}
          onChange={handleChange}
          placeholder="Paste job details or use auto-fill..."
        />
      </div>



      {formData.id && (
        <div className={styles.notesSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>
              <MessageSquare size={18} />
              <h3>Communications & Notes</h3>
            </div>
            <div className={styles.sectionActions}>
              <button 
                type="button" 
                className={styles.importBtn} 
                onClick={() => importGmailMutation.mutate()}
                disabled={importGmailMutation.isPending}
              >
                {importGmailMutation.isPending ? <Loader2 className={styles.spinning} size={14} /> : <Mail size={14} />}
                Import Gmail
              </button>
              <button 
                type="button" 
                className={styles.addNoteToggle}
                onClick={() => setIsAddingNote(!isAddingNote)}
              >
                <Plus size={14} />
                Add Note
              </button>
            </div>
          </div>

          {isAddingNote && (
            <div className={styles.noteForm}>
              <textarea 
                className={styles.input}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Enter markdown note..."
                rows={3}
              />
              <div className={styles.noteFormActions}>
                <button type="button" onClick={() => setIsAddingNote(false)}>Cancel</button>
                <button 
                    type="button" 
                    className={styles.saveNoteBtn}
                    onClick={() => addNoteMutation.mutate(newNote)}
                    disabled={!newNote.trim() || addNoteMutation.isPending}
                >
                    Save Note
                </button>
              </div>
            </div>
          )}

          <div className={styles.commList}>
            {communications.length === 0 ? (
                <div className={styles.emptyComms}>No communications logged yet.</div>
            ) : (
                [...communications].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(comm => (
                    <div key={comm.id} className={styles.commItem}>
                        <div className={styles.commHeader}>
                            <div className={styles.commLeft}>
                                <span className={`${styles.commType} ${styles[comm.type.toLowerCase()]}`}>
                                    {comm.type === 'EMAIL' ? <Mail size={12} /> : comm.type === 'PHONE' ? <Phone size={12} /> : comm.type === 'INTERVIEW' ? <Calendar size={12} /> : <MessageSquare size={12} />}
                                    {comm.type}
                                </span>
                                <span className={styles.commDate}>
                                    <Clock size={10} />
                                    {new Date(comm.date).toLocaleDateString()} {new Date(comm.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <button 
                                type="button" 
                                className={styles.delCommBtn}
                                onClick={() => deleteCommMutation.mutate(comm.id)}
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                        <div className={styles.commBody}>
                            {comm.subject !== 'Manual Note' && <p className={styles.commSubject}>{comm.subject}</p>}
                            <p className={styles.commText}>{comm.body}</p>
                            {comm.fromAddress && <div className={styles.commMeta}>From: {comm.fromAddress}</div>}
                        </div>
                    </div>
                ))
            )}
          </div>
        </div>
      )}

      <footer className={styles.footer}>
        <button type="button" className={styles.cancelBtn} onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className={styles.submitBtn} disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving...' : formData.id ? 'Save Changes' : 'Create Lead'}
        </button>
      </footer>
    </form>
  );
};

export default LeadForm;
