# Code Citations

## License: MIT
https://github.com/cham11ng/typescript-api-starter/blob/dd2c86bcff30698ab5374349e5f0c29300344332/src/database/migrations/20180130005620_create_users_table.ts

```
Promise.all([
  db.schema.hasTable('users').then((exists) => {
    if (!exists) {
      return db.schema.createTable('users', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('email').notNullable().unique();
        table.string('password').notNullable();
        table.string('role').defaultTo('user');
        table
```


## License: unknown
https://github.com/DanielaAlvarado/dune/blob/cb72304bcf9362f21e36e90a6c54d8890394e8ad/lib/project/auth-project-files/src/db/migrations/1566427990982_user.js

```
Promise.all([
  db.schema.hasTable('users').then((exists) => {
    if (!exists) {
      return db.schema.createTable('users', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('email').notNullable().unique();
        table.string('password').notNullable();
        table.string('role').defaultTo('user');
        table
```


## License: unknown
https://github.com/GabrielLinss/webstock/blob/f8cb56325ae7e63fa37e2a8bfce2ae040c65b176/webstock-server/src/database/migrations/03_create_users.ts

```
Promise.all([
  db.schema.hasTable('users').then((exists) => {
    if (!exists) {
      return db.schema.createTable('users', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('email').notNullable().unique();
        table.string('password').notNullable();
        table.string('role').defaultTo('user');
        table
```


## License: unknown
https://github.com/Gia-Kiet-99/nodeapi_docker/blob/51f33a434d1a0aaffffcf7469acad2e03250013f/src/databases/mysql/config.js

```
Promise.all([
  db.schema.hasTable('users').then((exists) => {
    if (!exists) {
      return db.schema.createTable('users', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('email').notNullable().unique();
        table.string('password').notNullable();
        table.string('role').defaultTo('user');
        table
```


## License: unknown
https://github.com/JasonXu314/chatterbox-backend/blob/1dcd8567b53c3a4fd609c64a54af5d306c57ce3e/src/db.service.ts

```
Promise.all([
  db.schema.hasTable('users').then((exists) => {
    if (!exists) {
      return db.schema.createTable('users', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('email').notNullable().unique();
        table.string('password').notNullable();
        table.string('role').defaultTo('user');
        table
```


## License: unknown
https://github.com/bernixCodes/dashboard-node/blob/f2b0f211d32f46f16b9967ead19e142973754048/config/db.js

```
Promise.all([
  db.schema.hasTable('users').then((exists) => {
    if (!exists) {
      return db.schema.createTable('users', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('email').notNullable().unique();
        table.string('password').notNullable();
        table.string('role').defaultTo('user');
        table
```


## License: unknown
https://github.com/saad-test-organization/express-objection-boilerplate/blob/b436256a7bcdd5253c54c2269867ee48aff9e4b8/src/db/migrations/20240229220339_init.js

```
Promise.all([
  db.schema.hasTable('users').then((exists) => {
    if (!exists) {
      return db.schema.createTable('users', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('email').notNullable().unique();
        table.string('password').notNullable();
        table.string('role').defaultTo('user');
        table
```

