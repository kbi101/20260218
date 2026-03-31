import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { 
  Plus, 
  FileText, 
  Clock, 
  FileDown,
  Edit2, 
  Trash2,
  FileCheck,
  Eye
} from 'lucide-react';
import ConfirmModal from '../../components/ConfirmModal';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import styles from './ResumesPage.module.css';
import type { Resume } from '../../types';
import Modal from '../../components/Modal';
import ResumeForm from './ResumeForm';
import ResumeSnippets from './ResumeSnippets';
import { useUser } from '../../context/UserContext';

const ResumesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { primaryPerson } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResume, setSelectedResume] = useState<Resume | undefined>(undefined);
  const [previewResume, setPreviewResume] = useState<Resume | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'versions' | 'snippets'>(
    (localStorage.getItem('resumes_active_tab') as any) || 'versions'
  );
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState<number | null>(null);

  React.useEffect(() => {
    localStorage.setItem('resumes_active_tab', activeTab);
  }, [activeTab]);

  const { data: resumes = [], isLoading } = useQuery<Resume[]>({
    queryKey: ['resumes', primaryPerson?.id],
    queryFn: async () => (await axios.get('/api/resumes', { params: { personId: primaryPerson?.id } })).data,
    enabled: !!primaryPerson?.id
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => axios.delete(`/api/resumes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      if (previewResume?.id === selectedResume?.id) setPreviewResume(undefined);
    }
  });

  const handleEdit = (resume: Resume) => {
    setSelectedResume(resume);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedResume(undefined);
    setIsModalOpen(true);
  };

  const openDeleteConfirm = (id: number) => {
    setResumeToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const executeDelete = () => {
    if (resumeToDelete) {
      deleteMutation.mutate(resumeToDelete);
    }
  };

  const handleDownload = async (resume: Resume, format: 'pdf' | 'docx') => {
    try {
      const response = await axios.get(`/api/resumes/${resume.id}/export/${format}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${resume.name}.${format === 'pdf' ? 'pdf' : 'docx'}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error(`Export failed: ${error}`);
      alert('Failed to export resume.');
    }
  };

  if (isLoading) return <div className={styles.loading}>Loading resumes...</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Resumes</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your resume versions and exports.</p>
        </div>
        <button className={styles.addButton} onClick={handleCreate}>
          <Plus size={18} />
          <span>New Resume</span>
        </button>
      </header>

      <div className={styles.tabSwitcher}>
         <button 
           className={`${styles.tabButton} ${activeTab === 'versions' ? styles.tabActive : ''}`}
           onClick={() => setActiveTab('versions')}
         >
           <FileText size={18} />
           <span>Resume Versions</span>
         </button>
         <button 
           className={`${styles.tabButton} ${activeTab === 'snippets' ? styles.tabActive : ''}`}
           onClick={() => setActiveTab('snippets')}
         >
           <Plus size={18} />
           <span>Resume Snippets</span>
         </button>
      </div>

      {activeTab === 'versions' ? (
        <>
          <div className={styles.resumeGrid}>
            {resumes.map((resume) => (
              <div 
                key={resume.id} 
                className={`${styles.resumeCard} ${previewResume?.id === resume.id ? styles.activeCard : ''}`}
                onClick={() => setPreviewResume(resume)}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.iconWrapper}>
                    <FileText size={20} color="var(--primary)" />
                  </div>
                  <div className={styles.statusBadges}>
                    {resume.isPrimary && <span className={styles.primaryBadge}><FileCheck size={10} /> PRIMARY</span>}
                  </div>
                </div>
                
                <div className={styles.resumeInfo}>
                  <h3 className={styles.resumeName}>{resume.name}</h3>
                  <div className={styles.meta}>
                    <Clock size={12} />
                    <span>Last Updated: {resume.lastUpdated ? new Date(resume.lastUpdated).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>

                <div className={styles.cardActions}>
                  <button 
                    title="Download PDF" 
                    className={styles.actionButton}
                    onClick={(e) => { e.stopPropagation(); handleDownload(resume, 'pdf'); }}
                  >
                    <FileDown size={18} />
                  </button>
                  <button 
                    title="Edit version" 
                    className={styles.actionButton}
                    onClick={(e) => { e.stopPropagation(); handleEdit(resume); }}
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    title="Delete version" 
                    className={styles.deleteButton}
                    onClick={(e) => { e.stopPropagation(); openDeleteConfirm(resume.id); }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <section className={styles.previewSection}>
             <div className={styles.previewHeader}>
                <h3>Preview: {previewResume?.name || 'Markdown Selection'}</h3>
                <div className={styles.previewActions}>
                  {previewResume && (
                    <>
                      <button className={styles.exportBtn} onClick={() => handleEdit(previewResume)}>Edit Version</button>
                      <button className={styles.exportBtn} onClick={() => handleDownload(previewResume, 'pdf')}>Export PDF</button>
                      <button className={styles.exportBtn} onClick={() => handleDownload(previewResume, 'docx')}>Export Word</button>
                    </>
                  )}
                </div>
             </div>
             <div className={styles.previewContent}>
                {previewResume ? (
                  <div 
                    className={styles.markdownBody}
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(previewResume.content) as string) }}
                  />
                ) : (
                  <div className={styles.emptyState}>
                    <Eye size={48} color="var(--border)" />
                    <p>Select a resume to preview its content.</p>
                  </div>
                )}
             </div>
          </section>
        </>
      ) : (
        <ResumeSnippets 
          personId={primaryPerson?.id} 
          availableResumes={resumes} 
        />
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={selectedResume ? 'Edit Resume' : 'Create New Resume'}
      >
        <ResumeForm 
            initialData={selectedResume || { person: primaryPerson || undefined }} 
            onSuccess={() => setIsModalOpen(false)} 
            onCancel={() => setIsModalOpen(false)} 
        />
      </Modal>

      <ConfirmModal 
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={executeDelete}
        title="Delete Resume Version?"
        message="Are you sure you want to delete this resume version? All tailored content and formatting for this version will be permanently removed."
        confirmText="Delete Version"
      />
    </div>
  );
};

export default ResumesPage;
