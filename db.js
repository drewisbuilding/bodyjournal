// Supabase helpers — requires Supabase CDN loaded before this file

let _client = null;

function isSupabaseConfigured() {
  return typeof SUPABASE_URL !== 'undefined' &&
    SUPABASE_URL !== 'YOUR_SUPABASE_URL' &&
    typeof SUPABASE_ANON_KEY !== 'undefined' &&
    SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY';
}

function getClient() {
  if (!_client) {
    _client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _client;
}

// Returns null if reachable, or an error string if not
async function dbCheckReachable() {
  try {
    const resp = await fetch(`${SUPABASE_URL}/auth/v1/health`, {
      headers: { apikey: SUPABASE_ANON_KEY }
    });
    if (resp.ok) return null;
    const text = await resp.text().catch(() => '');
    return `HTTP ${resp.status}: ${text.slice(0, 200)}`;
  } catch (e) {
    return `Network error: ${e.message}`;
  }
}

// Auth -----------------------------------------------------------------------

async function dbGetSession() {
  const { data } = await getClient().auth.getSession();
  return data.session;
}

function dbOnAuthChange(callback) {
  getClient().auth.onAuthStateChange((_event, session) => callback(session));
}

async function dbSignInWithEmail(email) {
  const redirectTo = window.location.origin + window.location.pathname;
  const { error } = await getClient().auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo }
  });
  return error;
}

async function dbSignOut() {
  await getClient().auth.signOut();
}

// Profile --------------------------------------------------------------------

async function dbGetProfile(userId) {
  const { data, error } = await getClient()
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error || !data) return null;
  return {
    name: data.name || '',
    weight: data.weight || '',
    age: data.age || '',
    gender: data.gender || '',
    fitnessLevel: data.fitness_level || 'beginner',
    equipment: data.equipment || [],
    goal: data.goal || 'build',
    startDate: data.start_date || null
  };
}

async function dbDeleteAllUserData(userId) {
  await getClient().from('workout_logs').delete().eq('user_id', userId);
  await getClient().from('profiles').delete().eq('id', userId);
}

async function dbSaveProfile(userId, profile, startDate) {
  const { error } = await getClient()
    .from('profiles')
    .upsert({
      id: userId,
      name: profile.name || '',
      weight: profile.weight || '',
      age: profile.age || '',
      gender: profile.gender || '',
      fitness_level: profile.fitnessLevel || 'beginner',
      equipment: profile.equipment || [],
      goal: profile.goal || 'build',
      start_date: startDate || null,
      updated_at: new Date().toISOString()
    });
  if (error) console.error('dbSaveProfile error:', error);
}

// Workout logs ---------------------------------------------------------------

async function dbGetLog(userId, dayNum, intensity) {
  const { data, error } = await getClient()
    .from('workout_logs')
    .select('log')
    .eq('user_id', userId)
    .eq('day_num', dayNum)
    .eq('intensity', intensity)
    .single();
  if (error || !data) return null;
  return data.log;
}

async function dbSaveLog(userId, dayNum, intensity, log) {
  const { error } = await getClient()
    .from('workout_logs')
    .upsert(
      { user_id: userId, day_num: dayNum, intensity, log, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,day_num,intensity' }
    );
  if (error) console.error('dbSaveLog error:', error);
}

async function dbGetAllLogs(userId) {
  const { data, error } = await getClient()
    .from('workout_logs')
    .select('day_num, intensity, log')
    .eq('user_id', userId);
  if (error) return [];
  return data || [];
}
