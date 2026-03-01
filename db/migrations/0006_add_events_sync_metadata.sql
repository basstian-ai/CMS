alter table events
add column if not exists sync_source text;

alter table events
add column if not exists external_uid text;

update events
set sync_source = 'manual'
where sync_source is null;

alter table events
alter column sync_source set default 'manual';

alter table events
alter column sync_source set not null;

create index if not exists events_sync_source_start_time_idx
on events (sync_source, start_time);
