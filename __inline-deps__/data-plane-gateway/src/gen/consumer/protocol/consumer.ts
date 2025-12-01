/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface GetHintsResponseResponseHints {
  /** If the hints value does not exist Hints will be nil. */
  hints?: RecoverylogFSMHints;
}

/**
* Etcd represents the effective Etcd MVCC state under which a Gazette broker
is operating in its processing of requests and responses. Its inclusion
allows brokers to reason about relative "happened before" Revision ordering
of apparent routing conflicts in proxied or replicated requests, as well
as enabling sanity checks over equality of Etcd ClusterId (and precluding,
for example, split-brain scenarios where different brokers are backed by
different Etcd clusters). Etcd is kept in sync with
etcdserverpb.ResponseHeader.
*/
export interface HeaderEtcd {
  /**
   * cluster_id is the ID of the cluster.
   * @format uint64
   */
  clusterId?: string;
  /**
   * member_id is the ID of the member.
   * @format uint64
   */
  memberId?: string;
  /**
   * revision is the Etcd key-value store revision when the request was
   * applied.
   * @format int64
   */
  revision?: string;
  /**
   * raft_term is the raft term when the request was applied.
   * @format uint64
   */
  raftTerm?: string;
}

/**
 * Shards of the response.
 */
export interface ListResponseShard {
  /**
   * ShardSpec describes a shard and its configuration, and is the long-lived unit
   * of work and scaling for a consumer application. Each shard is allocated to a
   * one "primary" at-a-time selected from the current processes of a consumer
   * application, and is re-assigned on process fault or exit.
   *
   * ShardSpecs describe all configuration of the shard and its processing,
   * including journals to consume, configuration for processing transactions, its
   * recovery log, hot standbys, etc. ShardSpecs may be further extended with
   * domain-specific labels & values to further define application behavior.
   * ShardSpec is-a allocator.ItemValue.
   */
  spec?: ConsumerShardSpec;
  /**
   * Current ModRevision of the ShardSpec.
   * @format int64
   */
  modRevision?: string;
  /** Route of the shard, including endpoints. */
  route?: ProtocolRoute;
  /** Status of each replica. Cardinality and ordering matches |route|. */
  status?: ConsumerReplicaStatus[];
}

/**
 * ID composes a zone and a suffix to uniquely identify a ProcessSpec.
 */
export interface ProcessSpecID {
  /**
   * "Zone" in which the process is running. Zones may be AWS, Azure, or
   * Google Cloud Platform zone identifiers, or rack locations within a colo,
   * or given some other custom meaning. Gazette will replicate across
   * multiple zones, and seeks to minimize traffic which must cross zones (for
   * example, by proxying reads to a broker in the current zone).
   */
  zone?: string;
  /**
   * Unique suffix of the process within |zone|. It is permissible for a
   * suffix value to repeat across zones, but never within zones. In practice,
   * it's recommended to use a FQDN, Kubernetes Pod name, or comparable unique
   * and self-describing value as the ID suffix.
   */
  suffix?: string;
}

/**
*  - BACKFILL: The replica is actively playing the historical recovery log.
 - STANDBY: The replica has finished playing the historical recovery log and is
live-tailing it to locally mirror recorded operations as they are
produced. It can take over as primary at any time.

Shards not having recovery logs immediately transition to STANDBY.
 - PRIMARY: The replica is actively serving as primary.
 - FAILED: The replica has encountered an unrecoverable error.
*/
export type ReplicaStatusCode = "IDLE" | "BACKFILL" | "STANDBY" | "PRIMARY" | "FAILED";

/**
* Change defines an insertion, update, or deletion to be applied to the set
of ShardSpecs. Exactly one of |upsert| or |delete| must be set.
*/
export interface ConsumerApplyRequestChange {
  /**
   * Expected ModRevision of the current ShardSpec. If the shard is being
   * created, expect_mod_revision is zero.
   * @format int64
   */
  expectModRevision?: string;
  /**
   * ShardSpec to be updated (if expect_mod_revision > 0) or created
   * (if expect_mod_revision == 0).
   */
  upsert?: ConsumerShardSpec;
  /** Shard to be deleted. expect_mod_revision must not be zero. */
  delete?: string;
}

