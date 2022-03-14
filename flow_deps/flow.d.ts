export type catalog = /* Catalog Each catalog source defines a portion of a Flow Catalog, by defining collections, derivations, tests, and materializations of the Catalog. Catalog sources may reference and import other sources, in order to collections and other entities that source defines. */ {
    "$schema"?: /* JSON-Schema against which the Catalog is validated. */ string | null;
    captures?: /* Captures of this Catalog. */ {
        [k: string]: CaptureDef;
    };
    collections?: /* Collections of this Catalog. */ {
        [k: string]: CollectionDef;
    };
    import?: /* Import other Flow catalog sources. By importing another Flow catalog source, the collections, schemas, and derivations it defines become usable within this Catalog source. Each import is an absolute URI, or a URI which is relative to this source location. */ Import[];
    materializations?: /* Materializations of this Catalog. */ {
        [k: string]: MaterializationDef;
    };
    npmDependencies?: /* NPM package dependencies of the Catalog. Dependencies are included when building the catalog's build NodeJS package, as {"package-name": "version"}. I.e. {"moment": "^2.24"}.

Version strings can take any form understood by NPM. See https://docs.npmjs.com/files/package.json#dependencies */ {
        [k: string]: string;
    };
    resources?: /* Inlined resources of the catalog. Inline resources are intended for Flow API clients (only), and are used to bundle multiple resources into a single POSTed catalog document. Each key must be an absolute URL which is referenced from elsewhere in the Catalog, which is also the URL from which this resource was fetched. */ {
        [k: string]: ResourceDef;
    };
    storageMappings?: {
        [k: string]: StorageDef;
    };
    tests?: /* Tests of this Catalog. */ {
        [k: string]: TestStep[];
    };
};

export type BucketType = /* BucketType is a provider of object storage buckets, which are used to durably storage journal fragments. */ "AZURE" | "GCS" | "S3";

export type Capture = /* Capture names are paths of Unicode letters, numbers, '-', '_', or '.'. Each path component is separated by a slash '/', and a name may not begin or end in a '/'. */ string;

export type CaptureBinding = {
    resource: /* Endpoint resource to capture from. */ {
        [k: string]: unknown;
    };
    target: /* Name of the collection to capture into. */ Collection;
};

export type CaptureDef = /* A Capture binds an external system and target (e.x., a SQL table or cloud storage bucket) from which data should be continuously captured, with a Flow collection into that captured data is ingested. Multiple Captures may be bound to a single collection, but only one capture may exist for a given endpoint and target. */ {
    bindings: /* Bound collections to capture from the endpoint. */ CaptureBinding[];
    endpoint: /* Endpoint to capture from. */ CaptureEndpoint;
    interval?: /* Interval of time between invocations of the capture. Configured intervals are applicable only to connectors which are unable to continuously tail their source, and which instead produce a current quantity of output and then exit. Flow will start the connector again after the given interval of time has passed.

Intervals are relative to the start of an invocation and not its completion. For example, if the interval is five minutes, and an invocation of the capture finishes after two minutes, then the next invocation will be started after three additional minutes. */ string | null;
    shards?: /* Template for shards of this capture task. */ ShardTemplate;
};

export type CaptureEndpoint = /* An Endpoint connector used for Flow captures. */ {
    connector?: ConnectorConfig;
    ingest?: IngestConfig;
};

export type Collection = /* Collection names are paths of Unicode letters, numbers, '-', '_', or '.'. Each path component is separated by a slash '/', and a name may not begin or end in a '/'. */ string;

export type CollectionDef = /* Collection describes a set of related documents, where each adheres to a common schema and grouping key. Collections are append-only: once a document is added to a collection, it is never removed. However, it may be replaced or updated (either in whole, or in part) by a future document sharing its key. Each new document of a given key is "reduced" into existing documents of the key. By default, this reduction is achieved by completely replacing the previous document, but much richer reduction behaviors can be specified through the use of annotated reduction strategies of the collection schema. */ {
    derivation?: /* Derivation which builds this collection from others. */ {
        register?: /* Register configuration of this derivation. */ Register;
        shards?: /* Template for shards of this derivation task. */ ShardTemplate;
        transform: /* Transforms which make up this derivation. */ {
            [k: string]: TransformDef;
        };
    } | null;
    journals?: /* Template for journals of this collection. */ JournalTemplate;
    key: /* Composite key of this collection. */ CompositeKey;
    projections?: /* Projections and logical partitions of this collection. */ {
        [k: string]: Projection;
    };
    schema: /* Schema against which collection documents are validated and reduced. */ Schema;
};

