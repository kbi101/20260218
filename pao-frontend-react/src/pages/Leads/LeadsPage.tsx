import React, { useState, useEffect } from 'react';
import { useSearch } from '../../context/SearchContext';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { 
  Plus, 
  Calendar, 
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import styles from './LeadsPage.module.css';
import type { JobOpportunity, JobProfile } from '../../types';
import Modal from '../../components/Modal';
import LeadForm from './LeadForm';
import { useUser } from '../../context/UserContext';

const LeadsPage: React.FC = () => {
  const { searchQuery } = useSearch();
  const { primaryPerson } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<JobOpportunity | undefined>(undefined);
  const [selectedProfileId, setSelectedProfileId] = useState<number | 'all'>(() => {
    const saved = localStorage.getItem('leads_profile_filter');
    return saved ? (saved === 'all' ? 'all' : parseInt(saved)) : 'all';
  });

  useEffect(() => {
    localStorage.setItem('leads_profile_filter', selectedProfileId.toString());
  }, [selectedProfileId]);

  const { data: profiles = [] } = useQuery<JobProfile[]>({
    queryKey: ['profiles', primaryPerson?.id],
    queryFn: async () => (await axios.get('/api/job-profiles', { params: { personId: primaryPerson?.id } })).data,
    enabled: !!primaryPerson?.id
  });

  const { data: leads = [], isLoading, error } = useQuery<JobOpportunity[]>({
    queryKey: ['leads', primaryPerson?.id],
    queryFn: async () => {
      const response = await axios.get('/api/job-opportunities', { params: { personId: primaryPerson?.id } });
      return response.data;
    },
    enabled: !!primaryPerson?.id
  });

  const columns = [
    { title: 'Target', status: 'TARGET' },
    { title: 'Applied', status: 'APPLIED' },
    { title: 'Interviewing', status: 'INTERVIEWING' },
    { title: 'Offered', status: 'OFFERED' },
    { title: 'Rejected', status: 'REJECTED' },
    { title: 'Aborted', status: 'ABORTED' },
  ];

  const handleCreate = () => {
    setSelectedLead(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (lead: JobOpportunity) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedLead(undefined);
  };

  if (isLoading) return <div className={styles.loading}>Loading leads...</div>;
  if (error) return <div className={styles.error}>Error: {(error as any).message}</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Leads Board</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your job search pipeline.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select 
            className={styles.selectFilter}
            value={selectedProfileId}
            onChange={(e) => setSelectedProfileId(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
          >
            <option value="all">All Profiles</option>
            {profiles.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
          <button className={styles.addButton} onClick={handleCreate}>
            <Plus size={18} />
            <span>New Lead</span>
          </button>
        </div>
      </header>

      <div className={styles.board}>
        {columns.map((column) => {
          const colLeads = leads.filter(l => {
            const matchesStatus = l.status === column.status;
            const matchesSearch = (l.jobTitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                                (l.organization?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
            const matchesProfile = selectedProfileId === 'all' || l.jobProfile?.id === selectedProfileId;
            return matchesStatus && matchesSearch && matchesProfile;
          });
          
          return (
            <div key={column.status} className={styles.column}>
              <div className={styles.columnHeader}>
                <span className={styles.columnTitle}>{column.title}</span>
                <span className={styles.columnCount}>{colLeads.length}</span>
              </div>
              <div className={styles.cards}>
                {colLeads.map((lead) => (
                  <div key={lead.id} className={styles.card} onClick={() => handleEdit(lead)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span className={styles.orgName}>
                        {lead.organization?.name}
                      </span>
                    </div>
                    <h3 className={styles.cardTitle}>{lead.jobTitle}</h3>
                    <div className={styles.profileBadge}>{lead.jobProfile?.title}</div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                      {lead.jobPostingUrl && (
                        <a 
                          href={lead.jobPostingUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className={styles.linkIcon} 
                          onClick={(e) => e.stopPropagation()}
                          title="View Posting"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                    <div className={styles.cardFooter}>
                      <div className={styles.metaItem}>
                         <Calendar size={12} />
                         <span>{lead.applicationDate ? new Date(lead.applicationDate).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <ChevronRight size={14} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={selectedLead ? 'Edit Lead' : 'Create New Lead'}
      >
        <LeadForm 
          initialData={selectedLead} 
          onSuccess={closeModal} 
          onCancel={closeModal} 
        />
      </Modal>
    </div>
  );
};

export default LeadsPage;
