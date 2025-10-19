// ============================================================================
// DATABASE TYPES - Auto-generated from Supabase Schema
// ============================================================================

// ============================================================================
// 1. USER & AUTHENTICATION TYPES
// ============================================================================

export interface UserProfile {
  id: string; // UUID
  email: string;
  full_name: string;
  phone?: string;
  college?: string;
  graduation_year?: number;
  department?: string;
  profile_image_url?: string;
  bio?: string;
  role: 'user' | 'team_leader' | 'admin' | 'super_admin';
  is_verified: boolean;
  email_verified: boolean;
  phone_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

export interface UserAddress {
  id: string;
  user_id: string;
  address_type: 'home' | 'college' | 'other';
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSocialLink {
  id: string;
  user_id: string;
  platform: 'linkedin' | 'github' | 'twitter' | 'instagram' | 'portfolio' | 'other';
  url: string;
  created_at: string;
}

// ============================================================================
// 2. EVENT TYPES
// ============================================================================

export interface EventCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export interface Event {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  content?: string; // Markdown content
  
  // Category & Classification
  category_id?: string;
  category?: string;
  event_type: 'competition' | 'workshop' | 'seminar' | 'cultural' | 'sports' | 'technical' | 'hackathon' | 'other';
  
  // Dates & Timing
  date_from?: string;
  date_to?: string;
  registration_start_date?: string;
  registration_end_date?: string;
  event_start_time?: string;
  event_end_time?: string;
  duration_hours?: number;
  
  // Location
  venue?: string;
  location_type: 'offline' | 'online' | 'hybrid';
  venue_details?: VenueDetails;
  online_meeting_link?: string;
  
  // Team Configuration
  team_size_min: number;
  team_size_max: number;
  team_size?: string; // "2-4"
  allow_individual: boolean;
  
  // Pricing & Prizes
  registration_fee: number;
  prize_pool?: string;
  prize_distribution?: PrizeDistribution;
  
  // Media
  poster_url?: string;
  banner_url?: string;
  thumbnail_url?: string;
  gallery_images?: string[];
  video_url?: string;
  
  // Limits & Capacity
  max_teams?: number;
  max_participants?: number;
  current_registrations: number;
  waitlist_enabled: boolean;
  
  // Rules & Requirements
  rules?: string;
  eligibility_criteria?: string;
  requirements?: string[];
  tags?: string[];
  
  // Contact
  coordinator_name?: string;
  coordinator_email?: string;
  coordinator_phone?: string;
  contact_details?: ContactDetail[];
  
  // Status & Visibility
  status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled';
  is_featured: boolean;
  is_visible: boolean;
  show_on_homepage: boolean;
  
  // Metadata
  created_by?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface VenueDetails {
  building?: string;
  room?: string;
  capacity?: number;
  facilities?: string[];
  parking?: boolean;
  accessibility?: boolean;
}

export interface PrizeDistribution {
  first?: number;
  second?: number;
  third?: number;
}

export interface ContactDetail {
  name: string;
  email: string;
  phone: string;
  role?: string;
}

export interface EventFAQ {
  id: string;
  event_id: string;
  question: string;
  answer: string;
  display_order: number;
  created_at: string;
}

export interface EventSchedule {
  id: string;
  event_id: string;
  day_number: number;
  schedule_date?: string;
  start_time: string;
  end_time: string;
  activity_title: string;
  activity_description?: string;
  location?: string;
  speaker?: string;
  is_break: boolean;
  created_at: string;
}

export interface EventSponsor {
  id: string;
  event_id: string;
  sponsor_name: string;
  sponsor_logo_url?: string;
  sponsor_website?: string;
  sponsor_type: 'title' | 'platinum' | 'gold' | 'silver' | 'bronze' | 'partner';
  display_order: number;
  created_at: string;
}

// ============================================================================
// 3. TEAM TYPES
// ============================================================================

export interface Team {
  id: string;
  team_name: string;
  team_code: string;
  event_id: string;
  event_slug: string;
  
  // Team Leader
  leader_id?: string;
  leader_name: string;
  leader_email: string;
  leader_phone: string;
  leader_college?: string;
  
  // Team Details
  team_size: number;
  team_description?: string;
  team_logo_url?: string;
  
  // Status
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  is_active: boolean;
  
  // Metadata
  created_at: string;
  updated_at: string;
  approved_at?: string;
  approved_by?: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id?: string;
  
