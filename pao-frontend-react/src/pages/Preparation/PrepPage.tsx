import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { 
  Plus, 
  Target, 
  Mic2, 
  ChevronRight, 
  Zap,
} from 'lucide-react';
import styles from './PrepPage.module.css';
import type { JobProfile, ElevatorPitch } from '../../types';
import Modal from '../../components/Modal';
import JobProfileForm from './JobProfileForm';
import PitchForm from './PitchForm';
import { useUser } from '../../context/UserContext';
import PracticeMode from './PracticeMode';

const PrepPage: React.FC = () => {
  const { primaryPerson } = useUser();
  const [activeTab, setActiveTab] = useState<'profiles' | 'pitches'>(
    (localStorage.getItem('prep_active_tab') as any) || 'profiles'
  );

  React.useEffect(() => {
    localStorage.setItem('prep_active_tab', activeTab);
  }, [activeTab]);
  const [modalType, setModalType] = useState<'profile' | 'pitch' | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<JobProfile | undefined>(undefined);
  const [selectedPitch, setSelectedPitch] = useState<ElevatorPitch | undefined>(undefined);
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [practicePitch, setPracticePitch] = useState<ElevatorPitch | null>(null);

  const { data: profiles = [] } = useQuery<JobProfile[]>({
    queryKey: ['profiles', primaryPerson?.id],
    queryFn: async () => (await axios.get('/api/job-profiles', { params: { personId: primaryPerson?.id } })).data,
    enabled: !!primaryPerson?.id
  });

  const { data: pitches = [] } = useQuery<ElevatorPitch[]>({
    queryKey: ['pitches'],
    queryFn: async () => (await axios.get('/api/pitches')).data
  });

  const openProfileModal = (profile?: JobProfile) => {
    setSelectedProfile(profile);
    setModalType('profile');
    setIsModalOpen(true);
  };

  const openPitchModal = (pitch?: ElevatorPitch) => {
    setSelectedPitch(pitch);
    setModalType('pitch');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType(null);
    setSelectedProfile(undefined);
    setSelectedPitch(undefined);
  };

  const openPracticeMode = (pitch: ElevatorPitch) => {
    setPracticePitch(pitch);
    setIsPracticeMode(true);
  };

  const closePracticeMode = () => {
    setIsPracticeMode(false);
    setPracticePitch(null);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Preparation Hub</h1>
          <p style={{ color: 'var(--text-muted)' }}>Define your target roles and master your pitch.</p>
        </div>
        <div className={styles.tabSwitcher}>
           <button 
             className={`${styles.tabButton} ${activeTab === 'profiles' ? styles.tabActive : ''}`}
             onClick={() => setActiveTab('profiles')}
           >
             <Target size={18} />
             <span>Job Profiles</span>
           </button>
           <button 
             className={`${styles.tabButton} ${activeTab === 'pitches' ? styles.tabActive : ''}`}
             onClick={() => setActiveTab('pitches')}
           >
             <Mic2 size={18} />
             <span>Elevator Pitches</span>
           </button>
        </div>
      </header>

      <div className={styles.content}>
        {activeTab === 'profiles' ? (
          <div className={styles.grid}>
             <div className={styles.actionCard} onClick={() => openProfileModal()}>
                <Plus size={32} color="var(--primary)" />
                <h3>New Profile</h3>
                <p>Define a new target job role and expectations.</p>
             </div>
             {profiles.map(profile => (
                <div key={profile.id} className={styles.card} onClick={() => openProfileModal(profile)}>
                  <div className={styles.cardIcon}>
                     <Target size={24} color="var(--primary)" />
                  </div>
                  <div className={styles.info}>
                     <h3>{profile.title}</h3>
                     <p>{profile.targetIndustry || 'Generic Industry'} • {profile.workModel || 'Remote'}</p>
                  </div>
                  <div className={styles.stats}>
                     <div className={styles.stat}>
                        <span className={styles.label}>Salary</span>
                        <span className={styles.value}>{profile.expectedSalary || 'N/A'}</span>
                     </div>
                     <div className={styles.stat}>
                        <span className={styles.label}>Type</span>
                        <span className={styles.value}>{profile.jobType?.replace('_', ' ') || 'FULL TIME'}</span>
                     </div>
                  </div>
                  <button className={styles.editBtn}>
                     <ChevronRight size={18} />
                  </button>
                </div>
             ))}
          </div>
        ) : (
          <div className={styles.grid}>
             <div className={styles.pitchActionCard} onClick={() => openPitchModal()}>
                <Zap size={32} color="#f59e0b" />
                <h3>Generate AI Pitch</h3>
                <p>Create a powerful pitch tailored to your profile.</p>
             </div>
             {pitches.map(pitch => (
                <div key={pitch.id} className={styles.pitchCard} onClick={() => openPitchModal(pitch)}>
                  <div className={styles.pitchHeader}>
                     <h3 className={styles.pitchName}>{pitch.name}</h3>
                     <span className={styles.roleTag}>{pitch.targetRole}</span>
                  </div>
                  <div className={styles.bullets}>
                     {pitch.bullets?.split('\n').filter(b => b.trim()).slice(0, 3).map((bullet, i) => (
                       <p key={i}>• {bullet}</p>
                     ))}
                  </div>
                  <div className={styles.pitchFooter}>
                     <button className={styles.practiceBtn} onClick={(e) => { e.stopPropagation(); openPracticeMode(pitch); }}>Practice Mode</button>
                     <button className={styles.editBtn}>Edit</button>
                  </div>
                </div>
             ))}
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={modalType === 'profile' ? (selectedProfile ? 'Edit Job Profile' : 'New Job Profile') : (selectedPitch ? 'Edit Pitch' : 'AI Pitch Generator')}
      >
        {modalType === 'profile' ? (
          <JobProfileForm 
              initialData={selectedProfile || { person: primaryPerson || undefined }} 
              onSuccess={closeModal} 
              onCancel={closeModal} 
          />
        ) : (
          <PitchForm 
              initialData={selectedPitch} 
              onSuccess={closeModal} 
              onCancel={closeModal} 
          />
        )}
      </Modal>

      {isPracticeMode && practicePitch && (
        <PracticeMode pitch={practicePitch} onClose={closePracticeMode} />
      )}
    </div>
  );
};

export default PrepPage;
