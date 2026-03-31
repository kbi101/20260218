import React, { useState, useEffect } from 'react';
import type { Person, Organization } from '../../types';
import styles from '../Leads/LeadForm.module.css';

interface RelationshipFormProps {
  people: Person[];
  organizations: Organization[];
  onSave: (relRequest: any) => void;
  onCancel: () => void;
  initialSource?: { type: 'PERSON' | 'ORGANIZATION', id: number } | null;
}

type EntityType = 'PERSON' | 'ORGANIZATION';

const RelationshipForm: React.FC<RelationshipFormProps> = ({ 
  people, 
  organizations, 
  onSave, 
  onCancel,
  initialSource
}) => {
  const [sourceType, setSourceType] = useState<EntityType>('PERSON');
  const [sourceId, setSourceId] = useState<string>('');
  const [targetType, setTargetType] = useState<EntityType>('ORGANIZATION');
  const [targetId, setTargetId] = useState<string>('');
  const [type, setType] = useState('MEMBER_OF');

  useEffect(() => {
    if (initialSource) {
        setSourceType(initialSource.type);
        setSourceId(initialSource.id.toString());
    }
  }, [initialSource]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceId || !targetId) return;

    // Matches backend RelationshipRequest DTO
    const relRequest = {
      sourceId: Number(sourceId),
      targetId: Number(targetId),
      sourceType: sourceType,
      targetType: targetType,
      type: type
    };
    
    onSave(relRequest);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.row}>
        <div className={styles.group}>
          <label>Source Type</label>
          <select 
            className={styles.input} 
            value={sourceType} 
            onChange={(e) => {
              setSourceType(e.target.value as EntityType);
              setSourceId('');
            }}
            disabled={!!initialSource}
          >
            <option value="PERSON">Person</option>
            <option value="ORGANIZATION">Organization</option>
          </select>
        </div>
        <div className={styles.group}>
          <label>Source Name</label>
          <select 
            className={styles.input} 
            value={sourceId} 
            onChange={(e) => setSourceId(e.target.value)}
            required
            disabled={!!initialSource}
          >
            <option value="">Select...</option>
            {sourceType === 'PERSON' ? 
              people.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>) :
              organizations.map(o => <option key={o.id} value={o.id}>{o.name}</option>)
            }
          </select>
        </div>
      </div>

      <div className={styles.group}>
        <label>Relationship Type</label>
        <select 
          className={styles.input} 
          value={type} 
          onChange={(e) => setType(e.target.value)}
          required
        >
          <option value="MEMBER_OF">Member Of</option>
          <option value="CONTACT_AT">Contact At</option>
          <option value="WORKS_AT">Works At</option>
          <option value="COLLEAGUE_OF">Colleague Of</option>
          <option value="PARTNERED_WITH">Partnered With</option>
          <option value="HIRED_BY">Hired By</option>
          <option value="REFERRAL">Referral</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      <div className={styles.row}>
        <div className={styles.group}>
          <label>Target Type</label>
          <select 
            className={styles.input} 
            value={targetType} 
            onChange={(e) => {
              setTargetType(e.target.value as EntityType);
              setTargetId('');
            }}
          >
            <option value="PERSON">Person</option>
            <option value="ORGANIZATION">Organization</option>
          </select>
        </div>
        <div className={styles.group}>
          <label>Target Name</label>
          <select 
            className={styles.input} 
            value={targetId} 
            onChange={(e) => setTargetId(e.target.value)}
            required
          >
            <option value="">Select...</option>
            {targetType === 'PERSON' ? 
              people.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>) :
              organizations.map(o => <option key={o.id} value={o.id}>{o.name}</option>)
            }
          </select>
        </div>
      </div>

      <div className={styles.formActions}>
        <button type="button" className={styles.cancelBtn} onClick={onCancel}>Cancel</button>
        <button type="submit" className={styles.submitBtn}>Save Connection</button>
      </div>
    </form>
  );
};

export default RelationshipForm;
