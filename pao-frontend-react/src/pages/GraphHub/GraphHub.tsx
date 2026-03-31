import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  ReactFlow, 
  Controls, 
  Background, 
  applyNodeChanges, 
  applyEdgeChanges, 
  type Node, 
  type Edge, 
  type OnNodesChange, 
  type OnEdgesChange,
  type OnConnect,
  addEdge,
  type Connection,
  Panel,
  type OnNodeDrag
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Save, RefreshCw, X, Mail, Phone, User, Building, Plus, Trash2, ArrowRightLeft } from 'lucide-react';
import { useSearch } from '../../context/SearchContext';
import Modal from '../../components/Modal';
import ConfirmModal from '../../components/ConfirmModal';
import RelationshipForm from '../PeopleOrg/RelationshipForm';
import CustomNode from './CustomNode';
import styles from './GraphHub.module.css';
import './GraphFlow.css';
import type { Person, Organization, Relationship, GraphNodePosition } from '../../types';

const nodeTypes = {
  custom: CustomNode,
};

interface GraphHubProps {
  isEmbedded?: boolean;
}

const GraphHub: React.FC<GraphHubProps> = ({ isEmbedded = false }) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [, setShowSavedToast] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<{type: 'p'|'o', data: any} | null>(() => {
    const saved = localStorage.getItem('graph_selected_entity');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (selectedEntity) {
        localStorage.setItem('graph_selected_entity', JSON.stringify(selectedEntity));
    } else {
        localStorage.removeItem('graph_selected_entity');
    }
  }, [selectedEntity]);

  const [isRelModalOpen, setIsRelModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  
  const { searchQuery } = useSearch();
  const queryClient = useQueryClient();
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Queries
  const { data: people = [], isLoading: pL } = useQuery<Person[]>({ 
    queryKey: ['people'], 
    queryFn: async () => (await axios.get('/api/people')).data 
  });
  const { data: orgs = [], isLoading: oL } = useQuery<Organization[]>({ 
    queryKey: ['organizations'], 
    queryFn: async () => (await axios.get('/api/organizations')).data 
  });
  const { data: relationships = [], isLoading: rL } = useQuery<Relationship[]>({ 
    queryKey: ['relationships'], 
    queryFn: async () => (await axios.get('/api/relationships')).data 
  });
  const { data: positions = [], isLoading: psL } = useQuery<GraphNodePosition[]>({ 
    queryKey: ['graph-positions'], 
    queryFn: async () => {
      try {
        const res = await axios.get('/api/graph/positions');
        return res.data;
      } catch (e) {
        return [];
      }
    }
  });

  const isLoading = pL || oL || rL || psL;

  const savePositionsMutation = useMutation({
    mutationFn: (newPositions: GraphNodePosition[]) => axios.post('/api/graph/positions', newPositions),
    onSuccess: () => {
        setShowSavedToast(true);
        setTimeout(() => setShowSavedToast(false), 2000);
    }
  });

  const createRelMutation = useMutation({
    mutationFn: (r: any) => axios.post('/api/relationships', r),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['relationships'] });
        setIsRelModalOpen(false);
    }
  });

  const deleteRelMutation = useMutation({
    mutationFn: (id: number) => axios.delete(`/api/relationships/${id}`),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['relationships'] });
    }
  });

  useEffect(() => {
    if (isLoading) return;
    const query = searchQuery.toLowerCase().trim();
    const posMap = new Map((positions || []).map(p => [p.nodeId, p]));

    const primaryPeopleIds = new Set(people
      .filter(p => !query || `${p.firstName} ${p.lastName}`.toLowerCase().includes(query) || p.title?.toLowerCase().includes(query))
      .map(p => `p-${p.id}`));

    const primaryOrgIds = new Set(orgs
      .filter(o => !query || o.name.toLowerCase().includes(query) || o.industry?.toLowerCase().includes(query))
      .map(o => `o-${o.id}`));

    const primaryMatchIds = new Set([...primaryPeopleIds, ...primaryOrgIds]);
    const expandedMatchIds = new Set([...primaryMatchIds]);
    
    if (query) {
        relationships.forEach(r => {
            const sid = r.sourcePerson?.id ? `p-${r.sourcePerson.id}` : r.sourceOrganization?.id ? `o-${r.sourceOrganization.id}` : '';
            const tid = r.targetPerson?.id ? `p-${r.targetPerson.id}` : r.targetOrganization?.id ? `o-${r.targetOrganization.id}` : '';
            if (sid && tid) {
                if (primaryMatchIds.has(sid)) expandedMatchIds.add(tid);
                if (primaryMatchIds.has(tid)) expandedMatchIds.add(sid);
            }
        });
    }

    const pNodes: Node[] = people
      .filter(p => expandedMatchIds.has(`p-${p.id}`))
      .map((p, i) => {
          const id = `p-${p.id}`;
          const pos = posMap.get(id);
          return {
            id,
            type: 'custom',
            position: pos && typeof pos.x === 'number' ? { x: pos.x, y: pos.y } : { x: (i % 6) * 300, y: Math.floor(i / 6) * 150 },
            data: { label: `${p.firstName} ${p.lastName}`, type: 'PERSON', subLabel: p.title, original: p },
          } as Node;
      });

    const oNodes: Node[] = orgs
      .filter(o => expandedMatchIds.has(`o-${o.id}`))
      .map((o, i) => {
          const id = `o-${o.id}`;
          const pos = posMap.get(id);
          return {
            id,
            type: 'custom',
            position: pos && typeof pos.x === 'number' ? { x: pos.x, y: pos.y } : { x: (i % 6) * 300, y: 450 + Math.floor(i / 6) * 150 },
            data: { label: o.name, type: 'ORGANIZATION', subLabel: o.industry, original: o },
          } as Node;
      });

    const nodeIds = new Set([...pNodes, ...oNodes].map(n => n.id));

    const fEdges: Edge[] = (relationships || [])
      .map(r => {
          const sid = r.sourcePerson?.id ? `p-${r.sourcePerson.id}` : r.sourceOrganization?.id ? `o-${r.sourceOrganization.id}` : '';
          const tid = r.targetPerson?.id ? `p-${r.targetPerson.id}` : r.targetOrganization?.id ? `o-${r.targetOrganization.id}` : '';
          if (!sid || !tid || !nodeIds.has(sid) || !nodeIds.has(tid)) return null;
          return { id: `r-${r.id}`, source: sid, target: tid, label: r.type, animated: true, style: { stroke: 'var(--primary)', strokeWidth: 2 } } as Edge;
      })
      .filter((e): e is Edge => e !== null);

    setNodes([...pNodes, ...oNodes]);
    setEdges(fEdges);
  }, [people, orgs, relationships, positions, isLoading, searchQuery]);

  const onNodesChange: OnNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange: OnEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const onConnect: OnConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), []);

  const saveLayout = useCallback(() => {
    setNodes((currentNodes) => {
        const currentPositions: GraphNodePosition[] = currentNodes.map(n => ({ nodeId: n.id, x: n.position.x, y: n.position.y }));
        savePositionsMutation.mutate(currentPositions);
        return currentNodes;
    });
  }, [savePositionsMutation]);

  const onNodeDragStop: OnNodeDrag = useCallback(() => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => saveLayout(), 1000);
  }, [saveLayout]);

  const onNodeClick = useCallback((_: any, node: any) => {
      const type = node.id.split('-')[0] as 'p'|'o';
      setSelectedEntity({ type, data: node.data.original });
  }, []);

  const entityRelationships = relationships.filter(r => {
      if (!selectedEntity) return false;
      const sid = r.sourcePerson?.id || r.sourceOrganization?.id;
      const tid = r.targetPerson?.id || r.targetOrganization?.id;
      return sid === selectedEntity.data.id || tid === selectedEntity.data.id;
  });

  return (
    <div className={`${styles.container} ${isEmbedded ? styles.embeddedContainer : ''}`}>
      <div className={styles.flowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDragStop={onNodeDragStop}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          key={searchQuery}
          colorMode={(document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light') as any}
        >
          <Background />
          <Controls />
          
          <Panel position="top-left" className={styles.floatingHeader}>
             {!isEmbedded && (
                <div className={styles.headerContent}>
                    <h1>Network Architecture</h1>
                    <div className={styles.headerDot}></div>
                    <span className={styles.nodeCount}>{nodes.length} Nodes Synchronized</span>
                </div>
             )}
          </Panel>

          <Panel position="top-right" className={styles.panel}>
              <div className={styles.legend}>
                <div className={styles.legendItem}><div className={`${styles.dot} ${styles.personDot}`}></div> People</div>
                <div className={styles.legendItem}><div className={`${styles.dot} ${styles.orgDot}`}></div> Organizations</div>
                
                <div className={styles.panelActions}>
                    <button className={styles.saveBtn} onClick={saveLayout}>
                        <Save size={14} /> <span>Save Layout</span>
                    </button>
                    {!isEmbedded && (
                        <button className={styles.refreshBtn} onClick={() => queryClient.invalidateQueries({ queryKey: ['people', 'organizations', 'relationships'] })}>
                            <RefreshCw size={14} />
                        </button>
                    )}
                </div>
             </div>
          </Panel>
        </ReactFlow>

        {selectedEntity && (
            <div className={styles.inspectPanel}>
                <div className={styles.inspectHeader}>
                    <div className={styles.inspectAvatar}>
                        {selectedEntity.type === 'p' ? <User size={20} /> : <Building size={20} />}
                    </div>
                    <div className={styles.inspectTitle}>
                        <h3>{selectedEntity.type === 'p' ? `${selectedEntity.data.firstName} ${selectedEntity.data.lastName}` : selectedEntity.data.name}</h3>
                        <p>{selectedEntity.type === 'p' ? selectedEntity.data.title : selectedEntity.data.industry}</p>
                    </div>
                    <button className={styles.closeInspect} onClick={() => setSelectedEntity(null)}>
                        <X size={18} />
                    </button>
                </div>
                
                <div className={styles.inspectScroll}>
                    <div className={styles.inspectSection}>
                        <div className={styles.inspectRow}><Mail size={14} /> <span>{selectedEntity.data.email || 'No email'}</span></div>
                        <div className={styles.inspectRow}><Phone size={14} /> <span>{selectedEntity.data.phone || 'No phone'}</span></div>
                    </div>

                    <div className={styles.inspectSection}>
                        <header className={styles.sectionHeader}>
                            <ArrowRightLeft size={14} />
                            <span>Professional Network ({entityRelationships.length})</span>
                            <button className={styles.addRelInlineBtn} onClick={() => setIsRelModalOpen(true)}>
                                <Plus size={14} />
                            </button>
                        </header>
                        <div className={styles.inspectRelList}>
                            {entityRelationships.map(r => {
                                const isSource = (r.sourcePerson?.id === selectedEntity.data.id) || (r.sourceOrganization?.id === selectedEntity.data.id);
                                const peer = isSource 
                                    ? (r.targetPerson ? `${r.targetPerson.firstName} ${r.targetPerson.lastName}` : r.targetOrganization?.name)
                                    : (r.sourcePerson ? `${r.sourcePerson.firstName} ${r.sourcePerson.lastName}` : r.sourceOrganization?.name);
                                return (
                                    <div key={r.id} className={styles.inspectRelItem}>
                                        <div className={styles.inspectRelText}>
                                            <span className={styles.peerName}>{peer}</span>
                                            <span className={styles.relTypeLabel}>{r.type}</span>
                                        </div>
                                        <button className={styles.delRelBtn} onClick={() => setConfirmDeleteId(r.id)}>
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>

      <Modal isOpen={isRelModalOpen} onClose={() => setIsRelModalOpen(false)} title="Create New Connection">
            <RelationshipForm 
                people={people} 
                organizations={orgs} 
                onSave={(data) => createRelMutation.mutate(data)} 
                onCancel={() => setIsRelModalOpen(false)}
                initialSource={selectedEntity ? { type: selectedEntity.type === 'p' ? 'PERSON' : 'ORGANIZATION', id: selectedEntity.data.id } : null}
            />
      </Modal>

      <ConfirmModal 
        isOpen={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => confirmDeleteId && deleteRelMutation.mutate(confirmDeleteId)}
        title="Confirm Delete"
        message="Are you sure you want to delete this connection? This action is permanent."
      />
    </div>
  );
};

export default GraphHub;
