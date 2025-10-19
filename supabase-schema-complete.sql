-- ============================================================================
-- GANTAVYA EVENT MANAGEMENT SYSTEM - COMPLETE DATABASE SCHEMA
-- ============================================================================
-- This schema includes:
-- - User Authentication & Profiles
-- - Events Management
-- - Event Registrations
-- - Teams & Team Members
-- - Payment Tracking
-- - Document Management
-- - Admin Controls
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. USER AUTHENTICATION & PROFILES
-- ============================================================================

-- User profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    college TEXT,
    graduation_year INTEGER,
    department TEXT,
    profile_image_url TEXT,
    bio TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'team_leader', 'admin', 'super_admin')),
    is_verified BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

-- User addresses
CREATE TABLE IF NOT EXISTS user_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    address_type TEXT DEFAULT 'home' CHECK (address_type IN ('home', 'college', 'other')),
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT DEFAULT 'India',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User social links
CREATE TABLE IF NOT EXISTS user_social_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('linkedin', 'github', 'twitter', 'instagram', 'portfolio', 'other')),
    url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. EVENTS MANAGEMENT
-- ============================================================================

-- Event categories
CREATE TABLE IF NOT EXISTS event_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Main events table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    content TEXT, -- Markdown content for event details
    
    -- Category & Classification
    category_id UUID REFERENCES event_categories(id),
    category TEXT, -- Backward compatibility
    event_type TEXT DEFAULT 'competition' CHECK (event_type IN ('competition', 'workshop', 'seminar', 'cultural', 'sports', 'technical', 'hackathon', 'other')),
    
    -- Dates & Timing
    date_from DATE,
    date_to DATE,
    registration_start_date TIMESTAMPTZ,
    registration_end_date TIMESTAMPTZ,
    event_start_time TIME,
    event_end_time TIME,
    duration_hours INTEGER,
    
    -- Location
    venue TEXT,
    location_type TEXT DEFAULT 'offline' CHECK (location_type IN ('offline', 'online', 'hybrid')),
    venue_details JSONB, -- {building, room, capacity, facilities, etc}
    online_meeting_link TEXT,
    
    -- Team Configuration
    team_size_min INTEGER DEFAULT 1,
    team_size_max INTEGER DEFAULT 4,
    team_size TEXT, -- Format: "2-4" for backward compatibility
    allow_individual BOOLEAN DEFAULT TRUE,
    
    -- Pricing & Prizes
    registration_fee DECIMAL(10, 2) DEFAULT 0.00,
    prize_pool TEXT,
    prize_distribution JSONB, -- {first: 50000, second: 30000, third: 20000}
    
    -- Media
    poster_url TEXT,
    banner_url TEXT,
    thumbnail_url TEXT,
    gallery_images JSONB, -- Array of image URLs
    video_url TEXT,
    
    -- Limits & Capacity
    max_teams INTEGER,
    max_participants INTEGER,
    current_registrations INTEGER DEFAULT 0,
    waitlist_enabled BOOLEAN DEFAULT FALSE,
    
    -- Rules & Requirements
    rules TEXT,
    eligibility_criteria TEXT,
    requirements JSONB, -- Array of requirement strings
    tags JSONB, -- Array of tags for search/filter
    
    -- Contact
    coordinator_name TEXT,
    coordinator_email TEXT,
    coordinator_phone TEXT,
    contact_details JSONB, -- Multiple coordinators
    
    -- Status & Visibility
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'ongoing', 'completed', 'cancelled')),
    is_featured BOOLEAN DEFAULT FALSE,
    is_visible BOOLEAN DEFAULT TRUE,
    show_on_homepage BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

-- Event FAQ
CREATE TABLE IF NOT EXISTS event_faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event timeline/schedule
CREATE TABLE IF NOT EXISTS event_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    day_number INTEGER DEFAULT 1,
    schedule_date DATE,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    activity_title TEXT NOT NULL,
    activity_description TEXT,
    location TEXT,
    speaker TEXT,
    is_break BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event sponsors
