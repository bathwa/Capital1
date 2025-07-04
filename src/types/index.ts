export interface User {
  id: string;
  email: string;
  phone_number: string;
  role: 'ADMIN' | 'ENTREPRENEUR' | 'INVESTOR' | 'SERVICE_PROVIDER' | 'OBSERVER';
  status: 'PENDING_EMAIL_CONFIRMATION' | 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
  first_name: string;
  last_name: string;
  organization_name?: string;
  date_registered: string;
  last_login?: string;
  email_verified: boolean;
  profile_completion_percentage: number;
  reliability_score: number;
  profile_picture_url?: string;
  created_at: string;
  updated_at: string;
}

export interface EntrepreneurProfile {
  user_id: string;
  business_registration_number: string;
  business_address: string;
  industry: string;
  business_description: string;
  due_diligence_data: {
    debt_profile: string;
    other_investors: string;
    court_cases: boolean;
    education_level: string;
    trade_references: string;
    accountants_details: string;
  };
  legal_status_verified: boolean;
  settlement_plan_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface InvestorProfile {
  user_id: string;
  investor_type: 'INDIVIDUAL' | 'SYNDICATE_LEADER' | 'INSTITUTIONAL';
  investment_preferences: {
    preferred_industries: string[];
    min_investment: number;
    max_investment: number;
    risk_tolerance: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  source_of_funds_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Opportunity {
  id: string;
  entrepreneur_id: string;
  title: string;
  description: string;
  category: 'GOING_CONCERN' | 'ORDER_FULFILLMENT' | 'PROJECT_PARTNERSHIP';
  industry: string;
  location: string;
  funding_goal: number;
  equity_offered_percentage: number;
  roi_projected_percentage: number;
  funding_stage: 'SEED' | 'STARTUP' | 'GROWTH';
  status: 'DRAFT' | 'PENDING_ADMIN_REVIEW' | 'ADMIN_REJECTED' | 'FUNDING_LIVE' | 'FUNDING_CLOSED' | 'ACTIVE_INVESTMENT' | 'COMPLETED' | 'FAILED' | 'DISPUTED';
  min_investment_amount: number;
  current_funds_raised: number;
  start_date: string;
  end_date: string;
  due_diligence_summary: string;
  risk_assessment_score: number;
  risk_assessment_details: string;
  admin_rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface InvestmentOffer {
  id: string;
  opportunity_id: string;
  investor_id: string;
  amount_offered: number;
  equity_requested_percentage: number;
  offer_terms: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED_BY_ENTREPRENEUR' | 'COUNTER_OFFERED' | 'EXPIRED' | 'WITHDRAWN_BY_INVESTOR';
  counter_offer_id?: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface Investment {
  id: string;
  offer_id: string;
  investor_id: string;
  opportunity_id: string;
  invested_amount: number;
  equity_percentage: number;
  transaction_reference: string;
  proof_of_payment_url?: string;
  payment_method: string;
  status: 'PENDING_INVESTOR_PAYMENT' | 'PENDING_ADMIN_CONFIRMATION' | 'FUNDS_IN_ESCROW' | 'FUNDS_RELEASED_TO_ENTREPRENEUR' | 'COMPLETED' | 'REJECTED_BY_ADMIN';
  admin_confirmation_at?: string;
  funds_released_at?: string;
  admin_rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: string;
  opportunity_id: string;
  title: string;
  description: string;
  target_date: string;
  actual_completion_date?: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'FLAGGED';
  progress_notes: string;
  completion_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface InvestmentPool {
  id: string;
  name: string;
  description: string;
  category: 'SYNDICATE' | 'COLLECTIVE' | 'COMMUNITY_DEVELOPMENT_INITIATIVE' | 'COMPANY';
  status: 'PENDING_ADMIN_APPROVAL' | 'ACTIVE' | 'CLOSED';
  created_by_id: string;
  admin_approved_at?: string;
  member_count: number;
  total_pool_value: number;
  created_at: string;
  updated_at: string;
}

export interface PoolMember {
  id: string;
  pool_id: string;
  user_id: string;
  role: 'MEMBER' | 'CHAIRPERSON' | 'SECRETARY' | 'TREASURER' | 'INVESTMENTS_OFFICER';
  contribution_amount?: number;
  joined_at: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceRequest {
  id: string;
  entrepreneur_id: string;
  service_provider_id: string;
  opportunity_id: string;
  service_category: string;
  service_description: string;
  proposed_payment: number;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  completion_report_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  related_entity_type?: string;
  related_entity_id?: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface SettlementPlan {
  id: string;
  entrepreneur_id: string;
  opportunity_id: string;
  reason_for_failure: string;
  total_amount_to_settle: number;
  status: 'PENDING_ENTREPRENEUR_SUBMISSION' | 'PENDING_ADMIN_REVIEW' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'COMPLETED';
  admin_rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface SettlementInstallment {
  id: string;
  settlement_plan_id: string;
  installment_number: number;
  installment_amount: number;
  due_date: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  paid_at?: string;
  proof_of_payment_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Agreement {
  id: string;
  type: 'INVESTMENT_AGREEMENT' | 'NDA' | 'SERVICE_AGREEMENT';
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

export interface File {
  id: string;
  entity_type: string;
  entity_id: string;
  category: string;
  filename: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  file_url: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface DashboardData {
  // Admin specific
  total_users?: number;
  user_growth_percentage?: number;
  pending_approvals?: number;
  total_active_investments?: number;
  investment_growth_percentage?: number;
  platform_revenue?: number;
  revenue_growth_percentage?: number;

  // Entrepreneur specific
  active_opportunities?: number;
  total_funded?: number;
  funding_growth_percentage?: number;
  reliability_score?: number;
  reliability_change?: number;
  overdue_milestones?: number;

  // Investor specific
  active_investments?: number;
  total_invested?: number;
  portfolio_roi?: number;
  roi_change?: number;
  pool_memberships?: number;

  // Service Provider specific
  active_requests?: number;
  completed_services?: number;
  services_growth?: number;
  total_earnings?: number;
  earnings_growth_percentage?: number;
  average_rating?: number;

  // Observer specific
  observed_entities?: number;
  access_permissions?: number;
  recent_reports?: number;
  alerts?: number;
}