-- Clarity — Supabase / Postgres Schema
-- Run this in your Supabase SQL editor or via psql.
-- Requires the pgvector extension (enabled in Supabase by default).

-- -----------------------------------------------------------------------
-- Extensions
-- -----------------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists vector;

-- -----------------------------------------------------------------------
-- documents
-- -----------------------------------------------------------------------
create table if not exists documents (
    id                    uuid primary key default uuid_generate_v4(),
    user_id               uuid references auth.users(id) on delete cascade,
    filename              text not null,
    upload_date           timestamptz not null default now(),
    page_count            int,
    status                text not null default 'processing'
                              check (status in ('processing', 'ready', 'error')),
    extraction_confidence numeric(5,2),  -- 0.00–100.00
    storage_path          text,          -- Supabase storage object path
    created_at            timestamptz not null default now(),
    updated_at            timestamptz not null default now()
);

-- -----------------------------------------------------------------------
-- clauses
-- -----------------------------------------------------------------------
create table if not exists clauses (
    id               uuid primary key default uuid_generate_v4(),
    document_id      uuid not null references documents(id) on delete cascade,
    section_ref      text,              -- e.g. "Section 4.1"
    title            text,              -- plain-English header
    original_text    text not null,     -- verbatim source text
    page_ref         text,              -- e.g. "Page 3, Line 42"
    plain_explanation text,             -- Gemini-generated explanation
    risk_tag         text check (risk_tag in ('standard', 'worth_reviewing', 'risky')),
    category         text,              -- e.g. "Termination", "Rent", "Repairs"
    embedding        vector(768),       -- text-embedding-004 output (768 dims)
    created_at       timestamptz not null default now()
);

-- Index for fast cosine similarity search within a document
create index if not exists clauses_embedding_idx
    on clauses
    using ivfflat (embedding vector_cosine_ops)
    with (lists = 100);

-- Index for filtering by document_id (used in all queries)
create index if not exists clauses_document_id_idx on clauses (document_id);

-- -----------------------------------------------------------------------
-- chat_messages
-- -----------------------------------------------------------------------
create table if not exists chat_messages (
    id               uuid primary key default uuid_generate_v4(),
    document_id      uuid not null references documents(id) on delete cascade,
    role             text not null check (role in ('user', 'assistant')),
    content          text not null,
    cited_clause_ids uuid[],           -- which clauses the answer is grounded in
    created_at       timestamptz not null default now()
);

create index if not exists chat_messages_document_id_idx on chat_messages (document_id);

-- -----------------------------------------------------------------------
-- action_items
-- -----------------------------------------------------------------------
create table if not exists action_items (
    id               uuid primary key default uuid_generate_v4(),
    document_id      uuid not null references documents(id) on delete cascade,
    title            text not null,
    description      text,
    status           text not null default 'pending'
                         check (status in ('pending', 'completed', 'pay_attention',
                                           'clarification', 'looks_standard')),
    suggested_script text,             -- nullable ready-to-send email/script
    created_at       timestamptz not null default now(),
    updated_at       timestamptz not null default now()
);

create index if not exists action_items_document_id_idx on action_items (document_id);

-- -----------------------------------------------------------------------
-- comparisons
-- -----------------------------------------------------------------------
create table if not exists comparisons (
    id              uuid primary key default uuid_generate_v4(),
    document_a_id   uuid not null references documents(id) on delete cascade,
    document_b_id   uuid not null references documents(id) on delete cascade,
    summary_json    jsonb,             -- full compare response payload
    created_at      timestamptz not null default now()
);

-- -----------------------------------------------------------------------
-- inconsistencies  (flagged by the ADK consistency agent)
-- -----------------------------------------------------------------------
create table if not exists inconsistencies (
    id           uuid primary key default uuid_generate_v4(),
    document_id  uuid not null references documents(id) on delete cascade,
    clause_id_a  uuid not null references clauses(id) on delete cascade,
    clause_id_b  uuid not null references clauses(id) on delete cascade,
    explanation  text not null,        -- plain-language, cites both clauses
    created_at   timestamptz not null default now()
);

create index if not exists inconsistencies_document_id_idx on inconsistencies (document_id);

-- -----------------------------------------------------------------------
-- Supabase RPC: match_clauses
-- Used by embeddings.cosine_search() for RAG retrieval
-- -----------------------------------------------------------------------
create or replace function match_clauses(
    query_embedding     vector(768),
    match_document_id   uuid,
    match_count         int default 5,
    exclude_clause_id   uuid default null
)
returns table (
    clause_id      uuid,
    document_id    uuid,
    section_ref    text,
    title          text,
    original_text  text,
    page_ref       text,
    plain_explanation text,
    risk_tag       text,
    category       text,
    similarity     float
)
language sql stable
as $$
    select
        id               as clause_id,
        document_id,
        section_ref,
        title,
        original_text,
        page_ref,
        plain_explanation,
        risk_tag,
        category,
        1 - (embedding <=> query_embedding) as similarity
    from clauses
    where
        document_id = match_document_id
        and (exclude_clause_id is null or id != exclude_clause_id)
        and embedding is not null
    order by embedding <=> query_embedding
    limit match_count;
$$;

-- -----------------------------------------------------------------------
-- Row-Level Security (RLS)
-- Users can only see their own documents and related rows.
-- The backend uses the service-role key (bypasses RLS).
-- -----------------------------------------------------------------------
alter table documents enable row level security;
alter table clauses enable row level security;
alter table chat_messages enable row level security;
alter table action_items enable row level security;
alter table comparisons enable row level security;
alter table inconsistencies enable row level security;

-- documents: users own their own
create policy "Users access own documents"
    on documents for all
    using (auth.uid() = user_id);

-- clauses: inherit through documents
create policy "Users access own clauses"
    on clauses for all
    using (
        document_id in (
            select id from documents where user_id = auth.uid()
        )
    );

-- chat_messages: inherit through documents
create policy "Users access own chat messages"
    on chat_messages for all
    using (
        document_id in (
            select id from documents where user_id = auth.uid()
        )
    );

-- action_items: inherit through documents
create policy "Users access own action items"
    on action_items for all
    using (
        document_id in (
            select id from documents where user_id = auth.uid()
        )
    );

-- comparisons: user owns either document
create policy "Users access own comparisons"
    on comparisons for all
    using (
        document_a_id in (select id from documents where user_id = auth.uid())
        or document_b_id in (select id from documents where user_id = auth.uid())
    );

-- inconsistencies: inherit through documents
create policy "Users access own inconsistencies"
    on inconsistencies for all
    using (
        document_id in (
            select id from documents where user_id = auth.uid()
        )
    );

-- -----------------------------------------------------------------------
-- Storage bucket: documents
-- Create this in Supabase Dashboard → Storage, or via CLI.
-- Bucket name: "documents", set to private (not public).
-- -----------------------------------------------------------------------
-- insert into storage.buckets (id, name, public)
-- values ('documents', 'documents', false)
-- on conflict (id) do nothing;