CREATE TABLE IF NOT EXISTS event_sponsors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    sponsor_name TEXT NOT NULL,
    sponsor_logo_url TEXT,
    sponsor_website TEXT,
    sponsor_type TEXT CHECK (sponsor_type IN ('title', 'platinum', 'gold', 'silver', 'bronze', 'partner')),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. TEAMS & TEAM MANAGEMENT
-- ============================================================================

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_name TEXT NOT NULL,
    team_code TEXT UNIQUE, -- Auto-generated unique code for team identification
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    event_slug TEXT REFERENCES events(slug),
    
    -- Team Leader
    leader_id UUID REFERENCES user_profiles(id),
    leader_name TEXT NOT NULL,
    leader_email TEXT NOT NULL,
    leader_phone TEXT NOT NULL,
    leader_college TEXT,
    
    -- Team Details
    team_size INTEGER DEFAULT 1,
    team_description TEXT,
    team_logo_url TEXT,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES user_profiles(id)
);

-- Team members
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id), -- NULL if not registered user
    
    -- Member Details
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    college TEXT,
    department TEXT,
    year_of_study INTEGER,
    student_id TEXT,
    
    -- Role
    is_leader BOOLEAN DEFAULT FALSE,
    role TEXT, -- Captain, Vice-Captain, Member
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'removed')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(team_id, email)
);

-- Team invitations
CREATE TABLE IF NOT EXISTS team_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    invited_by UUID REFERENCES user_profiles(id),
    invited_email TEXT NOT NULL,
    invitation_code TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
    expires_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. EVENT REGISTRATIONS
-- ============================================================================

-- Main registrations table
CREATE TABLE IF NOT EXISTS registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_number TEXT UNIQUE NOT NULL, -- Auto-generated: REG-EVENT-001
    
    -- Event & Team
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    event_slug TEXT REFERENCES events(slug),
    team_id UUID REFERENCES teams(id),
    user_id UUID REFERENCES user_profiles(id), -- Individual registration
    
    -- Registration Type
    registration_type TEXT DEFAULT 'team' CHECK (registration_type IN ('individual', 'team')),
    
    -- Team Info (for backward compatibility)
    team_name TEXT,
    team_size INTEGER DEFAULT 1,
    
    -- Contact Details
    contact_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    
    -- Status & Verification
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'waitlisted', 'rejected', 'cancelled', 'attended')),
    is_verified BOOLEAN DEFAULT FALSE,
    verification_code TEXT UNIQUE,
    verified_at TIMESTAMPTZ,
    
    -- Payment Reference
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'waived')),
    
    -- Additional Info
    additional_info TEXT,
    special_requirements TEXT,
    dietary_restrictions TEXT,
    emergency_contact JSONB, -- {name, phone, relationship}
    
    -- Check-in
    checked_in BOOLEAN DEFAULT FALSE,
    checked_in_at TIMESTAMPTZ,
    checked_in_by UUID REFERENCES user_profiles(id),
    
    -- Metadata
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT
);

-- Registration history/audit log
CREATE TABLE IF NOT EXISTS registration_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
    changed_by UUID REFERENCES user_profiles(id),
    change_type TEXT NOT NULL, -- status_change, payment_update, etc.
    old_value TEXT,
    new_value TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. PAYMENTS
-- ============================================================================

