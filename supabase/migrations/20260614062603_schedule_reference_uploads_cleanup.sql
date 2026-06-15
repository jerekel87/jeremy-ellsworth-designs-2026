create extension if not exists pg_cron;
create extension if not exists pg_net;

do $$
begin
  if exists (select 1 from cron.job where jobname = 'cleanup-reference-uploads-hourly') then
    perform cron.unschedule('cleanup-reference-uploads-hourly');
  end if;
end $$;

select cron.schedule(
  'cleanup-reference-uploads-hourly',
  '0 * * * *',
  $$
  select net.http_post(
    url := 'https://jmwbfleznzjezqokbudo.supabase.co/functions/v1/cleanup-reference-uploads',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
