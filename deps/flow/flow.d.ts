/* Generated from https://raw.githubusercontent.com/estuary/flow/v0.6.15/flow.schema.json by `npm run generate-flow-types`. Do not edit. */

/**
 * This interface was referenced by `undefined`'s JSON-Schema definition
 * via the `patternProperty` "^([^/~]|(~[01]))+(/([^/~]|(~[01]))+)*$".
 */
export type Value = unknown;
/**
 * Collection names are paths of Unicode letters, numbers, '-', '_', or '.'.
 * Each path component is separated by a slash '/',
 * and a name may not begin or end in a '/'.
 */
export type Collection = string;
/**
 * An endpoint from which Flow will capture.
 */
export type CaptureEndpoint =
  | {
      connector: ConnectorConfig;
    }
  | {
      local: LocalConfig;
    };
/**
 * JSON Pointer which identifies a location in a document.
 *
 * This interface was referenced by `undefined`'s JSON-Schema definition
 * via the `patternProperty` "^[\p{Letter}\p{Number}\-_\.]+(/[\p{Letter}\p{Number}\-_\.]+)*$".
 *
 * This interface was referenced by `undefined`'s JSON-Schema definition
 * via the `patternProperty` "^[\p{Letter}\p{Number}\-_\.]+(/[\p{Letter}\p{Number}\-_\.]+)*$".
 *
 * This interface was referenced by `undefined`'s JSON-Schema definition
 * via the `patternProperty` "^[\p{Letter}\p{Number}\-_\.]+(/[\p{Letter}\p{Number}\-_\.]+)*$".
 */
export type JsonPointer = string;
/**
 * Token is Unicode letters, numbers, '-', '_', or '.'.
 *
 * This interface was referenced by `undefined`'s JSON-Schema definition
 * via the `patternProperty` "^[\p{Letter}\p{Number}\-_\.]+$".
 */
export type Token = string;
/**
 * Collection describes a set of related documents, where each adheres to a
 * common schema and grouping key. Collections are append-only: once a document
 * is added to a collection, it is never removed. However, it may be replaced
 * or updated (either in whole, or in part) by a future document sharing its
 * key. Each new document of a given key is "reduced" into existing documents
 * of the key. By default, this reduction is achieved by completely replacing
 * the previous document, but much richer reduction behaviors can be specified
 * through the use of annotated reduction strategies of the collection schema.
 *
 * This interface was referenced by `undefined`'s JSON-Schema definition
 * via the `patternProperty` "^[\p{Letter}\p{Number}\-_\.]+(/[\p{Letter}\p{Number}\-_\.]+)*$".
 */
export type CollectionDef = {
  /**
   * When true, a publication will delete this collection.
   */
  delete?: boolean;
  derive?: Derivation;
  /**
   * When present, a publication of the collection will fail if the
   * last publication ID in the control plane doesn't match this value.
   */
  expectPubId?: string;
  journals?: JournalTemplate;
  key: CompositeKey;
  projections?: {
    [k: string]: Projection;
  };
  /**
   * A schema is a draft 2020-12 JSON Schema which validates Flow documents.
   * Schemas also provide annotations at document locations, such as reduction
   * strategies for combining one document into another.
   *
   * Schemas may be defined inline to the catalog, or given as a relative
   * or absolute URI. URIs may optionally include a JSON fragment pointer that
   * locates a specific sub-schema therein.
   *
   * For example, "schemas/marketing.yaml#/$defs/campaign" would reference the schema
   * at location {"$defs": {"campaign": ...}} within ./schemas/marketing.yaml.
   */
  readSchema?: {
    [k: string]: unknown;
  };
  /**
   * Publishing a value of `true` will reset this collection, which is
   * equivalent to deleting and then re-creating the collection but
   * applied as a single publication.
   * If this is a derived collection then the derivation task state is
   * also reset, effectively re-building the derivation in its entirety.
   */
  reset?: boolean;
  /**
   * A schema is a draft 2020-12 JSON Schema which validates Flow documents.
   * Schemas also provide annotations at document locations, such as reduction
   * strategies for combining one document into another.
   *
   * Schemas may be defined inline to the catalog, or given as a relative
   * or absolute URI. URIs may optionally include a JSON fragment pointer that
   * locates a specific sub-schema therein.
   *
   * For example, "schemas/marketing.yaml#/$defs/campaign" would reference the schema
   * at location {"$defs": {"campaign": ...}} within ./schemas/marketing.yaml.
   */
  schema?: {
    [k: string]: unknown;
  };
  /**
   * A schema is a draft 2020-12 JSON Schema which validates Flow documents.
   * Schemas also provide annotations at document locations, such as reduction
   * strategies for combining one document into another.
   *
   * Schemas may be defined inline to the catalog, or given as a relative
   * or absolute URI. URIs may optionally include a JSON fragment pointer that
   * locates a specific sub-schema therein.
   *
   * For example, "schemas/marketing.yaml#/$defs/campaign" would reference the schema
   * at location {"$defs": {"campaign": ...}} within ./schemas/marketing.yaml.
   */
  writeSchema?: {
    [k: string]: unknown;
  };
} & CollectionDef1;
/**
 * Type of a shuffled key component.
 */
