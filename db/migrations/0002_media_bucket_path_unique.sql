alter table media
  drop constraint if exists media_path_key;

alter table media
  add constraint media_bucket_path_key unique (bucket, path);