-- Payment transactions
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id TEXT UNIQUE NOT NULL,
    
    -- References
    registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id),
    event_id UUID REFERENCES events(id),
    
    -- Payment Details
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    payment_method TEXT CHECK (payment_method IN ('UPI', 'Net Banking', 'Card', 'Wallet', 'Cash', 'Other')),
    
    -- Transaction Info
    gateway TEXT, -- razorpay, stripe, paytm, etc.
    gateway_transaction_id TEXT,
    gateway_order_id TEXT,
    gateway_payment_id TEXT,
    
    -- UPI Details
    upi_id TEXT,
    upi_transaction_ref TEXT,
    
    -- Card Details (never store full card numbers!)
    card_last4 TEXT,
    card_brand TEXT,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled')),
    
    -- Verification
    payment_proof_url TEXT, -- Screenshot/receipt upload
    verified_by UUID REFERENCES user_profiles(id),
    verified_at TIMESTAMPTZ,
    verification_notes TEXT,
    
    -- Timestamps
    initiated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ,
    
    -- Error handling
    error_code TEXT,
    error_message TEXT,
    
    -- Metadata
    metadata JSONB, -- Additional gateway-specific data
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment refunds
CREATE TABLE IF NOT EXISTS payment_refunds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
    refund_amount DECIMAL(10, 2) NOT NULL,
    refund_reason TEXT NOT NULL,
    refund_type TEXT CHECK (refund_type IN ('full', 'partial', 'processing_fee')),
    gateway_refund_id TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    processed_by UUID REFERENCES user_profiles(id),
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 6. DOCUMENTS & FILE MANAGEMENT
-- ============================================================================

-- Documents table (for storing team documents, ID proofs, etc.)
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- References
    uploaded_by UUID REFERENCES user_profiles(id),
    team_id UUID REFERENCES teams(id),
    registration_id UUID REFERENCES registrations(id),
    event_id UUID REFERENCES events(id),
    
    -- Document Details
    document_type TEXT NOT NULL CHECK (document_type IN (
        'id_proof', 'student_id', 'college_id', 'team_logo', 
        'payment_proof', 'medical_certificate', 'consent_form',
        'project_document', 'presentation', 'other'
    )),
    document_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER, -- in bytes
    file_type TEXT, -- MIME type
    
    -- Metadata
    description TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES user_profiles(id),
    verified_at TIMESTAMPTZ,
    
    -- Access Control
    is_public BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 7. NOTIFICATIONS & COMMUNICATIONS
-- ============================================================================

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Notification Details
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type TEXT CHECK (notification_type IN (
        'registration_confirmation', 'payment_success', 'team_invitation',
        'status_update', 'event_reminder', 'announcement', 'other'
    )),
    
    -- Links
    action_url TEXT,
    action_label TEXT,
    
    -- Related References
    event_id UUID REFERENCES events(id),
    registration_id UUID REFERENCES registrations(id),
    team_id UUID REFERENCES teams(id),
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    
    -- Priority
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- Email logs
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_email TEXT NOT NULL,
    recipient_user_id UUID REFERENCES user_profiles(id),
    subject TEXT NOT NULL,
    email_type TEXT NOT NULL,
    template_name TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
    sent_at TIMESTAMPTZ,
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 8. ADMIN & ANALYTICS
-- ============================================================================

-- Admin activity log
CREATE TABLE IF NOT EXISTS admin_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES user_profiles(id),
    action TEXT NOT NULL,
    entity_type TEXT, -- event, registration, payment, user
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event analytics
CREATE TABLE IF NOT EXISTS event_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    metric_date DATE DEFAULT CURRENT_DATE,
    
    -- Metrics
    page_views INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    registrations_count INTEGER DEFAULT 0,
    revenue DECIMAL(10, 2) DEFAULT 0.00,
    
    -- Sources
    traffic_sources JSONB, -- {direct: 100, social: 50, search: 30}
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(event_id, metric_date)
);

-- ============================================================================
-- 9. INDEXES FOR PERFORMANCE
-- ============================================================================

-- User profiles indexes
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_college ON user_profiles(college);