export type ShuffleType = "boolean" | "integer" | "string";
/**
 * A Shuffle specifies how a shuffling key is to be extracted from
 * collection documents.
 */
export type Shuffle =
  | "any"
  | {
      key: CompositeKey;
    }
  | {
      lambda: Value;
    };
/**
 * Ordered JSON-Pointers which define how a composite key may be extracted from
 * a collection document.
 */
export type CompositeKey = JsonPointer[];
/**
 * A source collection and details of how it's read.
 */
export type Source = FullSource | Collection;
/**
 * A derivation runtime implementation.
 */
export type DeriveUsing =
  | {
      connector: ConnectorConfig;
    }
  | {
      sqlite: DeriveUsingSqlite;
    }
  | {
      typescript: DeriveUsingTypescript;
    }
  | {
      python: DeriveUsingPython;
    }
  | {
      local: LocalConfig;
    };
/**
 * A CompressionCodec may be applied to compress journal fragments before
 * they're persisted to cloud stoage. The compression applied to a journal
 * fragment is included in its filename, such as ".gz" for GZIP. A
 * collection's compression may be changed at any time, and will affect
 * newly-written journal fragments.
 */
export type CompressionCodec = "NONE" | "GZIP" | "ZSTANDARD" | "SNAPPY" | "GZIP_OFFLOAD_DECOMPRESSION";
/**
 * Projections are named locations within a collection document which
 * may be used for logical partitioning or directly exposed to databases
 * into which collections are materialized.
 *
 * This interface was referenced by `undefined`'s JSON-Schema definition
 * via the `patternProperty` "^([^/~]|(~[01]))+(/([^/~]|(~[01]))+)*$".
 */
export type Projection =
  | JsonPointer
  | {
      location: JsonPointer;
      partition?: boolean;
    };
export type CollectionDef1 =
  | {
      readSchema?: {
        [k: string]: unknown;
      };
      writeSchema?: {
        [k: string]: unknown;
      };
    }
  | {
      schema?: {
        [k: string]: unknown;
      };
    };
/**
 * A URL identifying a resource, which may be a relative local path
 * with respect to the current resource (i.e, ../path/to/flow.yaml),
 * or may be an external absolute URL (i.e., http://example/flow.yaml).
 */
export type RelativeUrl = string;
/**
 * Field names a projection of a document location. They may include '/',
 * but cannot begin or end with one.
 * Many Fields are automatically inferred by Flow from a collection JSON Schema,
 * and are the JSON Pointer of the document location with the leading '/' removed.
 * User-provided Fields which act as a logical partitions are restricted to
 * Unicode letters, numbers, '-', '_', or '.'
 */
