/*
# Seed admin user for the Studio CMS

1. Purpose
   - Creates a single administrator account so the /admin CMS can require sign-in.
   - There is no public sign-up; this is the only way an admin account is created.

2. Account created
   - Email: admin@je.design
   - Password: jedesign2026  (the owner should change this after first login)
   - Email is pre-confirmed so the account can sign in immediately (email confirmation stays OFF).

3. Records
   - One row in auth.users (with a bcrypt-hashed password via pgcrypto).
   - One matching row in auth.identities (provider "email"), required for password sign-in.

4. Notes
   1. Idempotent — if the email already exists, nothing is inserted.
   2. No application tables are touched.
*/

DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@je.design') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data, is_super_admin
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_user_id,
      'authenticated',
      'authenticated',
      'admin@je.design',
      crypt('jedesign2026', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      false
    );

    INSERT INTO auth.identities (
      provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    ) VALUES (
      new_user_id,
      new_user_id,
      json_build_object('sub', new_user_id::text, 'email', 'admin@je.design')::jsonb,
      'email',
      now(), now(), now()
    );
  END IF;
END $$;
