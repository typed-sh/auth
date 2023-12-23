create table "migrations" (
  integer rev primary key
);

create table "users" (
  integer id primary key,
  text email,
  text username,
  text password,
  blob mfa,
  numeric created_at,
  numeric updated_at
);

create table "applications" (
  integer id primary key,
  text name,
  text description,
  text website,
  text privacy_policy,
  blob platform_key,
  numeric created_at,
  numeric updated_at
);

create table "devices" (
  integer id primary key,
  integer user foreign key references users(id),
  text name,
  text agent,
  numeric last_seen
);
