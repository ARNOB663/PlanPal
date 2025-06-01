import { supabase } from './supabase';

async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .maybeSingle();

    if (error) {
      console.error('Error connecting to Supabase:', error.message);
      return;
    }

    console.log('Successfully connected to Supabase!');
    console.log('Number of users in database:', data?.count || 0);
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testConnection();