# Registration Form - 3-Part Modular Flow Implementation

## ✅ What's Been Implemented

### 1. Multi-Step Form Flow

The registration form now has 3 distinct steps:

#### **Step 1: Basic Details & Team Setup**
- Team name input with validation
- Team leader details (name, email, phone, college)
- Dynamic team member fields (add/remove)
- File upload for leader ID proof (PDF only, ≤2MB)
- Validations:
  - Unique email enforcement
  - Single team leader restriction
  - Minimum 1 participant (leader)
  - Required ID proof upload

#### **Step 2: Event Selection**
- Fetches available events from Supabase
- Multi-select with checkboxes
- Displays event details (fee, team size, category)
- Auto-calculates total cost based on selections
- Validates at least one event selected

#### **Step 3: Payment & Confirmation**
- Summary preview showing:
  - Team information
  - Selected events
  - Cost breakdown (base + platform fee + GST)
- Total payable amount calculation:
  - Base: Sum of event fees
  - Platform Fee: 2% of base
  - GST: 18% of (base + platform fee)
- Razorpay integration placeholder (ready for implementation)

### 2. Features Implemented

✅ **Auto-save Draft**
- Saves form progress to localStorage every 500ms
- Restores draft on page reload
- Draft key format: `registration_draft_${eventSlug}`

✅ **File Upload**
- PDF validation (type and size ≤2MB)
- Uploads to Supabase Storage via `/api/upload`
- Stores public URL in registration record
- Error handling with user-friendly messages

✅ **Event Fetching**
- API route `/api/events` fetches published events
- Cached in component state
- Used for selection and cost calculation

✅ **Server-side Validation**
- Email duplicate checking before proceeding
- Event capacity validation (placeholder)
- Form validation on each step

✅ **Progress Indicator**
- Visual step indicator at top
- Shows current step with blue highlight

✅ **Navigation**
- Back/Continue buttons for step navigation
- Cancel button to close modal
- Validation guards prevent moving forward with invalid data

## 📁 Files Modified/Created

### Modified Files:
1. **`src/components/register/form.tsx`**
   - Added multi-step state management
   - Implemented 3-part UI flow
   - Added file upload handling
   - Added event selection logic
   - Added cost calculation
   - Added auto-save functionality

2. **`src/lib/supabaseService.ts`**
   - Added `uploadFileToStorage()` helper
   - Added `fetchPublishedEvents()` helper
   - Updated `submitRegistration()` to accept `leaderIdProofUrl`

### Created Files:
1. **`src/app/api/upload/route.ts`**
   - Handles file uploads to Supabase Storage
   - Returns public URL on success

2. **`src/app/api/events/route.ts`**
   - Fetches published events from database
   - Returns event list as JSON

3. **`STORAGE_SETUP.md`**
   - Instructions for creating Supabase Storage bucket
   - Troubleshooting guide
   - Security policy examples

## 🚀 How It Works

### Registration Flow:

```
User opens form
    ↓
Step 1: Enter team details + upload ID
    ↓ (validates emails, requires ID)
Step 2: Select events
    ↓ (validates at least 1 event selected)
Step 3: Review & Pay
    ↓
Upload ID proof to Storage → Get URL
    ↓
Create registration in database (with ID proof URL)
    ↓
[TODO] Create Razorpay order
    ↓
[TODO] Open Razorpay checkout
    ↓
[TODO] Verify payment signature
    ↓
Update registration status to "confirmed"
    ↓
Send confirmation email
    ↓
Show success message & close modal
```

### Data Flow:

```
Form State (React Hook Form)
    ↓
localStorage (auto-save draft)
    ↓
Step validation guards
    ↓
File upload (/api/upload) → Supabase Storage
    ↓
Registration creation (/lib/supabaseService)
    ↓
Supabase Database (registrations + team_members tables)
```

## 🔧 Configuration

### Environment Variables Required:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Supabase Storage Setup:

1. Create `registrations` bucket (Public)
2. Configure file size limit (2MB recommended)
3. Set allowed MIME types: `application/pdf`

**See `STORAGE_SETUP.md` for detailed instructions.**

## 📊 Cost Calculation Logic

