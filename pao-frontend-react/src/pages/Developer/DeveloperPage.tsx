import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { 
  Terminal, 
  Settings, 
  Trash2, 
  RefreshCw, 
  Database, 
  Server, 
  Cpu, 
  AlertCircle, 
  CheckCircle2, 
  Info,
  Save,
  Clock
} from 'lucide-react';
import styles from './DeveloperPage.module.css';

interface SiteSetting {
    key: string;
    value: string;
    description: string;
}

interface TaskLog {
    id: number;
    source: string;
    category: string;
    level: string;
    message: string;
    details: string;
    timestamp: string;
}

const DeveloperPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'logs' | 'config'>('logs');
  const [configUpdates, setConfigUpdates] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  const { data: settings = [] } = useQuery<SiteSetting[]>({
    queryKey: ['admin-settings'],
    queryFn: async () => (await axios.get('/api/admin/settings')).data
  });

  const { data: logs = [] } = useQuery<TaskLog[]>({
    queryKey: ['admin-logs'],
    queryFn: async () => (await axios.get('/api/admin/logs')).data,
    refetchInterval: activeTab === 'logs' ? 3000 : false
  });

  const updateSettingMutation = useMutation({
    mutationFn: (update: Record<string, string>) => axios.post('/api/admin/settings', update),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
        setConfigUpdates({});
    }
  });

  const clearLogsMutation = useMutation({
    mutationFn: () => axios.delete('/api/admin/logs'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-logs'] })
  });

  const handleConfigChange = (key: string, value: string) => {
      setConfigUpdates(prev => ({ ...prev, [key]: value }));
  };

  const getLogLevelIcon = (level: string) => {
      switch(level) {
          case 'ERROR': return <AlertCircle size={14} color="var(--danger)" />;
          case 'WARN': return <AlertCircle size={14} color="var(--warning)" />;
          case 'INFO': return <Info size={14} color="var(--primary)" />;
          default: return <CheckCircle2 size={14} color="var(--success)" />;
      }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Terminal size={24} />
          <div>
            <h1>Developer Console</h1>
            <p>Infrastructure monitoring and system orchestration.</p>
          </div>
        </div>
        <div className={styles.tabs}>
            <button className={`${styles.tab} ${activeTab === 'logs' ? styles.tabActive : ''}`} onClick={() => setActiveTab('logs')}>
                <Server size={18} /> <span>System Logs</span>
            </button>
            <button className={`${styles.tab} ${activeTab === 'config' ? styles.tabActive : ''}`} onClick={() => setActiveTab('config')}>
                <Settings size={18} /> <span>Application Config</span>
            </button>
        </div>
      </header>

      <div className={styles.content}>
        {activeTab === 'logs' && (
            <div className={styles.logsView}>
                <div className={styles.viewActions}>
                    <button className={styles.clearBtn} onClick={() => clearLogsMutation.mutate()}>
                        <Trash2 size={16} /> <span>Clear Task Stream</span>
                    </button>
                    <button className={styles.refreshBtn} onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-logs'] })}>
                        <RefreshCw size={16} /> <span>Refresh Log Payload</span>
                    </button>
                </div>
                <div className={styles.logList}>
                    {logs.length === 0 ? (
                        <div className={styles.emptyState}>
                            <Terminal size={40} />
                            <p>Sequential task stream is currently stagnant.</p>
                        </div>
                    ) : (
                        logs.map(log => (
                            <div key={log.id} className={`${styles.logItem} ${styles[log.level.toLowerCase()]}`}>
                                <div className={styles.logHeader}>
                                    <div className={styles.logLeft}>
                                        <span className={styles.time}><Clock size={12} /> {new Date(log.timestamp).toLocaleTimeString()}</span>
                                        <span className={styles.sourceTag}>{log.source}</span>
                                        <span className={styles.categoryTag}>{log.category}</span>
                                    </div>
                                    <div className={styles.logLevel}>
                                        {getLogLevelIcon(log.level)}
                                        <span className={styles.levelText}>{log.level}</span>
                                    </div>
                                </div>
                                <div className={styles.logBody}>
                                    <p className={styles.mainMsg}>{log.message}</p>
                                    {log.details && (
                                        <pre className={styles.detailsPre}>{log.details}</pre>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        )}

        {activeTab === 'config' && (
            <div className={styles.configView}>
                <div className={styles.configGrid}>
                    {settings.map(s => (
                        <div key={s.key} className={styles.configCard}>
                            <div className={styles.configHeader}>
                                {s.key.includes('mcp') ? <Server size={18} /> : s.key.includes('llm') || s.key.includes('gemini') ? <Cpu size={18} /> : <Database size={18} />}
                                <div className={styles.configMeta}>
                                    <h3>{s.key.toUpperCase()}</h3>
                                    <p>{s.description}</p>
                                </div>
                            </div>
                            <div className={styles.configInputArea}>
                                <input 
                                    className={styles.input} 
                                    value={configUpdates[s.key] !== undefined ? configUpdates[s.key] : s.value}
                                    onChange={(e) => handleConfigChange(s.key, e.target.value)}
                                    autoComplete="off"
                                />
                                {configUpdates[s.key] !== undefined && (
                                    <button className={styles.saveInlineBtn} onClick={() => updateSettingMutation.mutate({ [s.key]: configUpdates[s.key] })}>
                                        <Save size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className={styles.configFooter}>
                    <div className={styles.statusInfo}>
                        <Info size={16} />
                        <span>Infrastructure changes require a service heartbeat sync.</span>
                    </div>
                    <button 
                        className={styles.bulkSaveBtn} 
                        disabled={Object.keys(configUpdates).length === 0}
                        onClick={() => updateSettingMutation.mutate(configUpdates)}
                    >
                        <Save size={18} />
                        <span>Push Global Overrides</span>
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default DeveloperPage;
