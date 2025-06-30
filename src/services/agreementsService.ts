import { apiService } from './api';

export interface Agreement {
  id: string;
  type: 'INVESTMENT_AGREEMENT' | 'NDA' | 'SERVICE_AGREEMENT';
  title: string;
  parties: string[];
  opportunity?: string;
  amount?: number;
  equity?: number;
  status: 'DRAFT' | 'PENDING_SIGNATURES' | 'FULLY_EXECUTED' | 'EXPIRED';
  createdDate: string;
  signedDate?: string;
  documentUrl: string;
  signatures: {
    party: string;
    signedAt: string;
    type: 'digital' | 'wet';
  }[];
}

export class AgreementsService {
  async getAgreements(filters?: {
    type?: string;
    status?: string;
    searchTerm?: string;
  }): Promise<Agreement[]> {
    const response = await apiService.get('/api/v1/agreements', { params: filters });
    return response.data;
  }

  async createAgreement(agreementData: Partial<Agreement>): Promise<Agreement> {
    const response = await apiService.post('/api/v1/agreements', agreementData);
    return response.data;
  }

  async updateAgreement(id: string, updates: Partial<Agreement>): Promise<Agreement> {
    const response = await apiService.put(`/api/v1/agreements/${id}`, updates);
    return response.data;
  }

  async signAgreement(id: string, signatureData: {
    party: string;
    type: 'digital' | 'wet';
  }): Promise<Agreement> {
    const response = await apiService.post(`/api/v1/agreements/${id}/sign`, signatureData);
    return response.data;
  }

  async downloadAgreement(id: string): Promise<Blob> {
    const response = await apiService.get(`/api/v1/agreements/${id}/download`, {
      responseType: 'blob'
    });
    return response.data;
  }
}

export const agreementsService = new AgreementsService();
