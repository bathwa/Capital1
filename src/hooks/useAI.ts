import { useState, useEffect, useCallback } from 'react';
import aiModelService from '../services/aiModels';

// Custom hook for AI model integration
export const useAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize AI models on first use
  const initializeModels = useCallback(async () => {
    if (isInitialized) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await aiModelService.initialize();
      setIsInitialized(true);
    } catch (err) {
      setError('Failed to initialize AI models');
      console.error('AI initialization error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  // Analyze entrepreneur reliability
  const analyzeReliability = useCallback(async (data: {
    milestoneUpdateFrequency: number;
    profileCompleteness: number;
    overdueMilestones: number;
    communicationFrequency: number;
    progressNotes?: string[];
  }) => {
    if (!isInitialized) {
      await initializeModels();
    }
    
    setIsLoading(true);
    try {
      const result = await aiModelService.analyzeReliabilityScore(data);
      return result;
    } catch (err) {
      setError('Failed to analyze reliability');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, initializeModels]);

  // Assess opportunity risk
  const assessRisk = useCallback(async (opportunity: {
    category: string;
    industry: string;
    fundingGoal: number;
    description: string;
    entrepreneurReliabilityScore: number;
    fundingStage: string;
  }) => {
    if (!isInitialized) {
      await initializeModels();
    }
    
    setIsLoading(true);
    try {
      const result = await aiModelService.assessOpportunityRisk(opportunity);
      return result;
    } catch (err) {
      setError('Failed to assess risk');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, initializeModels]);

  // Generate investment recommendations
  const generateRecommendations = useCallback(async (
    investorProfile: {
      preferredIndustries: string[];
      minInvestment: number;
      maxInvestment: number;
      riskTolerance: 'LOW' | 'MEDIUM' | 'HIGH';
      investmentType: string[];
    },
    opportunities: any[]
  ) => {
    if (!isInitialized) {
      await initializeModels();
    }
    
    setIsLoading(true);
    try {
      const result = await aiModelService.generateRecommendations(investorProfile, opportunities);
      return result;
    } catch (err) {
      setError('Failed to generate recommendations');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, initializeModels]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isInitialized) {
        aiModelService.dispose();
      }
    };
  }, [isInitialized]);

  return {
    isLoading,
    isInitialized,
    error,
    initializeModels,
    analyzeReliability,
    assessRisk,
    generateRecommendations
  };
};

export default useAI;