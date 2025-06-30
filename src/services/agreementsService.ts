import { apiService } from './api';

export interface Agreement {
  id: string;
  type: 'INVESTMENT_AGREEMENT' | 'NDA' | 'SERVICE_AGREEMENT';
  title: string;
  parties: string[];
  opportunity_id?: string;
  offer_id?: string;
  status: 'DRAFT' | 'PENDING_SIGNATURES' | 'FULLY_EXECUTED' | 'EXPIRED';
  document_url: string;
  signatures: Array<{
    user_id: string;
    signed_at: string;
    signature_type: 'digital' | 'electronic';
  }>;
  created_at: string;
  updated_at: string;
}

export class AgreementsService {
  async getAgreements(filters?: any): Promise<Agreement[]> {
    // TODO: Implement actual API call
    return [];
  }

  async createAgreement(agreementData: Partial<Agreement>): Promise<Agreement> {
    // TODO: Implement actual API call
    throw new Error('Not implemented');
  }

  async updateAgreement(id: string, updates: Partial<Agreement>): Promise<Agreement> {
    // TODO: Implement actual API call
    throw new Error('Not implemented');
  }

  async signAgreement(id: string, signatureData: { party: string; type: 'digital' | 'wet' }): Promise<Agreement> {
    // TODO: Implement actual API call
    throw new Error('Not implemented');
  }

  async downloadAgreement(id: string): Promise<Blob> {
    // TODO: Implement actual API call
    throw new Error('Not implemented');
  }
}

export const agreementsService = new AgreementsService();
