/**
* Change defines an insertion, update, or deletion to be applied to the set
of JournalSpecs. Exactly one of |upsert| or |delete| must be set.
*/
export interface ApplyRequestChange {
    /**
     * Expected ModRevision of the current JournalSpec. If the Journal is being
     * created, expect_mod_revision is zero.
     * @format int64
     */
    expectModRevision?: string;
    /**
     * JournalSpec to be updated (if expect_mod_revision > 0) or created
     * (if expect_mod_revision == 0).
     */
    upsert?: ProtocolJournalSpec;
    /** Journal to be deleted. expect_mod_revision must not be zero. */
    delete?: string;
}
/**
 * Fragments of the Response.
 */
export interface FragmentsResponseFragment {
    /**
     * Fragment is a content-addressed description of a contiguous Journal span,
     * defined by the [begin, end) offset range covered by the Fragment and the
     * SHA1 sum of the corresponding Journal content.
     */
    spec?: ProtocolFragment;
    /**
     * SignedURL is a temporary URL at which a direct GET of the Fragment may
     * be issued, signed by the broker's credentials. Set only if the request
     * specified a SignatureTTL.
     */
    signedUrl?: string;
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
 * Journals of the response.
 */
export interface ListResponseJournal {
    /** JournalSpec describes a Journal and its configuration. */
    spec?: ProtocolJournalSpec;
    /**
     * Current ModRevision of the JournalSpec.
     * @format int64
     */
    modRevision?: string;
    /** Route of the journal, including endpoints. */
    route?: ProtocolRoute;
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
export interface ProtobufAny {
    typeUrl?: string;
    /** @format byte */
    value?: string;
}
/**
 * AppendResponse is the unary response message of the broker Append RPC.
 */
export interface ProtocolAppendResponse {
    /** Status of the Append RPC. */
    status?: ProtocolStatus;
    /** Header of the response. */
    header?: ProtocolHeader;
    /**
     * If status is OK, then |commit| is the Fragment which places the
     * committed Append content within the Journal.
     */
    commit?: ProtocolFragment;
    /** Current registers of the journal. */
    registers?: ProtocolLabelSet;
    /**
     * Total number of RPC content chunks processed in this append.
     * @format int64
     */
    totalChunks?: string;
    /**
     * Number of content chunks which were delayed by journal flow control.
     * @format int64
     */
    delayedChunks?: string;
}
/**
 * ApplyResponse is the unary response message of the broker Apply RPC.
 */
export interface ProtocolApplyResponse {
    /** Status of the Apply RPC. */
    status?: ProtocolStatus;
    /** Header of the response. */
    header?: ProtocolHeader;
}
/**
* CompressionCode defines codecs known to Gazette.

 - INVALID: INVALID is the zero-valued CompressionCodec, and is not a valid codec.
 - NONE: NONE encodes Fragments without any applied compression, with default suffix
".raw".
 - GZIP: GZIP encodes Fragments using the Gzip library, with default suffix ".gz".
 - ZSTANDARD: ZSTANDARD encodes Fragments using the ZStandard library, with default
suffix ".zst".
 - SNAPPY: SNAPPY encodes Fragments using the Snappy library, with default suffix
".sz".
 - GZIP_OFFLOAD_DECOMPRESSION: GZIP_OFFLOAD_DECOMPRESSION is the GZIP codec with additional behavior
around reads and writes to remote Fragment stores, designed to offload
the work of decompression onto compatible stores. Specifically:
 * Fragments are written with a "Content-Encoding: gzip" header.
 * Client read requests are made with "Accept-Encoding: identity".
This can be helpful in contexts where reader IO bandwidth to the storage
API is unconstrained, as the cost of decompression is offloaded to the
store and CPU-intensive batch readers may receive a parallelism benefit.
While this codec may provide substantial read-time performance
improvements, it is an advanced configuration and the "Content-Encoding"
header handling can be subtle and sometimes confusing. It uses the default
suffix ".gzod".
*/
export declare type ProtocolCompressionCodec = "INVALID" | "NONE" | "GZIP" | "ZSTANDARD" | "SNAPPY" | "GZIP_OFFLOAD_DECOMPRESSION";
/**
* Fragment is a content-addressed description of a contiguous Journal span,
defined by the [begin, end) offset range covered by the Fragment and the
SHA1 sum of the corresponding Journal content.
*/
export interface ProtocolFragment {
    /** Journal of the Fragment. */
    journal?: string;
    /**
     * Begin (inclusive) and end (exclusive) offset of the Fragment within the
     * Journal.
     * @format int64
     */
    begin?: string;
    /** @format int64 */
    end?: string;
    /** SHA1 sum of the Fragment's content. */
    sum?: ProtocolSHA1Sum;
    /** Codec with which the Fragment's content is compressed. */
    compressionCodec?: ProtocolCompressionCodec;
    /**
     * Fragment store which backs the Fragment. Empty if the Fragment has yet to
     * be persisted and is still local to a Broker.
     */
    backingStore?: string;
    /**
     * Modification timestamp of the Fragment within the backing store,
     * represented as seconds since the epoch.
     * @format int64
     */
    modTime?: string;
    /**
     * Path postfix under which the fragment is persisted to the store.
     * The complete Fragment store path is built from any path components of the
     * backing store, followed by the journal name, followed by the path postfix.
     */
    pathPostfix?: string;
}
/**
* FragmentsResponse is the unary response message of the broker ListFragments
RPC.
*/
export interface ProtocolFragmentsResponse {
    /** Status of the Apply RPC. */
    status?: ProtocolStatus;
    /** Header of the response. */
    header?: ProtocolHeader;
    fragments?: FragmentsResponseFragment[];
    /**
     * The NextPageToke value to be returned on subsequent Fragments requests. If
     * the value is zero then there are no more fragments to be returned for this
     * page.
     * @format int64
     */
    nextPageToken?: string;
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
 * JournalSpec describes a Journal and its configuration.
 */
export interface ProtocolJournalSpec {
    /** Name of the Journal. */
    name?: string;
    /**
     * Desired replication of this Journal. This defines the Journal's tolerance
     * to broker failures before data loss can occur (eg, a replication factor
     * of three means two failures are tolerated).
     * @format int32
     */
    replication?: number;
    /**
     * User-defined Labels of this JournalSpec. Two label names are reserved
     * and may not be used within a JournalSpec's Labels: "name" and "prefix".
     */
    labels?: ProtocolLabelSet;
    /**
     * Fragment is JournalSpec configuration which pertains to the creation,
     * persistence, and indexing of the Journal's Fragments.
     */
    fragment?: ProtocolJournalSpecFragment;
    /**
     * Flags of the Journal, as a combination of Flag enum values. The Flag enum
     * is not used directly, as protobuf enums do not allow for or'ed bitfields.
     * @format int64
     */
    flags?: number;
    /**
     * Maximum rate, in bytes-per-second, at which appends of this journal will
     * be processed. If zero (the default), no rate limiting is applied. A global
     * rate limit still may be in effect, in which case the effective rate is the
     * smaller of the journal vs global rate.
     * @format int64
     */
    maxAppendRate?: string;
}
/**
* Fragment is JournalSpec configuration which pertains to the creation,
persistence, and indexing of the Journal's Fragments.
*/
export interface ProtocolJournalSpecFragment {
    /**
     * Target content length of each Fragment. In normal operation after
     * Fragments reach at least this length, they will be closed and new ones
     * begun. Note lengths may be smaller at times (eg, due to changes in
     * Journal routing topology). Content length differs from Fragment file
     * size, in that the former reflects uncompressed bytes.
     * @format int64
     */
    length?: string;
    /** Codec used to compress Journal Fragments. */
    compressionCodec?: ProtocolCompressionCodec;
    /**
     * Storage backend base path for this Journal's Fragments. Must be in URL
     * form, with the choice of backend defined by the scheme. The full path of
     * a Journal's Fragment is derived by joining the store path with the
     * Fragment's ContentPath. Eg, given a fragment_store of
     *   "s3://My-AWS-bucket/a/prefix" and a JournalSpec of name "my/journal",
     * a complete Fragment path might be:
     *   "s3://My-AWS-bucket/a/prefix/my/journal/000123-000456-789abcdef.gzip
     * Multiple stores may be specified, in which case the Journal's Fragments
     * are the union of all Fragments present across all stores, and new
     * Fragments always persist to the first specified store. This can be
     * helpful in performing incremental migrations, where new Journal content
     * is written to the new store, while content in the old store remains
     * available (and, depending on fragment_retention or recovery log pruning,
     * may eventually be removed).
     *
     * If no stores are specified, the Journal is still use-able but will
     * not persist Fragments to any a backing fragment store. This allows for
     * real-time streaming use cases where reads of historical data are not
     * needed.
     */
    stores?: string[];
    /**
     * Interval of time between refreshes of remote Fragment listings from
     * configured fragment_stores.
     */
    refreshInterval?: string;
    /**
     * Retention duration for historical Fragments of this Journal within the
     * Fragment stores. If less than or equal to zero, Fragments are retained
     * indefinitely.
     */
    retention?: string;
    /**
     * Flush interval defines a uniform UTC time segment which, when passed,
     * will prompt brokers to close and persist a fragment presently being
     * written.
     *
     * Flush interval may be helpful in integrating the journal with a regularly
     * scheduled batch work-flow which processes new files from the fragment
     * store and has no particular awareness of Gazette. For example, setting
     * flush_interval to 3600s will cause brokers to persist their present
     * fragment on the hour, every hour, even if it has not yet reached its
     * target length. A batch work-flow running at 5 minutes past the hour is
     * then reasonably assured of seeing all events from the past hour.
     * See also "gazctl journals fragments --help" for more discussion.
     */
    flushInterval?: string;
    /**
     * Path postfix template is a Go template which evaluates to a partial
     * path under which fragments are persisted to the store. A complete
     * fragment path is constructed by appending path components from the
     * fragment store, then the journal name, and then the postfix template.
     * Path post-fixes can help in maintaining Hive compatible partitioning
     * over fragment creation time. The fields ".Spool" and ".JournalSpec"
     * are available for introspection in the template. For example,
     * to partition on the UTC date and hour of creation, use:
     * date={{ .Spool.FirstAppendTime.Format "2006-01-02" }}/hour={{
     *    .Spool.FirstAppendTime.Format "15" }}
     *
     * Which will produce a path postfix like "date=2019-11-19/hour=22".
     */
    pathPostfixTemplate?: string;
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
 * ListRequest is the unary request message of the broker List RPC.
 */
export interface ProtocolListRequest {
    /**
     * Selector optionally refines the set of journals which will be enumerated.
     * If zero-valued, all journals are returned. Otherwise, only JournalSpecs
     * matching the LabelSelector will be returned. Two meta-labels "name" and
     * "prefix" are additionally supported by the selector, where:
     *   * name=examples/a-name will match a JournalSpec with Name
     *   "examples/a-name"
     *   * prefix=examples/ will match any JournalSpec having prefix "examples/".
     *     The prefix Label value must end in '/'.
     */
    selector?: ProtocolLabelSelector;
}
/**
 * ListResponse is the unary response message of the broker List RPC.
 */
export interface ProtocolListResponse {
    /** Status of the List RPC. */
    status?: ProtocolStatus;
    /** Header of the response. */
    header?: ProtocolHeader;
    journals?: ListResponseJournal[];
}
/**
 * ReadRequest is the unary request message of the broker Read RPC.
 */
export interface ProtocolReadRequest {
    /** Header is attached by a proxying broker peer. */
    header?: ProtocolHeader;
    /** Journal to be read. */
    journal?: string;
    /**
     * Desired offset to begin reading from. Value -1 has special handling, where
     * the read is performed from the current write head. All other positive
     * values specify a desired exact byte offset to read from. If the offset is
     * not available (eg, because it represents a portion of Journal which has
     * been permanently deleted), the broker will return the next available
     * offset. Callers should therefore always inspect the ReadResponse offset.
     * @format int64
     */
    offset?: string;
    /**
     * Whether the operation should block until content becomes available.
     * OFFSET_NOT_YET_AVAILABLE is returned if a non-blocking read has no ready
     * content.
     */
    block?: boolean;
    /**
     * If do_not_proxy is true, the broker will not proxy the read to another
     * broker, or open and proxy a remote Fragment on the client's behalf.
     */
    doNotProxy?: boolean;
    /**
     * If metadata_only is true, the broker will respond with Journal and
     * Fragment metadata but not content.
     */
    metadataOnly?: boolean;
    /**
     * Offset to read through. If zero, then the read end offset is unconstrained.
     * @format int64
     */
    endOffset?: string;
    /**
     * BeginModTime is an optional inclusive lower bound on the modification
     * timestamps of fragments read from the backing store, represented as
     * seconds since the epoch. The request Offset will be advanced as-needed
     * to skip persisted Fragments having a modication time before the bound.
     * @format int64
     */
    beginModTime?: string;
}
/**
* ReadResponse is the streamed response message of the broker Read RPC.
Responses messages are of two types:
* * "Metadata" messages, which conveys the journal Fragment addressed by the
   request which is ready to be read.
* "Chunk" messages, which carry associated journal Fragment content bytes.

A metadata message specifying a Fragment always precedes all "chunks" of the
Fragment's content. Response streams may be very long lived, having many
metadata and accompanying chunk messages. The reader may also block for long
periods of time awaiting the next metadata message (eg, if the next offset
hasn't yet committed). However once a metadata message is read, the reader
is assured that its associated chunk messages are immediately forthcoming.
*/
export interface ProtocolReadResponse {
    /** Status of the Read RPC. */
    status?: ProtocolStatus;
    /**
     * Header of the response. Accompanies the first ReadResponse of the response
     * stream.
     */
    header?: ProtocolHeader;
    /**
     * The effective offset of the read. See ReadRequest offset.
     * @format int64
     */
    offset?: string;
    /**
     * The offset to next be written, by the next append transaction served by
     * broker. In other words, the last offset through which content is
     * available to be read from the Journal. This is a metadata field and will
     * not be returned with a content response.
     * @format int64
     */
    writeHead?: string;
    /**
     * Fragment to which the offset was mapped. This is a metadata field and will
     * not be returned with a content response.
     */
    fragment?: ProtocolFragment;
    /** If Fragment is remote, a URL from which it may be directly read. */
    fragmentUrl?: string;
    /**
     * Content chunks of the read.
     * @format byte
     */
    content?: string;
}
/**
* ReplicateResponse is the streamed response message of the broker's internal
Replicate RPC. Each message is a 1:1 response to a previously read "proposal"
ReplicateRequest with |acknowledge| set.
*/
export interface ProtocolReplicateResponse {
    /** Status of the Replicate RPC. */
    status?: ProtocolStatus;
    /**
     * Header of the response. Accompanies the first ReplicateResponse of the
     * response stream.
     */
    header?: ProtocolHeader;
    /**
     * If status is PROPOSAL_MISMATCH, then |fragment| is the replica's current
     * journal Fragment, and either it or |registers| will differ from the
     * primary's proposal.
     */
    fragment?: ProtocolFragment;
    /**
     * If status is PROPOSAL_MISMATCH, then |registers| are the replica's current
     * journal registers.
     */
    registers?: ProtocolLabelSet;
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
 * SHA1Sum is a 160-bit SHA1 digest.
 */
export interface ProtocolSHA1Sum {
    /** @format uint64 */
    part1?: string;
    /** @format uint64 */
    part2?: string;
    /** @format int64 */
    part3?: number;
}
/**
* Status is a response status code, used universally across Gazette RPC APIs.

 - JOURNAL_NOT_FOUND: The named journal does not exist.
 - NO_JOURNAL_PRIMARY_BROKER: There is no current primary broker for the journal. This is a temporary
condition which should quickly resolve, assuming sufficient broker
capacity.
 - NOT_JOURNAL_PRIMARY_BROKER: The present broker is not the assigned primary broker for the journal.
 - NOT_JOURNAL_BROKER: The present broker is not an assigned broker for the journal.
 - INSUFFICIENT_JOURNAL_BROKERS: There are an insufficient number of assigned brokers for the journal
to meet its required replication.
 - OFFSET_NOT_YET_AVAILABLE: The requested offset is not yet available. This indicates either that the
offset has not yet been written, or that the broker is not yet aware of a
written fragment covering the offset. Returned only by non-blocking reads.
 - WRONG_ROUTE: The peer disagrees with the Route accompanying a ReplicateRequest.
 - PROPOSAL_MISMATCH: The peer disagrees with the proposal accompanying a ReplicateRequest.
 - ETCD_TRANSACTION_FAILED: The Etcd transaction failed. Returned by Update RPC when an
expect_mod_revision of the UpdateRequest differs from the current
ModRevision of the JournalSpec within the store.
 - NOT_ALLOWED: A disallowed journal access was attempted (eg, a write where the
journal disables writes, or read where journals disable reads).
 - WRONG_APPEND_OFFSET: The Append is refused because its requested offset is not equal
to the furthest written offset of the journal.
 - INDEX_HAS_GREATER_OFFSET: The Append is refused because the replication pipeline tracks a smaller
journal offset than that of the remote fragment index. This indicates
that journal replication consistency has been lost in the past, due to
too many broker or Etcd failures.
 - REGISTER_MISMATCH: The Append is refused because a registers selector was provided with the
request, but it was not matched by current register values of the journal.
*/
export declare type ProtocolStatus = "OK" | "JOURNAL_NOT_FOUND" | "NO_JOURNAL_PRIMARY_BROKER" | "NOT_JOURNAL_PRIMARY_BROKER" | "NOT_JOURNAL_BROKER" | "INSUFFICIENT_JOURNAL_BROKERS" | "OFFSET_NOT_YET_AVAILABLE" | "WRONG_ROUTE" | "PROPOSAL_MISMATCH" | "ETCD_TRANSACTION_FAILED" | "NOT_ALLOWED" | "WRONG_APPEND_OFFSET" | "INDEX_HAS_GREATER_OFFSET" | "REGISTER_MISMATCH";
export interface RuntimeError {
    error?: string;
    /** @format int32 */
    code?: number;
    message?: string;
    details?: ProtobufAny[];
}
export interface RuntimeStreamError {
    /** @format int32 */
    grpcCode?: number;
    /** @format int32 */
    httpCode?: number;
    message?: string;
    httpStatus?: string;
    details?: ProtobufAny[];
}