export type Field = string;
/**
 * Available selection modes and their meanings:
 *  `false`/`0` = Only fields required by the user or the connector are materialized.
 *  `1` = Only top-level fields are selected.
 *  `2` = Second-level fields are selected, or top-level fields having no children.
 *  `3`, `4`, ... = Further levels of nesting are selected.
 *  `true` = Select nested fields regardless of their depth.
 */
export type RecommendedDepth = boolean | number;
/**
 * An Endpoint connector used for Flow materializations.
 */
export type MaterializationEndpoint =
  | {
      connector: ConnectorConfig;
    }
  | {
      local: LocalConfig;
    }
  | {
      dekaf: DekafConfig;
    };
export type SourceType = Capture | SourceDef;
/**
 * Capture names are paths of Unicode letters, numbers, '-', '_', or '.'.
 * Each path component is separated by a slash '/',
 * and a name may not begin or end in a '/'.
 */
export type Capture = string;
/**
 * Naming strategy for materialization binding resource names.
 *
 * Controls how collection names are mapped to destination table and schema
 * names when bindings are added. Only applies to connectors whose
 * destination system supports schemas.
 *
 * Given a collection like `acmeCo/marketing/mySchema/myTable`, all
 * strategies use the last two path segments: `mySchema` and `myTable`.
 *
 * Template fields use mustache-style substitution to wrap computed names
 * (e.g. `"staging_{{table}}"` produces `"staging_myTable"`).
 */
export type TargetNamingStrategy =
  | {
      /**
       * Template for the schema name. `{{schema}}` is replaced with
       * the second-to-last path segment (e.g. `mySchema`).
       */
      schemaTemplate?: string;
      strategy: "matchSourceStructure";
      /**
       * Template for the table name. `{{table}}` is replaced with
       * the last path segment (e.g. `myTable`).
       */
      tableTemplate?: string;
    }
  | {
      /**
       * The destination schema name.
       */
      schema: string;
      strategy: "singleSchema";
      /**
       * Template for the table name. `{{table}}` is replaced with
       * the last path segment (e.g. `myTable`).
       */
      tableTemplate?: string;
    }
  | {
      /**
       * The destination schema name.
       */
      schema: string;
      /**
       * When true, omit the prefix for common default schema names
       * like "public" or "dbo".
       */
      skipCommonDefaults?: boolean;
      strategy: "prefixTableNames";
      /**
       * Template for the table name. `{{table}}` is replaced with
       * the already-prefixed name (e.g. `mySchema_myTable`).
       */
      tableTemplate?: string;
    };
/**
 * A test step describes either an "ingest" of document fixtures into a
 * collection, or a "verify" of expected document fixtures from a collection.
 */
export type TestStep =
  | {
      ingest: TestStepIngest;
    }
  | {
      verify: TestStepVerify;
    };

/**
 * A Capture binds an external system and target (e.x., a SQL table or cloud storage bucket)
 * from which data should be continuously captured, with a Flow collection into that captured
 * data is ingested. Multiple Captures may be bound to a single collection, but only one
 * capture may exist for a given endpoint and target.
 *
 * This interface was referenced by `undefined`'s JSON-Schema definition
 * via the `patternProperty` "^[\p{Letter}\p{Number}\-_\.]+(/[\p{Letter}\p{Number}\-_\.]+)*$".
 */
