import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { Agreement } from '../services/agreementsService';
import { agreementsService } from '../services/agreementsService';

interface AgreementsState {
  agreements: Agreement[];
  loading: boolean;
  error: string | null;
  activeTab: 'all' | 'investment' | 'nda' | 'service';
  searchTerm: string;
  statusFilter: 'all' | 'draft' | 'pending' | 'executed' | 'expired';
}

interface AgreementsContextType extends AgreementsState {
  setActiveTab: (tab: 'all' | 'investment' | 'nda' | 'service') => void;
  setSearchTerm: (term: string) => void;
  setStatusFilter: (status: 'all' | 'draft' | 'pending' | 'executed' | 'expired') => void;
  fetchAgreements: () => Promise<void>;
  createAgreement: (agreementData: Partial<Agreement>) => Promise<Agreement>;
  updateAgreement: (id: string, updates: Partial<Agreement>) => Promise<Agreement>;
  signAgreement: (id: string, signatureData: { party: string; type: 'digital' | 'wet' }) => Promise<Agreement>;
  downloadAgreement: (id: string) => Promise<Blob>;
}

const AgreementsContext = createContext<AgreementsContextType | undefined>(undefined);

export const AgreementsProvider: React.FC<{ children: React.ReactNode }> = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AgreementsState>({
    agreements: [],
    loading: false,
    error: null,
    activeTab: 'all',
    searchTerm: '',
    statusFilter: 'all',
  });

  const fetchAgreements = async (): Promise<void> => {
    try {
      setState((prev: AgreementsState) => ({ ...prev, loading: true, error: null }));
      const filters = {
        type: state.activeTab === 'all' ? undefined : state.activeTab,
        status: state.statusFilter === 'all' ? undefined : state.statusFilter,
        searchTerm: state.searchTerm
      };
      const data = await agreementsService.getAgreements(filters);
      setState((prev: AgreementsState) => ({ ...prev, agreements: data, loading: false }));
    } catch (error) {
      setState((prev: AgreementsState) => ({ ...prev, error: 'Failed to fetch agreements', loading: false }));
    }
  };

  useEffect(() => {
    fetchAgreements();
  }, [state.activeTab, state.statusFilter, state.searchTerm]);

  return (
    <AgreementsContext.Provider 
      value={{
        ...state,
        setActiveTab: (tab: 'all' | 'investment' | 'nda' | 'service') => 
          setState((prev: AgreementsState) => ({ ...prev, activeTab: tab })),
        setSearchTerm: (term: string) => 
          setState((prev: AgreementsState) => ({ ...prev, searchTerm: term })),
        setStatusFilter: (status: 'all' | 'draft' | 'pending' | 'executed' | 'expired') => 
          setState((prev: AgreementsState) => ({ ...prev, statusFilter: status })),
        fetchAgreements,
        createAgreement: agreementsService.createAgreement,
        updateAgreement: agreementsService.updateAgreement,
        signAgreement: agreementsService.signAgreement,
        downloadAgreement: agreementsService.downloadAgreement
      }}
    >
      {children}
    </AgreementsContext.Provider>
  );
};

export const useAgreements = (): AgreementsContextType => {
  const context = useContext(AgreementsContext);
  if (context === undefined) {
    throw new Error('useAgreements must be used within an AgreementsProvider');
  }
  return context;
};
