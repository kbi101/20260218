import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { 
  Briefcase, 
  FileText, 
  ChevronRight,
  Send,
  UserCheck,
  CheckCircle,
  FileBadge
} from 'lucide-react';
import styles from './DashboardPage.module.css';
import type { JobOpportunity, Resume } from '../../types';
import { useUser } from '../../context/UserContext';

const DashboardPage: React.FC = () => {
  const { primaryPerson } = useUser();
  const { data: leads = [] } = useQuery<JobOpportunity[]>({
    queryKey: ['leads', primaryPerson?.id],
    queryFn: async () => {
      const response = await axios.get('/api/job-opportunities', { params: { personId: primaryPerson?.id } });
      return response.data;
    },
    enabled: !!primaryPerson?.id
  });

  const { data: resumes = [] } = useQuery<Resume[]>({
    queryKey: ['resumes', primaryPerson?.id],
    queryFn: async () => {
      const response = await axios.get('/api/resumes', { params: { personId: primaryPerson?.id } });
      return response.data;
    },
    enabled: !!primaryPerson?.id
  });

  const counts = {
    total: leads.length,
    applied: leads.filter(l => l.status === 'APPLIED').length,
    interviewing: leads.filter(l => l.status === 'INTERVIEWING').length,
    offered: leads.filter(l => l.status === 'OFFERED').length,
    aborted: leads.filter(l => l.status === 'ABORTED').length,
  };

  return (
    <div className={styles.container}>
      <header>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>Welcome back!</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem' }}>Here's what's happening in your job search.</p>
      </header>

      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
             <div style={{ backgroundColor: '#eff6ff', padding: '10px', borderRadius: '12px' }}>
                <Send size={24} color="#3b82f6" />
             </div>
          </div>
          <p className={styles.statLabel}>Total Leads</p>
          <p className={styles.statValue}>{counts.total}</p>
        </div>
        <div className={styles.statCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
             <div style={{ backgroundColor: '#fdf4ff', padding: '10px', borderRadius: '12px' }}>
                <UserCheck size={24} color="#d946ef" />
             </div>
          </div>
          <p className={styles.statLabel}>Interviews</p>
          <p className={styles.statValue}>{counts.interviewing}</p>
        </div>
        <div className={styles.statCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
             <div style={{ backgroundColor: '#ecfdf5', padding: '10px', borderRadius: '12px' }}>
                <CheckCircle size={24} color="#10b981" />
             </div>
          </div>
          <p className={styles.statLabel}>Applications</p>
          <p className={styles.statValue}>{counts.applied}</p>
        </div>
        <div className={styles.statCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
             <div style={{ backgroundColor: '#fff7ed', padding: '10px', borderRadius: '12px' }}>
                <FileBadge size={24} color="#f59e0b" />
             </div>
          </div>
          <p className={styles.statLabel}>Resumes</p>
          <p className={styles.statValue}>{resumes.length}</p>
        </div>
      </section>

      <div className={styles.recentGrid}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Upcoming & Active Leads</h2>
            <button style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem' }}>View Board</button>
          </div>
          <div className={styles.cardList}>
            {leads.slice(0, 4).map((lead) => (
              <div key={lead.id} className={styles.itemCard}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                   <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                      <Briefcase size={20} color="var(--text-muted)" />
                   </div>
                   <div className={styles.itemInfo}>
                      <h4>{lead.jobTitle}</h4>
                      <p>{lead.organization?.name} • <span style={{ color: 'var(--primary)', fontWeight: 500 }}>{lead.status}</span></p>
                   </div>
                </div>
                <ChevronRight size={18} color="var(--text-light)" />
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Resumes</h2>
            <button style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem' }}>Manage All</button>
          </div>
          <div className={styles.cardList}>
             {resumes.length > 0 ? resumes.slice(0, 3).map(resume => (
               <div key={resume.id} className={styles.itemCard}>
                 <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <FileText size={18} color="var(--text-muted)" />
                    <div className={styles.itemInfo}>
                       <h4 style={{ fontSize: '0.875rem' }}>{resume.name}</h4>
                       <p style={{ fontSize: '0.75rem' }}>Updated {resume.lastUpdated ? new Date(resume.lastUpdated).toLocaleDateString() : 'N/A'}</p>
                    </div>
                 </div>
                 {resume.isPrimary && <span style={{ fontSize: '0.625rem', backgroundColor: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>PRIMARY</span>}
               </div>
             )) : (
               <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px dashed var(--border)' }}>
                 No resumes found.
               </div>
             )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
