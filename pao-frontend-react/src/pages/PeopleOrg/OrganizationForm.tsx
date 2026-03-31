import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Globe, 
  Layers, 
  CheckCircle2, 
  XCircle,
  Building
} from 'lucide-react';
import type { Organization } from '../../types';
import styles from './PersonForm.module.css'; // Reusing the profile-style design system

interface OrganizationFormProps {
  initialData?: Organization;
  onSave: (org: Partial<Organization>) => void;
  onCancel: () => void;
}

const OrganizationForm: React.FC<OrganizationFormProps> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Organization>>({
    name: '',
    industry: '',
    website: '',
  });

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form className={styles.container} onSubmit={handleSubmit}>
      <div className={styles.header}>
        <div className={`${styles.avatarLarge} ${styles.orgAvatar}`}>
          <Building2 size={32} />
        </div>
        <div className={styles.headerInfo}>
          <h2>{initialData ? 'Edit Company Profile' : 'New Organization Node'}</h2>
          <p>Sync corporate metadata for your infrastructure map.</p>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <Building size={18} />
          <span>Core Identification</span>
        </div>
        <div className={styles.group}>
          <label>Organization Name</label>
          <div className={styles.inputWrapper}>
            <Building size={16} className={styles.inputIcon} />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g. Acme Corporation"
            />
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <Layers size={18} />
          <span>Category & Market</span>
        </div>
        <div className={styles.group}>
          <label>Industry Vertical</label>
          <div className={styles.inputWrapper}>
            <Layers size={16} className={styles.inputIcon} />
            <input
              type="text"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              placeholder="e.g. Artificial Intelligence, Healthcare"
            />
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <Globe size={18} />
          <span>Digital Presence</span>
        </div>
        <div className={styles.group}>
          <label>Official Website</label>
          <div className={styles.inputWrapper}>
            <Globe size={16} className={styles.inputIcon} />
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://www.company.com"
            />
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <button type="button" className={styles.cancelLink} onClick={onCancel}>
          <XCircle size={18} />
          <span>Cancel</span>
        </button>
        <button type="submit" className={styles.saveBtn}>
          <CheckCircle2 size={18} />
          <span>{initialData ? 'Update Profile' : 'Register Organization'}</span>
        </button>
      </div>
    </form>
  );
};

export default OrganizationForm;
