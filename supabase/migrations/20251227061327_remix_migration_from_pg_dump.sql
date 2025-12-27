CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



SET default_table_access_method = heap;

--
-- Name: notification_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    notice_title text NOT NULL,
    category text DEFAULT 'general'::text NOT NULL,
    sent_at timestamp with time zone DEFAULT now() NOT NULL,
    subscribers_count integer DEFAULT 0 NOT NULL,
    successful integer DEFAULT 0 NOT NULL,
    failed integer DEFAULT 0 NOT NULL,
    triggered_by text DEFAULT 'auto'::text NOT NULL
);


--
-- Name: push_subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.push_subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    endpoint text NOT NULL,
    p256dh text NOT NULL,
    auth text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    last_success_at timestamp with time zone,
    user_agent text
);


--
-- Name: seen_notices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seen_notices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    first_seen timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: notification_history notification_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_history
    ADD CONSTRAINT notification_history_pkey PRIMARY KEY (id);


--
-- Name: push_subscriptions push_subscriptions_endpoint_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT push_subscriptions_endpoint_key UNIQUE (endpoint);


--
-- Name: push_subscriptions push_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT push_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: seen_notices seen_notices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seen_notices
    ADD CONSTRAINT seen_notices_pkey PRIMARY KEY (id);


--
-- Name: seen_notices seen_notices_title_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seen_notices
    ADD CONSTRAINT seen_notices_title_key UNIQUE (title);


--
-- Name: push_subscriptions Anyone can check subscription status; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can check subscription status" ON public.push_subscriptions FOR SELECT USING (true);


--
-- Name: push_subscriptions Anyone can subscribe to notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can subscribe to notifications" ON public.push_subscriptions FOR INSERT WITH CHECK (true);


--
-- Name: push_subscriptions Anyone can unsubscribe; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can unsubscribe" ON public.push_subscriptions FOR DELETE USING (true);


--
-- Name: push_subscriptions Anyone can update subscription status; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can update subscription status" ON public.push_subscriptions FOR UPDATE USING (true) WITH CHECK (true);


--
-- Name: notification_history Anyone can view notification history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view notification history" ON public.notification_history FOR SELECT USING (true);


--
-- Name: notification_history Service role can manage notification history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage notification history" ON public.notification_history USING (true) WITH CHECK (true);


--
-- Name: seen_notices Service role can manage seen_notices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Service role can manage seen_notices" ON public.seen_notices USING (true) WITH CHECK (true);


--
-- Name: notification_history; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notification_history ENABLE ROW LEVEL SECURITY;

--
-- Name: push_subscriptions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

--
-- Name: seen_notices; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.seen_notices ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;