  // Member Details
  name: string;
  email: string;
  phone: string;
  college?: string;
  department?: string;
  year_of_study?: number;
  student_id?: string;
  
  // Role
  is_leader: boolean;
  role?: string;
  
  // Status
  status: 'pending' | 'accepted' | 'rejected' | 'removed';
  joined_at: string;
  
  // Metadata
  created_at: string;
  updated_at: string;
}

export interface TeamInvitation {
  id: string;
  team_id: string;
  invited_by: string;
  invited_email: string;
  invitation_code: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  expires_at: string;
  accepted_at?: string;
  created_at: string;
}

// ============================================================================
// 4. REGISTRATION TYPES
// ============================================================================

export interface Registration {
  id: string;
  registration_number: string;
  
  // Event & Team
  event_id: string;
  event_slug: string;
  team_id?: string;
  user_id?: string;
  
  // Registration Type
  registration_type: 'individual' | 'team';
  
  // Team Info
  team_name?: string;
  team_size: number;
  
  // Contact Details
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  
  // Status & Verification
  status: 'pending' | 'confirmed' | 'waitlisted' | 'rejected' | 'cancelled' | 'attended';
  is_verified: boolean;
  verification_code?: string;
  verified_at?: string;
  
  // Payment Reference
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'waived';
  
  // Additional Info
  additional_info?: string;
  special_requirements?: string;
  dietary_restrictions?: string;
  emergency_contact?: EmergencyContact;
  
  // Check-in
  checked_in: boolean;
  checked_in_at?: string;
  checked_in_by?: string;
  
  // Metadata
  registered_at: string;
  created_at: string;
  updated_at: string;
  cancelled_at?: string;
  cancellation_reason?: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface RegistrationHistory {
  id: string;
  registration_id: string;
  changed_by?: string;
  change_type: string;
  old_value?: string;
  new_value?: string;
  notes?: string;
  created_at: string;
}

// ============================================================================
// 5. PAYMENT TYPES
// ============================================================================

export interface Payment {
  id: string;
  transaction_id: string;
  
  // References
  registration_id: string;
  user_id?: string;
  event_id?: string;
  
  // Payment Details
  amount: number;
  currency: string;
  payment_method: 'UPI' | 'Net Banking' | 'Card' | 'Wallet' | 'Cash' | 'Other';
  
  // Transaction Info
  gateway?: string;
  gateway_transaction_id?: string;
  gateway_order_id?: string;
  gateway_payment_id?: string;
  
  // UPI Details
  upi_id?: string;
  upi_transaction_ref?: string;
  
  // Card Details
  card_last4?: string;
  card_brand?: string;
  
  // Status
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  
  // Verification
  payment_proof_url?: string;
  verified_by?: string;
  verified_at?: string;
  verification_notes?: string;
  
  // Timestamps
  initiated_at: string;
  completed_at?: string;
  failed_at?: string;
  refunded_at?: string;
  
  // Error handling
  error_code?: string;
  error_message?: string;
  
  // Metadata
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PaymentRefund {
  id: string;
  payment_id: string;
  refund_amount: number;
  refund_reason: string;
  refund_type: 'full' | 'partial' | 'processing_fee';
  gateway_refund_id?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processed_by?: string;
  processed_at?: string;
  created_at: string;
}

// ============================================================================
// 6. DOCUMENT TYPES
// ============================================================================

export interface Document {
  id: string;
  
  // References
  uploaded_by?: string;
  team_id?: string;
  registration_id?: string;
  event_id?: string;
  
  // Document Details
  document_type: 'id_proof' | 'student_id' | 'college_id' | 'team_logo' | 
                  'payment_proof' | 'medical_certificate' | 'consent_form' |
                  'project_document' | 'presentation' | 'other';
  document_name: string;
  file_url: string;
  file_size?: number;
  file_type?: string;
  
  // Metadata
  description?: string;
  is_verified: boolean;
  verified_by?: string;
  verified_at?: string;
  
  // Access Control
  is_public: boolean;
  
  // Timestamps
  uploaded_at: string;
  created_at: string;
}

// ============================================================================
// 7. NOTIFICATION TYPES
// ============================================================================

export interface Notification {
  id: string;
  user_id: string;
  
  // Notification Details
  title: string;
  message: string;
  notification_type: 'registration_confirmation' | 'payment_success' | 'team_invitation' |
                     'status_update' | 'event_reminder' | 'announcement' | 'other';
  
  // Links
  action_url?: string;
  action_label?: string;
  
