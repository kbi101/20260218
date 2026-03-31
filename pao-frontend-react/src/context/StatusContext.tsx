import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface StatusContextType {
    status: string | null;
    isProcessing: boolean;
    isDevOpen: boolean;
    setStatus: (msg: string | null) => void;
    setIsProcessing: (val: boolean) => void;
    setIsDevOpen: (val: boolean) => void;
    showStatus: (msg: string, duration?: number) => void;
}

const StatusContext = createContext<StatusContextType | undefined>(undefined);

export const StatusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [status, setStatus] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDevOpen, setIsDevOpen] = useState(() => 
        localStorage.getItem('is_dev_open') === 'true'
    );

    const setIsDevOpenWithPersistence = (val: boolean) => {
        setIsDevOpen(val);
        localStorage.setItem('is_dev_open', val.toString());
    };

    const showStatus = (msg: string, duration = 3000) => {
        setStatus(msg);
        if (duration > 0) {
            setTimeout(() => setStatus(null), duration);
        }
    };

    return (
        <StatusContext.Provider value={{ 
            status, 
            isProcessing, 
            isDevOpen, 
            setStatus, 
            setIsProcessing, 
            setIsDevOpen: setIsDevOpenWithPersistence, 
            showStatus 
        }}>
            {children}
        </StatusContext.Provider>
    );
};

export const useStatus = () => {
    const context = useContext(StatusContext);
    if (!context) throw new Error('useStatus must be used within StatusProvider');
    return context;
};