export type CompositeKey = /* Ordered JSON-Pointers which define how a composite key may be extracted from a collection document. */ JsonPointer[];

export type CompressionCodec = /* A CompressionCodec may be applied to compress journal fragments before they're persisted to cloud stoage. The compression applied to a journal fragment is included in its filename, such as ".gz" for GZIP. A collection's compression may be changed at any time, and will affect newly-written journal fragments. */ "GZIP" | "GZIP_OFFLOAD_DECOMPRESSION" | "NONE" | "SNAPPY" | "ZSTANDARD";

export type Config = /* A configuration which is either defined inline, or is a relative or absolute URI to a configuration file. */ {
    [k: string]: unknown;
} | string;

export type ConnectorConfig = /* Connector image and configuration specification. */ {
    config: /* Configuration of the connector. */ Config;
    image: /* Image of the connector. */ string;
};

export type ContentType = /* ContentType is the type of an imported resource's content. */ "CATALOG" | "CONFIG" | "DOCUMENTS_FIXTURE" | "JSON_SCHEMA" | "TYPESCRIPT_MODULE";

export type Derivation = /* A derivation specifies how a collection is derived from other collections. A collection without a derivation is a "captured" collection, into which documents are directly ingested. */ {
    register?: /* Register configuration of this derivation. */ Register;
    shards?: /* Template for shards of this derivation task. */ ShardTemplate;
    transform: /* Transforms which make up this derivation. */ {
        [k: string]: TransformDef;
    };
};

export type Field = /* Field names a projection of a document location. They may include '/', but cannot begin or end with one. Many Fields are automatically inferred by Flow from a collection JSON Schema, and are the JSON Pointer of the document location with the leading '/' removed. User-provided Fields which act as a logical partitions are restricted to Unicode letters, numbers, '-', '_', or '.' */ string;

export type FragmentTemplate = /* A FragmentTemplate configures how journal fragment files are produced as part of a collection. */ {
    compressionCodec?: /* Codec used to compress Journal Fragments. */ string | null;
    flushInterval?: /* Maximum flush delay before in-progress fragments are closed and persisted into cloud storage. Intervals are converted into uniform time segments: 24h will "roll" all fragments at midnight UTC every day, 1h at the top of every hour, 15m a :00, :15, :30, :45 past the hour, and so on. If not set, then fragments are not flushed on time-based intervals. */ string | null;
    length?: /* Desired content length of each fragment, in megabytes before compression. When a collection journal fragment reaches this threshold, it will be closed off and pushed to cloud storage. If not set, a default of 512MB is used. */ number | null;
    retention?: /* Duration for which historical fragments of a collection should be kept. If not set, then fragments are retained indefinitely. */ string | null;
};

export type Import = /* Import a referenced Resource into the catalog. */ {
    contentType: /* The content-type of the imported resource. */ ContentType;
    url: /* The resource to import. */ RelativeUrl;
} | string;

export type IngestConfig = /* Ingest source specification. */ Record<string, unknown>;

export type JournalTemplate = /* A JournalTemplate configures the journals which make up the physical partitions of a collection. */ {
    fragments: /* Fragment configuration of collection journals. */ FragmentTemplate;
};

export type JsonPointer = /* JSON Pointer which identifies a location in a document. */ string;

export type Lambda = /* Lambdas are user functions which are invoked by the Flow runtime to process and transform source collection documents into derived collections. Flow supports multiple lambda run-times, with a current focus on TypeScript and remote HTTP APIs.

TypeScript lambdas are invoked within on-demand run-times, which are automatically started and scaled by Flow's task distribution in order to best co-locate data and processing, as well as to manage fail-over.

Remote lambdas may be called from many Flow tasks, and are up to the API provider to provision and scale. */ {
    remote: string;
} | string;

export type Materialization = /* Materialization names are paths of Unicode letters, numbers, '-', '_', or '.'. Each path component is separated by a slash '/', and a name may not begin or end in a '/'. */ string;