export interface ConsumerApplyResponse {
  /** Status of the Apply RPC. */
  status?: ConsumerStatus;
  /** Header of the response. */
  header?: ProtocolHeader;
  /**
   * Optional extension of the ApplyResponse.
   * @format byte
   */
  extension?: string;
}

export interface ConsumerGetHintsResponse {
  /** Status of the Hints RPC. */
  status?: ConsumerStatus;
  /** Header of the response. */
  header?: ProtocolHeader;
  /** Primary hints for the shard. */
  primaryHints?: GetHintsResponseResponseHints;
  /**
   * List of backup hints for a shard. The most recent recovery log hints will
   * be first, any subsequent hints are for historical backup. If there is no
   * value for a hint key the value corresponding hints will be nil.
   */
  backupHints?: GetHintsResponseResponseHints[];
  /**
   * Optional extension of the GetHintsResponse.
   * @format byte
   */
  extension?: string;
}

export interface ConsumerListRequest {
  /**
   * Selector optionally refines the set of shards which will be enumerated.
   * If zero-valued, all shards are returned. Otherwise, only ShardSpecs
   * matching the LabelSelector will be returned. One meta-label "id" is
   * additionally supported by the selector, where "id=example-shard-ID"
   * will match a ShardSpec with ID "example-shard-ID".
   */
  selector?: ProtocolLabelSelector;
  /**
   * Optional extension of the ListRequest.
   * @format byte
   */
  extension?: string;
}

export interface ConsumerListResponse {
  /** Status of the List RPC. */
  status?: ConsumerStatus;
  /** Header of the response. */
  header?: ProtocolHeader;
  shards?: ListResponseShard[];
  /**
   * Optional extension of the ListResponse.
   * @format byte
   */
  extension?: string;
}

/**
* ReplicaStatus is the status of a ShardSpec assigned to a ConsumerSpec.
It serves as an allocator AssignmentValue. ReplicaStatus is reduced by taking
the maximum enum value among statuses. Eg, if a primary is PRIMARY, one
replica is BACKFILL and the other STANDBY, then the status is PRIMARY. If one
of the replicas transitioned to FAILED, than the status is FAILED. This
reduction behavior is used to summarize status across all replicas.
*/
export interface ConsumerReplicaStatus {
  /**
   *  - BACKFILL: The replica is actively playing the historical recovery log.
   *  - STANDBY: The replica has finished playing the historical recovery log and is
   * live-tailing it to locally mirror recorded operations as they are
   * produced. It can take over as primary at any time.
   *
   * Shards not having recovery logs immediately transition to STANDBY.
   *  - PRIMARY: The replica is actively serving as primary.
   *  - FAILED: The replica has encountered an unrecoverable error.
   */
  code?: ReplicaStatusCode;
  /** Errors encountered during replica processing. Set iff |code| is FAILED. */
  errors?: string[];
}

