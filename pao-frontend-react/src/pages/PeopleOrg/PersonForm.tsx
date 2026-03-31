import React, { useState } from 'react';
import { 
  User, 
  Briefcase, 
  Mail, 
  Phone, 
  Linkedin, 
  MapPin, 
  Users,
  Building2,
  ArrowRightLeft
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import styles from './PersonForm.module.css';
import type { Person, Relationship } from '../../types';

interface PersonFormProps {
  initialData?: Person | null;
  onSave: (data: Partial<Person>) => void;
  onCancel: () => void;
}

const PersonForm: React.FC<PersonFormProps> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Person>>(
    initialData || {
      firstName: '',
      lastName: '',
      title: '',
      email: '',
      phone: '',
      linkedInUrl: '',
      address: '',
      job: ''
    }
  );

  // Fetch relationships for this person to show "Connections"
  const { data: relationships = [] } = useQuery<Relationship[]>({
    queryKey: ['relationships'],
    queryFn: async () => (await axios.get('/api/relationships')).data,
    enabled: !!initialData?.id
  });

  const personRelationships = relationships.filter(r => 
    (r.sourcePerson?.id === initialData?.id) || (r.targetPerson?.id === initialData?.id)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.header}>
        <div className={styles.avatarBlock}>
          <div className={styles.avatar}>
            {formData.firstName?.[0]}{formData.lastName?.[0] || <User size={24} />}
          </div>
          <div className={styles.avatarInfo}>
            <h3>{formData.firstName || 'New'} {formData.lastName || 'Contact'}</h3>
            <span>{formData.title || 'Professional Title'}</span>
          </div>
        </div>
      </div>

      <div className={styles.sections}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <User size={16} />
            <span>Identity</span>
          </div>
          <div className={styles.grid}>
            <div className={styles.group}>
              <label>First Name</label>
              <input name="firstName" value={formData.firstName} onChange={handleChange} required placeholder="e.g. John" />
            </div>
            <div className={styles.group}>
              <label>Last Name</label>
              <input name="lastName" value={formData.lastName} onChange={handleChange} required placeholder="e.g. Doe" />
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Briefcase size={16} />
            <span>Professional Role</span>
          </div>
          <div className={styles.grid}>
            <div className={styles.group}>
              <label>Job Title</label>
              <div className={styles.inputWithIcon}>
                <Briefcase size={14} />
                <input name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Senior Software Engineer" />
              </div>
            </div>
            <div className={styles.group}>
              <label>Current Company (Metadata)</label>
              <div className={styles.inputWithIcon}>
                <Building2 size={14} />
                <input name="job" value={formData.job} onChange={handleChange} placeholder="e.g. Tech Corp" />
              </div>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Mail size={16} />
            <span>Social & Contact</span>
          </div>
          <div className={styles.grid}>
            <div className={styles.group}>
              <label>Email Address</label>
              <div className={styles.inputWithIcon}>
                <Mail size={14} />
                <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="john.doe@example.com" />
              </div>
            </div>
            <div className={styles.group}>
              <label>Phone Number</label>
              <div className={styles.inputWithIcon}>
                <Phone size={14} />
                <input name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" />
              </div>
            </div>
            <div className={styles.group}>
              <label>LinkedIn Profile</label>
              <div className={styles.inputWithIcon}>
                <Linkedin size={14} />
                <input name="linkedInUrl" value={formData.linkedInUrl} onChange={handleChange} placeholder="linkedin.com/in/username" />
              </div>
            </div>
            <div className={styles.group}>
              <label>Location</label>
              <div className={styles.inputWithIcon}>
                <MapPin size={14} />
                <input name="address" value={formData.address} onChange={handleChange} placeholder="City, State" />
              </div>
            </div>
          </div>
        </div>

        {initialData && personRelationships.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <ArrowRightLeft size={16} />
              <span>Professional Network ({personRelationships.length})</span>
            </div>
            <div className={styles.relList}>
               {personRelationships.map(rel => {
                   const isSource = rel.sourcePerson?.id === initialData.id;
                   const peerName = isSource 
                     ? (rel.targetPerson ? `${rel.targetPerson.firstName} ${rel.targetPerson.lastName}` : rel.targetOrganization?.name)
                     : (rel.sourcePerson ? `${rel.sourcePerson.firstName} ${rel.sourcePerson.lastName}` : rel.sourceOrganization?.name);
                   const peerType = isSource 
                     ? (rel.targetPerson ? 'PERSON' : 'ORGANIZATION')
                     : (rel.sourcePerson ? 'PERSON' : 'ORGANIZATION');
                   
                   return (
                     <div key={rel.id} className={styles.relItem}>
                        <div className={styles.relIcon}>
                           {peerType === 'PERSON' ? <Users size={14} /> : <Building2 size={14} />}
                        </div>
                        <div className={styles.relInfo}>
                           <span className={styles.relPeer}>{peerName}</span>
                           <span className={styles.relType}>{rel.type}</span>
                        </div>
                     </div>
                   );
               })}
            </div>
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <button type="button" className={styles.cancelBtn} onClick={onCancel}>Cancel</button>
        <button type="submit" className={styles.submitBtn}>
          {initialData ? 'Update Profile' : 'Create Contact'}
        </button>
      </div>
    </form>
  );
};

export default PersonForm;