export interface CaptureDef {
  autoDiscover?: AutoDiscover;
  bindings: CaptureBinding[];
  /**
   * When true, a publication will delete this capture.
   */
  delete?: boolean;
  endpoint: CaptureEndpoint;
  /**
   * When present, a publication of the capture will fail if the
   * last publication ID in the control plane doesn't match this value.
   */
  expectPubId?: string;
  /**
   * Configured intervals are applicable only to connectors which are
   * unable to continuously tail their source, and which instead produce
   * a current quantity of output and then exit. Flow will start the
   * connector again after the given interval of time has passed.
   *
   * Intervals are relative to the start of an invocation and not its completion.
   * For example, if the interval is five minutes, and an invocation of the
   * capture finishes after two minutes, then the next invocation will be started
   * after three additional minutes.
   */
  interval?: string | null;
  /**
   * When provided, this base64-encoded salt is used instead of a generated one.
   */
  redactSalt?: string;
  /**
   * Publishing a value of `true` will reset this capture, which is
   * equivalent to deleting and then re-creating the capture but
   * applied as a single publication.
   */
  reset?: boolean;
  /**
   * Maps the name of a secret to a JSON pointer within the endpoint
   * configuration. On task start, the resolved value is applied into
   * the specified location as an RFC 7396 JSON merge patch.
   *
   * A configuration using `secrets` may not also be sealed with `sops`.
   */
  secrets?: {
    [k: string]: JsonPointer;
  };
  shards?: ShardTemplate;
}
/**
 * Settings to determine how Flow should stay abreast of ongoing changes to collections and schemas.
 */
export interface AutoDiscover {
  /**
   * Automatically add new bindings discovered from the source.
   */
  addNewBindings?: boolean;
  /**
   * Whether to automatically evolve collections and/or materialization
   * bindings to handle changes to collections that would otherwise be
   * incompatible with the existing catalog.
   */
  evolveIncompatibleCollections?: boolean;
}
export interface CaptureBinding {
  /**
   * Every increment of this counter will result in a new backfill of this
   * binding from the captured endpoint. For example when capturing from a
   * SQL table, incrementing this counter will cause the table to be
   * re-captured in its entirety from the source database.
   *
   * Note that a backfill does *not* truncate the target collection,
   * and documents published by a backfilled binding will coexist with
   * (and be ordered after) any documents which were published as part
   * of a preceding backfill.
   */
  backfill?: number;
  /**
   * Disabled bindings are inactive, and not validated.
   * They can be used to represent discovered resources that are
   * intentionally not being captured.
   */
  disable?: boolean;
  resource: Value;
  target: Collection;
}
/**
 * Connector image and configuration specification.
 */
export interface ConnectorConfig {
  config: Value;
  image: string;
}
/**
 * Local command and its configuration.
 */
export interface LocalConfig {
  command: string[];
  config: Value;
  env?: {
    [k: string]: string;
  };
  protobuf?: boolean;
}
/**
 * A ShardTemplate configures how shards process a catalog task.
 */
export interface ShardTemplate {
  disable?: boolean;
  /**
   * Flag names must be valid tokens (Unicode letters, numbers, '-', '_', '.').
   * Each flag produces a shard label `estuary.dev/flag/<name>`.
   */
  flags?: {
    [k: string]: Token;
  };
  /**
   * Hot standbys of a shard actively replicate the shard's state to another
   * machine, and are able to be quickly promoted to take over processing for
   * the shard should its current primary fail.
   * If not set, then no hot standbys are maintained.
   * EXPERIMENTAL: this field MAY be removed.
   */
  hotStandbys?: number;
  /**
   * Log levels may currently be "error", "warn", "info", "debug", or "trace".
   * If not set, the effective log level is "info".
   */
  logLevel?: string;
  /**
   * This duration upper-bounds the amount of time during which a transaction
   * may process documents before it must flush and commit.
   * It may run for less time if there aren't additional ready documents for
   * it to process.
   * If not set, the maximum duration defaults to twenty minutes for materializations,
   * and one second for captures and derivations.
   * EXPERIMENTAL: this field MAY be removed.
   */
  maxTxnDuration?: string | null;
  /**
   * This duration lower-bounds the amount of time during which a transaction
   * must process documents before it must flush and commit.
   * It may run for more time if additional documents are available.
   * The default value is zero seconds.
   * Larger values may result in more data reduction, at the cost of
   * more latency.
   * EXPERIMENTAL: this field MAY be removed.
   */
  minTxnDuration?: string | null;
  /**
   * Larger values are recommended for tasks having more than one
   * shard split and long, bursty transaction durations.
   * If not set, a reasonable default (currently 4,096) is used.
   * EXPERIMENTAL: this field is LIKELY to be removed.
   */
  readChannelSize?: number;
  /**
   * The ring buffer is a performance optimization only:
   * catalog tasks will replay portions of journals as
   * needed when messages aren't available in the buffer.
   * It can remain small if upstream task transactions are small,
   * but larger transactions will achieve better performance with a
   * larger ring.
   * If not set, a reasonable default (currently 65,536) is used.
   * EXPERIMENTAL: this field is LIKELY to be removed.
   */
  ringBufferSize?: number;
  /**
   * Bounds the aggregate size of buffered, sealed shuffle segment files on a
   * shard's disk. When exceeded, the shuffle reader back-pressures upstream
   * journal reads (released once the backlog falls below half).
   * If not set, the data-plane default (currently 2 GiB) is used.
   * EXPERIMENTAL: this field MAY be removed.
   */
  shuffleDiskLimit?: number;
}
/**
 * Derive specifies how a collection is derived from other collections.
 */
