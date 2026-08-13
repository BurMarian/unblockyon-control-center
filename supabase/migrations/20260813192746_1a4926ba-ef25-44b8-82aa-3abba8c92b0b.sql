
-- ============ helpers ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ profiles ============
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  phone text,
  avatar_url text,
  status text NOT NULL DEFAULT 'active',
  last_seen_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_status ON public.profiles(status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ rbac ============
CREATE TABLE public.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  is_system boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  resource text NOT NULL,
  action text NOT NULL,
  description text NOT NULL DEFAULT ''
);
CREATE TABLE public.role_permissions (
  role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);
CREATE INDEX idx_role_permissions_permission ON public.role_permissions(permission_id);
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  granted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role_id)
);
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.roles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.permissions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.role_permissions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.roles, public.permissions, public.role_permissions, public.user_roles TO service_role;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.role_permissions rp ON rp.role_id = ur.role_id
    JOIN public.permissions p ON p.id = rp.permission_id
    WHERE ur.user_id = _user_id AND p.key = _permission
  );
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = _user_id AND r.key = _role
  );
$$;

-- ============ qr ============
CREATE TABLE public.qr_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  quantity integer NOT NULL DEFAULT 0,
  format text NOT NULL DEFAULT 'png',
  status text NOT NULL DEFAULT 'pending',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.qr_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  batch_id uuid REFERENCES public.qr_batches(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'unused',
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  vehicle_plate text,
  activation_code text UNIQUE,
  activated_at timestamptz,
  last_used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_qr_codes_batch ON public.qr_codes(batch_id);
CREATE INDEX idx_qr_codes_status ON public.qr_codes(status);
CREATE INDEX idx_qr_codes_owner ON public.qr_codes(owner_id);
CREATE TABLE public.qr_activations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_id uuid NOT NULL REFERENCES public.qr_codes(id) ON DELETE CASCADE,
  activated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  source text NOT NULL DEFAULT 'web',
  status text NOT NULL DEFAULT 'succeeded',
  vehicle_plate text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_qr_activations_code ON public.qr_activations(qr_code_id);
CREATE TABLE public.qr_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_id uuid NOT NULL REFERENCES public.qr_codes(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  detail text,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_qr_events_code ON public.qr_events(qr_code_id, created_at DESC);

-- ============ interactions ============
CREATE TABLE public.interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_id uuid REFERENCES public.qr_codes(id) ON DELETE SET NULL,
  requester_contact text,
  channel text NOT NULL DEFAULT 'telegram',
  status text NOT NULL DEFAULT 'pending',
  message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_interactions_status ON public.interactions(status);
CREATE TABLE public.interaction_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interaction_id uuid NOT NULL REFERENCES public.interactions(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  detail text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_interaction_events_interaction ON public.interaction_events(interaction_id, created_at DESC);

-- ============ telegram ============
CREATE TABLE public.telegram_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id text NOT NULL UNIQUE,
  username text,
  first_name text,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.telegram_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_account_id uuid REFERENCES public.telegram_accounts(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'ok',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_telegram_events_created ON public.telegram_events(created_at DESC);

-- ============ notifications ============
CREATE TABLE public.notification_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  channel text NOT NULL DEFAULT 'telegram',
  subject text,
  body text NOT NULL DEFAULT '',
  variables text[] NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES public.notification_templates(id) ON DELETE SET NULL,
  recipient text NOT NULL,
  channel text NOT NULL DEFAULT 'telegram',
  type text NOT NULL DEFAULT 'system',
  message text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  error text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_status ON public.notifications(status);

-- ============ payments ============
CREATE TABLE public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'EUR',
  interval text NOT NULL DEFAULT 'month',
  features text[] NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.plans(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'active',
  current_period_end timestamptz,
  external_reference text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_subscriptions_profile ON public.subscriptions(profile_id);
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  plan_id uuid REFERENCES public.plans(id) ON DELETE SET NULL,
  amount_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'EUR',
  method text NOT NULL DEFAULT 'card',
  status text NOT NULL DEFAULT 'pending',
  external_reference text,
  refunded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_payments_created ON public.payments(created_at DESC);
CREATE INDEX idx_payments_status ON public.payments(status);

-- ============ audit / system ============
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email text,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity, entity_id);

CREATE TABLE public.system_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  description text NOT NULL DEFAULT '',
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  version text,
  status text NOT NULL DEFAULT 'operational',
  last_check_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.system_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_key text,
  event_type text NOT NULL,
  severity text NOT NULL DEFAULT 'info',
  message text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_system_events_created ON public.system_events(created_at DESC);
CREATE TABLE public.error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_key text,
  severity text NOT NULL DEFAULT 'error',
  message text NOT NULL,
  stack text,
  request_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_error_logs_created ON public.error_logs(created_at DESC);

-- grants for domain tables
GRANT SELECT, INSERT, UPDATE, DELETE ON
  public.qr_batches, public.qr_codes, public.qr_activations, public.qr_events,
  public.interactions, public.interaction_events,
  public.telegram_accounts, public.telegram_events,
  public.notification_templates, public.notifications,
  public.plans, public.subscriptions, public.payments,
  public.audit_logs, public.system_settings, public.services,
  public.system_events, public.error_logs
TO authenticated;
GRANT ALL ON
  public.qr_batches, public.qr_codes, public.qr_activations, public.qr_events,
  public.interactions, public.interaction_events,
  public.telegram_accounts, public.telegram_events,
  public.notification_templates, public.notifications,
  public.plans, public.subscriptions, public.payments,
  public.audit_logs, public.system_settings, public.services,
  public.system_events, public.error_logs
TO service_role;

ALTER TABLE public.qr_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_activations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interaction_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_qr_batches_updated BEFORE UPDATE ON public.qr_batches FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_qr_codes_updated BEFORE UPDATE ON public.qr_codes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_interactions_updated BEFORE UPDATE ON public.interactions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_templates_updated BEFORE UPDATE ON public.notification_templates FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_plans_updated BEFORE UPDATE ON public.plans FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_subs_updated BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_payments_updated BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_roles_updated BEFORE UPDATE ON public.roles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_services_updated BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ policies ============
DO $$
DECLARE
  t record;
BEGIN
  FOR t IN
    SELECT * FROM (VALUES
      ('profiles','users'),
      ('roles','roles'),
      ('permissions','permissions'),
      ('role_permissions','roles'),
      ('user_roles','roles'),
      ('qr_batches','qr'),
      ('qr_codes','qr'),
      ('qr_activations','qr'),
      ('qr_events','qr'),
      ('interactions','interactions'),
      ('interaction_events','interactions'),
      ('telegram_accounts','telegram'),
      ('telegram_events','telegram'),
      ('notification_templates','notifications'),
      ('notifications','notifications'),
      ('plans','payments'),
      ('subscriptions','payments'),
      ('payments','payments'),
      ('system_settings','system'),
      ('services','system'),
      ('system_events','system'),
      ('error_logs','system')
    ) AS v(tbl, res)
  LOOP
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (public.has_permission(auth.uid(), %L))',
      t.tbl || '_select', t.tbl, t.res || '.view');
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (public.has_permission(auth.uid(), %L))',
      t.tbl || '_insert', t.tbl, CASE WHEN t.res IN ('interactions','telegram','notifications','system','permissions') THEN t.res || '.manage' ELSE t.res || '.create' END);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (public.has_permission(auth.uid(), %L)) WITH CHECK (public.has_permission(auth.uid(), %L))',
      t.tbl || '_update', t.tbl,
      CASE WHEN t.res IN ('interactions','telegram','notifications','system','permissions') THEN t.res || '.manage' ELSE t.res || '.update' END,
      CASE WHEN t.res IN ('interactions','telegram','notifications','system','permissions') THEN t.res || '.manage' ELSE t.res || '.update' END);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (public.has_permission(auth.uid(), %L))',
      t.tbl || '_delete', t.tbl,
      CASE WHEN t.res IN ('interactions','telegram','notifications','system','permissions') THEN t.res || '.manage' ELSE t.res || '.delete' END);
  END LOOP;