/**
* ShardSpec describes a shard and its configuration, and is the long-lived unit
of work and scaling for a consumer application. Each shard is allocated to a
one "primary" at-a-time selected from the current processes of a consumer
application, and is re-assigned on process fault or exit.

ShardSpecs describe all configuration of the shard and its processing,
including journals to consume, configuration for processing transactions, its
recovery log, hot standbys, etc. ShardSpecs may be further extended with
domain-specific labels & values to further define application behavior.
ShardSpec is-a allocator.ItemValue.
*/
export interface ConsumerShardSpec {
  /** ID of the shard. */
  id?: string;
  /** Sources of the shard, uniquely ordered on Source journal. */
  sources?: ConsumerShardSpecSource[];
  /**
   * Prefix of the Journal into which the shard's recovery log will be recorded.
   * The complete Journal name is built as "{recovery_log_prefix}/{shard_id}".
   * If empty, the shard does not use a recovery log.
   */
  recoveryLogPrefix?: string;
  /**
   * Prefix of Etcd keys into which recovery log FSMHints are written to and
   * read from. FSMHints allow readers of the recovery log to efficiently
   * determine the minimum fragments of log which must be read to fully recover
   * local store state. The complete hint key written by the shard primary is:
   * "{hint_prefix}/{shard_id}.primary"
   *
   * The primary will regularly produce updated hints into this key, and
   * players of the log will similarly utilize hints from this key.
   * If |recovery_log_prefix| is set, |hint_prefix| must be also.
   */
  hintPrefix?: string;
  /**
   * Backups of verified recovery log FSMHints, retained as a disaster-recovery
   * mechanism. On completing playback, a player will write recovered hints to:
   * "{hints_prefix}/{shard_id}.backup.0".
   *
   * It also move hints previously stored under
   * "{hints_prefix/{shard_id}.backup.0" to
   * "{hints_prefix/{shard_id}.backup.1", and so on, keeping at most
   * |hint_backups| distinct sets of FSMHints.
   * In the case of disaster or data-loss, these copied hints can be an
   * important fallback for recovering a consistent albeit older version of the
   * shard's store, with each relying on only progressively older portions of
   * the recovery log.
   * When pruning the recovery log, log fragments which are older than (and no
   * longer required by) the *oldest* backup are discarded, ensuring that
   * all hints remain valid for playback.
   * @format int32
   */
  hintBackups?: number;
  /**
   * Max duration of shard transactions. This duration upper-bounds the amount
   * of time during which a transaction may process messages before it must
   * flush and commit. It may run for less time if an input message stall occurs
   * (eg, no decoded journal message is ready without blocking). A typical value
   * would be `1s`: applications which perform extensive aggregation over
   * message streams exhibiting locality of "hot" keys may benefit from larger
   * values.
   */
  maxTxnDuration?: string;
  /**
   * Min duration of shard transactions. This duration lower-bounds the amount
   * of time during which a transaction must process messages before it may
   * flush and commit. It may run for more time if additional messages are
   * available (eg, decoded journal messages are ready without blocking). Note
   * also that transactions are pipelined: a current transaction may process
   * messages while a prior transaction's recovery log writes flush to Gazette,
   * but it cannot prepare to commit until the prior transaction writes
   * complete. In other words even if |min_txn_quantum| is zero, some degree of
   * message batching is expected due to the network delay inherent in Gazette
   * writes. A typical value of would be `0s`: applications which perform
   * extensive aggregation may benefit from larger values.
   */
  minTxnDuration?: string;
  /** Disable processing of the shard. */
  disable?: boolean;
  /**
   * Hot standbys is the desired number of consumer processes which should be
   * replicating the primary consumer's recovery log. Standbys are allocated in
   * a separate availability zone of the current primary, and tail the live log
   * to continuously mirror the primary's on-disk DB file structure. Should the
   * primary experience failure, one of the hot standbys will be assigned to
   * take over as the new shard primary, which is accomplished by simply opening
   * its local copy of the recovered store files.
   *
   * Note that under regular operation, shard hand-off is zero downtime even if
   * standbys are zero, as the current primary will not cede ownership until the
   * replacement process declares itself ready. However, without standbys a
   * process failure will leave the shard without an active primary while its
   * replacement starts and completes playback of its recovery log.
   * @format int64
   */
  hotStandbys?: number;
  /**
   * User-defined Labels of this ShardSpec. The label "id" is reserved and may
   * not be used with a ShardSpec's labels.
   */
  labels?: ProtocolLabelSet;
  /**
   * Disable waiting for acknowledgements of pending message(s).
   *
   * If a consumer transaction reads uncommitted messages, it will by default
   * remain open (subject to the max duration) awaiting an acknowledgement of
   * those messages, in the hope that that acknowledgement will be quickly
   * forthcoming and, by remaining open, we can process all messages in this
   * transaction. Effectively we're trading a small amount of increased local
   * latency for a global reduction in end-to-end latency.
   * This works well for acyclic message flows, but can introduce unnecessary
   * stalls if there are message cycles between shards. In the simplest case,
   * a transaction could block awaiting an ACK of a message that it itself
   * produced -- an ACK which can't arrive until the transaction closes.
   */
  disableWaitForAck?: boolean;
  /**
   * Size of the ring buffer used to sequence read-uncommitted messages
   * into consumed, read-committed ones. The ring buffer is a performance
   * optimization only: applications will replay portions of journals as
   * needed when messages aren't available in the buffer.
   * It can remain small if source journal transactions are small,
   * but larger transactions will achieve better performance with a
   * larger ring.
   * If zero, a reasonable default (currently 8192) is used.
   * @format int64
   */
  ringBufferSize?: number;
  /**
   * Size of the channel used to bridge message read and decode with
   * sequencing and consumption. Larger values may reduce data stalls,
   * particularly for larger transactions and/or bursty custom
   * MessageProducer implementations.
   * If zero, a reasonable default (currently 8192) is used.
   * @format int64
   */
  readChannelSize?: number;
}