export interface Derivation {
  /**
   * When provided, this base64-encoded salt is used instead of a generated one.
   */
  redactSalt?: string;
  /**
   * Maps the name of a secret to a JSON pointer within the endpoint
   * configuration. On task start, the resolved value is applied into
   * the specified location as an RFC 7396 JSON merge patch.
   *
   * A configuration using `secrets` may not also be sealed with `sops`.
   */
  secrets?: {
    [k: string]: JsonPointer;
  };
  shards?: ShardTemplate;
  /**
   * Typically you omit this and Flow infers it from your transform shuffle keys.
   * In some circumstances, Flow may require that you explicitly tell it of
   * your shuffled key types.
   */
  shuffleKeyTypes?: ShuffleType[];
  transforms: TransformDef[];
  using: DeriveUsing;
}
/**
 * A Transform reads and shuffles documents of a source collection,
 * and processes each document through either one or both of a register
 * "update" lambda and a derived document "publish" lambda.
 */
export interface TransformDef {
  /**
   * Every increment of this counter will result in a new backfill of this
   * transform. Specifically, the transform's lambda will be re-invoked for
   * every applicable document of its source collection.
   *
   * Note that a backfill does *not* truncate the derived collection,
   * and documents published by a backfilled transform will coexist with
   * (and be ordered after) any documents which were published as part
   * of a preceding backfill.
   */
  backfill?: number;
  /**
   * Disabled transforms are completely ignored at runtime and are not validated.
   */
  disable?: boolean;
  /**
   * Lambdas may be provided inline,
   * or as a relative URL to a file containing the lambda.
   */
  lambda?: {
    [k: string]: unknown;
  };
  /**
   * The names of transforms within a derivation must be unique and stable.
   */
  name: string;
  /**
   * When all transforms are of equal priority, Flow processes documents
   * according to their associated publishing time, as encoded in the
   * document UUID.
   *
   * However, when one transform has a higher priority than others,
   * then *all* ready documents are processed through the transform
   * before *any* documents of other transforms are processed.
   *
   * Priority may be negative, which de-prioritizes a transform with
   * respect to transforms having the default priority of zero.
   */
  priority?: number;
  /**
   * Delays are applied as an adjustment to the UUID clock encoded within each
   * document, which is then used to impose a relative ordering of all documents
   * read by this derivation. This means that read delays are applied in a
   * consistent way, even when back-filling over historical documents. When caught
   * up and tailing the source collection, delays also "gate" documents such that
   * they aren't processed until the current wall-time reflects the delay.
   */
  readDelay?: string | null;
  shuffle: Shuffle;
  source: Source;
}
/**
 * A source collection and details of how it's read.
 */
