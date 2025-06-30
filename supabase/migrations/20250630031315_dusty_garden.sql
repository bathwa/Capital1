/*
  # Initialize Database Extensions

  1. Extensions
    - Enable uuid-ossp for UUID generation
    - Enable moddatetime for automatic timestamp updates
    - Enable pgcrypto for additional cryptographic functions

  2. Custom Types
    - Create ENUM types for consistent data validation
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom ENUM types for better data consistency
CREATE TYPE user_role AS ENUM (
  'ADMIN',
  'ENTREPRENEUR', 
  'INVESTOR',
  'SERVICE_PROVIDER',
  'OBSERVER'
);

CREATE TYPE user_status AS ENUM (
  'PENDING_EMAIL_CONFIRMATION',
  'ACTIVE',
  'SUSPENDED',
  'DEACTIVATED'
);

CREATE TYPE organization_status AS ENUM (
  'PENDING',
  'ACTIVE',
  'INACTIVE',
  'SUSPENDED'
);

CREATE TYPE project_status AS ENUM (
  'DRAFT',
  'PLANNING',
  'ACTIVE',
  'ON_HOLD',
  'COMPLETED',
  'CANCELLED',
  'ARCHIVED'
);

CREATE TYPE task_status AS ENUM (
  'TODO',
  'IN_PROGRESS',
  'REVIEW',
  'DONE',
  'BLOCKED',
  'CANCELLED'
);

CREATE TYPE task_priority AS ENUM (
  'LOW',
  'MEDIUM',
  'HIGH',
  'URGENT'
);

CREATE TYPE entity_type AS ENUM (
  'user',
  'organization',
  'project',
  'task',
  'comment',
  'attachment'
);