END $$;

-- everyone signed in can always read their own profile and their own roles
CREATE POLICY profiles_self_select ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY profiles_self_update ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY user_roles_self_select ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY roles_any_authenticated_select ON public.roles FOR SELECT TO authenticated USING (true);
CREATE POLICY permissions_any_authenticated_select ON public.permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY role_permissions_self_select ON public.role_permissions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role_id = role_permissions.role_id));

-- audit logs: readable with audit.view, insertable by any authenticated actor (server writes as the user)
CREATE POLICY audit_logs_select ON public.audit_logs FOR SELECT TO authenticated USING (public.has_permission(auth.uid(), 'audit.view'));
CREATE POLICY audit_logs_insert ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (actor_id = auth.uid());

-- ============ seed roles & permissions (static application configuration) ============
INSERT INTO public.roles (key, name, description, is_system) VALUES
  ('superadmin','Superadmin','Full unrestricted access to every area of the control center.', true),
  ('admin','Admin','Manages users, QR lifecycle, notifications and payments.', false),
  ('manager','Manager','Operational access to QR, interactions and notifications.', false),
  ('support','Support','Read-only operational access for customer support.', false);

INSERT INTO public.permissions (key, resource, action, description) VALUES
  ('users.view','users','view','View admin users and profiles'),
  ('users.create','users','create','Invite and create admin users'),
  ('users.update','users','update','Edit admin users'),
  ('users.delete','users','delete','Delete admin users'),
  ('roles.view','roles','view','View roles'),
  ('roles.create','roles','create','Create roles'),
  ('roles.update','roles','update','Edit roles'),
  ('roles.delete','roles','delete','Delete roles'),
  ('roles.manage','roles','manage','Assign roles and permissions'),
  ('permissions.view','permissions','view','View permissions'),
  ('permissions.manage','permissions','manage','Manage permission definitions'),
  ('qr.view','qr','view','View QR codes and batches'),
  ('qr.create','qr','create','Create QR batches'),
  ('qr.generate','qr','generate','Generate QR identifiers'),
  ('qr.update','qr','update','Edit QR codes'),
  ('qr.activate','qr','activate','Activate QR codes'),
  ('qr.delete','qr','delete','Delete QR codes'),
  ('interactions.view','interactions','view','View interactions'),
  ('interactions.manage','interactions','manage','Manage interactions'),
  ('telegram.view','telegram','view','View Telegram activity'),
  ('telegram.manage','telegram','manage','Manage Telegram accounts and events'),
  ('notifications.view','notifications','view','View notifications and templates'),
  ('notifications.manage','notifications','manage','Send and manage notifications and templates'),
  ('payments.view','payments','view','View payments, plans and subscriptions'),
  ('payments.manage','payments','manage','Manage payments, plans and subscriptions'),
  ('audit.view','audit','view','View audit logs'),
  ('system.view','system','view','View system health, services and logs'),
  ('system.manage','system','manage','Manage system settings and services');