export interface FullSource {
  name: Collection;
  /**
   * Source collection documents published after this date-time are filtered.
   * `notAfter` is *only* a filter. Updating its value will not cause Flow
   * to re-process documents that have already been read.
   * Optional. Default is to process all documents.
   */
  notAfter?: string | null;
  /**
   * Source collection documents published before this date-time are filtered.
   * `notBefore` is *only* a filter. Updating its value will not cause Flow
   * to re-process documents that have already been read.
   * Optional. Default is to process all documents.
   */
  notBefore?: string | null;
  partitions?: PartitionSelector;
}
/**
 * Partition selectors identify a desired subset of the
 * available logical partitions of a collection.
 */
export interface PartitionSelector {
  /**
   * Partition field names and values which are excluded from the source
   * collection. Any documents matching *any one* of the partition values
   * will be excluded.
   */
  exclude?: {
    [k: string]: unknown[];
  };
  /**
   * Partition field names and corresponding values which must be matched
   * from the Source collection. Only documents having one of the specified
   * values across all specified partition names will be matched. For example,
   *   source: [App, Web]
   *   region: [APAC]
   * would mean only documents of 'App' or 'Web' source and also occurring
   * in the 'APAC' region will be processed.
   */
  include?: {
    [k: string]: unknown[];
  };
}
export interface DeriveUsingSqlite {
  /**
   * Migrations may be provided as an inline string,
   * or as a relative URL to a file containing the migration SQL.
   */
  migrations?: string[];
}
export interface DeriveUsingTypescript {
  environment?: {
    [k: string]: string;
  };
  /**
   * Module is either a relative URL of a TypeScript module file,
   * or is an inline representation of a Typescript module.
   * The module must have a exported Derivation variable which
   * is an instance implementing the corresponding Derivation
   * interface.
   */
  module: string;
}
export interface DeriveUsingPython {
  /**
   * Map of package name to version specifier (e.g., {"httpx": ">=0.27", "pydantic": ">=2.0"}).
   * These dependencies will be included in the generated pyproject.toml.
   */
  dependencies?: {
    [k: string]: string;
  };
  environment?: {
    [k: string]: string;
  };
  /**
   * Module is either a relative URL of a Python module file,
   * or is an inline representation of a Python module.
   * The module must have an exported Derivation class which
   * extends the generated IDerivation base class.
   */
  module: string;
}
/**
 * A JournalTemplate configures the journals which make up the
 * physical partitions of a collection.
 */
export interface JournalTemplate {
  fragments: FragmentTemplate;
}
/**
 * A FragmentTemplate configures how journal fragment files are
 * produced as part of a collection.
 */
export interface FragmentTemplate {
  compressionCodec?: CompressionCodec;
  /**
   * into cloud storage. Intervals are converted into uniform time segments:
   * 24h will "roll" all fragments at midnight UTC every day, 1h at the top of
   * every hour, 15m a :00, :15, :30, :45 past the hour, and so on.
   * If not set, then fragments are not flushed on time-based intervals.
   */
  flushInterval?: string | null;
  /**
   * When a collection journal fragment reaches this threshold, it will be
   * closed off and pushed to cloud storage.
   * If not set, a default of 512MB is used.
   */
  length?: number;
  /**
   * If not set, then fragments are retained indefinitely.
   */
  retention?: string | null;
}
/**
 * A Materialization binds a Flow collection with an external system & target
 * (e.x, a SQL table) into which the collection is to be continuously materialized.
 *
 * This interface was referenced by `undefined`'s JSON-Schema definition
 * via the `patternProperty` "^[\p{Letter}\p{Number}\-_\.]+(/[\p{Letter}\p{Number}\-_\.]+)*$".
 */
