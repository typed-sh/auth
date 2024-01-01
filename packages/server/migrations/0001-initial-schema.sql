create table "meta" (
  key text primary key,
  value text,
  unique(key)
);

create table "users" (
  id integer primary key,
  email text not null,
  username text not null,
  password text not null,
  mfa blob,
  is_email_verified bool not null,
  is_trusted bool not null,
  created_at integer not null,
  updated_at integer not null,
  unique(email)
);

create table "applications" (
  id integer primary key,
  user integer not null,
  name text not null,
  description text not null,
  website text not null,
  privacy_policy text not null,
  redirect_uri text not null,
  is_approved bool not null,
  is_trusted bool not null,
  created_at integer not null,
  updated_at integer not null,
  foreign key(user) references users(id)
);

create table "user_integrations" (
  id integer primary key,
  user integer not null,
  application integer not null,
  private_key blob not null,
  is_user_readable boolean not null,
  is_user_writable boolean not null,
  created_at integer not null,
  updated_at integer not null,
  foreign key(user) references users(id),
  foreign key(application) references applications(id)
);

create table "devices" (
  id integer primary key,
  user_integration integer not null,
  name text,
  agent text,
  last_seen integer not null,
  foreign key(user_integration) references user_integrations(id)
);

/* update migration meta */
insert into "meta" (key, value) values ('migration_revision', 1);
