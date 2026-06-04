import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
  const users = [
    { email: 'owner@gaanfunkhaan.com', password: 'password123', role: 'admin' },
    { email: 'manager@gaanfunkhaan.com', password: 'password123', role: 'manager' }
  ];

  for (const u of users) {
    console.log(`Attempting to create admin user ${u.email}...`);
    const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true
    });

    if (signUpError) {
      console.error(`Creation failed for ${u.email}: ${signUpError.message}`);
      continue;
    }

    if (signUpData.user) {
        console.log(`User created successfully! ID: ${signUpData.user.id}`);
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
  }
}

seed();