-- Events indexes
CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_events_category_id ON events(category_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_date_from ON events(date_from);
CREATE INDEX idx_events_is_featured ON events(is_featured);
CREATE INDEX idx_events_created_at ON events(created_at DESC);

-- Teams indexes
CREATE INDEX idx_teams_event_id ON teams(event_id);
CREATE INDEX idx_teams_leader_id ON teams(leader_id);
CREATE INDEX idx_teams_team_code ON teams(team_code);
CREATE INDEX idx_teams_status ON teams(status);

-- Team members indexes
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_team_members_email ON team_members(email);

-- Registrations indexes
CREATE INDEX idx_registrations_event_id ON registrations(event_id);
CREATE INDEX idx_registrations_team_id ON registrations(team_id);
CREATE INDEX idx_registrations_user_id ON registrations(user_id);
CREATE INDEX idx_registrations_status ON registrations(status);
CREATE INDEX idx_registrations_payment_status ON registrations(payment_status);
CREATE INDEX idx_registrations_email ON registrations(contact_email);
CREATE INDEX idx_registrations_created_at ON registrations(created_at DESC);

-- Payments indexes
CREATE INDEX idx_payments_registration_id ON payments(registration_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);

-- Documents indexes
CREATE INDEX idx_documents_team_id ON documents(team_id);
CREATE INDEX idx_documents_registration_id ON documents(registration_id);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_documents_document_type ON documents(document_type);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================================================
-- 10. VIEWS FOR EASY DATA ACCESS
-- ============================================================================

-- Complete registration details view
CREATE OR REPLACE VIEW registration_details AS
SELECT 
    r.id,
    r.registration_number,
    r.event_slug,
    e.title as event_title,
    r.team_name,
    r.team_size,
    r.contact_name,
    r.contact_email,
    r.contact_phone,
    r.status as registration_status,
    r.payment_status,
    r.checked_in,
    r.registered_at,
    -- Team members as JSON array
    COALESCE(
        json_agg(
            json_build_object(
                'id', tm.id,
                'name', tm.name,
                'email', tm.email,
                'phone', tm.phone,
                'college', tm.college,
                'is_leader', tm.is_leader
            )
            ORDER BY tm.is_leader DESC, tm.created_at
        ) FILTER (WHERE tm.id IS NOT NULL),
        '[]'::json
    ) as team_members,
    -- Payment info
    p.amount as payment_amount,
    p.payment_method,
    p.status as payment_transaction_status,
    p.completed_at as payment_completed_at
FROM registrations r
LEFT JOIN events e ON r.event_id = e.id
LEFT JOIN teams t ON r.team_id = t.id
LEFT JOIN team_members tm ON t.id = tm.team_id
LEFT JOIN payments p ON r.id = p.registration_id
GROUP BY r.id, e.title, p.amount, p.payment_method, p.status, p.completed_at;

-- Event statistics view
CREATE OR REPLACE VIEW event_stats AS
SELECT 
    e.id,
    e.slug,
    e.title,
    e.status,
    e.date_from,
    e.date_to,
    COUNT(DISTINCT r.id) as total_registrations,
    COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'confirmed') as confirmed_registrations,
    COUNT(DISTINCT r.id) FILTER (WHERE r.payment_status = 'paid') as paid_registrations,
    COUNT(DISTINCT r.id) FILTER (WHERE r.checked_in = true) as checked_in_count,
    SUM(r.team_size) as total_participants,
    COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'completed'), 0) as total_revenue,
    e.max_teams,
    e.max_participants,
    CASE 
        WHEN e.max_teams IS NOT NULL THEN 
            ROUND((COUNT(DISTINCT r.id)::DECIMAL / e.max_teams) * 100, 2)
        ELSE 0
    END as registration_percentage
FROM events e
LEFT JOIN registrations r ON e.id = r.event_id
LEFT JOIN payments p ON r.id = p.registration_id
GROUP BY e.id, e.slug, e.title, e.status, e.date_from, e.date_to, e.max_teams, e.max_participants;

-- Team details view
CREATE OR REPLACE VIEW team_details AS
SELECT 
    t.id,
    t.team_name,
    t.team_code,
    t.event_slug,
    e.title as event_title,
    t.leader_name,
    t.leader_email,
    t.status as team_status,
    t.team_size,
    COUNT(tm.id) as current_member_count,
    json_agg(
        json_build_object(
            'id', tm.id,
            'name', tm.name,
            'email', tm.email,
            'phone', tm.phone,
            'college', tm.college,
            'is_leader', tm.is_leader,
            'status', tm.status
        )
        ORDER BY tm.is_leader DESC, tm.created_at
    ) as members