/**
* Sources define the set of journals which this shard consumes. At least one
Source must be specified, and in many use cases only one will be needed.
For use cases which can benefit, multiple sources may be specified to
represent a "join" over messages of distinct journals.

Note the effective mapping of messages to each of the joined journals
should align (eg, joining a journal of customer updates with one of orders,
where both are mapped on customer ID). This typically means the
partitioning of the two event "topics" must be the same.

Another powerful pattern is to shard on partitions of a high-volume event
stream, and also have each shard join against all events of a low-volume
stream. For example, a shard might ingest and index "viewed product"
events, read a comparably low-volume "purchase" event stream, and on each
purchase publish the bundle of its corresponding prior product views.
*/
export interface ConsumerShardSpecSource {
  /** Journal which this shard is consuming. */
  journal?: string;
  /**
   * Minimum journal byte offset the shard should begin reading from.
   * Typically this should be zero, as read offsets are check-pointed and
   * restored from the shard's Store as it processes. |min_offset| can be
   * useful for shard initialization, directing it to skip over historical
   * portions of the journal not needed for the application's use case.
   * @format int64
   */
  minOffset?: string;
}

export interface ConsumerStatRequest {
  /** Header may be attached by a proxying consumer peer. */
  header?: ProtocolHeader;
  /** Shard to Stat. */
  shard?: string;
  /**
   * Journals and offsets which must be reflected in a completed consumer
   * transaction before Stat returns, blocking if required. Offsets of journals
   * not read by this shard are ignored.
   */
  readThrough?: Record<string, string>;
  /**
   * Optional extension of the StatRequest.
   * @format byte
   */
  extension?: string;
}

export interface ConsumerStatResponse {
  /** Status of the Stat RPC. */
  status?: ConsumerStatus;
  /** Header of the response. */
  header?: ProtocolHeader;
  /**
   * Journals and offsets read through by the most recent completed consumer
   * transaction.
   */
  readThrough?: Record<string, string>;
  /**
   * Journals and offsets this shard has published through, including
   * acknowledgements, as-of the most recent completed consumer transaction.
   *
   * Formally, if an acknowledged message A results in this shard publishing
   * messages B, and A falls within |read_through|, then all messages B & their
   * acknowledgements fall within |publish_at|.
   * The composition of |read_through| and |publish_at| allow CQRS applications
   * to provide read-your-writes consistency, even if written events pass
   * through multiple intermediate consumers and arbitrary transformations
   * before arriving at the materialized view which is ultimately queried.
   */
  publishAt?: Record<string, string>;
  /**
   * Optional extension of the StatResponse.
   * @format byte
   */
  extension?: string;
}