export type MaterializationBinding = {
    fields?: /* Selected projections for this materialization. */ MaterializationFields;
    partitions?: /* Selector over partitions of the source collection to read. */ {
        exclude?: /* Partition field names and values which are excluded from the source collection. Any documents matching *any one* of the partition values will be excluded. */ {
            [k: string]: unknown[];
        };
        include?: /* Partition field names and corresponding values which must be matched from the Source collection. Only documents having one of the specified values across all specified partition names will be matched. For example, source: [App, Web] region: [APAC] would mean only documents of 'App' or 'Web' source and also occurring in the 'APAC' region will be processed. */ {
            [k: string]: unknown[];
        };
    } | null;
    resource: /* Endpoint resource to materialize into. */ {
        [k: string]: unknown;
    };
    source: /* Name of the collection to be materialized. */ Collection;
};

export type MaterializationDef = /* A Materialization binds a Flow collection with an external system & target (e.x, a SQL table) into which the collection is to be continuously materialized. */ {
    bindings: /* Bound collections to materialize into the endpoint. */ MaterializationBinding[];
    endpoint: /* Endpoint to materialize into. */ MaterializationEndpoint;
    shards?: /* Template for shards of this materialization task. */ ShardTemplate;
};

export type MaterializationEndpoint = /* An Endpoint connector used for Flow materializations. */ {
    connector?: ConnectorConfig;
    sqlite?: SqliteConfig;
};

export type MaterializationFields = /* MaterializationFields defines a selection of projections to materialize, as well as optional per-projection, driver-specific configuration. */ {
    exclude?: /* Fields to exclude. This removes from recommended projections, where enabled. */ Field[];
    include?: /* Fields to include. This supplements any recommended fields, where enabled. Values are passed through to the driver, e.x. for customization of the driver's schema generation or runtime behavior with respect to the field. */ {
        [k: string]: {
            [k: string]: unknown;
        };
    };
    recommended: /* Should recommended projections for the endpoint be used? */ boolean;
};

export type PartitionSelector = /* Partition selectors identify a desired subset of the available logical partitions of a collection. */ {
    exclude?: /* Partition field names and values which are excluded from the source collection. Any documents matching *any one* of the partition values will be excluded. */ {
        [k: string]: unknown[];
    };
    include?: /* Partition field names and corresponding values which must be matched from the Source collection. Only documents having one of the specified values across all specified partition names will be matched. For example, source: [App, Web] region: [APAC] would mean only documents of 'App' or 'Web' source and also occurring in the 'APAC' region will be processed. */ {
        [k: string]: unknown[];
    };
};

export type Prefix = /* Prefixes are paths of Unicode letters, numbers, '-', '_', or '.'. Each path component is separated by a slash '/'. Prefixes may not begin in a '/', but must end in one. */ string;

export type Projection = /* Projections are named locations within a collection document which may be used for logical partitioning or directly exposed to databases into which collections are materialized. */ {
    location: /* Location of this projection. */ JsonPointer;
    partition?: /* Is this projection a logical partition? */ boolean;
} | string;

export type Publish = /* Publish lambdas take a source document, a current register and (if there is also an "update" lambda) a previous register, and transform them into one or more documents to be published into a derived collection. */ {
    lambda: /* Lambda invoked by the publish. */ Lambda;
};

export type Register = /* Registers are the internal states of a derivation, which can be read and updated by all of its transformations. They're an important building block for joins, aggregations, and other complex stateful workflows.

Registers are implemented using JSON-Schemas, often ones with reduction annotations. When reading source documents, every distinct shuffle key by which the source collection is read is mapped to a corresponding register value (or, if no shuffle key is defined, the source collection's key is used instead).

Then, an "update" lambda of the transformation produces updates which are reduced into the register, and a "publish" lambda reads the current (and previous, if updated) register value. */ {
    initial?: /* Initial value of a keyed register which has never been updated. If not specified, the default is "null". */ unknown;
    schema: /* Schema which validates and reduces register documents. */ Schema;
};

export type RelativeUrl = /* A URL identifying a resource, which may be a relative local path with respect to the current resource (i.e, ../path/to/flow.yaml), or may be an external absolute URL (i.e., http://example/flow.yaml). */ string;

export type ResourceDef = /* A Resource is binary content with an associated ContentType. */ {
    content: /* Byte content of the Resource. */ string;
    contentType: /* Content type of the Resource. */ ContentType;
};

