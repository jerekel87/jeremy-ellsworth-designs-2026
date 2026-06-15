/*
  # Seed additional admin user

  Creates the administrator account jerekel87@gmail.com so the /admin CMS can be
  accessed. Email is pre-confirmed (email confirmation stays OFF). All token
  columns are initialised to empty strings so GoTrue can scan the row.
  Idempotent — if the email already exists, nothing is inserted.
*/

DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'jerekel87@gmail.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data, is_super_admin,
      confirmation_token, recovery_token, email_change,
      email_change_token_new, email_change_token_current,
      phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_user_id,
      'authenticated',
      'authenticated',
      'jerekel87@gmail.com',
      crypt('@W00d0953!!!', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      false,
      '', '', '', '', '', '', '', ''
    );

    INSERT INTO auth.identities (
      provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    ) VALUES (
      new_user_id,
      new_user_id,
      json_build_object('sub', new_user_id::text, 'email', 'jerekel87@gmail.com')::jsonb,
      'email',
      now(), now(), now()
    );
  END IF;
END $$;
