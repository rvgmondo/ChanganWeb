import * as migration_20261005_192542_initial from './20261005_192542_initial';
import * as migration_20261006_033713_trade_in_photos_departments from './20261006_033713_trade_in_photos_departments';
import * as migration_20261006_034330_preview_visits from './20261006_034330_preview_visits';

export const migrations = [
  {
    up: migration_20261005_192542_initial.up,
    down: migration_20261005_192542_initial.down,
    name: '20261005_192542_initial',
  },
  {
    up: migration_20261006_033713_trade_in_photos_departments.up,
    down: migration_20261006_033713_trade_in_photos_departments.down,
    name: '20261006_033713_trade_in_photos_departments',
  },
  {
    up: migration_20261006_034330_preview_visits.up,
    down: migration_20261006_034330_preview_visits.down,
    name: '20261006_034330_preview_visits'
  },
];
