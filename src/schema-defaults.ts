import { registerSchemaDefaults } from "./type-registry.js";

export interface SchemaDefaults {
  /**
   * By default, are item types and key paths syncable? Non-syncable key paths
   * will be omitted from SyncList responses. Non-syncable items are cheaper to
   * store and write. The default is true (syncable). This can be overridden at
   * the itemType and keyPath level.
   */
  syncable?: boolean;
  /**
   * By default is group versioning enabled for item item types and key paths?
   * Group versioned key paths are optimized for transactions that modify
   * multiple items in the same group. All item types in a group must be
   * versioned or not versioned. The default is true (versioned). This can be
   * overridden at the itemType and keyPath level.
   */
  versioned?: boolean;

  /**
   * For syncable key paths, StatelyDB automatically maintains a "tombstone"
   * when an item is deleted. This allows SyncList to return the key paths of
   * deleted items. tombstoneTTLHours controls how long these tombstones stick
   * around before being deleted. The default, if unset, is 60 days (1,440
   * hours). If a token returned from SyncList is older than this, you'll get a
   * "reset" and fresh data from ContinueList.
   */
  tombstoneTTLHours?: number;
}

/**
 * Set the default parameters for the schema. Some of these parameters affect the
 * defaults for item types or key paths - others just describe global parameters
 * for the store.
 */
export function schemaDefaults(params: SchemaDefaults) {
  return registerSchemaDefaults(params);
}
