import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Zap, Loader2 } from 'lucide-react';
import styles from './Form.module.css';
import type { ElevatorPitch, JobProfile } from '../../types';

interface PitchFormProps {
  initialData?: Partial<ElevatorPitch>;
  onSuccess: () => void;
  onCancel: () => void;
}

const PitchForm: React.FC<PitchFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Partial<ElevatorPitch>>({
    name: '',
    targetRole: '',
    bullets: '',
    content: '',
    fontSize: 18,
    ...initialData
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const { data: profiles = [] } = useQuery<JobProfile[]>({
    queryKey: ['profiles'],
    queryFn: async () => (await axios.get('/api/job-profiles')).data
  });

  const mutation = useMutation({
    mutationFn: async (data: Partial<ElevatorPitch>) => {
      // Backend PitchSaveRequest: { id, personId, name, targetRole, bullets, content, fontSize }
    const payload = {
        ...data,
        personId: 100 // Defaulting to 100 (John Doe) for demonstration
      };
      return axios.post('/api/pitches', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pitches'] });
      onSuccess();
    }
  });

  const handleGenerate = async () => {
    if (!formData.bullets || !formData.targetRole) {
      alert('Please select a target role and provide some bullets for AI to work with.');
      return;
    }
    setIsGenerating(true);
    try {
      const response = await axios.post('/api/pitches/generate', {
        personId: 100, // Sync with John Doe (ID 100)
        bullets: formData.bullets,
        targetRole: formData.targetRole
      }, {
        transformResponse: [(data) => data] // Keep it as raw string to avoid JSON parsing errors
      });
      setFormData(prev => ({ ...prev, content: response.data }));
    } catch (error) {
      console.error('Generation failed', error);
      alert('Failed to generate pitch with AI. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSelect = (title: string) => {
    setFormData(prev => ({ ...prev, targetRole: title }));
  };

  return (
    <form className={styles.form} onSubmit={(e) => { e.preventDefault(); mutation.mutate(formData); }}>
      <div className={styles.row}>
        <div className={styles.field}>
          <label>Pitch Name / Audience</label>
          <input 
            className={styles.input}
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Recruiter, Hiring Manager, Friend"
            required
          />
        </div>
        <div className={styles.field}>
          <label>Target Role / Profile</label>
          <select 
            className={styles.select}
            name="targetRole"
            value={formData.targetRole}
            onChange={(e) => handleProfileSelect(e.target.value)}
            required
          >
            <option value="">Select Target Role</option>
            {profiles.map(p => (
              <option key={p.id} value={p.title}>{p.title}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.field}>
        <label>Key Selling Points (Bullets)</label>
        <textarea 
          className={styles.textarea}
          style={{ minHeight: '100px' }}
          name="bullets"
          value={formData.bullets}
          onChange={handleChange}
          placeholder="Enter key skills or keywords (one per line)..."
        />
        <button 
          type="button" 
          className={styles.generateBtn}
          onClick={handleGenerate}
          disabled={isGenerating || !formData.bullets || !formData.targetRole}
        >
          {isGenerating ? <Loader2 className="spinning" size={16} /> : <Zap size={16} />}
          Generate AI Pitch
        </button>
      </div>

      <div className={styles.field}>
        <label>Final Pitch Content</label>
        <textarea 
          className={styles.textarea}
          style={{ minHeight: '200px', fontSize: `${formData.fontSize}px` }}
          name="content"
          value={formData.content}
          onChange={handleChange}
          placeholder="The actual text of your pitch..."
          required
        />
      </div>

      <div className={styles.field}>
        <label>Font Size (px)</label>
        <input 
          type="number"
          className={styles.input}
          name="fontSize"
          value={formData.fontSize}
          onChange={handleChange}
          min="12"
          max="48"
        />
      </div>

      <footer className={styles.footer}>
        <button type="button" className={styles.cancelBtn} onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className={styles.submitBtn} disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving...' : formData.id ? 'Save Changes' : 'Create Pitch'}
        </button>
      </footer>
    </form>
  );
};

export default PitchForm;