  // Related References
  event_id?: string;
  registration_id?: string;
  team_id?: string;
  
  // Status
  is_read: boolean;
  read_at?: string;
  
  // Priority
  priority: 'low' | 'normal' | 'high' | 'urgent';
  
  // Timestamps
  created_at: string;
  expires_at?: string;
}

export interface EmailLog {
  id: string;
  recipient_email: string;
  recipient_user_id?: string;
  subject: string;
  email_type: string;
  template_name?: string;
  status: 'pending' | 'sent' | 'failed' | 'bounced';
  sent_at?: string;
  error_message?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

// ============================================================================
// 8. ADMIN TYPES
// ============================================================================

export interface AdminLog {
  id: string;
  admin_id?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface EventAnalytics {
  id: string;
  event_id: string;
  metric_date: string;
  
  // Metrics
  page_views: number;
  unique_visitors: number;
  registrations_count: number;
  revenue: number;
  
  // Sources
  traffic_sources?: Record<string, number>;
  
  created_at: string;
}

// ============================================================================
// 9. VIEW TYPES (Read-Only)
// ============================================================================

export interface RegistrationDetail {
  id: string;
  registration_number: string;
  event_slug: string;
  event_title: string;
  team_name?: string;
  team_size: number;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  registration_status: string;
  payment_status: string;
  checked_in: boolean;
  registered_at: string;
  team_members: TeamMemberDetail[];
  payment_amount?: number;
  payment_method?: string;
  payment_transaction_status?: string;
  payment_completed_at?: string;
}

export interface TeamMemberDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  college?: string;
  is_leader: boolean;
}

export interface EventStats {
  id: string;
  slug: string;
  title: string;
  status: string;
  date_from?: string;
  date_to?: string;
  total_registrations: number;
  confirmed_registrations: number;
  paid_registrations: number;
  checked_in_count: number;
  total_participants: number;
  total_revenue: number;
  max_teams?: number;
  max_participants?: number;
  registration_percentage: number;
}

export interface TeamDetail {
  id: string;
  team_name: string;
  team_code: string;
  event_slug: string;
  event_title: string;
  leader_name: string;
  leader_email: string;
  team_status: string;
  team_size: number;
  current_member_count: number;
  members: TeamMemberDetail[];
}

export interface UserDashboard {
  id: string;
  full_name: string;
  email: string;
  college?: string;
  total_registrations: number;
  confirmed_registrations: number;
  teams_leading: number;
  teams_member_of: number;
  total_paid: number;
}

// ============================================================================
// 10. FORM DATA TYPES (For Frontend Forms)
// ============================================================================

export interface RegistrationFormData {
  teamName: string;
  teamLeader: {
    name: string;
    email: string;
    phone: string;
    college: string;
  };
  teamMembers: Array<{
    name: string;
    email: string;
    phone: string;
    college: string;
  }>;
  paymentMethod?: 'UPI' | 'Net Banking' | 'Card';
  transactionId?: string;
  additionalInfo?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  college?: string;
  acceptTerms: boolean;
}

export interface ProfileUpdateFormData {
  full_name: string;
  phone?: string;
  college?: string;
  graduation_year?: number;
  department?: string;
  bio?: string;
}

// ============================================================================
// 11. API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RegistrationResponse {
  success: boolean;
  registrationId?: string;
  registrationNumber?: string;
  message: string;
  error?: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  transactionId?: string;
  status?: string;
  message: string;
  error?: string;
}

// ============================================================================
// 12. UTILITY TYPES
// ============================================================================

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      user_profiles: { Row: UserProfile };
      events: { Row: Event };
      teams: { Row: Team };
      team_members: { Row: TeamMember };
      registrations: { Row: Registration };
      payments: { Row: Payment };
      documents: { Row: Document };
      notifications: { Row: Notification };
      // ... add other tables as needed
    };
    Views: {
      registration_details: { Row: RegistrationDetail };
      event_stats: { Row: EventStats };
      team_details: { Row: TeamDetail };
      user_dashboard: { Row: UserDashboard };
    };
  };
};

// ============================================================================
// 13. FILTER & SORT TYPES
// ============================================================================

export interface EventFilters {
  category?: string;
  event_type?: string;
  status?: string;
  is_featured?: boolean;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface RegistrationFilters {
  event_slug?: string;
  status?: string;
  payment_status?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export type SortOrder = 'asc' | 'desc';

export interface SortOptions {
  field: string;
  order: SortOrder;
}
