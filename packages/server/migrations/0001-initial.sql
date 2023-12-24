create table "meta" (
  key text primary key,
  value text,
  unique(key)
);

create table "users" (
  id integer primary key,
  email text not null,
  username text,
  password text not null,
  mfa blob,
  created_at integer not null,
  updated_at integer not null,
  unique(email)
);

create table "applications" (
  id integer primary key,
  user integer not null,
  name text not null,
  description text,
  website text,
  privacy_policy text,
  created_at integer not null,
  updated_at integer not null,
  foreign key(user) references users(id)
);

create table "user_integrations" (
  id integer primary key,
  user integer not null,
  application integer not null,
  private_key blob not null,
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

/* setup initial user */
insert into "users" (email, username, password, mfa, created_at, updated_at)
values ('internals@typed.sh', 'Typed.sh', '{__AUTH_INIT_PASSWORD__}', null, 0, 0);
insert into "applications" (user, name, description, website, privacy_policy, created_at, updated_at)
values (1, 'Typed.sh', '', '{__AUTH_WEBSITE__}', '', 0, 0);

/* update migration meta */
insert into "meta" (key, value) values ('migration_revision', 1);