export type Schema = /* A schema is a draft 2020-12 JSON Schema which validates Flow documents. Schemas also provide annotations at document locations, such as reduction strategies for combining one document into another.

Schemas may be defined inline to the catalog, or given as a relative or absolute URI. URIs may optionally include a JSON fragment pointer that locates a specific sub-schema therein.

For example, "schemas/marketing.yaml#/$defs/campaign" would reference the schema at location {"$defs": {"campaign": ...}} within ./schemas/marketing.yaml. */ {
    [k: string]: unknown;
} | boolean | string;

export type ShardTemplate = /* A ShardTemplate configures how shards process a catalog task. */ {
    disable?: /* Disable processing of the task's shards. */ boolean;
    hotStandbys?: /* Number of hot standbys to keep for each task shard. Hot standbys of a shard actively replicate the shard's state to another machine, and are able to be quickly promoted to take over processing for the shard should its current primary fail. If not set, then no hot standbys are maintained. EXPERIMENTAL: this field MAY be removed. */ number | null;
    logLevel?: /* Log level of this tasks's shards. Log levels may currently be "error", "warn", "info", "debug", or "trace". If not set, the effective log level is "info". */ string | null;
    maxTxnDuration?: /* Maximum duration of task transactions. This duration upper-bounds the amount of time during which a transaction may process documents before it must flush and commit. It may run for less time if there aren't additional ready documents for it to process. If not set, the maximum duration defaults to one second. Some tasks, particularly materializations to large analytic warehouses like Snowflake, may benefit from a longer duration such as thirty seconds. EXPERIMENTAL: this field MAY be removed. */ string | null;
    minTxnDuration?: /* Minimum duration of task transactions. This duration lower-bounds the amount of time during which a transaction must process documents before it must flush and commit. It may run for more time if additional documents are available. The default value is zero seconds. Larger values may result in more data reduction, at the cost of more latency. EXPERIMENTAL: this field MAY be removed. */ string | null;
    readChannelSize?: /* Size of the reader channel used for decoded documents. Larger values are recommended for tasks having more than one shard split and long, bursty transaction durations. If not set, a reasonable default (currently 65,536) is used. EXPERIMENTAL: this field is LIKELY to be removed. */ number | null;
    ringBufferSize?: /* Size of the ring buffer used to sequence documents for exactly-once semantics. The ring buffer is a performance optimization only: catalog tasks will replay portions of journals as needed when messages aren't available in the buffer. It can remain small if upstream task transactions are small, but larger transactions will achieve better performance with a larger ring. If not set, a reasonable default (currently 65,536) is used. EXPERIMENTAL: this field is LIKELY to be removed. */ number | null;
};

export type Shuffle = /* A Shuffle specifies how a shuffling key is to be extracted from collection documents. */ {
    key?: CompositeKey;
    lambda?: Lambda;
};

export type SqliteConfig = /* Sqlite endpoint configuration. */ {
    path: /* Path of the database, relative to this catalog source. */ RelativeUrl;
};

export type StorageDef = /* Storage defines the backing cloud storage for journals. */ {
    stores: /* Stores for journal fragments under this prefix. Multiple stores may be specified, and all stores are periodically scanned to index applicable journal fragments. New fragments are always persisted to the first store in the list.

This can be helpful in performing bucket migrations: adding a new store to the front of the list causes ongoing data to be written to that location, while historical data continues to be read and served from the prior stores.

When running `flowctl test`, stores are ignored and a local temporary directory is used instead. */ Store[];
};

export type Store = /* A Store into which Flow journal fragments may be written.

The persisted path of a journal fragment is determined by composing the Store's bucket and prefix with the journal name and a content-addressed fragment file name.

Eg, given a Store to S3 with bucket "my-bucket" and prefix "a/prefix", along with a collection "example/events" having a logical partition "region", then a complete persisted path might be:

s3://my-bucket/a/prefix/example/events/region=EU/utc_date=2021-10-25/utc_hour=13/000123-000456-789abcdef.gzip */ {
    bucket: /* Bucket into which Flow will store data. */ string;
    prefix?: /* Optional prefix of keys written to the bucket. */ string | null;
    provider: BucketType;
};

export type Test = /* Test names are paths of Unicode letters, numbers, '-', '_', or '.'. Each path component is separated by a slash '/', and a name may not begin or end in a '/'. */ string;

export type TestDocuments = /* A test step describes either an "ingest" of document fixtures into a collection, or a "verify" of expected document fixtures from a collection. */ {
    [k: string]: unknown;
}[] | string;

