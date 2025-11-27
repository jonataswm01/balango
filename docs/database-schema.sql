-- ============================================
-- SCHEMA COMPLETO DO BANCO DE DADOS - BALANGO v3
-- Documentação de referência das tabelas
-- ============================================

-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

-- ============================================
-- 1. APP_SETTINGS
-- Configurações gerais da aplicação
-- ============================================
CREATE TABLE public.app_settings (
  key text NOT NULL,
  value numeric NOT NULL,
  description text,
  CONSTRAINT app_settings_pkey PRIMARY KEY (key)
);

-- ============================================
-- 2. CLIENTS
-- Cadastro de clientes
-- ============================================
CREATE TABLE public.clients (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  name text NOT NULL,
  phone text,
  email text,
  document text,
  address text,
  active boolean DEFAULT true,
  CONSTRAINT clients_pkey PRIMARY KEY (id)
);

-- ============================================
-- 3. SERVICES
-- Serviços prestados
-- ============================================
CREATE TABLE public.services (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  description text,
  date date NOT NULL,
  status text DEFAULT 'pendente'::text,
  priority text DEFAULT 'media'::text,
  service_type text,
  technician_id uuid,
  client_id uuid,
  gross_value numeric NOT NULL DEFAULT 0,
  operational_cost numeric NOT NULL DEFAULT 0,
  tax_amount numeric NOT NULL DEFAULT 0,
  has_invoice boolean DEFAULT false,
  invoice_number text,
  payment_status text DEFAULT 'pendente'::text,
  payment_method text,
  payment_date date,
  location text,
  notes text,
  estimated_hours numeric,
  actual_hours numeric,
  start_date timestamp without time zone,
  completed_date timestamp without time zone,
  contact_phone text,
  contact_email text,
  CONSTRAINT services_pkey PRIMARY KEY (id),
  CONSTRAINT services_technician_id_fkey FOREIGN KEY (technician_id) REFERENCES public.technicians(id),
  CONSTRAINT services_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id)
);

-- ============================================
-- 4. TECHNICIANS
-- Cadastro de técnicos
-- ============================================
CREATE TABLE public.technicians (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  name text NOT NULL,
  nickname text,
  active boolean DEFAULT true,
  phone text,
  email text,
  document text,
  CONSTRAINT technicians_pkey PRIMARY KEY (id)
);

-- ============================================
-- 5. USERS
-- Perfis de usuários (autenticação via Supabase Auth)
-- ============================================
CREATE TABLE public.users (
  id uuid NOT NULL,
  email text NOT NULL,
  nome text NOT NULL,
  telefone text NOT NULL UNIQUE,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);