FROM teams t
LEFT JOIN events e ON t.event_id = e.id
LEFT JOIN team_members tm ON t.id = tm.team_id
GROUP BY t.id, t.team_name, t.team_code, t.event_slug, e.title, t.leader_name, t.leader_email, t.status, t.team_size;

-- User dashboard view
CREATE OR REPLACE VIEW user_dashboard AS
SELECT 
    u.id,
    u.full_name,
    u.email,
    u.college,
    -- Registrations
    COUNT(DISTINCT r.id) as total_registrations,
    COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'confirmed') as confirmed_registrations,
    -- Teams
    COUNT(DISTINCT t.id) FILTER (WHERE t.leader_id = u.id) as teams_leading,
    COUNT(DISTINCT tm.team_id) as teams_member_of,
    -- Payments
    COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'completed'), 0) as total_paid
FROM user_profiles u
LEFT JOIN registrations r ON u.id = r.user_id
LEFT JOIN teams t ON u.id = t.leader_id
LEFT JOIN team_members tm ON u.id = tm.user_id
LEFT JOIN payments p ON u.id = p.user_id
GROUP BY u.id, u.full_name, u.email, u.college;

-- ============================================================================
-- 11. FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all relevant tables
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_registrations_updated_at BEFORE UPDATE ON registrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate registration number
CREATE OR REPLACE FUNCTION generate_registration_number()
RETURNS TRIGGER AS $$
DECLARE
    event_prefix TEXT;
    counter INTEGER;
BEGIN
    -- Get event slug prefix (first 3 letters, uppercase)
    event_prefix := UPPER(SUBSTRING(NEW.event_slug FROM 1 FOR 3));
    
    -- Get count of existing registrations for this event
    SELECT COUNT(*) + 1 INTO counter
    FROM registrations
    WHERE event_slug = NEW.event_slug;
    
    -- Generate registration number: REG-EVT-001
    NEW.registration_number := 'REG-' || event_prefix || '-' || LPAD(counter::TEXT, 3, '0');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_registration_number BEFORE INSERT ON registrations
    FOR EACH ROW EXECUTE FUNCTION generate_registration_number();

-- Function to generate team code
CREATE OR REPLACE FUNCTION generate_team_code()
RETURNS TRIGGER AS $$
DECLARE
    code TEXT;
    code_exists BOOLEAN;
BEGIN
    LOOP
        -- Generate random 8-character alphanumeric code
        code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 8));
        
        -- Check if code already exists
        SELECT EXISTS(SELECT 1 FROM teams WHERE team_code = code) INTO code_exists;
        
        -- Exit loop if code is unique
        EXIT WHEN NOT code_exists;
    END LOOP;
    
    NEW.team_code := code;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_team_code BEFORE INSERT ON teams
    FOR EACH ROW EXECUTE FUNCTION generate_team_code();

-- Function to update event registration count
CREATE OR REPLACE FUNCTION update_event_registration_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE events 
        SET current_registrations = current_registrations + 1
        WHERE id = NEW.event_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE events 
        SET current_registrations = GREATEST(current_registrations - 1, 0)
        WHERE id = OLD.event_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_registration_count AFTER INSERT OR DELETE ON registrations
    FOR EACH ROW EXECUTE FUNCTION update_event_registration_count();

-- ============================================================================
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_analytics ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view all profiles" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Events Policies
CREATE POLICY "Anyone can view published events" ON events FOR SELECT USING (
    status = 'published' AND is_visible = true
);
CREATE POLICY "Admins can manage events" ON events FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
);

-- Registrations Policies
CREATE POLICY "Users can view own registrations" ON registrations FOR SELECT USING (
    user_id = auth.uid() OR 
    contact_email = (SELECT email FROM user_profiles WHERE id = auth.uid())
);
CREATE POLICY "Anyone can insert registrations" ON registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own registrations" ON registrations FOR UPDATE USING (
    user_id = auth.uid() OR
    contact_email = (SELECT email FROM user_profiles WHERE id = auth.uid())
);
CREATE POLICY "Admins can view all registrations" ON registrations FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
);