export type TestStep = /* A test step describes either an "ingest" of document fixtures into a collection, or a "verify" of expected document fixtures from a collection. */ {
    ingest?: TestStepIngest;
    verify?: TestStepVerify;
};

export type TestStepIngest = /* An ingestion test step ingests document fixtures into the named collection. */ {
    collection: /* Name of the collection into which the test will ingest. */ Collection;
    description?: /* Description of this test ingestion. */ string;
    documents: /* Documents to ingest. */ TestDocuments;
};

export type TestStepVerify = /* A verification test step verifies that the contents of the named collection match the expected fixtures, after fully processing all preceding ingestion test steps. */ {
    collection: /* Collection into which the test will ingest. */ Collection;
    description?: /* Description of this test verification. */ string;
    documents: /* Documents to verify. */ TestDocuments;
    partitions?: /* Selector over partitions to verify. */ {
        exclude?: /* Partition field names and values which are excluded from the source collection. Any documents matching *any one* of the partition values will be excluded. */ {
            [k: string]: unknown[];
        };
        include?: /* Partition field names and corresponding values which must be matched from the Source collection. Only documents having one of the specified values across all specified partition names will be matched. For example, source: [App, Web] region: [APAC] would mean only documents of 'App' or 'Web' source and also occurring in the 'APAC' region will be processed. */ {
            [k: string]: unknown[];
        };
    } | null;
};

export type Transform = /* Transform names are Unicode letters, numbers, '-', '_', or '.'. */ string;

export type TransformDef = /* A Transform reads and shuffles documents of a source collection, and processes each document through either one or both of a register "update" lambda and a derived document "publish" lambda. */ {
    priority?: /* Priority applied to documents processed by this transform. When all transforms are of equal priority, Flow processes documents according to their associated publishing time, as encoded in the document UUID.

However, when one transform has a higher priority than others, then *all* ready documents are processed through the transform before *any* documents of other transforms are processed. */ number;
    publish?: /* Publish that maps a source document and registers into derived documents of the collection. */ {
        lambda: /* Lambda invoked by the publish. */ Lambda;
    } | null;
    readDelay?: /* Delay applied to documents processed by this transform. Delays are applied as an adjustment to the UUID clock encoded within each document, which is then used to impose a relative ordering of all documents read by this derivation. This means that read delays are applied in a consistent way, even when back-filling over historical documents. When caught up and tailing the source collection, delays also "gate" documents such that they aren't processed until the current wall-time reflects the delay. */ string | null;
    shuffle?: /* Shuffle by which source documents are mapped to registers. If empty, the key of the source collection is used. */ {
        key?: CompositeKey;
        lambda?: Lambda;
    } | null;
    source: /* Source collection read by this transform. */ TransformSource;
    update?: /* Update that maps a source document into register updates. */ {
        lambda: /* Lambda invoked by the update. */ Lambda;
    } | null;
};

export type TransformSource = /* TransformSource defines a transformation source collection and how it's read. */ {
    name: /* Name of the collection to be read. */ Collection;
    partitions?: /* Selector over partition of the source collection to read. */ {
        exclude?: /* Partition field names and values which are excluded from the source collection. Any documents matching *any one* of the partition values will be excluded. */ {
            [k: string]: unknown[];
        };
        include?: /* Partition field names and corresponding values which must be matched from the Source collection. Only documents having one of the specified values across all specified partition names will be matched. For example, source: [App, Web] region: [APAC] would mean only documents of 'App' or 'Web' source and also occurring in the 'APAC' region will be processed. */ {
            [k: string]: unknown[];
        };
    } | null;
    schema?: /* Optional JSON-Schema to validate against the source collection. All data in the source collection is already validated against the schema of that collection, so providing a source schema is only used for _additional_ validation beyond that.

This is useful in building "Extract Load Transform" patterns, where a collection is captured with minimal schema applied (perhaps because it comes from an uncontrolled third party), and is then progressively verified as collections are derived. If None, the principal schema of the collection is used instead. */ {
        [k: string]: unknown;
    } | boolean | string | null;
};

export type Update = /* Update lambdas take a source document and transform it into one or more register updates, which are then reduced into the associated register by the runtime. For example these register updates might update counters, or update the state of a "join" window. */ {
    lambda: /* Lambda invoked by the update. */ Lambda;
};