export interface MaterializationDef {
  bindings: MaterializationBinding[];
  /**
   * When true, a publication will delete this materialization.
   */
  delete?: boolean;
  endpoint: MaterializationEndpoint;
  /**
   * When present, a publication of the materialization will fail if the
   * last publication ID in the control plane doesn't match this value.
   */
  expectPubId?: string;
  /**
   * This can be overridden on a per-binding basis.
   */
  onIncompatibleSchemaChange?: "abort" | "backfill" | "disableBinding" | "disableTask";
  /**
   * Publishing a value of `true` will reset this materialization, which is
   * equivalent to deleting and then re-creating the materialization but
   * applied as a single publication.
   */
  reset?: boolean;
  /**
   * Maps the name of a secret to a JSON pointer within the endpoint
   * configuration. On task start, the resolved value is applied into
   * the specified location as an RFC 7396 JSON merge patch.
   *
   * A configuration using `secrets` may not also be sealed with `sops`.
   */
  secrets?: {
    [k: string]: JsonPointer;
  };
  shards?: ShardTemplate;
  source?: SourceType;
  syncSchedule?: SyncSchedule | null;
  /**
   * Controls how collection names are mapped to destination table and schema
   * names when bindings are added. Only applies to connectors whose
   * destination system supports schemas.
   */
  targetNaming?: TargetNamingStrategy | null;
  triggers?: Triggers | null;
}
export interface MaterializationBinding {
  /**
   * Every increment of this counter will result in a new backfill of this
   * binding from its source collection to its materialized resource.
   * For example when materializing to a SQL table, incrementing this counter
   * causes the table to be dropped and then rebuilt by re-reading the source
   * collection.
   */
  backfill?: number;
  /**
   * Disabled bindings are inactive, and not validated.
   */
  disable?: boolean;
  fields?: MaterializationFields;
  /**
   * This setting is used to determine the action to take when a schema change
   * is rejected due to incompatibility with the target resource. By default,
   * the binding will have its `backfill` counter incremented, causing it to
   * be re-materialized from the source collection.
   */
  onIncompatibleSchemaChange?: "abort" | "backfill" | "disableBinding" | "disableTask";
  /**
   * When all bindings are of equal priority, Flow processes documents
   * according to their associated publishing time, as encoded in the
   * document UUID.
   *
   * However, when one binding has a higher priority than others,
   * then *all* ready documents are processed through the binding
   * before *any* documents of other bindings are processed.
   *
   * Priority may be negative, which de-prioritizes a binding with
   * respect to bindings having the default priority of zero.
   */
  priority?: number;
  resource: Value;
  source: Source;
}
/**
 * MaterializationFields defines a selection of projections to materialize,
 * as well as optional per-projection, driver-specific configuration.
 */
export interface MaterializationFields {
  /**
   * This removes from recommended projections, where enabled.
   */
  exclude?: Field[];
  /**
   * If not specified, the key of the source collection is used.
   * Materialization bindings may select an ordered subset of scalar fields
   * which will be grouped over, resulting in a natural index over the chosen
   * group-by key. Fields may or may not be part of the collection key.
   */
  groupBy?: Field[];
  recommended: RecommendedDepth;
  /**
   * This supplements any selected fields, where enabled.
   * Values are passed to and interpreted by the connector, which may use it
   * to customize DDL generation or other behaviors with respect to the field.
   * Consult connector documentation to see what it supports.
   *
   * Note that this field has been renamed from `include`,
   * which will continue to be accepted as an alias.
   */
  require?: {
    [k: string]: Value;
  };
}
/**
 * Dekaf service configuration
 */
export interface DekafConfig {
  config: Value;
  /**
   * Since we support integrating with a bunch of different providers via Dekaf,
   * this allows us to store which of those connector variants this particular Dekaf connector was
   * created as, in order to e.g link to the correct docs URL, show the correct name and logo, etc.
   */
  variant: string;
}
/**
 * Specifies configuration for source captures, and defaults for new bindings
 * that are added to the materialization. Changing these defaults has no effect
 * on existing bindings.
 */
