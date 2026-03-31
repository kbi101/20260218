import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';
import type { Person } from '../types';

interface UserContextType {
  primaryPerson: Person | null;
  setPrimaryPerson: (person: Person) => Promise<void>;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [primaryPerson, setPrimaryPersonState] = useState<Person | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPrimary = async () => {
      try {
        const response = await axios.get('/api/people/primary');
        if (response.data) {
          setPrimaryPersonState(response.data);
        } else {
          // If no primary is set, try to fetch the first person as default fallback
          const allPeople = await axios.get('/api/people');
          if (allPeople.data.length > 0) {
            // Pick first one but don't mark as primary in DB yet, just set in state
            // or let the user choose. For now, just set the first one in state.
            setPrimaryPersonState(allPeople.data[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching primary person:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPrimary();
  }, []);

  const setPrimaryPerson = async (person: Person) => {
    try {
      const response = await axios.post(`/api/people/${person.id}/primary`);
      setPrimaryPersonState(response.data);
    } catch (error) {
      console.error('Error setting primary person:', error);
      throw error;
    }
  };

  return (
    <UserContext.Provider value={{ primaryPerson, setPrimaryPerson, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
