import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import styles from './Form.module.css';
import type { JobProfile } from '../../types';

interface JobProfileFormProps {
  initialData?: Partial<JobProfile>;
  onSuccess: () => void;
  onCancel: () => void;
}

const JobProfileForm: React.FC<JobProfileFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Partial<JobProfile>>({
    title: '',
    description: '',
    targetIndustry: '',
    expectedSalary: '',
    workModel: 'REMOTE',
    jobType: 'FULL_TIME',
    ...initialData
  });

  const mutation = useMutation({
    mutationFn: async (data: Partial<JobProfile>) => {
      if (data.id) {
        return axios.put(`/api/job-profiles/${data.id}`, data);
      }
      return axios.post('/api/job-profiles', data, { params: { personId: data.person?.id } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      onSuccess();
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label>Job Title / Goal</label>
        <input 
          className={styles.input}
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g. Senior Software Engineer"
          required
        />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label>Target Industry</label>
          <input 
            className={styles.input}
            name="targetIndustry"
            value={formData.targetIndustry}
            onChange={handleChange}
            placeholder="e.g. Fintech, E-commerce"
          />
        </div>
        <div className={styles.field}>
          <label>Expected Salary Range</label>
          <input 
            className={styles.input}
            name="expectedSalary"
            value={formData.expectedSalary}
            onChange={handleChange}
            placeholder="e.g. $150k - $180k"
          />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label>Work Model</label>
          <select 
            className={styles.select}
            name="workModel"
            value={formData.workModel}
            onChange={handleChange}
          >
            <option value="REMOTE">Remote</option>
            <option value="HYBRID">Hybrid</option>
            <option value="ONSITE">On-site</option>
          </select>
        </div>
        <div className={styles.field}>
          <label>Job Type</label>
          <select 
            className={styles.select}
            name="jobType"
            value={formData.jobType}
            onChange={handleChange}
          >
            <option value="FULL_TIME">Full-time</option>
            <option value="CONTRACT">Contract</option>
            <option value="PART_TIME">Part-time</option>
          </select>
        </div>
      </div>

      <div className={styles.field}>
        <label>Role Description / Keywords</label>
        <textarea 
          className={styles.textarea}
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="What exactly are you looking for?"
        />
      </div>

      <footer className={styles.footer}>
        <button type="button" className={styles.cancelBtn} onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className={styles.submitBtn} disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving...' : formData.id ? 'Save Changes' : 'Create Profile'}
        </button>
      </footer>
    </form>
  );
};

export default JobProfileForm;
