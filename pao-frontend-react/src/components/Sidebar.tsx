import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Briefcase, 
  FileText, 
  Target, 
  Users, 
  ExternalLink, 
  LayoutDashboard,
  Terminal
} from 'lucide-react';
import logoImg from '../assets/logo.png';
import styles from './Sidebar.module.css';

const Sidebar: React.FC = () => {
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Leads', icon: Briefcase, path: '/leads' },
    { name: 'Resumes', icon: FileText, path: '/resumes' },
    { name: 'Preparation', icon: Target, path: '/prep' },
    { name: 'Intelligence Hub', icon: Users, path: '/people-org' },
    { name: 'Developer', icon: Terminal, path: '/developer' },
  ];

  const [isLogoOpen, setIsLogoOpen] = useState(false);

  return (
    <>
      <aside className={styles.sidebar}>
        <div className={styles.logo} onClick={() => setIsLogoOpen(true)} style={{ cursor: 'pointer' }}>
          <img src={logoImg} alt="Finding Job is a full-time job" className={styles.logoImg} />
          <div className={styles.logoText}>
            <span className={styles.appName}>Finding Job</span>
            <span className={styles.appSubtitle}>is a full-time job</span>
          </div>
        </div>

      <nav className={styles.nav}>
        {navItems.map((item) => {
          return (
            <NavLink 
              key={item.path} 
              to={item.path} 
              className={({ isActive }) => 
                `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
              }
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className={styles.navFooter}>
        <a 
          href="http://localhost:4200" 
          target="_self"
          className={styles.switchClassic}
        >
          <ExternalLink size={18} />
          <span>Switch to Classic UI</span>
        </a>
        </div>
      </aside>

      {isLogoOpen && (
        <div className={styles.logoOverlay} onClick={() => setIsLogoOpen(false)}>
          <div className={styles.logoModal} onClick={e => e.stopPropagation()}>
            <img src={logoImg} alt="Finding Job Logo Large" className={styles.logoLarge} />
            <button className={styles.closeBtn} onClick={() => setIsLogoOpen(false)}>×</button>
            <div className={styles.logoModalText}>
              <h2>Finding Job</h2>
              <p>is a full-time job</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
