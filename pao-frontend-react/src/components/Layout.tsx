import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import DeveloperPage from '../pages/Developer/DeveloperPage';
import styles from './Layout.module.css';
import { useStatus, StatusProvider } from '../context/StatusContext';
import { Loader2 } from 'lucide-react';

const LayoutContent: React.FC = () => {
  const { status, isProcessing, isDevOpen } = useStatus();

  return (
    <div className={styles.appContainer}>
      <Sidebar />
      <div className={styles.mainWrapper}>
        <Navbar />
        <main className={styles.mainContent}>
          <Outlet />
        </main>
        
        {/* Global Status Bar */}
        {(status || isProcessing) && (
          <div className={styles.globalStatusBar}>
              <div className={styles.statusInner}>
                  {isProcessing && <Loader2 className={styles.spinner} size={14} />}
                  <span className={styles.statusText}>{status || (isProcessing ? 'Processing AI mutation...' : '')}</span>
              </div>
          </div>
        )}

        {/* Developer Console Overlay */}
        {isDevOpen && (
          <div className={styles.devDrawer}>
            <DeveloperPage />
          </div>
        )}
      </div>
    </div>
  );
};

const Layout: React.FC = () => (
  <StatusProvider>
    <LayoutContent />
  </StatusProvider>
);

export default Layout;
