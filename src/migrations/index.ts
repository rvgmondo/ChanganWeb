import * as migration_20261005_192542_initial from './20261005_192542_initial';

export const migrations = [
  {
    up: migration_20261005_192542_initial.up,
    down: migration_20261005_192542_initial.down,
    name: '20261005_192542_initial'
  },
];
