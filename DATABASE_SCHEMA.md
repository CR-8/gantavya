# Complete Database Schema Documentation

## Overview

This document describes the complete database schema for the Gantavya Event Management System. The schema is designed to handle:

- User authentication and profiles
- Event management with detailed configurations
- Team formation and management
- Event registrations
- Payment processing and tracking
- Document management
- Notifications and communications
- Admin controls and analytics

## Table of Contents

1. [User Management](#1-user-management)
2. [Event Management](#2-event-management)
3. [Team Management](#3-team-management)
4. [Registration System](#4-registration-system)
5. [Payment Processing](#5-payment-processing)
6. [Document Management](#6-document-management)
7. [Notifications](#7-notifications)
8. [Admin & Analytics](#8-admin--analytics)
9. [Views](#9-views)
10. [Security](#10-security)

---

## 1. User Management

### `user_profiles`
Extends Supabase's built-in authentication with additional user information.

**Key Fields:**
- `id` (UUID): References `auth.users(id)`
- `email`: Unique email address
- `full_name`: User's full name
- `college`: College/University name
- `role`: User role (`user`, `team_leader`, `admin`, `super_admin`)
- `is_verified`: Email verification status

**Use Cases:**
- Store extended user profile information
- Manage user roles and permissions
- Track user verification status

### `user_addresses`
Stores multiple addresses for users (home, college, etc.).

**Key Fields:**
- `user_id`: Foreign key to `user_profiles`
- `address_type`: Type of address
- `is_default`: Default address flag

### `user_social_links`
Social media and portfolio links for users.

**Supported Platforms:**
- LinkedIn, GitHub, Twitter, Instagram, Portfolio, Other

---

## 2. Event Management

### `event_categories`
Categorizes events (Technical, Cultural, Sports, Workshop).

**Key Fields:**
- `slug`: URL-friendly identifier
- `color`: Brand color for UI
- `display_order`: Sorting order

### `events`
Main table for all event information.

**Key Sections:**

#### Basic Information
- `slug`: Unique URL identifier
- `title`, `subtitle`, `description`
- `content`: Full markdown content

#### Dates & Timing
- `date_from`, `date_to`: Event dates
- `registration_start_date`, `registration_end_date`
- `event_start_time`, `event_end_time`

#### Location
- `venue`: Physical location
- `location_type`: `offline`, `online`, or `hybrid`
- `venue_details` (JSONB): Detailed venue information
- `online_meeting_link`: For online events

#### Team Configuration
- `team_size_min`, `team_size_max`: Team size limits
- `allow_individual`: Individual participation allowed

#### Pricing & Prizes
- `registration_fee`: Entry fee
- `prize_pool`: Total prize money
- `prize_distribution` (JSONB): Prize breakdown

#### Capacity Management
- `max_teams`: Maximum number of teams
- `max_participants`: Maximum participants
- `current_registrations`: Auto-updated count
- `waitlist_enabled`: Waitlist feature

#### Status
- `status`: `draft`, `published`, `ongoing`, `completed`, `cancelled`
- `is_featured`: Featured on homepage
- `is_visible`: Public visibility

### `event_faqs`
Frequently asked questions for each event.

### `event_schedules`
Day-by-day schedule with timing and activities.

### `event_sponsors`
Sponsor information with tier levels.

---

## 3. Team Management

### `teams`
Central table for all team information.

**Key Features:**
- `team_code`: Auto-generated unique 8-character code
- `leader_id`: Reference to user who created the team
- `status`: `pending`, `approved`, `rejected`, `withdrawn`

**Workflow:**
1. Team leader creates team
2. System generates unique `team_code`
3. Leader can invite members
4. Admin can approve/reject team

### `team_members`
Individual members of each team.

**Key Fields:**
- `team_id`: Foreign key to `teams`
- `user_id`: Optional link to registered user
- `is_leader`: Leader flag
- `status`: `pending`, `accepted`, `rejected`, `removed`

**Features:**
- Supports both registered and non-registered users
- Each member's college and year information
- Unique constraint on `(team_id, email)`

### `team_invitations`
Team invitation system with expiry.

**Workflow:**
1. Team leader sends invitation via email
2. System generates unique `invitation_code`
3. Invitee receives email with code
4. Invitation expires after set time
5. Invitee accepts/rejects invitation

---

## 4. Registration System

### `registrations`
Main registration records.

**Key Features:**

#### Auto-Generated Fields
- `registration_number`: Format `REG-EVT-001` (auto-generated)

#### Registration Types
- `individual`: Single person registration
- `team`: Team-based registration

#### Status Management
- `pending`: Initial state
- `confirmed`: Registration confirmed
- `waitlisted`: On waitlist
- `rejected`: Registration rejected
- `cancelled`: User cancelled
- `attended`: Checked in at event

#### Payment Integration
- `payment_status`: Linked to payment records
- Supports: `pending`, `paid`, `failed`, `refunded`, `waived`

#### Check-in System
- `checked_in`: Boolean flag
- `checked_in_at`: Timestamp
- `checked_in_by`: Admin who checked in

#### Additional Information
- `special_requirements`: Accessibility needs
- `dietary_restrictions`: Food preferences
- `emergency_contact` (JSONB): Emergency contact info

### `registration_history`
Audit log for all registration changes.

**Tracks:**
- Status changes
- Payment updates
- User modifications
- Admin actions

---

## 5. Payment Processing

### `payments`
Complete payment transaction records.

**Payment Methods:**
- UPI (with UPI ID tracking)
- Net Banking
- Credit/Debit Card
- Wallet
- Cash
- Other

**Gateway Integration:**
- Supports multiple gateways (Razorpay, Stripe, PayTM)
- Stores gateway-specific transaction IDs
- `metadata` (JSONB) for gateway-specific data

**Security:**
- Never stores full card numbers
- Only stores last 4 digits
- Card brand for reference

**Status Flow:**
```
pending → processing → completed
                    ↓
                  failed
                    ↓
                 refunded
```

**Verification:**
- `payment_proof_url`: Upload receipt/screenshot
- `verified_by`: Admin verification
- `verification_notes`: Admin notes

### `payment_refunds`
Refund tracking and management.

**Refund Types:**
- `full`: Complete refund
- `partial`: Partial amount
- `processing_fee`: Only processing fee

---

## 6. Document Management

### `documents`
File upload and document storage.

**Document Types:**
- `id_proof`: Government ID
- `student_id`: Student ID card
- `college_id`: College ID
- `team_logo`: Team logo image
- `payment_proof`: Payment receipt
- `medical_certificate`: Medical documents
- `consent_form`: Consent forms
- `project_document`: Project files
- `presentation`: Presentation files
- `other`: Other documents

**Features:**
- Multiple uploads per registration/team
- File size and type tracking
- Verification system
- Public/private access control

**Access Control:**
- `is_public`: Public accessibility
- RLS policies ensure users can only access their own documents

---

## 7. Notifications

### `notifications`
In-app notification system.

**Notification Types:**
- `registration_confirmation`: Registration success
- `payment_success`: Payment confirmed
- `team_invitation`: Team invite received
- `status_update`: Registration status changed
- `event_reminder`: Event reminders
- `announcement`: General announcements
- `other`: Other notifications

**Priority Levels:**
- `low`: Non-urgent
- `normal`: Standard priority
- `high`: Important
- `urgent`: Immediate attention required

**Features:**
- Read/unread tracking
- Action links (e.g., "View Registration")
- Expiry dates for time-sensitive notifications

### `email_logs`
Email delivery tracking.

**Tracks:**
- Email sending status
- Bounce tracking
- Template usage
- Delivery timestamps

---

## 8. Admin & Analytics

### `admin_logs`
Complete audit trail of admin actions.

**Logged Information:**
- Action type
- Entity modified
- Old and new values (JSONB)
- IP address
- User agent
- Timestamp

**Use Cases:**
- Security auditing
- Compliance tracking
- Debugging issues
- User activity monitoring

### `event_analytics`
Daily event analytics and metrics.

**Metrics Tracked:**
- Page views
- Unique visitors
- Registration count
- Revenue
- Traffic sources (JSONB)

**Use Cases:**
- Event performance tracking
- Marketing effectiveness
- Revenue forecasting
- Trend analysis

---

## 9. Views

### `registration_details`
Complete registration information with team members.

**Joins:**
- registrations
- events
- teams
- team_members
- payments

**Output:**
- All registration fields
- Team members as JSON array
- Payment information
- Event details

**Usage:**
```sql
SELECT * FROM registration_details WHERE event_slug = 'tech-hackathon-2024';
```

### `event_stats`
Event-level statistics and metrics.

**Calculated Fields:**
- Total registrations
- Confirmed registrations
- Paid registrations
- Check-in count
- Total participants
- Total revenue
- Registration percentage

**Usage:**
```sql
SELECT * FROM event_stats WHERE slug = 'tech-hackathon-2024';
```

### `team_details`
Complete team information with all members.

**Features:**
- Team information
- All members as JSON array
- Current member count
- Team status

### `user_dashboard`
User-specific dashboard data.

**Shows:**
- Total registrations
- Confirmed registrations
- Teams leading
- Teams member of
- Total amount paid

---

## 10. Security

### Row Level Security (RLS)

All tables have RLS enabled with carefully designed policies:

#### User Data
- ✅ Users can view all profiles
- ✅ Users can only update their own profile
- ❌ Users cannot delete profiles

#### Events
- ✅ Anyone can view published events
- ✅ Admins can manage all events
- ❌ Regular users cannot modify events

#### Registrations
- ✅ Users can view their own registrations
- ✅ Anyone can create registrations
- ✅ Users can update their own registrations
- ✅ Admins can view all registrations

#### Teams
- ✅ Users can view teams they're part of
- ✅ Anyone can create teams
- ✅ Team leaders can update their teams
- ❌ Non-members cannot view team details

#### Payments
- ✅ Users can view their own payments
- ✅ Admins can view all payments
- ❌ Users cannot view others' payments

#### Documents
- ✅ Users can view their own documents
- ✅ Public documents visible to all
- ✅ Users can upload documents
- ❌ Cannot access others' private documents

#### Notifications
- ✅ Users can view their own notifications
- ✅ Users can mark notifications as read
- ❌ Cannot view others' notifications

---

## Database Functions

### Auto-Generated Values

#### `generate_registration_number()`
Automatically generates unique registration numbers.

**Format:** `REG-EVT-001`
- `REG`: Fixed prefix
- `EVT`: First 3 letters of event slug (uppercase)
- `001`: Sequential counter per event

#### `generate_team_code()`
Generates unique 8-character alphanumeric team codes.

**Example:** `A7F3K9M2`

### Triggers

#### `update_updated_at_column()`
Auto-updates `updated_at` timestamp on record modification.

**Applied to:**
- user_profiles
- events
- teams
- team_members
- registrations
- payments

#### `update_event_registration_count()`
Auto-updates `current_registrations` in events table.

**Triggers on:**
- Registration INSERT: Increment count
- Registration DELETE: Decrement count

---

## Indexes

Performance-optimized indexes on frequently queried columns:

### Events
- `slug` (unique searches)
- `category_id` (filtering)
- `status` (filtering)
- `date_from` (date range queries)
- `is_featured` (homepage queries)
- `created_at DESC` (recent events)

### Registrations
- `event_id` (event-specific queries)
- `user_id` (user registrations)
- `status` (status filtering)
- `payment_status` (payment filtering)
- `contact_email` (email searches)
- `created_at DESC` (recent registrations)

### Teams
- `event_id` (event teams)
- `leader_id` (leader's teams)
- `team_code` (code lookups)
- `status` (status filtering)

### Payments
- `registration_id` (registration payments)
- `user_id` (user payments)
- `status` (status filtering)
- `transaction_id` (transaction lookups)
- `created_at DESC` (recent payments)

---

## Data Flow Examples

### Registration Flow

```mermaid
User → Create Team → Invite Members → Register for Event → Make Payment → Verified → Confirmed
```

1. User creates account (`user_profiles`)
2. Creates team (`teams`, auto-generates `team_code`)
3. Invites members (`team_invitations`)
4. Members accept (`team_members`)
5. Team leader registers (`registrations`, auto-generates `registration_number`)
6. Makes payment (`payments`)
7. Admin verifies payment
8. Registration status → `confirmed`
9. User receives notification (`notifications`)

### Event Creation Flow

```mermaid
Admin → Create Event → Add Details → Add Schedule → Add FAQs → Publish
```

1. Admin creates event (`events`)
2. Adds schedules (`event_schedules`)
3. Adds FAQs (`event_faqs`)
4. Adds sponsors (`event_sponsors`)
5. Sets status → `published`
6. Event appears on frontend

---

## Migration Guide

### From Simple Schema to Complete Schema

If you're upgrading from the basic schema (`supabase-schema.sql`):

1. **Backup existing data**
   ```sql
   -- Export current data
   COPY registrations TO '/tmp/registrations_backup.csv' CSV HEADER;
   ```

2. **Run new schema**
   ```sql
   -- Run complete schema
   \i supabase-schema-complete.sql
   ```

3. **Migrate data**
   ```sql
   -- Example: Migrate old registrations to new format
   INSERT INTO user_profiles (id, email, full_name)
   SELECT DISTINCT 
     gen_random_uuid(),
     contact_email,
     contact_name
   FROM old_registrations;
   ```

4. **Test thoroughly**
   - Verify all data migrated
   - Test RLS policies
   - Check foreign key constraints

---

## Best Practices

### Performance
- Use indexes for frequently queried columns
- Use views for complex joins
- Paginate large result sets
- Use `LIMIT` and `OFFSET` for pagination

### Security
- Always use RLS policies
- Never expose sensitive data in public APIs
- Validate all user inputs
- Use prepared statements to prevent SQL injection

### Data Integrity
- Use foreign keys to maintain referential integrity
- Use CHECK constraints for data validation
- Use triggers for automatic updates
- Use transactions for multi-step operations

### Monitoring
- Log all admin actions (`admin_logs`)
- Track email delivery (`email_logs`)
- Monitor event analytics (`event_analytics`)
- Review registration history (`registration_history`)

---

## Common Queries

### Get all registrations for an event
```sql
SELECT * FROM registration_details 
WHERE event_slug = 'tech-hackathon-2024'
ORDER BY registered_at DESC;
```

### Get event statistics
```sql
SELECT * FROM event_stats 
WHERE slug = 'tech-hackathon-2024';
```

### Get user's teams
```sql
SELECT * FROM team_details 
WHERE leader_email = 'user@example.com' 
   OR members::text LIKE '%user@example.com%';
```

### Get pending payments
```sql
SELECT r.registration_number, p.*
FROM payments p
JOIN registrations r ON p.registration_id = r.id
WHERE p.status = 'pending'
ORDER BY p.initiated_at DESC;
```

### Get unread notifications
```sql
SELECT * FROM notifications
WHERE user_id = 'user-uuid'
  AND is_read = false
ORDER BY created_at DESC;
```

---

## Troubleshooting

### Issue: Registration number not generating
**Solution:** Ensure trigger is created:
```sql
CREATE TRIGGER set_registration_number BEFORE INSERT ON registrations
FOR EACH ROW EXECUTE FUNCTION generate_registration_number();
```

### Issue: RLS blocking queries
**Solution:** Check user role and policies:
```sql
-- Check current user
SELECT current_user, current_setting('request.jwt.claims', true)::json->>'role';

-- Disable RLS temporarily for testing (NOT in production!)
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
```

### Issue: Slow queries
**Solution:** Add missing indexes:
```sql
-- Check query performance
EXPLAIN ANALYZE SELECT * FROM registrations WHERE event_slug = 'event-slug';

-- Add index if needed
CREATE INDEX idx_custom ON table_name(column_name);
```

---

## Future Enhancements

1. **Waiting List System**
   - Auto-promote from waitlist when slots available
   - Notification system for waitlist movement

2. **Certificate Generation**
   - Auto-generate participation certificates
   - Store in `documents` table

3. **Real-time Updates**
   - Supabase Realtime for live registration counts
   - Live event updates

4. **Advanced Analytics**
   - Registration funnel analysis
   - Payment conversion rates
   - User behavior tracking

5. **Integration APIs**
   - Email service integration (SendGrid, AWS SES)
   - SMS notifications (Twilio)
   - Payment gateway webhooks

---

## Support

For issues or questions:
1. Check this documentation
2. Review `SUPABASE_SETUP.md` for setup instructions
3. Check `REGISTRATION_FORM.md` for form implementation
4. Review SQL schema comments in `supabase-schema-complete.sql`

---

**Last Updated:** October 19, 2025
**Schema Version:** 2.0.0
**Database:** PostgreSQL 15+ (Supabase)