/**
* Status is a response status code, used across Gazette Consumer RPC APIs.

 - SHARD_NOT_FOUND: The named shard does not exist.
 - NO_SHARD_PRIMARY: There is no current primary consumer process for the shard. This is a
temporary condition which should quickly resolve, assuming sufficient
consumer capacity.
 - NOT_SHARD_PRIMARY: The present consumer process is not the assigned primary for the shard,
and was not instructed to proxy the request.
 - ETCD_TRANSACTION_FAILED: The Etcd transaction failed. Returned by Update RPC when an
expect_mod_revision of the UpdateRequest differs from the current
ModRevision of the ShardSpec within the store.
 - SHARD_STOPPED: The current primary shard has stopped, either due to reassignment or
processing failure, and will not make further progress toward the
requested operation.
For example, a Stat RPC will return SHARD_STOPPED if the StatRequest
cannot be satisfied.
*/
export type ConsumerStatus =
  | "OK"
  | "SHARD_NOT_FOUND"
  | "NO_SHARD_PRIMARY"
  | "NOT_SHARD_PRIMARY"
  | "ETCD_TRANSACTION_FAILED"
  | "SHARD_STOPPED";

export interface ConsumerUnassignResponse {
  /** Status of the Unassign RPC. */
  status?: ConsumerStatus;
  /** Shards which had assignments removed. */
  shards?: string[];
}

export interface ProtobufAny {
  typeUrl?: string;
  /** @format byte */
  value?: string;
}

/**
* Header captures metadata such as the process responsible for processing
an RPC, and its effective Etcd state.
*/
export interface ProtocolHeader {
  /**
   * ID of the process responsible for request processing. May be empty iff
   * Header is being used within a proxied request, and that request may be
   * dispatched to any member of the Route.
   */
  processId?: ProcessSpecID;
  /**
   * Route of processes specifically responsible for this RPC, or an empty Route
   * if any process is capable of serving the RPC.
   */
  route?: ProtocolRoute;
  /**
   * Etcd represents the effective Etcd MVCC state under which a Gazette broker
   * is operating in its processing of requests and responses. Its inclusion
   * allows brokers to reason about relative "happened before" Revision ordering
   * of apparent routing conflicts in proxied or replicated requests, as well
   * as enabling sanity checks over equality of Etcd ClusterId (and precluding,
   * for example, split-brain scenarios where different brokers are backed by
   * different Etcd clusters). Etcd is kept in sync with
   * etcdserverpb.ResponseHeader.
   */
  etcd?: HeaderEtcd;
}

/**
* Label defines a key & value pair which can be attached to entities like
JournalSpecs and BrokerSpecs. Labels may be used to provide identifying
attributes which do not directly imply semantics to the core system, but
are meaningful to users or for higher-level Gazette tools.
*/
export interface ProtocolLabel {
  name?: string;
  value?: string;
}

/**
 * LabelSelector defines a filter over LabelSets.
 */
export interface ProtocolLabelSelector {
  /**
   * Include is Labels which must be matched for a LabelSet to be selected. If
   * empty, all Labels are included. An include Label with empty ("") value is
   * matched by a Label of the same name having any value.
   */
  include?: ProtocolLabelSet;
  /**
   * Exclude is Labels which cannot be matched for a LabelSet to be selected. If
   * empty, no Labels are excluded. An exclude Label with empty ("") value
   * excludes a Label of the same name having any value.
   */
  exclude?: ProtocolLabelSet;
}

/**
 * LabelSet is a collection of labels and their values.
 */
export interface ProtocolLabelSet {
  /** Labels of the set. Instances must be unique and sorted over (Name, Value). */
  labels?: ProtocolLabel[];
}

/**
 * Route captures the current topology of an item and the processes serving it.
 */
export interface ProtocolRoute {
  /** Members of the Route, ordered on ascending ProcessSpec.ID (zone, suffix). */
  members?: ProcessSpecID[];
  /**
   * Index of the ProcessSpec serving as primary within |members|,
   * or -1 of no member is currently primary.
   * @format int32
   */
  primary?: number;
  /**
   * Endpoints of each Route member. If not empty, |endpoints| has the same
   * length and order as |members|, and captures the endpoint of each one.
   */
  endpoints?: string[];
}

