import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  const users = [
    { email: 'owner@gaanfunkhaan.com', password: 'password123', role: 'admin' },
    { email: 'manager@gaanfunkhaan.com', password: 'password123', role: 'manager' }
  ];

  for (const u of users) {
    console.log(`Attempting login for ${u.email}...`);
    let { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: u.email,
      password: u.password
    });

    if (signInError) {
      console.log(`Login failed for ${u.email}: ${signInError.message}. Attempting signup...`);
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: u.email,
        password: u.password
      });

      if (signUpError) {
        console.error(`Signup failed for ${u.email}: ${signUpError.message}`);
        continue;
      }

      if (signUpData.user?.identities?.length === 0) {
          console.log(`User already exists but sign in failed (possibly wrong password or unconfirmed).`);
      } else {
          console.log(`Signup success for ${u.email}! Please check if email confirmation is required: ${signUpData.session ? 'Not Required' : 'REQUIRED'}`);
      }
      
      if (signUpData.user) {
          // Update profile role
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ role: u.role, restaurant_id: '11111111-1111-1111-1111-111111111111' })
            .eq('id', signUpData.user.id);
          
          if (profileError) {
              console.log(`Profile update failed:`, profileError.message);
          } else {
              console.log(`Profile role set to ${u.role}`);
          }
      }
    } else {
      console.log(`Successfully logged in as ${u.email}!`);
    }
  }
}

seed();