export interface SourceDef {
  /**
   * Capture names are paths of Unicode letters, numbers, '-', '_', or '.'.
   * Each path component is separated by a slash '/',
   * and a name may not begin or end in a '/'.
   */
  capture: string;
  /**
   * New bindings will apply this as their delta-updates setting.
   */
  deltaUpdates?: boolean;
  fieldsRecommended?: RecommendedDepth;
  /**
   * New bindings will apply the naming convention to determine the
   * target's name and schema within the endpoint.
   */
  targetNaming?: "noSchema" | "withSchema" | "prefixSchema" | "prefixNonDefaultSchema";
}
/**
 * Controls how often a materialization commits transactions, trading data
 * freshness for reduced destination compute cost. When caught up, the runtime
 * holds an open transaction (continuing to combine new documents) until the
 * next scheduled instant, rather than committing continuously.
 *
 * The base interval applies 24/7, and any number of non-overlapping recurring
 * local-time windows may each be given their own interval, which applies
 * while that window is active.
 */
export interface SyncSchedule {
  /**
   * Interval between transaction commits when the materialization is caught
   * up, at all times not covered by a window. A value of zero commits as
   * fast as possible.
   */
  baseInterval: string | null;
  /**
   * IANA timezone name (e.g. `America/New_York`) or `+HH:MM` offset in
   * which window times and days are interpreted. Required when windows are
   * configured.
   */
  timezone?: string;
  /**
   * Recurring local-time windows, each with its own commit interval which
   * applies instead of the base interval while the window is active.
   * Windows must not overlap.
   */
  windows?: Window[];
}
/**
 * A recurring local-time window and the commit interval effective within it.
 */
export interface Window {
  /**
   * Days of the week on which the window applies (e.g. `[Mon, Fri]`).
   * All days if not set.
   */
  days?: ("Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun")[];
  /**
   * Local time of day (`HH:MM`) at which the window closes. The window may
   * straddle midnight (`end` earlier than `start`).
   */
  end: string;
  /**
   * Interval between transaction commits while the window is active.
   * A value of zero commits as fast as possible.
   */
  interval: string | null;
  /**
   * Local time of day (`HH:MM`) at which the window opens.
   */
  start: string;
}
/**
 * Webhook triggers that fire upon materialization transaction completion.
 */
export interface Triggers {
  /**
   * List of webhook triggers to fire when new data is materialized.
   */
  config: TriggerConfig[];
  /**
   * A burst of transactions within the interval collapses into a single
   * delivery covering the full span.
   */
  interval?: string | null;
}
/**
 * Configuration for a webhook trigger that fires when new data is
 * materialized to the endpoint.
 */
export interface TriggerConfig {
  headers?: {
    [k: string]: string;
  };
  /**
   * The task is failed if all attempts are exhausted without a successful delivery.
   */
  maxAttempts?: number;
  /**
   * HTTP method for the webhook request.
   */
  method?: "POST" | "PUT" | "PATCH";
  payloadTemplate: string;
  /**
   * The task is failed if all attempts are exhausted without a successful delivery.
   */
  timeout?: string | null;
  url: string;
}
/**
 * Test the behavior of reductions and derivations, through a sequence of test steps.
 *
 * This interface was referenced by `undefined`'s JSON-Schema definition
 * via the `patternProperty` "^[\p{Letter}\p{Number}\-_\.]+(/[\p{Letter}\p{Number}\-_\.]+)*$".
 */
export interface TestDef {
  /**
   * When true, a publication will delete this test.
   */
  delete?: boolean;
  description?: string;
  /**
   * When present, a publication of the test will fail if the
   * last publication ID in the control plane doesn't match this value.
   */
  expectPubId?: string;
  steps: TestStep[];
}
/**
 * An ingestion test step ingests document fixtures into the named
 * collection.
 */
export interface TestStepIngest {
  collection: Collection;
  description?: string;
  /**
   * Each document must conform to the collection's schema.
   */
  documents: {
    [k: string]: unknown;
  };
}
/**
 * A verification test step verifies that the contents of the named
 * collection match the expected fixtures, after fully processing all
 * preceding ingestion test steps.
 */
export interface TestStepVerify {
  collection: Source;
  description?: string;
  /**
   * Each document may contain only a portion of the matched document's
   * properties, and any properties present in the actual document but
   * not in this document fixture are ignored. All other values must
   * match or the test will fail.
   */
  documents: {
    [k: string]: unknown;
  };
}
