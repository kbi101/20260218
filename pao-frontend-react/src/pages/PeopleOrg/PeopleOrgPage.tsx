import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { 
  Building2, 
  Users, 
  Plus, 
  Mail, 
  Phone, 
  Linkedin, 
  Globe, 
  Briefcase, 
  Trash2, 
  Edit3, 
  Sparkles,
  ArrowRightLeft,
  Link2,
  Loader2,
  Share2
} from 'lucide-react';
import { useSearch } from '../../context/SearchContext';
import Modal from '../../components/Modal';
import ConfirmModal from '../../components/ConfirmModal';
import PersonForm from './PersonForm';
import OrganizationForm from './OrganizationForm';
import RelationshipForm from './RelationshipForm';
import GraphHub from '../GraphHub/GraphHub';
import { useStatus } from '../../context/StatusContext';
import { useUser } from '../../context/UserContext';
import styles from './PeopleOrgPage.module.css';
import type { Person, Organization, Relationship } from '../../types';

const PeopleOrgPage: React.FC = () => {
  const { showStatus, setIsProcessing } = useStatus();
  const { primaryPerson, setPrimaryPerson } = useUser();
  const [activeTab, setActiveTab] = useState<'people' | 'organizations' | 'relationships' | 'graph'>(
    (localStorage.getItem('intelligence_hub_tab') as any) || 'people'
  );

  useEffect(() => {
    localStorage.setItem('intelligence_hub_tab', activeTab);
  }, [activeTab]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [linkSource, setLinkSource] = useState<{type: 'PERSON' | 'ORGANIZATION', id: number} | null>(null);
  
  // Confirmation state
  const [confirmDelete, setConfirmDelete] = useState<{isOpen: boolean, id: number, type: 'PERSON' | 'ORGANIZATION' | 'RELATIONSHIP'} | null>(null);

  const { searchQuery } = useSearch();
  const queryClient = useQueryClient();

  // Queries
  const { data: people = [] } = useQuery<Person[]>({
    queryKey: ['people'],
    queryFn: async () => (await axios.get('/api/people')).data
  });

  const { data: organizations = [] } = useQuery<Organization[]>({
    queryKey: ['organizations'],
    queryFn: async () => (await axios.get('/api/organizations')).data
  });

  const { data: relationships = [] } = useQuery<Relationship[]>({
    queryKey: ['relationships'],
    queryFn: async () => (await axios.get('/api/relationships')).data
  });

  // Mutations
  const createPerson = useMutation({
    mutationFn: (p: Partial<Person>) => axios.post('/api/people', p),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['people'] }); setIsModalOpen(false); }
  });

  const updatePerson = useMutation({
    mutationFn: (p: Person) => axios.put(`/api/people/${p.id}`, p),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['people'] }); setIsModalOpen(false); }
  });

  const deletePerson = useMutation({
    mutationFn: (id: number) => axios.delete(`/api/people/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['people'] })
  });

  const createOrg = useMutation({
    mutationFn: (o: Partial<Organization>) => axios.post('/api/organizations', o),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['organizations'] }); setIsModalOpen(false); }
  });

  const updateOrg = useMutation({
    mutationFn: (o: Organization) => axios.put(`/api/organizations/${o.id}`, o),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['organizations'] }); setIsModalOpen(false); }
  });

  const deleteOrg = useMutation({
    mutationFn: (id: number) => axios.delete(`/api/organizations/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['organizations'] })
  });

  const createRel = useMutation({
    mutationFn: (r: Partial<Relationship>) => axios.post('/api/relationships', r),
    onSuccess: () => { 
        queryClient.invalidateQueries({ queryKey: ['relationships'] }); 
        queryClient.invalidateQueries({ queryKey: ['graph-positions'] }); 
        setIsModalOpen(false); 
        setLinkSource(null);
    }
  });

  const deleteRel = useMutation({
    mutationFn: (id: number) => axios.delete(`/api/relationships/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['relationships'] })
  });
  
  const enrichPerson = useMutation({
    mutationFn: (id: number) => {
        const p = people.find(x => x.id === id);
        const name = p ? `${p.firstName} ${p.lastName}` : `ID ${id}`;
        setIsProcessing(true);
        showStatus(`Enriching profile for ${name}...`, 0);
        
        // Log to Task Stream
        axios.post('/api/admin/logs', {
            source: 'FRONTEND',
            category: 'AI_COMMAND',
            level: 'INFO',
            message: `Initiating profile enrichment for ${name}`,
            details: `Target Person ID: ${id}`
        }).catch(() => {});

        return axios.post(`/api/people/${id}/enrich`);
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['people'] });
        setIsProcessing(false);
        showStatus('Enrichment complete!', 3000);
    },
    onError: () => {
        setIsProcessing(false);
        showStatus('Enrichment failed. Check Task Stream.', 5000);
    }
  });

  const enrichOrg = useMutation({
    mutationFn: (id: number) => {
        const o = organizations.find(x => x.id === id);
        const name = o?.name || `ID ${id}`;
        setIsProcessing(true);
        showStatus(`Discovering market data for ${name}...`, 0);

        // Log to Task Stream
        axios.post('/api/admin/logs', {
            source: 'FRONTEND',
            category: 'AI_COMMAND',
            level: 'INFO',
            message: `Initiating market discovery for ${name}`,
            details: `Target Organization ID: ${id}`
        }).catch(() => {});

        return axios.post(`/api/organizations/${id}/enrich`);
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['organizations'] });
        setIsProcessing(false);
        showStatus('Market data synced!', 3000);
    },
    onError: () => {
        setIsProcessing(false);
        showStatus('Metadata discovery failed.', 5000);
    }
  });

  // Filters
  const filteredPeople = people.filter(p => 
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrgs = organizations.filter(o => 
    o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.industry?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRels = relationships.filter(r => {
      const q = searchQuery.toLowerCase();
      const sLabel = r.sourcePerson ? `${r.sourcePerson.firstName} ${r.sourcePerson.lastName}` : r.sourceOrganization?.name || '';
      const tLabel = r.targetPerson ? `${r.targetPerson.firstName} ${r.targetPerson.lastName}` : r.targetOrganization?.name || '';
      return sLabel.toLowerCase().includes(q) || tLabel.toLowerCase().includes(q) || r.type.toLowerCase().includes(q);
  });

  const handleConfirmDelete = () => {
      if (!confirmDelete) return;
      if (confirmDelete.type === 'PERSON') deletePerson.mutate(confirmDelete.id);
      else if (confirmDelete.type === 'ORGANIZATION') deleteOrg.mutate(confirmDelete.id);
      else if (confirmDelete.type === 'RELATIONSHIP') deleteRel.mutate(confirmDelete.id);
      setConfirmDelete(null);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Intelligence Hub</h1>
          <p>Analyze and manage your professional network infrastructure.</p>
        </div>
        <button className={styles.addButton} onClick={() => { setEditingItem(null); setLinkSource(null); setIsModalOpen(true); }}>
          <Plus size={20} />
          <span>Add {activeTab === 'people' ? 'Person' : activeTab === 'organizations' ? 'Organization' : 'Relationship'}</span>
        </button>
      </header>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${activeTab === 'people' ? styles.tabActive : ''}`} onClick={() => setActiveTab('people')}>
          <Users size={18} /> <span>People</span> <span className={styles.badge}>{people.length}</span>
        </button>
        <button className={`${styles.tab} ${activeTab === 'organizations' ? styles.tabActive : ''}`} onClick={() => setActiveTab('organizations')}>
          <Building2 size={18} /> <span>Organizations</span> <span className={styles.badge}>{organizations.length}</span>
        </button>
        <button className={`${styles.tab} ${activeTab === 'relationships' ? styles.tabActive : ''}`} onClick={() => setActiveTab('relationships')}>
          <ArrowRightLeft size={18} /> <span>Relationships</span> <span className={styles.badge}>{relationships.length}</span>
        </button>
        <button className={`${styles.tab} ${activeTab === 'graph' ? styles.tabActive : ''}`} onClick={() => setActiveTab('graph')}>
          <Share2 size={18} /> <span>Network Map</span>
        </button>
      </div>

      <div className={activeTab === 'graph' ? `${styles.content} ${styles.contentFull}` : styles.content}>
        {activeTab === 'people' && (
          <div className={styles.grid}>
            {filteredPeople.map(person => (
              <div key={person.id} className={styles.card}>
                <div className={styles.cardInfo}>
                  <div className={styles.avatar}>{person.firstName[0]}{person.lastName[0]}</div>
                  <div className={styles.details}>
                    <h3>{person.firstName} {person.lastName}</h3>
                    <div className={styles.title}><Briefcase size={14} /> {person.title || 'Professional'}</div>
                  </div>
                  {primaryPerson?.id === person.id && <div className={styles.primaryBadge}>Primary</div>}
                </div>
                <div className={styles.contactInfo}>
                  {person.email && <div className={styles.contactItem}><Mail size={14} /> {person.email}</div>}
                  {person.phone && <div className={styles.contactItem}><Phone size={14} /> {person.phone}</div>}
                </div>
                <div className={styles.cardFooter}>
                  <div className={styles.socialActions}>
                    {person.linkedInUrl && <a href={person.linkedInUrl} className={styles.socialLink}><Linkedin size={16} /></a>}
                    <button className={styles.iconLinkBtn} onClick={() => { setLinkSource({type: 'PERSON', id: person.id}); setActiveTab('relationships'); setIsModalOpen(true); }}><Link2 size={16} /></button>
                    <button 
                      className={`${styles.iconLinkBtn} ${primaryPerson?.id === person.id ? styles.primaryActive : ''}`} 
                      onClick={() => setPrimaryPerson(person)}
                      title="Set as Primary Person"
                    >
                      <Users size={16} />
                    </button>
                  </div>
                  <div className={styles.cardActions}>
                    <button className={`${styles.actionBtn} ${styles.aiBtn}`} onClick={() => enrichPerson.mutate(person.id)} disabled={enrichPerson.isPending}>{enrichPerson.isPending ? <Loader2 size={16} className={styles.spin} /> : <Sparkles size={16} />}</button>
                    <button className={styles.actionBtn} onClick={() => { setEditingItem(person); setIsModalOpen(true); }}><Edit3 size={16} /></button>
                    <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => setConfirmDelete({isOpen: true, id: person.id, type: 'PERSON'})}><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'organizations' && (
          <div className={styles.grid}>
            {filteredOrgs.map(org => (
              <div key={org.id} className={styles.card}>
                <div className={styles.cardInfo}>
                  <div className={`${styles.avatar} ${styles.orgAvatar}`}><Building2 size={24} /></div>
                  <div className={styles.details}><h3>{org.name}</h3><div className={styles.title}>{org.industry || 'Industry'}</div></div>
                </div>
                <div className={styles.cardFooter}>
                   <div className={styles.socialActions}>
                        {org.website && <a href={org.website} className={styles.socialLink}><Globe size={16} /></a>}
                        <button className={styles.iconLinkBtn} onClick={() => { setLinkSource({type: 'ORGANIZATION', id: org.id}); setActiveTab('relationships'); setIsModalOpen(true); }}><Link2 size={16} /></button>
                  </div>
                  <div className={styles.cardActions}>
                    <button className={`${styles.actionBtn} ${styles.aiBtn}`} onClick={() => enrichOrg.mutate(org.id)} disabled={enrichOrg.isPending}>{enrichOrg.isPending ? <Loader2 size={16} className={styles.spin} /> : <Sparkles size={16} />}</button>
                    <button className={styles.actionBtn} onClick={() => { setEditingItem(org); setIsModalOpen(true); }}><Edit3 size={16} /></button>
                    <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => setConfirmDelete({isOpen: true, id: org.id, type: 'ORGANIZATION'})}><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'relationships' && (
          <div className={styles.relList}>
            {filteredRels.map(rel => (
              <div key={rel.id} className={styles.relCard}>
                <div className={styles.relEntity}>
                   {rel.sourcePerson ? <Users size={16} /> : <Building2 size={16} />}
                   <span>{rel.sourcePerson ? `${rel.sourcePerson.firstName} ${rel.sourcePerson.lastName}` : rel.sourceOrganization?.name}</span>
                </div>
                <div className={styles.relType}>
                  <div className={styles.relLine}></div>
                  <span>{rel.type}</span>
                  <ArrowRightLeft size={14} />
                </div>
                <div className={styles.relEntity}>
                   {rel.targetPerson ? <Users size={16} /> : <Building2 size={16} />}
                   <span>{rel.targetPerson ? `${rel.targetPerson.firstName} ${rel.targetPerson.lastName}` : rel.targetOrganization?.name}</span>
                </div>
                <button className={styles.deleteRelBtn} onClick={() => setConfirmDelete({isOpen: true, id: rel.id, type: 'RELATIONSHIP'})}>
                   <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'graph' && <GraphHub isEmbedded={true} />}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => {setIsModalOpen(false); setLinkSource(null);}} 
        title={linkSource ? 'Create Connection' : editingItem ? `Edit` : `Add New`}
      >
        {activeTab === 'people' && <PersonForm initialData={editingItem} onSave={(d) => editingItem ? updatePerson.mutate({...editingItem, ...d}) : createPerson.mutate(d)} onCancel={() => setIsModalOpen(false)} />}
        {activeTab === 'organizations' && <OrganizationForm initialData={editingItem} onSave={(d) => editingItem ? updateOrg.mutate({...editingItem, ...d}) : createOrg.mutate(d)} onCancel={() => setIsModalOpen(false)} />}
        {activeTab === 'relationships' && <RelationshipForm people={people} organizations={organizations} onSave={(d) => createRel.mutate(d)} onCancel={() => setIsModalOpen(false)} initialSource={linkSource} />}
      </Modal>

      <ConfirmModal 
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleConfirmDelete}
        title={`Confirm Delete`}
        message={`Are you sure you want to delete this ${confirmDelete?.type.toLowerCase().replace('relationship', 'connection')}? This action cannot be undone.`}
      />
    </div>
  );
};

export default PeopleOrgPage;
