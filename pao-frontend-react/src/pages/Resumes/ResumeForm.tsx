import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import styles from './ResumeForm.module.css';
import type { Resume } from '../../types';

interface ResumeFormProps {
  initialData?: Partial<Resume>;
  onSuccess: () => void;
  onCancel: () => void;
}

const ResumeForm: React.FC<ResumeFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Partial<Resume>>({
    name: '',
    content: '',
    isPrimary: false,
    ...initialData
  });

  const mutation = useMutation({
    mutationFn: async (data: Partial<Resume>) => {
      // The backend expects ResumeSaveRequest: { id, personId, name, content }
      // We'll hardcode personId to 1 for now or fetch it if possible.
      const payload = {
        id: data.id,
        personId: data.person?.id || initialData?.person?.id || 2, 
        name: data.name,
        content: data.content
      };
      return axios.post('/api/resumes', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      onSuccess();
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.content) {
      alert('Name and content are required.');
      return;
    }
    mutation.mutate(formData);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label>Resume Name / Version</label>
        <input 
          className={styles.input}
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="e.g. Senior Software Engineer - Generic"
          required
        />
      </div>

      <div className={styles.field}>
        <label>Content (Markdown)</label>
        <textarea 
          className={styles.textarea}
          value={formData.content}
          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
          placeholder="# Experience..."
          required
        />
      </div>

      <footer className={styles.footer}>
        <button type="button" className={styles.cancelBtn} onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className={styles.submitBtn} disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving...' : formData.id ? 'Update Resume' : 'Create Resume'}
        </button>
      </footer>
    </form>
  );
};

export default ResumeForm;
