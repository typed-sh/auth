create table "meta" (
  key text,
  value text,
  unique(key)
);

create table "users" (
  id integer primary key,
  email text,
  username text,
  password text,
  mfa blob,
  created_at integer,
  updated_at integer,
  unique(email)
);

create table "applications" (
  id integer primary key,
  name text,
  description text,
  website text,
  privacy_policy text,
  created_at integer,
  updated_at integer
);

create table "user_integrations" (
  id integer primary key,
  user integer,
  application integer,
  private_key blob,
  created_at integer,
  updated_at integer,
  foreign key(user) references users(id),
  foreign key(application) references applications(id)
);

create table "devices" (
  id integer primary key,
  user_integration integer,
  name text,
  agent text,
  last_seen integer,
  foreign key(user_integration) references user_integrations(id)
);

insert into "meta" (key, value) values ('migration_revision', 1);
