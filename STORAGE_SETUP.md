# Supabase Storage Setup

## Required Storage Buckets

### 1. Create "registrations" Bucket

This bucket stores uploaded files like ID proofs and documents.

**Steps:**

1. Go to your Supabase Dashboard
2. Navigate to **Storage** (left sidebar)
3. Click **New Bucket**
4. Fill in details:
   - **Name**: `registrations`
   - **Public**: ✅ Yes (check this box)
   - **File size limit**: 2MB (or as needed)
   - **Allowed MIME types**: `application/pdf` (for ID proofs)
5. Click **Create Bucket**

### 2. Configure Bucket Policies (Optional)

For better security, you can set up RLS policies:

```sql
-- Allow public read access
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'registrations');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'registrations' AND
  auth.role() = 'authenticated'
);
```

### 3. Test Upload

After creating the bucket:
1. Try uploading a test file through the registration form
2. Check that the file appears in Storage > registrations bucket
3. Verify the public URL works

## Folder Structure

The app organizes files in this structure:

```
registrations/
  ├── id-proofs/
  │   └── leaders/
  │       └── [timestamp]_[filename].pdf
  ├── documents/
  └── receipts/
```

## Troubleshooting

### "Bucket not found" Error

**Solution**: Create the `registrations` bucket as described above.

### "Upload failed" Error

**Possible causes**:
1. File size exceeds limit (default 2MB)
2. Invalid file type (only PDF allowed for ID proofs)
3. Network issues
4. Supabase credentials not configured in `.env.local`

**Check**:
- Verify `.env.local` has correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Ensure bucket is set to **Public**
- Check browser console for detailed error messages

### Files Not Accessible

**Solution**: Make sure bucket is set to **Public** in Supabase Dashboard.

---

## Environment Variables Required

Make sure your `.env.local` has:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

---

**Quick Command to Test:**

Open browser console and run:
```javascript
fetch('/api/upload', {
  method: 'POST',
  body: (() => {
    const fd = new FormData();
    fd.append('file', new File(['test'], 'test.pdf', { type: 'application/pdf' }));
    fd.append('bucket', 'registrations');
    fd.append('path', 'test/test.pdf');
    return fd;
  })()
}).then(r => r.json()).then(console.log);
```

This should return `{ success: true, publicURL: "..." }` if everything is configured correctly.
