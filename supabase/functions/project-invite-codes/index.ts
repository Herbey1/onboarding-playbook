import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateCodeRequest {
  project_id: string;
  role?: 'admin' | 'member' | 'viewer';
  expires_in_days?: number;
  uses_left?: number | null;
}

interface JoinByCodeRequest {
  code: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    if (req.method === 'POST' && action === 'generate') {
      return await generateInviteCode(supabaseClient, req, user.id);
    } else if (req.method === 'POST' && action === 'join') {
      return await joinByCode(supabaseClient, req, user.id);
    } else if (req.method === 'GET') {
      return await getInviteCodes(supabaseClient, req, user.id);
    } else if (req.method === 'DELETE') {
      return await deleteInviteCode(supabaseClient, req, user.id);
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in project-invite-codes function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

async function generateInviteCode(supabaseClient: any, req: Request, userId: string): Promise<Response> {
  const { project_id, role = 'member', expires_in_days = 30, uses_left }: GenerateCodeRequest = await req.json();

  // Check if user is admin of the project
  const { data: isAdmin, error: adminCheckError } = await supabaseClient.rpc('is_project_admin', {
    _project_id: project_id,
    _user_id: userId
  });

  if (adminCheckError || !isAdmin) {
    throw new Error('Unauthorized: Only project admins can generate invite codes');
  }

  // Generate unique code
  const code = generateUniqueCode();
  
  // Calculate expiration date
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expires_in_days);

  // Insert invite code
  const { data, error } = await supabaseClient
    .from('project_invite_codes')
    .insert({
      project_id,
      code,
      role,
      created_by: userId,
      expires_at: expiresAt.toISOString(),
      uses_left
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create invite code: ${error.message}`);
  }

  console.log(`Generated invite code ${code} for project ${project_id}`);

  return new Response(
    JSON.stringify({ success: true, data }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function joinByCode(supabaseClient: any, req: Request, userId: string): Promise<Response> {
  const { code }: JoinByCodeRequest = await req.json();

  // Find valid invite code
  const { data: inviteCode, error: codeError } = await supabaseClient
    .from('project_invite_codes')
    .select('*')
    .eq('code', code.toUpperCase())
    .gt('expires_at', new Date().toISOString())
    .single();

  if (codeError || !inviteCode) {
    throw new Error('Invalid or expired invite code');
  }

  // Check if user is already a member
  const { data: existingMember } = await supabaseClient
    .from('project_members')
    .select('id')
    .eq('project_id', inviteCode.project_id)
    .eq('user_id', userId)
    .single();

  if (existingMember) {
    throw new Error('You are already a member of this project');
  }

  // Add user to project
  const { data: newMember, error: memberError } = await supabaseClient
    .from('project_members')
    .insert({
      project_id: inviteCode.project_id,
      user_id: userId,
      role: inviteCode.role,
      invited_by: inviteCode.created_by
    })
    .select(`
      *,
      projects(name, description)
    `)
    .single();

  if (memberError) {
    throw new Error(`Failed to join project: ${memberError.message}`);
  }

  // Update uses_left if it's not unlimited
  if (inviteCode.uses_left !== null) {
    const newUsesLeft = inviteCode.uses_left - 1;
    
    if (newUsesLeft <= 0) {
      // Delete the code if no uses left
      await supabaseClient
        .from('project_invite_codes')
        .delete()
        .eq('id', inviteCode.id);
    } else {
      // Update uses left
      await supabaseClient
        .from('project_invite_codes')
        .update({ uses_left: newUsesLeft })
        .eq('id', inviteCode.id);
    }
  }

  console.log(`User ${userId} joined project ${inviteCode.project_id} using code ${code}`);

  return new Response(
    JSON.stringify({ 
      success: true, 
      data: { 
        member: newMember,
        project_name: newMember.projects?.name 
      } 
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getInviteCodes(supabaseClient: any, req: Request, userId: string): Promise<Response> {
  const url = new URL(req.url);
  const projectId = url.searchParams.get('project_id');

  if (!projectId) {
    throw new Error('project_id parameter is required');
  }

  // Check if user is admin of the project
  const { data: isAdmin, error: adminCheckError } = await supabaseClient.rpc('is_project_admin', {
    _project_id: projectId,
    _user_id: userId
  });

  if (adminCheckError || !isAdmin) {
    throw new Error('Unauthorized: Only project admins can view invite codes');
  }

  // Get active invite codes for project
  const { data, error } = await supabaseClient
    .from('project_invite_codes')
    .select('*')
    .eq('project_id', projectId)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch invite codes: ${error.message}`);
  }

  return new Response(
    JSON.stringify({ success: true, data }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function deleteInviteCode(supabaseClient: any, req: Request, userId: string): Promise<Response> {
  const url = new URL(req.url);
  const codeId = url.searchParams.get('code_id');

  if (!codeId) {
    throw new Error('code_id parameter is required');
  }

  // Get the invite code to check permissions
  const { data: inviteCode, error: codeError } = await supabaseClient
    .from('project_invite_codes')
    .select('project_id')
    .eq('id', codeId)
    .single();

  if (codeError || !inviteCode) {
    throw new Error('Invite code not found');
  }

  // Check if user is admin of the project
  const { data: isAdmin, error: adminCheckError } = await supabaseClient.rpc('is_project_admin', {
    _project_id: inviteCode.project_id,
    _user_id: userId
  });

  if (adminCheckError || !isAdmin) {
    throw new Error('Unauthorized: Only project admins can delete invite codes');
  }

  // Delete the invite code
  const { error: deleteError } = await supabaseClient
    .from('project_invite_codes')
    .delete()
    .eq('id', codeId);

  if (deleteError) {
    throw new Error(`Failed to delete invite code: ${deleteError.message}`);
  }

  console.log(`Deleted invite code ${codeId}`);

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function generateUniqueCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  // Generate 3 groups of 4 characters each (like ABC1-DEF2-GHI3)
  for (let group = 0; group < 3; group++) {
    if (group > 0) result += '-';
    for (let i = 0; i < 4; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
  }
  
  return result;
}

serve(handler);