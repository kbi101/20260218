import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, X, Type } from 'lucide-react';
import styles from './PracticeMode.module.css';
import type { ElevatorPitch } from '../../types';

interface PracticeModeProps {
  pitch: ElevatorPitch;
  onClose: () => void;
}

const PracticeMode: React.FC<PracticeModeProps> = ({ pitch, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(1); // 1-10
  const [fontSize, setFontSize] = useState(pitch.fontSize || 32);
  const [scrollPos, setScrollPos] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setScrollPos(prev => prev + scrollSpeed);
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying, scrollSpeed]);

  const handleReset = () => {
    setIsPlaying(false);
    setScrollPos(0);
  };

  return (
    <div className={styles.overlay}>
      <header className={styles.header}>
        <div className={styles.titleInfo}>
          <h2 className={styles.title}>{pitch.name}</h2>
          <span className={styles.roleTag}>{pitch.targetRole}</span>
        </div>
        <div className={styles.controls}>
          <div className={styles.controlGroup}>
             <label><Type size={16} /> Font</label>
             <input 
               type="range" min="20" max="80" 
               value={fontSize} 
               onChange={(e) => setFontSize(parseInt(e.target.value))} 
             />
          </div>
          <div className={styles.controlGroup}>
             <label>Speed</label>
             <input 
               type="range" min="1" max="10" 
               value={scrollSpeed} 
               onChange={(e) => setScrollSpeed(parseInt(e.target.value))} 
             />
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close Practice Mode">
            <X size={24} />
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <div 
          className={styles.pacingLines} 
          style={{ transform: `translateY(-${scrollPos}px)` }}
        >
          <div className={styles.content} style={{ fontSize: `${fontSize}px` }}>
            {pitch.content}
          </div>
        </div>
        <div className={styles.activeArea} />
      </main>

      <footer className={styles.footer}>
         <div className={styles.playbackControls}>
            <button className={styles.playbackBtn} onClick={handleReset}>
               <RotateCcw size={24} />
            </button>
            <button 
              className={`${styles.playbackBtn} ${styles.primaryAction}`} 
              onClick={() => setIsPlaying(!isPlaying)}
            >
               {isPlaying ? <Pause size={32} /> : <Play size={32} fill="currentColor" />}
            </button>
            <div className={styles.spacer} />
         </div>
         <p className={styles.hint}>Read the text within the highlighted area at your own pace.</p>
      </footer>
    </div>
  );
};

export default PracticeMode;
