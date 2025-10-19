import { NextResponse } from 'next/server';
import { uploadFileToStorage } from '@/lib/supabaseService';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const bucket = (formData.get('bucket') as string) || 'registrations'; // Use default bucket
    const path = (formData.get('path') as string) || `uploads/${Date.now()}`;

    if (!file) return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });

    console.log(`Attempting to upload to bucket: ${bucket}, path: ${path}`);

    // Convert web File to Node File if necessary - uploadFileToStorage expects a browser File which supabase client supports in edge
    const result = await uploadFileToStorage(bucket, path, file);
    
    if (!result.success) {
      console.error('Upload failed:', result.error);
      
      // Provide helpful error message if bucket doesn't exist
      if (result.error?.includes('Bucket not found') || result.error?.includes('404')) {
        return NextResponse.json({ 
          success: false, 
          error: `Storage bucket "${bucket}" not found. Please create it in Supabase Dashboard: Storage > New Bucket > Name: "${bucket}" > Public: Yes`
        }, { status: 404 });
      }
      
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, publicURL: result.publicURL });
  } catch (err) {
    console.error('Upload route error:', err);
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}
