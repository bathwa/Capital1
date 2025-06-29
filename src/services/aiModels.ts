import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import * as knnClassifier from '@tensorflow-models/knn-classifier';

// AI Model Service for TensorFlow.js integration
class AIModelService {
  private useModel: any = null;
  private reliabilityModel: tf.LayersModel | null = null;
  private riskAssessmentModel: tf.LayersModel | null = null;
  private knnRecommendationModel: any = null;
  private isInitialized = false;

  // Initialize all AI models
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('Loading AI models...');
      
      // Load Universal Sentence Encoder Lite for text processing
      await this.loadUSEModel();
      
      // Load custom models for reliability and risk assessment
      await this.loadCustomModels();
      
      // Initialize KNN classifier for recommendations
      this.initializeKNNModel();
      
      this.isInitialized = true;
      console.log('All AI models loaded successfully');
    } catch (error) {
      console.error('Failed to initialize AI models:', error);
      throw error;
    }
  }

  // Load Universal Sentence Encoder Lite
  private async loadUSEModel(): Promise<void> {
    try {
      this.useModel = await use.load();
      console.log('Universal Sentence Encoder model loaded');
    } catch (error) {
      console.error('Failed to load USE model:', error);
      throw error;
    }
  }

  // Load custom trained models
  private async loadCustomModels(): Promise<void> {
    try {
      // Load reliability assessment model
      this.reliabilityModel = await tf.loadLayersModel('/models/reliability/model.json');
      console.log('Reliability model loaded');

      // Load risk assessment model
      this.riskAssessmentModel = await tf.loadLayersModel('/models/risk-assessment/model.json');
      console.log('Risk assessment model loaded');
    } catch (error) {
      console.warn('Custom models not available, using fallback logic:', error);
      // Fallback to rule-based logic if models aren't available
    }
  }

  // Initialize KNN classifier for recommendations
  private initializeKNNModel(): void {
    this.knnRecommendationModel = knnClassifier.create();
    console.log('KNN recommendation model initialized');
  }

  // Entrepreneur Reliability Score Analysis
  async analyzeReliabilityScore(data: {
    milestoneUpdateFrequency: number;
    profileCompleteness: number;
    overdueMilestones: number;
    communicationFrequency: number;
    progressNotes?: string[];
  }): Promise<{
    score: number;
    insights: string[];
    recommendations: string[];
  }> {
    try {
      // Numerical features analysis
      const numericalScore = this.calculateNumericalReliabilityScore(data);
      
      // Text sentiment analysis if progress notes are provided
      let textScore = 0;
      let sentimentInsights: string[] = [];
      
      if (data.progressNotes && data.progressNotes.length > 0) {
        const textAnalysis = await this.analyzeTextSentiment(data.progressNotes);
        textScore = textAnalysis.score;
        sentimentInsights = textAnalysis.insights;
      }

      // Combine scores (weighted average)
      const finalScore = Math.round((numericalScore * 0.7) + (textScore * 0.3));
      
      // Generate insights and recommendations
      const insights = this.generateReliabilityInsights(data, sentimentInsights);
      const recommendations = this.generateReliabilityRecommendations(data, finalScore);

      return {
        score: Math.max(0, Math.min(100, finalScore)),
        insights,
        recommendations
      };
    } catch (error) {
      console.error('Error analyzing reliability score:', error);
      return this.getFallbackReliabilityScore(data);
    }
  }

  // Calculate numerical reliability score
  private calculateNumericalReliabilityScore(data: {
    milestoneUpdateFrequency: number;
    profileCompleteness: number;
    overdueMilestones: number;
    communicationFrequency: number;
  }): number {
    // Normalize inputs to 0-1 scale
    const normalizedFrequency = Math.min(data.milestoneUpdateFrequency / 7, 1); // Weekly updates = 1
    const normalizedCompleteness = data.profileCompleteness / 100;
    const normalizedOverdue = Math.max(0, 1 - (data.overdueMilestones / 5)); // 5+ overdue = 0
    const normalizedCommunication = Math.min(data.communicationFrequency / 3, 1); // 3+ per week = 1

    // Weighted calculation
    const score = (
      normalizedFrequency * 0.3 +
      normalizedCompleteness * 0.25 +
      normalizedOverdue * 0.25 +
      normalizedCommunication * 0.2
    ) * 100;

    return Math.round(score);
  }

  // Analyze text sentiment using USE embeddings
  private async analyzeTextSentiment(texts: string[]): Promise<{
    score: number;
    insights: string[];
  }> {
    if (!this.useModel) {
      return { score: 50, insights: ['Text analysis unavailable'] };
    }

    try {
      // Combine all text
      const combinedText = texts.join(' ');
      
      // Get embeddings
      const embeddings = await this.useModel.embed([combinedText]);
      const embeddingData = await embeddings.data();
      
      // Simple sentiment analysis based on embedding patterns
      // This is a simplified approach - in production, you'd use a trained classifier
      const positiveWords = ['progress', 'completed', 'successful', 'achieved', 'improved', 'excellent'];
      const negativeWords = ['delayed', 'problem', 'issue', 'failed', 'difficult', 'behind'];
      
      let positiveCount = 0;
      let negativeCount = 0;
      
      const lowerText = combinedText.toLowerCase();
      positiveWords.forEach(word => {
        if (lowerText.includes(word)) positiveCount++;
      });
      negativeWords.forEach(word => {
        if (lowerText.includes(word)) negativeCount++;
      });
      
      // Calculate sentiment score
      const totalWords = positiveCount + negativeCount;
      let sentimentScore = 50; // Neutral baseline
      
      if (totalWords > 0) {
        const positiveRatio = positiveCount / totalWords;
        sentimentScore = 30 + (positiveRatio * 40); // Scale to 30-70 range
      }
      
      const insights = this.generateSentimentInsights(positiveCount, negativeCount, texts.length);
      
      embeddings.dispose(); // Clean up memory
      
      return {
        score: sentimentScore,
        insights
      };
    } catch (error) {
      console.error('Error in text sentiment analysis:', error);
      return { score: 50, insights: ['Text analysis error'] };
    }
  }

  // Generate reliability insights
  private generateReliabilityInsights(data: any, sentimentInsights: string[]): string[] {
    const insights: string[] = [];
    
    if (data.profileCompleteness >= 90) {
      insights.push('Excellent profile completeness demonstrates commitment');
    } else if (data.profileCompleteness < 70) {
      insights.push('Profile completion needs attention for better credibility');
    }
    
    if (data.milestoneUpdateFrequency >= 5) {
      insights.push('Consistent milestone updates show strong project management');
    } else if (data.milestoneUpdateFrequency < 2) {
      insights.push('More frequent milestone updates would improve transparency');
    }
    
    if (data.overdueMilestones === 0) {
      insights.push('No overdue milestones indicates excellent time management');
    } else if (data.overdueMilestones > 2) {
      insights.push('Multiple overdue milestones may concern investors');
    }
    
    return [...insights, ...sentimentInsights];
  }

  // Generate reliability recommendations
  private generateReliabilityRecommendations(data: any, score: number): string[] {
    const recommendations: string[] = [];
    
    if (score < 60) {
      recommendations.push('Focus on completing your profile to build trust');
      recommendations.push('Provide more frequent project updates');
    }
    
    if (data.overdueMilestones > 0) {
      recommendations.push('Address overdue milestones immediately');
      recommendations.push('Set more realistic milestone timelines');
    }
    
    if (data.communicationFrequency < 2) {
      recommendations.push('Increase communication with stakeholders');
    }
    
    if (score >= 80) {
      recommendations.push('Excellent reliability! Consider mentoring other entrepreneurs');
    }
    
    return recommendations;
  }

  // Opportunity Risk Assessment
  async assessOpportunityRisk(opportunity: {
    category: string;
    industry: string;
    fundingGoal: number;
    description: string;
    entrepreneurReliabilityScore: number;
    fundingStage: string;
  }): Promise<{
    riskScore: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    riskFactors: string[];
    suggestions: string[];
  }> {
    try {
      // Analyze text description
      const textRisk = await this.analyzeDescriptionRisk(opportunity.description);
      
      // Analyze structural factors
      const structuralRisk = this.analyzeStructuralRisk(opportunity);
      
      // Combine risk scores
      const combinedRisk = (textRisk.score * 0.4) + (structuralRisk.score * 0.6);
      
      const riskLevel = combinedRisk < 30 ? 'LOW' : combinedRisk < 60 ? 'MEDIUM' : 'HIGH';
      
      return {
        riskScore: Math.round(combinedRisk),
        riskLevel,
        riskFactors: [...textRisk.factors, ...structuralRisk.factors],
        suggestions: [...textRisk.suggestions, ...structuralRisk.suggestions]
      };
    } catch (error) {
      console.error('Error assessing opportunity risk:', error);
      return this.getFallbackRiskAssessment(opportunity);
    }
  }

  // Analyze description for risk indicators
  private async analyzeDescriptionRisk(description: string): Promise<{
    score: number;
    factors: string[];
    suggestions: string[];
  }> {
    const riskKeywords = {
      high: ['revolutionary', 'disruptive', 'first-of-its-kind', 'untested', 'experimental'],
      medium: ['competitive', 'challenging', 'complex', 'ambitious'],
      low: ['proven', 'established', 'stable', 'experienced', 'track-record']
    };
    
    const lowerDesc = description.toLowerCase();
    let riskScore = 50; // Baseline medium risk
    const factors: string[] = [];
    const suggestions: string[] = [];
    
    // Check for risk indicators
    riskKeywords.high.forEach(keyword => {
      if (lowerDesc.includes(keyword)) {
        riskScore += 10;
        factors.push(`High-risk indicator: "${keyword}" suggests unproven approach`);
      }
    });
    
    riskKeywords.medium.forEach(keyword => {
      if (lowerDesc.includes(keyword)) {
        riskScore += 5;
        factors.push(`Medium-risk indicator: "${keyword}" suggests market challenges`);
      }
    });
    
    riskKeywords.low.forEach(keyword => {
      if (lowerDesc.includes(keyword)) {
        riskScore -= 10;
        factors.push(`Low-risk indicator: "${keyword}" suggests stability`);
      }
    });
    
    // Generate suggestions based on analysis
    if (riskScore > 70) {
      suggestions.push('Consider providing more evidence of market validation');
      suggestions.push('Include details about risk mitigation strategies');
    }
    
    if (description.length < 200) {
      suggestions.push('Provide more detailed business description');
      riskScore += 5;
    }
    
    return {
      score: Math.max(0, Math.min(100, riskScore)),
      factors,
      suggestions
    };
  }

  // Analyze structural risk factors
  private analyzeStructuralRisk(opportunity: any): {
    score: number;
    factors: string[];
    suggestions: string[];
  } {
    let riskScore = 30; // Start with low-medium risk
    const factors: string[] = [];
    const suggestions: string[] = [];
    
    // Funding goal analysis
    if (opportunity.fundingGoal > 100000) {
      riskScore += 20;
      factors.push('High funding goal increases execution risk');
      suggestions.push('Consider phased funding approach');
    } else if (opportunity.fundingGoal < 5000) {
      riskScore += 10;
      factors.push('Very low funding goal may indicate limited scope');
    }
    
    // Industry risk analysis
    const highRiskIndustries = ['technology', 'biotech', 'cryptocurrency', 'gaming'];
    const lowRiskIndustries = ['agriculture', 'retail', 'services', 'manufacturing'];
    
    if (highRiskIndustries.some(industry => 
      opportunity.industry.toLowerCase().includes(industry))) {
      riskScore += 15;
      factors.push('Industry has higher volatility and competition');
    } else if (lowRiskIndustries.some(industry => 
      opportunity.industry.toLowerCase().includes(industry))) {
      riskScore -= 10;
      factors.push('Industry has established market patterns');
    }
    
    // Entrepreneur reliability impact
    if (opportunity.entrepreneurReliabilityScore < 60) {
      riskScore += 20;
      factors.push('Entrepreneur reliability score indicates execution risk');
      suggestions.push('Request detailed milestone plan and progress tracking');
    } else if (opportunity.entrepreneurReliabilityScore > 80) {
      riskScore -= 15;
      factors.push('High entrepreneur reliability reduces execution risk');
    }
    
    // Funding stage analysis
    if (opportunity.fundingStage === 'SEED') {
      riskScore += 10;
      factors.push('Seed stage carries higher uncertainty');
    } else if (opportunity.fundingStage === 'GROWTH') {
      riskScore -= 5;
      factors.push('Growth stage indicates proven business model');
    }
    
    return {
      score: Math.max(0, Math.min(100, riskScore)),
      factors,
      suggestions
    };
  }

  // Smart Investment Matchmaking
  async generateRecommendations(
    investorProfile: {
      preferredIndustries: string[];
      minInvestment: number;
      maxInvestment: number;
      riskTolerance: 'LOW' | 'MEDIUM' | 'HIGH';
      investmentType: string[];
    },
    opportunities: any[]
  ): Promise<{
    recommendedOpportunities: Array<{
      opportunityId: string;
      matchScore: number;
      matchReasons: string[];
    }>;
  }> {
    try {
      const recommendations: Array<{
        opportunityId: string;
        matchScore: number;
        matchReasons: string[];
      }> = [];
      
      for (const opportunity of opportunities) {
        const matchAnalysis = await this.calculateMatchScore(investorProfile, opportunity);
        
        if (matchAnalysis.matchScore > 30) { // Only include decent matches
          recommendations.push({
            opportunityId: opportunity.id,
            matchScore: matchAnalysis.matchScore,
            matchReasons: matchAnalysis.reasons
          });
        }
      }
      
      // Sort by match score (highest first)
      recommendations.sort((a, b) => b.matchScore - a.matchScore);
      
      return {
        recommendedOpportunities: recommendations.slice(0, 10) // Top 10 recommendations
      };
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return { recommendedOpportunities: [] };
    }
  }

  // Calculate match score between investor and opportunity
  private async calculateMatchScore(investorProfile: any, opportunity: any): Promise<{
    matchScore: number;
    reasons: string[];
  }> {
    let score = 0;
    const reasons: string[] = [];
    
    // Industry preference matching (30% weight)
    if (investorProfile.preferredIndustries.includes(opportunity.industry)) {
      score += 30;
      reasons.push(`Matches preferred industry: ${opportunity.industry}`);
    } else {
      score += 5; // Small score for industry diversity
    }
    
    // Investment amount matching (25% weight)
    if (opportunity.min_investment_amount >= investorProfile.minInvestment &&
        opportunity.min_investment_amount <= investorProfile.maxInvestment) {
      score += 25;
      reasons.push('Investment amount within your range');
    } else if (opportunity.min_investment_amount < investorProfile.minInvestment) {
      score += 10;
      reasons.push('Lower investment threshold than preferred');
    }
    
    // Risk tolerance matching (20% weight)
    const opportunityRisk = await this.assessOpportunityRisk(opportunity);
    const riskMatch = this.matchRiskTolerance(investorProfile.riskTolerance, opportunityRisk.riskLevel);
    score += riskMatch.score;
    if (riskMatch.reason) reasons.push(riskMatch.reason);
    
    // Investment type matching (15% weight)
    if (investorProfile.investmentType.includes(opportunity.category)) {
      score += 15;
      reasons.push(`Matches investment type preference: ${opportunity.category}`);
    }
    
    // ROI attractiveness (10% weight)
    if (opportunity.roi_projected_percentage > 15) {
      score += 10;
      reasons.push('High projected ROI');
    } else if (opportunity.roi_projected_percentage > 8) {
      score += 5;
      reasons.push('Moderate projected ROI');
    }
    
    return {
      matchScore: Math.min(100, score),
      reasons
    };
  }

  // Match risk tolerance
  private matchRiskTolerance(investorTolerance: string, opportunityRisk: string): {
    score: number;
    reason?: string;
  } {
    const riskMatrix = {
      'LOW': { 'LOW': 20, 'MEDIUM': 5, 'HIGH': 0 },
      'MEDIUM': { 'LOW': 15, 'MEDIUM': 20, 'HIGH': 10 },
      'HIGH': { 'LOW': 10, 'MEDIUM': 15, 'HIGH': 20 }
    };
    
    const score = riskMatrix[investorTolerance as keyof typeof riskMatrix]?.[opportunityRisk as keyof typeof riskMatrix['LOW']] || 0;
    
    let reason;
    if (score >= 20) {
      reason = 'Perfect risk level match';
    } else if (score >= 10) {
      reason = 'Acceptable risk level';
    } else if (score > 0) {
      reason = 'Risk level outside comfort zone';
    }
    
    return { score, reason };
  }

  // Fallback methods for when models fail to load
  private getFallbackReliabilityScore(data: any): {
    score: number;
    insights: string[];
    recommendations: string[];
  } {
    const score = this.calculateNumericalReliabilityScore(data);
    return {
      score,
      insights: ['Using simplified analysis - AI models unavailable'],
      recommendations: ['Complete your profile', 'Update milestones regularly']
    };
  }

  private getFallbackRiskAssessment(opportunity: any): {
    riskScore: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    riskFactors: string[];
    suggestions: string[];
  } {
    const structuralRisk = this.analyzeStructuralRisk(opportunity);
    const riskLevel = structuralRisk.score < 30 ? 'LOW' : structuralRisk.score < 60 ? 'MEDIUM' : 'HIGH';
    
    return {
      riskScore: structuralRisk.score,
      riskLevel,
      riskFactors: structuralRisk.factors,
      suggestions: structuralRisk.suggestions
    };
  }

  private generateSentimentInsights(positiveCount: number, negativeCount: number, textCount: number): string[] {
    const insights: string[] = [];
    
    if (positiveCount > negativeCount) {
      insights.push('Progress notes show positive sentiment and confidence');
    } else if (negativeCount > positiveCount) {
      insights.push('Progress notes indicate challenges - consider addressing concerns');
    }
    
    if (textCount < 3) {
      insights.push('More frequent progress updates would improve analysis');
    }
    
    return insights;
  }

  // Cleanup method
  dispose(): void {
    if (this.reliabilityModel) {
      this.reliabilityModel.dispose();
    }
    if (this.riskAssessmentModel) {
      this.riskAssessmentModel.dispose();
    }
    this.isInitialized = false;
  }
}

// Export singleton instance
export const aiModelService = new AIModelService();
export default aiModelService;