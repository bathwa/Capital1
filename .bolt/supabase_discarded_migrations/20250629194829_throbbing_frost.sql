/*
  # Initial Database Schema for Abathwa Capital

  1. New Tables
    - `users` - Core user information and authentication
    - `entrepreneur_profiles` - Entrepreneur-specific data
    - `investor_profiles` - Investor-specific data
    - `service_provider_profiles` - Service provider data
    - `opportunities` - Investment opportunities
    - `investment_offers` - Investment offers from investors
    - `investments` - Confirmed investments
    - `milestones` - Project milestones
    - `investment_pools` - Investment pools/syndicates
    - `pool_members` - Pool membership data
    - `service_requests` - Service provider requests
    - `notifications` - User notifications
    - `settlement_plans` - Settlement plans for failed projects
    - `settlement_installments` - Settlement payment installments
    - `agreements` - Legal agreements
    - `files` - File attachments

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Implement proper authentication flows

  3. Indexes and Constraints
    - Foreign key relationships
    - Performance indexes
    - Data validation constraints
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('ADMIN', 'ENTREPRENEUR', 'INVESTOR', 'SERVICE_PROVIDER', 'OBSERVER');
CREATE TYPE user_status AS ENUM ('PENDING_EMAIL_CONFIRMATION', 'ACTIVE', 'SUSPENDED', 'DEACTIVATED');
CREATE TYPE opportunity_category AS ENUM ('GOING_CONCERN', 'ORDER_FULFILLMENT', 'PROJECT_PARTNERSHIP');
CREATE TYPE funding_stage AS ENUM ('SEED', 'STARTUP', 'GROWTH');
CREATE TYPE opportunity_status AS ENUM ('DRAFT', 'PENDING_ADMIN_REVIEW', 'ADMIN_REJECTED', 'FUNDING_LIVE', 'FUNDING_CLOSED', 'ACTIVE_INVESTMENT', 'COMPLETED', 'FAILED', 'DISPUTED');
CREATE TYPE offer_status AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED_BY_ENTREPRENEUR', 'COUNTER_OFFERED', 'EXPIRED', 'WITHDRAWN_BY_INVESTOR');
CREATE TYPE investment_status AS ENUM ('PENDING_INVESTOR_PAYMENT', 'PENDING_ADMIN_CONFIRMATION', 'FUNDS_IN_ESCROW', 'FUNDS_RELEASED_TO_ENTREPRENEUR', 'COMPLETED', 'REJECTED_BY_ADMIN');
CREATE TYPE milestone_status AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'FLAGGED');
CREATE TYPE pool_category AS ENUM ('SYNDICATE', 'COLLECTIVE', 'COMMUNITY_DEVELOPMENT_INITIATIVE', 'COMPANY');
CREATE TYPE pool_status AS ENUM ('PENDING_ADMIN_APPROVAL', 'ACTIVE', 'CLOSED');
CREATE TYPE pool_member_role AS ENUM ('MEMBER', 'CHAIRPERSON', 'SECRETARY', 'TREASURER', 'INVESTMENTS_OFFICER');
CREATE TYPE service_request_status AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE settlement_status AS ENUM ('PENDING_ENTREPRENEUR_SUBMISSION', 'PENDING_ADMIN_REVIEW', 'APPROVED', 'REJECTED', 'ACTIVE', 'COMPLETED');
CREATE TYPE installment_status AS ENUM ('PENDING', 'PAID', 'OVERDUE');
CREATE TYPE agreement_type AS ENUM ('INVESTMENT_AGREEMENT', 'NDA', 'SERVICE_AGREEMENT');
CREATE TYPE agreement_status AS ENUM ('DRAFT', 'PENDING_SIGNATURES', 'FULLY_EXECUTED', 'EXPIRED');
CREATE TYPE investor_type AS ENUM ('INDIVIDUAL', 'SYNDICATE_LEADER', 'INSTITUTIONAL');
CREATE TYPE risk_tolerance AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  phone_number TEXT NOT NULL,
  role user_role NOT NULL,
  status user_status DEFAULT 'PENDING_EMAIL_CONFIRMATION',
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  organization_name TEXT,
  date_registered TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  email_verified BOOLEAN DEFAULT FALSE,
  profile_completion_percentage INTEGER DEFAULT 0,
  reliability_score INTEGER DEFAULT 0,
  profile_picture_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Entrepreneur profiles
CREATE TABLE IF NOT EXISTS entrepreneur_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  business_registration_number TEXT,
  business_address TEXT,
  industry TEXT,
  business_description TEXT,
  due_diligence_data JSONB DEFAULT '{}',
  legal_status_verified BOOLEAN DEFAULT FALSE,
  settlement_plan_available BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Investor profiles
CREATE TABLE IF NOT EXISTS investor_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  investor_type investor_type DEFAULT 'INDIVIDUAL',
  investment_preferences JSONB DEFAULT '{}',
  source_of_funds_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service provider profiles
CREATE TABLE IF NOT EXISTS service_provider_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  service_categories TEXT[] DEFAULT '{}',
  credentials JSONB DEFAULT '{}',
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  total_services_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Opportunities
CREATE TABLE IF NOT EXISTS opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entrepreneur_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category opportunity_category NOT NULL,
  industry TEXT NOT NULL,
  location TEXT NOT NULL,
  funding_goal DECIMAL(15,2) NOT NULL,
  equity_offered_percentage DECIMAL(5,2) NOT NULL,
  roi_projected_percentage DECIMAL(5,2),
  funding_stage funding_stage NOT NULL,
  status opportunity_status DEFAULT 'DRAFT',
  min_investment_amount DECIMAL(15,2) NOT NULL,
  current_funds_raised DECIMAL(15,2) DEFAULT 0,
  start_date DATE,
  end_date DATE,
  due_diligence_summary TEXT,
  risk_assessment_score INTEGER,
  risk_assessment_details TEXT,
  admin_rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Investment offers
CREATE TABLE IF NOT EXISTS investment_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  investor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount_offered DECIMAL(15,2) NOT NULL,
  equity_requested_percentage DECIMAL(5,2) NOT NULL,
  offer_terms TEXT,
  status offer_status DEFAULT 'PENDING',
  counter_offer_id UUID REFERENCES investment_offers(id),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Investments
CREATE TABLE IF NOT EXISTS investments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  offer_id UUID NOT NULL REFERENCES investment_offers(id) ON DELETE CASCADE,
  investor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  invested_amount DECIMAL(15,2) NOT NULL,
  equity_percentage DECIMAL(5,2) NOT NULL,
  transaction_reference TEXT NOT NULL,
  proof_of_payment_url TEXT,
  payment_method TEXT NOT NULL,
  status investment_status DEFAULT 'PENDING_INVESTOR_PAYMENT',
  admin_confirmation_at TIMESTAMPTZ,
  funds_released_at TIMESTAMPTZ,
  admin_rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Milestones
CREATE TABLE IF NOT EXISTS milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE NOT NULL,
  actual_completion_date DATE,
  status milestone_status DEFAULT 'PLANNED',
  progress_notes TEXT DEFAULT '',
  completion_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Investment pools
CREATE TABLE IF NOT EXISTS investment_pools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category pool_category NOT NULL,
  status pool_status DEFAULT 'PENDING_ADMIN_APPROVAL',
  created_by_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  admin_approved_at TIMESTAMPTZ,
  member_count INTEGER DEFAULT 0,
  total_pool_value DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pool members
CREATE TABLE IF NOT EXISTS pool_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pool_id UUID NOT NULL REFERENCES investment_pools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role pool_member_role DEFAULT 'MEMBER',
  contribution_amount DECIMAL(15,2),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pool_id, user_id)
);

-- Service requests
CREATE TABLE IF NOT EXISTS service_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entrepreneur_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_provider_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  service_category TEXT NOT NULL,
  service_description TEXT NOT NULL,
  proposed_payment DECIMAL(15,2) NOT NULL,
  status service_request_status DEFAULT 'PENDING',
  completion_report_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_entity_type TEXT,
  related_entity_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settlement plans
CREATE TABLE IF NOT EXISTS settlement_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entrepreneur_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  reason_for_failure TEXT NOT NULL,
  total_amount_to_settle DECIMAL(15,2) NOT NULL,
  status settlement_status DEFAULT 'PENDING_ENTREPRENEUR_SUBMISSION',
  admin_rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settlement installments
CREATE TABLE IF NOT EXISTS settlement_installments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  settlement_plan_id UUID NOT NULL REFERENCES settlement_plans(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  installment_amount DECIMAL(15,2) NOT NULL,
  due_date DATE NOT NULL,
  status installment_status DEFAULT 'PENDING',
  paid_at TIMESTAMPTZ,
  proof_of_payment_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agreements
CREATE TABLE IF NOT EXISTS agreements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type agreement_type NOT NULL,
  parties UUID[] NOT NULL,
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
  offer_id UUID REFERENCES investment_offers(id) ON DELETE CASCADE,
  status agreement_status DEFAULT 'DRAFT',
  document_url TEXT NOT NULL,
  signatures JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Files
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  category TEXT NOT NULL,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_entrepreneur ON opportunities(entrepreneur_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_category ON opportunities(category);
CREATE INDEX IF NOT EXISTS idx_investment_offers_opportunity ON investment_offers(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_investment_offers_investor ON investment_offers(investor_id);
CREATE INDEX IF NOT EXISTS idx_investments_opportunity ON investments(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_investments_investor ON investments(investor_id);
CREATE INDEX IF NOT EXISTS idx_milestones_opportunity ON milestones(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_pool_members_pool ON pool_members(pool_id);
CREATE INDEX IF NOT EXISTS idx_pool_members_user ON pool_members(user_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE entrepreneur_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_provider_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE pool_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlement_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlement_installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users policies
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can read all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Entrepreneur profiles policies
CREATE POLICY "Entrepreneurs can manage own profile" ON entrepreneur_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Investors can read entrepreneur profiles" ON entrepreneur_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('INVESTOR', 'ADMIN')
    )
  );

-- Investor profiles policies
CREATE POLICY "Investors can manage own profile" ON investor_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Service provider profiles policies
CREATE POLICY "Service providers can manage own profile" ON service_provider_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can read service provider profiles" ON service_provider_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('ENTREPRENEUR', 'ADMIN')
    )
  );

-- Opportunities policies
CREATE POLICY "Entrepreneurs can manage own opportunities" ON opportunities
  FOR ALL USING (auth.uid() = entrepreneur_id);

CREATE POLICY "Users can read active opportunities" ON opportunities
  FOR SELECT USING (
    status IN ('FUNDING_LIVE', 'ACTIVE_INVESTMENT', 'COMPLETED') OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Investment offers policies
CREATE POLICY "Investors can manage own offers" ON investment_offers
  FOR ALL USING (auth.uid() = investor_id);

CREATE POLICY "Entrepreneurs can read offers for their opportunities" ON investment_offers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM opportunities 
      WHERE id = opportunity_id AND entrepreneur_id = auth.uid()
    )
  );

-- Investments policies
CREATE POLICY "Investors can read own investments" ON investments
  FOR SELECT USING (auth.uid() = investor_id);

CREATE POLICY "Entrepreneurs can read investments in their opportunities" ON investments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM opportunities 
      WHERE id = opportunity_id AND entrepreneur_id = auth.uid()
    )
  );

-- Notifications policies
CREATE POLICY "Users can manage own notifications" ON notifications
  FOR ALL USING (auth.uid() = user_id);

-- Add trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entrepreneur_profiles_updated_at BEFORE UPDATE ON entrepreneur_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investor_profiles_updated_at BEFORE UPDATE ON investor_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_provider_profiles_updated_at BEFORE UPDATE ON service_provider_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON opportunities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investment_offers_updated_at BEFORE UPDATE ON investment_offers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON investments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_milestones_updated_at BEFORE UPDATE ON milestones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investment_pools_updated_at BEFORE UPDATE ON investment_pools
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pool_members_updated_at BEFORE UPDATE ON pool_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_requests_updated_at BEFORE UPDATE ON service_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settlement_plans_updated_at BEFORE UPDATE ON settlement_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settlement_installments_updated_at BEFORE UPDATE ON settlement_installments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agreements_updated_at BEFORE UPDATE ON agreements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON files
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();