-- Teams Policies
CREATE POLICY "Users can view teams they're part of" ON teams FOR SELECT USING (
    leader_id = auth.uid() OR
    EXISTS (SELECT 1 FROM team_members WHERE team_id = teams.id AND user_id = auth.uid())
);
CREATE POLICY "Anyone can create teams" ON teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Team leaders can update their teams" ON teams FOR UPDATE USING (leader_id = auth.uid());

-- Team Members Policies
CREATE POLICY "Users can view team members of their teams" ON team_members FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM teams t 
        WHERE t.id = team_members.team_id 
        AND (t.leader_id = auth.uid() OR 
             EXISTS (SELECT 1 FROM team_members tm WHERE tm.team_id = t.id AND tm.user_id = auth.uid()))
    )
);
CREATE POLICY "Team leaders can manage members" ON team_members FOR ALL USING (
    EXISTS (
        SELECT 1 FROM teams 
        WHERE id = team_members.team_id AND leader_id = auth.uid()
    )
);

-- Payments Policies
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Anyone can create payments" ON payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all payments" ON payments FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
);

-- Documents Policies
CREATE POLICY "Users can view own documents" ON documents FOR SELECT USING (uploaded_by = auth.uid());
CREATE POLICY "Users can upload documents" ON documents FOR INSERT WITH CHECK (uploaded_by = auth.uid());
CREATE POLICY "Public documents visible to all" ON documents FOR SELECT USING (is_public = true);

-- Notifications Policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());

-- Admin Logs Policies
CREATE POLICY "Only admins can view logs" ON admin_logs FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
);

-- ============================================================================
-- 13. SAMPLE DATA (FOR TESTING - COMMENT OUT IN PRODUCTION)
-- ============================================================================

-- Insert sample event categories
INSERT INTO event_categories (name, slug, description, icon, color) VALUES
('Technical', 'technical', 'Technical competitions and hackathons', 'code', '#3B82F6'),
('Cultural', 'cultural', 'Cultural events and performances', 'music', '#EC4899'),
('Sports', 'sports', 'Sports competitions', 'trophy', '#10B981'),
('Workshop', 'workshop', 'Skill development workshops', 'wrench', '#F59E0B')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample event
INSERT INTO events (
    slug, title, subtitle, description, content, category, event_type,
    date_from, date_to, registration_start_date, registration_end_date,
    team_size_min, team_size_max, team_size, allow_individual,
    registration_fee, prize_pool, venue, location_type,
    max_teams, max_participants, status, is_featured, is_visible,
    coordinator_name, coordinator_email, coordinator_phone
) VALUES (
    'tech-hackathon-2024',
    'Tech Hackathon 2024',
    '48 Hours of Innovation',
    'Build innovative solutions to real-world problems',
    '# Tech Hackathon 2024\n\nJoin us for an exciting 48-hour coding marathon!',
    'Technical',
    'hackathon',
    '2025-11-15',
    '2025-11-17',
    '2025-10-01 00:00:00+00',
    '2025-11-10 23:59:59+00',
    2, 4, '2-4', false,
    500.00,
    '₹1,00,000',
    'Tech Park, Building A',
    'offline',
    50, 200,
    'published',
    true, true,
    'John Doe',
    'john@example.com',
    '9876543210'
) ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================

-- Display success message
DO $$
BEGIN
    RAISE NOTICE '✅ Gantavya Event Management System schema created successfully!';
    RAISE NOTICE '📊 Tables: 25+';
    RAISE NOTICE '📈 Views: 4';
    RAISE NOTICE '🔧 Functions: 5';
    RAISE NOTICE '🔒 RLS Policies: Enabled';
    RAISE NOTICE '🎯 Ready to use!';
END $$;
