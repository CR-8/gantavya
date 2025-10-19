import { supabase } from './supabase';

// Types matching the current simple schema
export interface TeamMember {
  name: string;
  email: string;
  phone: string;
  college: string;
  is_leader: boolean;
}

export interface RegistrationData {
  eventSlug: string;
  teamName: string;
  teamLeader: {
    name: string;
    email: string;
    phone: string;
    college: string;
  };
  teamMembers?: Array<{
    name: string;
    email: string;
    phone: string;
    college: string;
  }>;
  paymentMethod?: string;
  transactionId?: string;
  additionalInfo?: string;
}

export interface RegistrationResponse {
  success: boolean;
  message: string;
  registrationId?: string;
  error?: string;
}

/**
 * Submit a new event registration to Supabase
 */
export async function submitRegistration(
  data: RegistrationData & { leaderIdProofUrl?: string }
): Promise<RegistrationResponse> {
  try {
    const teamSize = 1 + (data.teamMembers?.length || 0);

    // Step 1: Insert the main registration record
    const { data: registration, error: registrationError } = await supabase
      .from('registrations')
      .insert({
        event_slug: data.eventSlug,
        team_name: data.teamName,
        team_size: teamSize,
        payment_method: data.paymentMethod || null,
        transaction_id: data.transactionId || null,
        additional_info: data.additionalInfo || null,
        leader_id_proof_url: data.leaderIdProofUrl || null,
        status: 'pending',
      })
      .select()
      .single();

    if (registrationError) {
      console.error('Registration error:', registrationError);
      return {
        success: false,
        message: 'Failed to create registration',
        error: registrationError.message,
      };
    }

    // Step 2: Insert team leader
    const { error: leaderError } = await supabase.from('team_members').insert({
      registration_id: registration.id,
      name: data.teamLeader.name,
      email: data.teamLeader.email,
      phone: data.teamLeader.phone,
      college: data.teamLeader.college,
      is_leader: true,
    });

    if (leaderError) {
      console.error('Leader insertion error:', leaderError);
      // Rollback: Delete the registration if leader insertion fails
      await supabase.from('registrations').delete().eq('id', registration.id);
      return {
        success: false,
        message: 'Failed to add team leader',
        error: leaderError.message,
      };
    }

    // Step 3: Insert team members (if any)
    if (data.teamMembers && data.teamMembers.length > 0) {
      const teamMembersData = data.teamMembers.map((member) => ({
        registration_id: registration.id,
        name: member.name,
        email: member.email,
        phone: member.phone,
        college: member.college,
        is_leader: false,
      }));

      const { error: membersError } = await supabase
        .from('team_members')
        .insert(teamMembersData);

      if (membersError) {
        console.error('Team members insertion error:', membersError);
        // Note: We don't rollback here as the leader is already added
        // The admin can manually add members later
      }
    }

    return {
      success: true,
      message: 'Registration submitted successfully! You will receive a confirmation email shortly.',
      registrationId: registration.id,
    };
  } catch (error) {
    console.error('Unexpected error during registration:', error);
    return {
      success: false,
      message: 'An unexpected error occurred',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get all registrations for a specific event
 */
export async function getEventRegistrations(eventSlug: string) {
  try {
    const { data, error } = await supabase
      .from('registration_details')
      .select('*')
      .eq('event_slug', eventSlug)
      .order('registration_date', { ascending: false });

    if (error) {
      console.error('Error fetching registrations:', error);
      return { success: false, data: null, error: error.message };
    }

    return { success: true, data, error: null };
  } catch (error) {
    console.error('Unexpected error:', error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get registration statistics for all events
 */
export async function getRegistrationStats() {
  try {
    const { data, error } = await supabase.rpc('get_registration_stats');

    if (error) {
      // Fallback to basic query if RPC doesn't exist
      const { data: registrations, error: regError } = await supabase
        .from('registrations')
        .select('event_slug, status');

      if (regError) {
        return { success: false, data: null, error: regError.message };
      }

      // Calculate stats manually
      const stats = registrations?.reduce((acc: Record<string, Record<string, number>>, reg: { event_slug: string; status: string }) => {
        if (!acc[reg.event_slug]) {
          acc[reg.event_slug] = {
            total: 0,
            confirmed: 0,
            pending: 0,
            cancelled: 0,
          };
        }
        acc[reg.event_slug].total++;
        acc[reg.event_slug][reg.status]++;
        return acc;
      }, {});

      return { success: true, data: stats, error: null };
    }

    return { success: true, data, error: null };
  } catch (error) {
    console.error('Unexpected error:', error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update registration status
 */
export async function updateRegistrationStatus(
  registrationId: string,
  status: 'pending' | 'confirmed' | 'cancelled' | 'waitlist'
) {
  try {
    const { error } = await supabase
      .from('registrations')
      .update({ status })
      .eq('id', registrationId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check if an email is already registered for an event
 */
export async function checkEmailRegistration(
  eventSlug: string,
  email: string
) {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select('id, registration_id, registrations!inner(event_slug)')
      .eq('email', email)
      .eq('registrations.event_slug', eventSlug)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = not found, which is expected if not registered
      console.error('Error checking email:', error);
      return { exists: false, error: error.message };
    }

    return { exists: !!data, error: null };
  } catch (error) {
    return {
      exists: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get total registered participants count for an event
 */
export async function getEventParticipantCount(eventSlug: string) {
  try {
    const { count, error } = await supabase
      .from('team_members')
      .select('*, registrations!inner(event_slug)', { count: 'exact', head: true })
      .eq('registrations.event_slug', eventSlug);

    if (error) {
      console.error('Error counting participants:', error);
      return { count: 0, error: error.message };
    }

    return { count: count || 0, error: null };
  } catch (error) {
    return {
      count: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Upload a file to Supabase Storage under a given bucket and path
 */
export async function uploadFileToStorage(bucket: string, path: string, file: File) {
  try {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

    if (error) {
      console.error('Upload error:', error);
      return { success: false, error: error.message };
    }

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
  // urlData has shape { publicUrl: string }
  return { success: true, publicURL: urlData.publicUrl };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Simple fetch for published events
 */
export async function fetchPublishedEvents() {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('slug,title,registration_fee,team_size_min,team_size_max,description,category')
      .eq('status', 'published')
      .order('date_from', { ascending: true });

    if (error) return { success: false, data: null, error: error.message };
    return { success: true, data, error: null };
  } catch (err) {
    return { success: false, data: null, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