/**
* FSMHints represents a manifest of Fnodes which were still live (eg, having
remaining links) at the time the FSMHints were produced, as well as any
Properties. It allows a Player of the log to identify minimal Segments which
must be read to recover all Fnodes, and also contains sufficient metadata for
a Player to resolve all possible conflicts it could encounter while reading
the log, to arrive at a consistent view of file state which exactly matches
that of the Recorder producing the FSMHints.
Next tag: 4.
*/
export interface RecoverylogFSMHints {
  /**
   * Log is the implied recovery log of any contained |live_nodes| Segments
   * which omit a |log| value. This implied behavior is both for backward-
   * compatibility (Segments didn't always have a |log| field) and also for
   * compacting the representation in the common case of Segments mostly or
   * entirely addressing a single log.
   */
  log?: string;
  /** Live Fnodes and their Segments as-of the generation of these FSMHints. */
  liveNodes?: RecoverylogFnodeSegments[];
  /** Property files and contents as-of the generation of these FSMHints. */
  properties?: RecoverylogProperty[];
}

/**
 * FnodeSegments captures log Segments containing all RecordedOps of the Fnode.
 */
export interface RecoverylogFnodeSegments {
  /**
   * Fnode being hinted.
   * @format int64
   */
  fnode?: string;
  /**
   * Segments of the Fnode in the log. Currently, FSM tracks only a single
   * Segment per Fnode per Author & Log. A specific implication of this is that Fnodes
   * modified over long periods of time will result in Segments spanning large
   * chunks of the log. For best performance, Fnodes should be opened & written
   * once, and then never be modified again (this is RocksDB's behavior).
   * If supporting this case is desired, FSM will have to be a bit smarter about
   * not extending Segments which gap over significant portions of the log
   * (eg, there's a trade-off to make over size of the hinted manifest, vs
   * savings incurred on playback by being able to skip portions of the log).
   */
  segments?: RecoverylogSegment[];
}

/**
* Property is a small file which rarely changes, and is thus managed
outside of regular Fnode tracking. See FSM.Properties.
*/
export interface RecoverylogProperty {
  /** Filesystem path of this property, relative to the common base directory. */
  path?: string;
  /** Complete file content of this property. */
  content?: string;
}

/**
* Segment is a contiguous chunk of recovery log written by a single Author.
Recorders track Segments they have written, for use in providing hints to
future readers of the log. A key point to understand is that Gazette append
semantics mean that Recorders *cannot know* exactly what offsets their writes
are applied to in the log, nor guarantee that their operations are not being
interleaved with those of other writers. Log Players are aware of these
limitations, and use Segments to resolve conflicts of possible interpretation
of the log. Segments produced by a Player are exact, since Players observe all
recorded operations at their exact offsets.
Next tag: 8.
*/
export interface RecoverylogSegment {
  /**
   * Author which wrote RecordedOps of this Segment.
   * @format int64
   */
  author?: number;
  /**
   * First (lowest) sequence number of RecordedOps within this Segment.
   * @format int64
   */
  firstSeqNo?: string;
  /**
   * First byte offset of the Segment, where |first_seq_no| is recorded.
   * If this Segment was produced by a Recorder, this is guaranteed only to be a
   * lower-bound (eg, a Player reading at this offset may encounter irrelevant
   * operations prior to the RecordedOp indicated by the tuple
   * (|author|, |first_seq_no|, |first_checksum|). If a Player produced the Segment,
   * first_offset is exact.
   * @format int64
   */
  firstOffset?: string;
  /**
   * Checksum of the RecordedOp having |first_seq_no|.
   * @format int64
   */
  firstChecksum?: number;
  /**
   * Last (highest, inclusive) sequence number of RecordedOps within this Segment.
   * @format int64
   */
  lastSeqNo?: string;
  /**
   * Last offset (exclusive) of the Segment. Zero means the offset is not known
   * (eg, because the Segment was produced by a Recorder).
   * @format int64
   */
  lastOffset?: string;
  /** Log is the Journal holding this Segment's data, and to which offsets are relative. */
  log?: string;
}

export interface RuntimeError {
  error?: string;
  /** @format int32 */
  code?: number;
  message?: string;
  details?: ProtobufAny[];
}
