-- ============================================
-- CREATE ADMIN USER
-- ============================================
-- Run this SQL in the Supabase SQL Editor to create an admin user
--
-- INSTRUCTIONS:
-- 1. Go to your Supabase Dashboard > SQL Editor
-- 2. Create a new query
-- 3. Replace 'admin@example.com' and 'your-secure-password' below
-- 4. Run the query
-- 5. You can now log in with those credentials
-- ============================================

DO $$
DECLARE
    new_user_id uuid;
    admin_email text := 'admin@example.com';  -- CHANGE THIS
    admin_password text := 'your-secure-password';  -- CHANGE THIS
BEGIN
    -- Create the auth user
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        recovery_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        admin_email,
        crypt(admin_password, gen_salt('bf')),
        now(),
        now(),
        now(),
        '{"provider":"email","providers":["email"]}',
        '{}',
        now(),
        now(),
        '',
        '',
        '',
        ''
    )
    RETURNING id INTO new_user_id;

    -- Create the profile with admin role
    INSERT INTO public.profiles (id, email, name, role, created_at, updated_at)
    VALUES (
        new_user_id,
        admin_email,
        split_part(admin_email, '@', 1),
        'admin',
        now(),
        now()
    );

    RAISE NOTICE 'Admin user created successfully with ID: %', new_user_id;
    RAISE NOTICE 'Email: %', admin_email;
    RAISE NOTICE 'You can now log in with these credentials';
END $$;