```typescript
Base Total = Σ(selected event fees)
Platform Fee = Base Total × 0.02 (2%)
Tax = (Base Total + Platform Fee) × 0.18 (18% GST)
Final Amount = Base Total + Platform Fee + Tax
```

**Example:**
- Event A: ₹500
- Event B: ₹300
- Base: ₹800
- Platform Fee: ₹16 (2%)
- Tax: ₹146.88 (18%)
- **Final: ₹962.88**

## 🎯 Validation Rules

### Step 1 Validations:
- Team name: 3-50 characters
- Leader name: 2-100 characters
- Email: Valid format + unique check
- Phone: 10 digits (Indian format)
- College: 2-100 characters
- ID proof: PDF file, ≤2MB, required
- Team members: Unique emails across all participants

### Step 2 Validations:
- At least 1 event must be selected
- No duplicate event selection

### Step 3 Validations:
- All previous steps must be valid
- File upload must succeed before registration creation

## 🔐 Security Features

### Client-side:
- File type validation (PDF only)
- File size validation (≤2MB)
- Email format validation
- Unique email enforcement

### Server-side:
- Duplicate email checking against database
- Supabase RLS policies on registrations table
- Storage bucket access control

## 📝 TODO: Razorpay Integration

The form is ready for Razorpay integration. Here's what's needed:

### 1. Create Backend Order Route:

```typescript
// src/app/api/razorpay/create-order/route.ts
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
  const { amount, currency, registrationId } = await request.json();
  
  const order = await razorpay.orders.create({
    amount: amount * 100, // Convert to paise
    currency: currency || 'INR',
    receipt: registrationId,
  });
  
  return NextResponse.json({ orderId: order.id, amount: order.amount });
}
```

### 2. Update Pay & Confirm Button:

Replace the TODO comment with:

```typescript
// Create Razorpay order
const orderRes = await fetch('/api/razorpay/create-order', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: calculateTotals().final,
    currency: 'INR',
    registrationId: resp.registrationId,
  }),
});

const { orderId, amount } = await orderRes.json();

// Open Razorpay checkout
const options = {
  key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  amount: amount,
  currency: 'INR',
  name: 'Gantavya',
  description: 'Event Registration',
  order_id: orderId,
  handler: async function (response) {
    // Verify payment signature on backend
    await fetch('/api/razorpay/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: response.razorpay_order_id,
        paymentId: response.razorpay_payment_id,
        signature: response.razorpay_signature,
        registrationId: resp.registrationId,
      }),
    });
    
    setSubmitStatus('success');
    setSubmitMessage('Payment successful! Registration confirmed.');
  },
};

const rzp = new (window as any).Razorpay(options);
rzp.open();
```

### 3. Add Razorpay Script:

```tsx
// In layout.tsx or page.tsx
<Script src="https://checkout.razorpay.com/v1/checkout.js" />
```

### 4. Environment Variables:

```env
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
```

## 🐛 Known Issues

1. **Storage bucket must be created manually** - See `STORAGE_SETUP.md`
2. **Razorpay integration pending** - Placeholder in place
3. **Email notifications not implemented** - Needs email service integration

## 📚 Documentation

- **Storage Setup**: `STORAGE_SETUP.md`
- **Database Schema**: `supabase-schema.sql` or `supabase-schema-complete.sql`
- **Registration Form**: `REGISTRATION_FORM.md`
- **Supabase Setup**: Check existing Supabase docs

## 🎨 UI/UX Features

- Dark theme matching site design
- Responsive grid layouts (mobile-friendly)
- Loading states during submission
- Success/Error messages with icons
- Progress indicator
- Smooth step transitions
- Accessible form labels
- Validation error messages inline

## 🧪 Testing Checklist

- [ ] Create Supabase Storage bucket "registrations"
- [ ] Upload test PDF file
- [ ] Fill Step 1 with valid data
- [ ] Add team members
- [ ] Upload ID proof
- [ ] Proceed to Step 2
- [ ] Select events
- [ ] Check cost calculation accuracy
- [ ] Proceed to Step 3
- [ ] Verify summary preview
- [ ] Test "Pay & Confirm" (creates registration)
- [ ] Check Supabase for registration record
- [ ] Check Storage for uploaded file
- [ ] Verify public URL works

---

**Implementation Status**: ✅ Core functionality complete, Razorpay integration pending
**Date**: October 19, 2025