-- superadmin: everything
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r CROSS JOIN public.permissions p WHERE r.key = 'superadmin';

-- admin: everything except permission definitions and role deletion
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r JOIN public.permissions p ON p.key NOT IN ('permissions.manage','roles.delete','system.manage')
WHERE r.key = 'admin';

-- manager: operational
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r JOIN public.permissions p ON p.key IN (
  'users.view','roles.view','permissions.view','qr.view','qr.create','qr.generate','qr.update','qr.activate',
  'interactions.view','interactions.manage','telegram.view','notifications.view','notifications.manage',
  'payments.view','audit.view','system.view')
WHERE r.key = 'manager';

-- support: read-only
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r JOIN public.permissions p ON p.key IN (
  'users.view','roles.view','qr.view','interactions.view','interactions.manage','telegram.view',
  'notifications.view','payments.view','system.view')
WHERE r.key = 'support';

-- ============ new user handling ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  is_first boolean;
  target_role uuid;
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NULLIF(NEW.raw_user_meta_data ->> 'full_name',''))
  ON CONFLICT (id) DO NOTHING;

  SELECT NOT EXISTS (SELECT 1 FROM public.user_roles) INTO is_first;
  IF is_first THEN
    SELECT id INTO target_role FROM public.roles WHERE key = 'superadmin';
    INSERT INTO public.user_roles (user_id, role_id) VALUES (NEW.id, target_role)
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
