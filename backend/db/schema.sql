-- ============================================================
-- Real Estate CRM - Database Schema
-- MySQL 8.0+
-- ============================================================

CREATE DATABASE IF NOT EXISTS realestate_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE realestate_crm;

-- ============================================================
-- ROLES
-- ============================================================
CREATE TABLE IF NOT EXISTS roles (
  id         INT          PRIMARY KEY AUTO_INCREMENT,
  name       VARCHAR(50)  NOT NULL UNIQUE,  -- admin, manager, agent
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO roles (name) VALUES ('admin'), ('manager'), ('agent');

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            INT           PRIMARY KEY AUTO_INCREMENT,
  full_name     VARCHAR(255)  NOT NULL,
  email         VARCHAR(255)  NOT NULL UNIQUE,
  phone         VARCHAR(50),
  password_hash VARCHAR(255)  NOT NULL,
  role_id       INT           NOT NULL DEFAULT 3,
  is_active     TINYINT(1)    NOT NULL DEFAULT 1,
  avatar_url    VARCHAR(500),
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- LEAD SOURCES
-- ============================================================
CREATE TABLE IF NOT EXISTS lead_sources (
  id         INT          PRIMARY KEY AUTO_INCREMENT,
  name       VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO lead_sources (name) VALUES
  ('Facebook Ads'), ('Referral'), ('WhatsApp'), ('Walk-in'),
  ('Instagram'), ('Website'), ('Phone Call'), ('Email'), ('Other');

-- ============================================================
-- LEADS
-- ============================================================
CREATE TABLE IF NOT EXISTS leads (
  id              INT           PRIMARY KEY AUTO_INCREMENT,
  full_name       VARCHAR(255)  NOT NULL,
  phone           VARCHAR(50)   NOT NULL,
  email           VARCHAR(255),
  source_id       INT,
  stage           ENUM('new_lead','contacted','interested','inspection_scheduled',
                       'negotiation','closed_won','closed_lost')
                  NOT NULL DEFAULT 'new_lead',
  assigned_to     INT,
  notes           TEXT,
  budget_range    DECIMAL(15,2),
  property_type   VARCHAR(100),
  next_follow_up  DATE,
  created_by      INT,
  created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_leads_source   FOREIGN KEY (source_id)   REFERENCES lead_sources(id) ON DELETE SET NULL,
  CONSTRAINT fk_leads_assignee FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_leads_creator  FOREIGN KEY (created_by)  REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS lead_notes (
  id         INT       PRIMARY KEY AUTO_INCREMENT,
  lead_id    INT       NOT NULL,
  user_id    INT       NOT NULL,
  content    TEXT      NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_lead_notes_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
  CONSTRAINT fk_lead_notes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- PROPERTIES
-- ============================================================
CREATE TABLE IF NOT EXISTS properties (
  id            INT            PRIMARY KEY AUTO_INCREMENT,
  title         VARCHAR(255)   NOT NULL,
  description   TEXT,
  price         DECIMAL(15,2)  NOT NULL,
  location      VARCHAR(255)   NOT NULL,
  state         VARCHAR(100),
  city          VARCHAR(100),
  property_type VARCHAR(100),   -- land, duplex, apartment, bungalow, etc.
  bedrooms      INT,
  bathrooms     INT,
  land_size     VARCHAR(100),
  status        ENUM('available','reserved','sold') NOT NULL DEFAULT 'available',
  assigned_to   INT,
  created_by    INT,
  created_at    TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_properties_agent   FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_properties_creator FOREIGN KEY (created_by)  REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS property_images (
  id          INT          PRIMARY KEY AUTO_INCREMENT,
  property_id INT          NOT NULL,
  image_url   VARCHAR(500) NOT NULL,
  is_primary  TINYINT(1)   NOT NULL DEFAULT 0,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_property_images_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- DEALS
-- ============================================================
CREATE TABLE IF NOT EXISTS deals (
  id                  INT            PRIMARY KEY AUTO_INCREMENT,
  lead_id             INT            NOT NULL,
  property_id         INT,
  agent_id            INT            NOT NULL,
  deal_value          DECIMAL(15,2)  NOT NULL,
  stage               ENUM('inspection','offer_made','payment_ongoing','closed')
                      NOT NULL DEFAULT 'inspection',
  notes               TEXT,
  expected_close_date DATE,
  closed_date         DATE,
  created_by          INT,
  created_at          TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_deals_lead     FOREIGN KEY (lead_id)     REFERENCES leads(id) ON DELETE RESTRICT,
  CONSTRAINT fk_deals_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL,
  CONSTRAINT fk_deals_agent    FOREIGN KEY (agent_id)    REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_deals_creator  FOREIGN KEY (created_by)  REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id                 INT            PRIMARY KEY AUTO_INCREMENT,
  deal_id            INT            NOT NULL,
  customer_name      VARCHAR(255)   NOT NULL,
  amount             DECIMAL(15,2)  NOT NULL,
  payment_date       DATE           NOT NULL,
  payment_method     VARCHAR(100),  -- cash, transfer, cheque, POS
  receipt_number     VARCHAR(100)   UNIQUE,
  installment_number INT            NOT NULL DEFAULT 1,
  total_installments INT            NOT NULL DEFAULT 1,
  notes              TEXT,
  recorded_by        INT,
  status             ENUM('pending','partial','completed') NOT NULL DEFAULT 'pending',
  created_at         TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_payments_deal     FOREIGN KEY (deal_id)     REFERENCES deals(id) ON DELETE RESTRICT,
  CONSTRAINT fk_payments_recorder FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- DOCUMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS documents (
  id            INT           PRIMARY KEY AUTO_INCREMENT,
  property_id   INT           NOT NULL,
  document_type ENUM('certificate_of_occupancy','survey_plan',
                     'deed_of_assignment','other') NOT NULL,
  title         VARCHAR(255)  NOT NULL,
  file_url      VARCHAR(500)  NOT NULL,
  status        ENUM('pending','verified','flagged') NOT NULL DEFAULT 'pending',
  notes         TEXT,
  uploaded_by   INT,
  verified_by   INT,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_documents_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  CONSTRAINT fk_documents_uploader FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_documents_verifier FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id          INT           PRIMARY KEY AUTO_INCREMENT,
  user_id     INT,
  action      VARCHAR(255)  NOT NULL,
  entity_type VARCHAR(100),
  entity_id   INT,
  details     JSON,
  ip_address  VARCHAR(45),  -- supports IPv6
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- INDEXES
-- ============================================================

-- Leads: most common query patterns
CREATE INDEX idx_leads_stage         ON leads(stage);
CREATE INDEX idx_leads_assigned_to   ON leads(assigned_to);
CREATE INDEX idx_leads_follow_up     ON leads(next_follow_up);        -- notification queries
CREATE INDEX idx_leads_created_at    ON leads(created_at);            -- date-range reports
CREATE INDEX idx_leads_source_id     ON leads(source_id);

-- Properties
CREATE INDEX idx_properties_status   ON properties(status);
CREATE INDEX idx_properties_type     ON properties(property_type);
CREATE INDEX idx_properties_city     ON properties(city);

-- Deals
CREATE INDEX idx_deals_stage         ON deals(stage);
CREATE INDEX idx_deals_agent_id      ON deals(agent_id);
CREATE INDEX idx_deals_lead_id       ON deals(lead_id);
CREATE INDEX idx_deals_property_id   ON deals(property_id);
CREATE INDEX idx_deals_created_at    ON deals(created_at);

-- Payments
CREATE INDEX idx_payments_status     ON payments(status);
CREATE INDEX idx_payments_deal_id    ON payments(deal_id);
CREATE INDEX idx_payments_date       ON payments(payment_date);       -- monthly revenue report

-- Documents
CREATE INDEX idx_documents_status    ON documents(status);
CREATE INDEX idx_documents_property  ON documents(property_id);

-- Audit logs: keep queries fast on large tables
CREATE INDEX idx_audit_user_id       ON audit_logs(user_id);
CREATE INDEX idx_audit_entity        ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created_at    ON audit_logs(created_at);

-- Lead notes
CREATE INDEX idx_lead_notes_lead_id  ON lead_notes(lead_id);