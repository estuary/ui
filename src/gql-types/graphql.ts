/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Collection: { input: any; output: any; }
  /**
   * Implement the DateTime<Utc> scalar
   *
   * The input/output is a string in RFC3339 format.
   */
  DateTime: { input: any; output: any; }
  Id: { input: any; output: any; }
  /** A scalar that can represent any JSON value. */
  JSON: { input: any; output: any; }
  /** A scalar that can represent any JSON Object value. */
  JSONObject: { input: any; output: any; }
  Name: { input: any; output: any; }
  Prefix: { input: any; output: any; }
  /**
   * A UUID is a unique 128-bit number, stored as 16 octets. UUIDs are parsed as
   * Strings within GraphQL. UUIDs are used to assign unique identifiers to
   * entities without requiring a central allocating authority.
   *
   * # References
   *
   * * [Wikipedia: Universally Unique Identifier](http://en.wikipedia.org/wiki/Universally_unique_identifier)
   * * [RFC4122: A Universally Unique Identifier (UUID) URN Namespace](http://tools.ietf.org/html/rfc4122)
   */
  UUID: { input: any; output: any; }
  /** URL is a String implementing the [URL Standard](http://url.spec.whatwg.org/) */
  Url: { input: any; output: any; }
};

/**
 * Status of the task shards running in the data-plane. This records information about
 * the activations of builds in the data-plane, including any subsequent re-activations
 * due to shard failures.
 */
export type ActivationStatus = {
  __typename?: 'ActivationStatus';
  /**
   * The build id that was last activated in the data plane.
   * If this is less than the `last_build_id` of the controlled spec,
   * then an activation is still pending.
   */
  lastActivated: Scalars['Id']['output'];
  /**
   * The time at which the last data plane activation was performed.
   * This could have been in order to activate a recent publication,
   * or in response to a shard failure.
   */
  lastActivatedAt?: Maybe<Scalars['DateTime']['output']>;
  /**
   * The most recent shard failure to have been observed. The presence of a failure here
   * does not necessarily mean that the shard is currently in a failed state, as it may
   * have been re-activated since the failure occurred.
   */
  lastFailure?: Maybe<ShardFailure>;
  /**
   * The next time at which failed task shards will be re-activated. If this is present, then
   * there has been at least one observed shard failure, which the controller has not yet handled.
   */
  nextRetry?: Maybe<Scalars['DateTime']['output']>;
  /**
   * Count of shard failures that have been observed over the last 24 hours for the currently activated
   * build. This resets to 0 when a newly published build is activated.
   */
  recentFailureCount: Scalars['Int']['output'];
  /** If this is a task with shards, this will track their last observed status. */
  shardStatus?: Maybe<ShardStatusCheck>;
};

/** An alert from the alert_history table */
export type Alert = {
  __typename?: 'Alert';
  /** The type of the alert */
  alertType: AlertType;
  /**
   * The alert arguments contain additional details about the alert, which
   * may be used in formatting the alert message.
   */
  arguments: Scalars['JSON']['output'];
  /** The catalog name that the alert pertains to. */
  catalogName: Scalars['String']['output'];
  /** Time at which the alert became active. */
  firedAt: Scalars['DateTime']['output'];
  /**
   * Optional arguments for the resolution. Most commonly, this will be null
   * and the regular `arguments` would be used during resolution in that case.
   */
  resolvedArguments?: Maybe<Scalars['JSON']['output']>;
  /** The time at which the alert was resolved, or null if it is still active. */
  resolvedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type AlertConnection = {
  __typename?: 'AlertConnection';
  /** A list of edges. */
  edges: Array<AlertEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type AlertEdge = {
  __typename?: 'AlertEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node: Alert;
};

export type AlertSubscription = {
  __typename?: 'AlertSubscription';
  alertTypes: Array<AlertType>;
  catalogPrefix: Scalars['Prefix']['output'];
  createdAt: Scalars['DateTime']['output'];
  /**
   * Destination represents the notification destination (i.e. the receiver)
   * as a URI, which can represent any type of transport. For now, only email
   * is supported and every destination URL will have the `mailto:` URI
   * scheme. Future notification mechanisms may use different URI schemes.
   */
  destination: Scalars['Url']['output'];
  detail?: Maybe<Scalars['String']['output']>;
  /**
   * The email recipient for notifications. This may be null for
   * subscriptions that use a different destination type.
   */
  email?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type AlertSubscriptionsBy = {
  /**
   * Show alert subscriptions for the given catalog namespace prefix. This
   * will return all subscriptions having a catalog prefix that starts with
   * the given prefix. For example, `prefix: "acmeCo/"` would return
   * subscriptions for both `acmeCo/` and `acmeCo/nested/`.
   */
  prefix: Scalars['Prefix']['input'];
};

export type AlertType =
  /**
   * Triggers when the automated background discovery process fails. If this
   * alert is firing, it means that the Capture may be unable to respond to
   * schema changes in the source system.
   */
  | 'auto_discover_failed'
  /**
   * Triggers when an automated background process needs to publish a spec,
   * but is unable to because of publication errors. Background publications
   * are peformed on all specs for a variety of reasons. For example,
   * updating inferred schemas, or updating materialization bindings to match
   * the source capture. When these publications fail, tasks are likely to
   * stop functioning correctly until the issue can be addressed.
   */
  | 'background_publication_failed'
  /**
   * Triggers when there has been no data successfully processed by the task during
   * the configured alert interval.
   */
  | 'data_movement_stalled'
  /**
   * Triggers automatically for every tenant that begins a free
   * trial, and resolves when the trial period ends.
   */
  | 'free_trial'
  /** Triggers when the free trial is getting close to expiring. */
  | 'free_trial_ending'
  /**
   * Triggers after the free trial period has expired, and still no payment info
   * has been added.
   */
  | 'free_trial_stalled'
  /**
   * Triggers for any tenants that do not have a payment method, and resolves when
   * a payment method is added.
   */
  | 'missing_payment_method'
  /**
   * Triggers after repeated task failures have been observed. The task may or may not
   * continue to make progress in between failures, but at a minimum, performance will
   * be degraded. And in many scenarios, the task will be unable to process data at all.
   */
  | 'shard_failed';

export type AlertsBy = {
  /**
   * Optionally filter alerts by active status. If unspecified, both active
   * and resolved alerts will be returned.
   */
  active?: InputMaybe<Scalars['Boolean']['input']>;
  /** Show alerts for the given catalog namespace prefix. */
  prefix: Scalars['String']['input'];
};

export type AutoDiscoverFailure = {
  __typename?: 'AutoDiscoverFailure';
  /** The number of consecutive failures that have been observed. */
  count: Scalars['Int']['output'];
  /** The timestamp of the first failure in the current sequence. */
  firstTs: Scalars['DateTime']['output'];
  /**
   * The discover outcome corresponding to the most recent failure. This will
   * be updated with the results of each retry until an auto-discover
   * succeeds.
   */
  lastOutcome: AutoDiscoverOutcome;
};

/** The results of an auto-discover attempt */
export type AutoDiscoverOutcome = {
  __typename?: 'AutoDiscoverOutcome';
  /** Bindings that were added to the capture. */
  added: Array<DiscoverChange>;
  /** Errors that occurred during the discovery or evolution process. */
  errors: Array<Error>;
  /** Bindings that were modified, either to change the schema or the collection key. */
  modified: Array<DiscoverChange>;
  /** The result of publishing the discovered changes, if a publication was attempted. */
  publishResult?: Maybe<JobStatus>;
  /** Bindings that were removed because they no longer appear in the source system. */
  removed: Array<DiscoverChange>;
  /** Time at which the disocver was attempted */
  ts: Scalars['DateTime']['output'];
};

export type AutoDiscoverStatus = {
  __typename?: 'AutoDiscoverStatus';
  /**
   * If auto-discovery has failed, this will include information about that failure.
   * This field is cleared as soon as a successful auto-discover is run.
   */
  failure?: Maybe<AutoDiscoverFailure>;
  /**
   * The outcome of the last _successful_ auto-discover. If `failure` is set,
   * then that will typically be more recent than `last_success`.
   */
  lastSuccess?: Maybe<AutoDiscoverOutcome>;
  /** Time at which the next auto-discover should be run. */
  nextAt?: Maybe<Scalars['DateTime']['output']>;
  /**
   * The outcome of the a recent discover, which is about to be published.
   * This will typically only be observed if the publication failed for some
   * reason.
   */
  pendingPublish?: Maybe<AutoDiscoverOutcome>;
};

export type BoolFilter = {
  eq?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Capability within the Estuary role-based access control (RBAC) authorization system. */
export type Capability =
  | 'admin'
  /** Note that the discriminants here align with those in the database type. */
  | 'read'
  | 'write';

export type CatalogType =
  | 'capture'
  | 'collection'
  | 'materialization'
  | 'test';

/** Result of checking storage health for a catalog prefix. */
export type ConnectionHealthTestResult = {
  __typename?: 'ConnectionHealthTestResult';
  /** Whether all health checks passed. */
  allPassed: Scalars['Boolean']['output'];
  /** The catalog prefix for which storage health was checked. */
  catalogPrefix: Scalars['Prefix']['output'];
  /** Individual health check results for each data plane and store combination. */
  results: Array<StorageHealthItem>;
};

/** The shape of a connector status, which matches that of an ops::Log. */
export type ConnectorStatus = {
  __typename?: 'ConnectorStatus';
  /**
   * Arbitrary JSON that can be used to communicate additional details. The
   * specific fields and their meanings are entirely up to the connector.
   */
  fields: Scalars['JSONObject']['output'];
  /** The message is meant to be presented to users, and may use Markdown formatting. */
  message: Scalars['String']['output'];
  /** The shard that last updated the status */
  shard: ShardRef;
  /** The time at which the status was last updated */
  ts: Scalars['DateTime']['output'];
};

/** Status info related to the controller */
export type Controller = {
  __typename?: 'Controller';
  /** Present for captures, collections, and materializations. */
  activation?: Maybe<ActivationStatus>;
  alerts?: Maybe<Scalars['JSONObject']['output']>;
  /** Only present for captures that use `autoDiscover`. */
  autoDiscover?: Maybe<AutoDiscoverStatus>;
  /**
   * Only present for captures or materializations that update their own endpoint configurations
   * (typically just captures that need to refres OAuth tokens).
   */
  configUpdate?: Maybe<PendingConfigUpdateStatus>;
  error?: Maybe<Scalars['String']['output']>;
  failures: Scalars['Int']['output'];
  /** Only present for collections that use the inferred schema. */
  inferredSchema?: Maybe<InferredSchemaStatus>;
  nextRun?: Maybe<Scalars['DateTime']['output']>;
  /** Present for all catalog types */
  publications?: Maybe<PublicationStatus>;
  /** Only present for materializations that use `sources`. */
  sourceCapture?: Maybe<SourceCaptureStatus>;
  updatedAt: Scalars['DateTime']['output'];
};

/** Result of creating a storage mapping. */
export type CreateStorageMappingResult = {
  __typename?: 'CreateStorageMappingResult';
  /** The catalog prefix for which the storage mapping was created. */
  catalogPrefix: Scalars['Prefix']['output'];
};

/** A data plane where tasks execute and collections are stored. */
export type DataPlane = {
  __typename?: 'DataPlane';
  /** AWS IAM user ARN for this data-plane. */
  awsIamUserArn?: Maybe<Scalars['String']['output']>;
  /** Azure application client ID for this data-plane. */
  azureApplicationClientId?: Maybe<Scalars['String']['output']>;
  /** Azure application name for this data-plane. */
  azureApplicationName?: Maybe<Scalars['String']['output']>;
  /** CIDR blocks for this data-plane. */
  cidrBlocks: Array<Scalars['String']['output']>;
  /** Cloud provider where this data-plane is hosted. */
  cloudProvider: DataPlaneCloudProvider;
  /** Fully-qualified domain name of this data-plane. */
  fqdn: Scalars['String']['output'];
  /** GCP service account email for this data-plane. */
  gcpServiceAccountEmail?: Maybe<Scalars['String']['output']>;
  /** Whether this is a public data-plane. */
  isPublic: Scalars['Boolean']['output'];
  /** Name of this data-plane under the catalog namespace. */
  name: Scalars['String']['output'];
  /** Address of reactors within the data-plane. */
  reactorAddress: Scalars['String']['output'];
  /**
   * Cloud region where this data-plane is hosted.
   * For example: "us-east-1" (AWS), "us-central1" (GCP), "eastus" (Azure).
   */
  region: Scalars['String']['output'];
  /** Tag (cluster) identifier within the region. */
  tag: Scalars['String']['output'];
  /** The current user's capability to this data plane's name prefix. */
  userCapability: Capability;
};

/** Cloud provider where the data plane is hosted. */
export type DataPlaneCloudProvider =
  | 'AWS'
  | 'AZURE'
  | 'GCP'
  | 'LOCAL';

export type DataPlaneConnection = {
  __typename?: 'DataPlaneConnection';
  /** A list of edges. */
  edges: Array<DataPlaneEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type DataPlaneEdge = {
  __typename?: 'DataPlaneEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node: DataPlane;
};

/** A capture binding that has changed as a result of a discover */
export type DiscoverChange = {
  __typename?: 'DiscoverChange';
  /** Whether the capture binding is disabled. */
  disable: Scalars['Boolean']['output'];
  /** Identifies the resource in the source system that this change pertains to. */
  resourcePath: Array<Scalars['String']['output']>;
  /** The target collection of the capture binding that was changed. */
  target: Scalars['Collection']['output'];
};

/** A generic error that can be associated with a particular draft spec for a given operation. */
export type Error = {
  __typename?: 'Error';
  catalogName: Scalars['String']['output'];
  detail: Scalars['String']['output'];
  scope?: Maybe<Scalars['String']['output']>;
};

/** Status of the inferred schema */
export type InferredSchemaStatus = {
  __typename?: 'InferredSchemaStatus';
  /**
   * The md5 of the inferred schema that will next be applied. If this is
   * present, it indicates that the controller is waiting on a cooldown
   * period before publishing this inferred schema.
   */
  nextMd5?: Maybe<Scalars['String']['output']>;
  /**
   * The time of the next scheduled inferred schema update. If this is
   * present, it indicates that the controller is waiting on a cooldown
   * period before publishing the inferred schema, and represents the
   * approximate time of the next update.
   */
  nextUpdateAfter?: Maybe<Scalars['DateTime']['output']>;
  /**
   * The time at which the inferred schema was last published. This will only
   * be present if the inferred schema was published at least once.
   */
  schemaLastUpdated?: Maybe<Scalars['DateTime']['output']>;
  /**
   * The md5 sum of the inferred schema that was last published.
   * Because the publications handler updates the model instead of the controller, it's
   * technically possible for the published inferred schema to be more recent than the one
   * corresponding to this hash. If that happens, we would expect a subsequent publication
   * on the next controller run, which would update the hash but not actually modify the schema.
   */
  schemaMd5?: Maybe<Scalars['String']['output']>;
};

/** An invite link that grants access to a catalog prefix. */
export type InviteLink = {
  __typename?: 'InviteLink';
  /** The capability level granted by this invite link. */
  capability: Capability;
  /** The catalog prefix this invite link grants access to. */
  catalogPrefix: Scalars['Prefix']['output'];
  /** When this invite link was created. */
  createdAt: Scalars['DateTime']['output'];
  /** Optional description of this invite link. */
  detail?: Maybe<Scalars['String']['output']>;
  /** Whether this invite link can only be used once. */
  singleUse: Scalars['Boolean']['output'];
  /** The secret token for this invite link. */
  token: Scalars['UUID']['output'];
};

export type InviteLinkConnection = {
  __typename?: 'InviteLinkConnection';
  /** A list of edges. */
  edges: Array<InviteLinkEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type InviteLinkEdge = {
  __typename?: 'InviteLinkEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node: InviteLink;
};

export type InviteLinksFilter = {
  catalogPrefix?: InputMaybe<PrefixFilter>;
  singleUse?: InputMaybe<BoolFilter>;
};

/** The status of a publication. */
export type JobStatus = {
  __typename?: 'JobStatus';
  lockFailures: Array<LockFailure>;
  type: StatusType;
};

export type LiveSpec = {
  __typename?: 'LiveSpec';
  builtSpec?: Maybe<Scalars['JSON']['output']>;
  catalogName: Scalars['String']['output'];
  catalogType: CatalogType;
  createdAt: Scalars['DateTime']['output'];
  dataPlaneId: Scalars['Id']['output'];
  isDisabled: Scalars['Boolean']['output'];
  lastBuildId: Scalars['Id']['output'];
  lastPubId: Scalars['Id']['output'];
  liveSpecId: Scalars['Id']['output'];
  model?: Maybe<Scalars['JSON']['output']>;
  /**
   * Returns a list of live specs that read from this spec. This will always
   * be empty if this spec is a not a collection.
   */
  readBy?: Maybe<LiveSpecRefConnection>;
  readsFrom?: Maybe<LiveSpecRefConnection>;
  sourceCapture?: Maybe<LiveSpecRef>;
  updatedAt: Scalars['DateTime']['output'];
  writesTo?: Maybe<LiveSpecRefConnection>;
  /**
   * Returns a list of live specs that write to this spec. This will always
   * be empty if this spec is a not a collection.
   */
  writtenBy?: Maybe<LiveSpecRefConnection>;
};


export type LiveSpecReadByArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type LiveSpecReadsFromArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type LiveSpecWritesToArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type LiveSpecWrittenByArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

/** Represents a reference from one live spec to another. */
export type LiveSpecRef = {
  __typename?: 'LiveSpecRef';
  /** Returns all alerts that are currently firing for this live spec. */
  activeAlerts?: Maybe<Array<Alert>>;
  /**
   * Returns the history of resolved alerts for this live spec. Alerts are
   * returned in reverse chronological order based on the `firedAt`
   * timestamp, and are paginated.
   */
  alertHistory?: Maybe<AlertConnection>;
  /** The catalog_name of the referent. */
  catalogName: Scalars['Name']['output'];
  /** Information about the most recent publication of the spec */
  lastPublication?: Maybe<SpecPublicationHistoryItem>;
  /** Returns the live spec that the reference points to, if the user has access to it. */
  liveSpec?: Maybe<LiveSpec>;
  /** The complete history of publications of this spec */
  publicationHistory?: Maybe<SpecPublicationHistoryItemConnection>;
  /** Returns the status of the live spec. */
  status?: Maybe<LiveSpecStatus>;
  /**
   * The current user's capability to the referent. Null indicates no access.
   * A query can obtain a reference to a catalog spec that the user has no
   * access to, which happens in scenarios where a LiveSpec that the user
   * does have access to references a spec in a different catalog namespace
   * that the user cannot access. It can also happen simply by listing by
   * name, and passing a name that the user cannot access. In either case,
   * the result would be `userCapability: null`, and all other fields on the
   * LiveSpecRef would also be null.
   */
  userCapability?: Maybe<Capability>;
};


/** Represents a reference from one live spec to another. */
export type LiveSpecRefAlertHistoryArgs = {
  before?: InputMaybe<Scalars['String']['input']>;
  last: Scalars['Int']['input'];
};


/** Represents a reference from one live spec to another. */
export type LiveSpecRefPublicationHistoryArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type LiveSpecRefConnection = {
  __typename?: 'LiveSpecRefConnection';
  /** A list of edges. */
  edges: Array<LiveSpecRefEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type LiveSpecRefEdge = {
  __typename?: 'LiveSpecRefEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node: LiveSpecRef;
};

/** The status of a LiveSpec */
export type LiveSpecStatus = {
  __typename?: 'LiveSpecStatus';
  connector?: Maybe<ConnectorStatus>;
  controller?: Maybe<Controller>;
  summary: Scalars['String']['output'];
  type: StatusSummaryType;
};

/** Input type for querying live specs. */
export type LiveSpecsBy = {
  /** Optionally filter by catalogType */
  catalogType?: InputMaybe<CatalogType>;
  /** Optionally filter by dataPlane name */
  dataPlaneName?: InputMaybe<Scalars['Name']['input']>;
  /** Fetch live specs by name. Required if `prefix` is empty */
  names?: InputMaybe<Array<Scalars['Name']['input']>>;
  /** Fetch live specs by prefix. Required if `names` is empty */
  prefix?: InputMaybe<Scalars['Prefix']['input']>;
};

/**
 * Represents an optimistic lock failure when trying to update a specification.
 * This typically means that an expectPubId was not matched, implying that
 * another publication has applied a conflicting update to this specification
 * since it was last fetched.
 */
export type LockFailure = {
  __typename?: 'LockFailure';
  /** The actual id that was found. */
  actual?: Maybe<Scalars['Id']['output']>;
  /** The name of the spec that failed the optimistic concurrency check. */
  catalogName: Scalars['String']['output'];
  /**
   * The expected id (either `last_pub_id` or `last_build_id`) that was not
   * matched.
   */
  expected: Scalars['Id']['output'];
};

export type MutationRoot = {
  __typename?: 'MutationRoot';
  /**
   * Creates a new alert subscription. Returns an error if there is already
   * an existing subscription for the same prefix and email address.
   */
  createAlertSubscription: AlertSubscription;
  /**
   * Create an invite link that grants access to a catalog prefix.
   *
   * The caller must have admin capability on the catalog prefix.
   * Share the returned token with the intended recipient out-of-band.
   */
  createInviteLink: InviteLink;
  /**
   * Create a storage mapping for the given catalog prefix.
   *
   * This validates that the user has admin access to the catalog prefix,
   * runs health checks to verify that data planes can access the storage buckets,
   * and then saves the storage mapping to the database.
   *
   * All health checks must pass before the storage mapping is created.
   */
  createStorageMapping: CreateStorageMappingResult;
  /** Delete an alert subscription that exactly matches the given prefix and email. */
  deleteAlertSubscription: AlertSubscription;
  /**
   * Delete an invite link, revoking it so it can no longer be redeemed.
   *
   * The caller must have admin capability on the invite link's catalog prefix.
   */
  deleteInviteLink: Scalars['Boolean']['output'];
  /**
   * Redeem an invite link token, granting the caller access to the associated
   * catalog prefix with the specified capability.
   */
  redeemInviteLink: RedeemInviteLinkResult;
  /**
   * Check storage health for a given catalog prefix and storage definition.
   *
   * This validates the inputs, verifies that the user has admin access to the catalog prefix,
   * and runs health checks to verify that data planes can access the storage buckets.
   *
   * Unlike create/update mutations, this does not modify any data and always returns
   * health check results (both successes and failures) rather than erroring on failures.
   */
  testConnectionHealth: ConnectionHealthTestResult;
  /**
   * Updates the alert subscription for the given prefix and email, returning
   * the updated subscription.
   */
  updateAlertSubscription: AlertSubscription;
  /**
   * Update an existing storage mapping for the given catalog prefix.
   *
   * This validates that the user has admin access to the catalog prefix,
   * runs health checks to verify that data planes can access the storage buckets,
   * and then updates the storage mapping in the database.
   *
   * Health checks for newly added stores or data planes must pass before the
   * storage mapping is updated. Health check failures for existing stores/data planes
   * are allowed (they were already validated when created).
   */
  updateStorageMapping: UpdateStorageMappingResult;
};


export type MutationRootCreateAlertSubscriptionArgs = {
  alertTypes?: InputMaybe<Array<AlertType>>;
  detail?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  prefix: Scalars['Prefix']['input'];
};


export type MutationRootCreateInviteLinkArgs = {
  capability: Capability;
  catalogPrefix: Scalars['Prefix']['input'];
  detail?: InputMaybe<Scalars['String']['input']>;
  singleUse?: Scalars['Boolean']['input'];
};


export type MutationRootCreateStorageMappingArgs = {
  catalogPrefix: Scalars['Prefix']['input'];
  detail?: InputMaybe<Scalars['String']['input']>;
  spec: Scalars['JSON']['input'];
};


export type MutationRootDeleteAlertSubscriptionArgs = {
  email: Scalars['String']['input'];
  prefix: Scalars['Prefix']['input'];
};


export type MutationRootDeleteInviteLinkArgs = {
  token: Scalars['UUID']['input'];
};


export type MutationRootRedeemInviteLinkArgs = {
  token: Scalars['UUID']['input'];
};


export type MutationRootTestConnectionHealthArgs = {
  catalogPrefix: Scalars['Prefix']['input'];
  spec: Scalars['JSON']['input'];
};


export type MutationRootUpdateAlertSubscriptionArgs = {
  alertTypes?: InputMaybe<Array<AlertType>>;
  detail?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  prefix: Scalars['Prefix']['input'];
};


export type MutationRootUpdateStorageMappingArgs = {
  catalogPrefix: Scalars['Prefix']['input'];
  detail?: InputMaybe<Scalars['String']['input']>;
  spec: Scalars['JSON']['input'];
};

/** Information about pagination in a connection */
export type PageInfo = {
  __typename?: 'PageInfo';
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['String']['output']>;
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars['Boolean']['output'];
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars['Boolean']['output'];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['String']['output']>;
};

/**
 * Information on the config updates performed by the controller.
 * This does not include any information on user-initiated config updates.
 */
export type PendingConfigUpdateStatus = {
  __typename?: 'PendingConfigUpdateStatus';
  /** The id of the build when the associated config update event was generated. */
  build: Scalars['Id']['output'];
  nextAttempt: Scalars['DateTime']['output'];
};

export type PrefixFilter = {
  startsWith?: InputMaybe<Scalars['String']['input']>;
};

/** A prefix to which the user is authorized. */
export type PrefixRef = {
  __typename?: 'PrefixRef';
  /** The prefix to which the user is authorized. */
  prefix: Scalars['Prefix']['output'];
  /** The capability granted to the user for this prefix. */
  userCapability: Capability;
};

export type PrefixRefConnection = {
  __typename?: 'PrefixRefConnection';
  /** A list of edges. */
  edges: Array<PrefixRefEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type PrefixRefEdge = {
  __typename?: 'PrefixRefEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node: PrefixRef;
};

export type PrefixesBy = {
  /** Filter returned prefixes by user capability. */
  minCapability: Capability;
};

/** Summary of a publication that was attempted by a controller. */
export type PublicationInfo = {
  __typename?: 'PublicationInfo';
  /** Time at which the publication was completed */
  completed?: Maybe<Scalars['DateTime']['output']>;
  /**
   * A publication info may represent multiple publications of the same spec.
   * If the publications have similar outcomes, then multiple publications
   * can be condensed into a single entry in the history. If this is done,
   * then the `count` field will be greater than 1. This field is omitted if
   * the count is 1.
   */
  count: Scalars['Int']['output'];
  /** Time at which the publication was initiated */
  created?: Maybe<Scalars['DateTime']['output']>;
  /** A brief description of the reason for the publication */
  detail?: Maybe<Scalars['String']['output']>;
  /** Errors will be non-empty for publications that were not successful */
  errors: Array<Error>;
  /**
   * The id of the publication, which will match the `last_pub_id` of the
   * spec after a successful publication, at least until the next publication.
   */
  id: Scalars['Id']['output'];
  /**
   * A touch publication is a publication that does not modify the spec, but
   * only updates the `built_spec` and `last_build_id` fields. They are most
   * commonly performed in response to changes in the spec's dependencies.
   * Touch publications will never be combined with non-touch publications in
   * the history.
   */
  isTouch: Scalars['Boolean']['output'];
  /** The final result of the publication */
  result?: Maybe<JobStatus>;
};

/**
 * Information on the publications performed by the controller.
 * This does not include any information on user-initiated publications.
 */
export type PublicationStatus = {
  __typename?: 'PublicationStatus';
  /** A limited history of publications performed by this controller */
  history: Array<PublicationInfo>;
  /**
   * The publication id at which the controller has last notified dependent
   * specs. A publication of the controlled spec will cause the controller to
   * notify the controllers of all dependent specs. When it does so, it sets
   * `max_observed_pub_id` to the current `last_pub_id`, so that it can avoid
   * notifying dependent controllers unnecessarily.
   */
  maxObservedPubId: Scalars['Id']['output'];
  /**
   * If we are awaiting a cooldown before publishing this spec, this field will be set
   * to the time after which the publication will be retried.
   */
  nextAfter?: Maybe<Scalars['DateTime']['output']>;
  pendingRepublish?: Maybe<RepublishRequested>;
};

export type QueryRoot = {
  __typename?: 'QueryRoot';
  /** Returns a complete list of alert subscriptions. */
  alertSubscriptions: Array<AlertSubscription>;
  /**
   * Returns a list of alerts that are currently active for the given catalog
   * prefixes.
   */
  alerts: AlertConnection;
  /**
   * Returns data planes accessible to the current user.
   *
   * Results are paginated and sorted by data_plane_name.
   * Only data planes the user has at least read capability to are returned.
   */
  dataPlanes: DataPlaneConnection;
  /**
   * List invite links the caller has admin access to.
   *
   * Returns invite links under all prefixes where the caller has admin
   * capability, optionally narrowed by a prefix filter.
   */
  inviteLinks: InviteLinkConnection;
  /**
   * Returns a paginated list of live specs under the given prefix and
   * matching the given type.
   *
   * Note that the `user_capability` that's returned as part of the reference
   * represents the user's capability to the whole prefix, and it is possible
   * that there are more specific grants for a broader capability. In other
   * words, this capability represents the _minimum_ capability that the user
   * has for the given spec.
   */
  liveSpecs: LiveSpecRefConnection;
  prefixes: PrefixRefConnection;
  /**
   * Returns storage mappings accessible to the current user.
   *
   * Requires at least read capability to the queried prefixes.
   * Results are paginated and sorted by catalog_prefix.
   */
  storageMappings: StorageMappingConnection;
};


export type QueryRootAlertSubscriptionsArgs = {
  by: AlertSubscriptionsBy;
};


export type QueryRootAlertsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  by: AlertsBy;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryRootDataPlanesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryRootInviteLinksArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<InviteLinksFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryRootLiveSpecsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  by: LiveSpecsBy;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryRootPrefixesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  by: PrefixesBy;
  first?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryRootStorageMappingsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  by: StorageMappingsBy;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

/** Result of redeeming an invite link. */
export type RedeemInviteLinkResult = {
  __typename?: 'RedeemInviteLinkResult';
  /** The capability level that was granted. */
  capability: Capability;
  /** The catalog prefix that was granted. */
  catalogPrefix: Scalars['Prefix']['output'];
};

export type RepublishRequested = {
  __typename?: 'RepublishRequested';
  /**
   * The `last_build_id` of the live spec as of when the `Republish` message
   * is received. If the live spec is observed with a `last_build_id` that is
   * greater than this, then the republication will be considered successful
   * and complete.
   */
  lastBuildId: Scalars['Id']['output'];
  /** The `reason` from the `Republish` message */
  reason: Scalars['String']['output'];
  /** Informational only, timestamp of when the controller observed the `Republish` request. */
  receivedAt: Scalars['DateTime']['output'];
};

/** The shape of a connector status, which matches that of an ops::Log. */
export type ShardFailure = {
  __typename?: 'ShardFailure';
  /**
   * Arbitrary JSON that can be used to communicate additional details. The
   * specific fields and their meanings are up to the connector, except for
   * the flow `/events` fields: `eventType`, `eventTarget`, and `error`, which
   * are restricted to string values.
   */
  fields: Scalars['JSONObject']['output'];
  /** The message is meant to be presented to users, and may use Markdown formatting. */
  message: Scalars['String']['output'];
  /** The specific shard that failed */
  shard: ShardRef;
  /** The time at which the failure occurred */
  ts: Scalars['DateTime']['output'];
};

/**
 * Identifies the specific task shard that is the source of an event. This
 * matches the shape of the `shard` field in an `ops.Log` message.
 */
export type ShardRef = {
  __typename?: 'ShardRef';
  /**
   * The id of the build that the shard was running when the event was
   * generated. This can be compared against the `last_build_id` of the live
   * spec to determine whether the event happened with the most rececnt
   * version of the published spec (it did if the `last_build_id` is the
   * same).
   */
  build: Scalars['Id']['output'];
  /**
   * The key range of the task as a hex string. Together with rClockBegin, this
   * uniquely identifies a specific task shard.
   */
  keyBegin: Scalars['String']['output'];
  /** The name of the task */
  name: Scalars['String']['output'];
  /**
   * The rClock range of the task as a hex string. Together with keyBegin, this
   * uniquely identifies a specific task shard.
   */
  rClockBegin: Scalars['String']['output'];
};

export type ShardStatusCheck = {
  __typename?: 'ShardStatusCheck';
  /** The number of checks that have returned ths status */
  count: Scalars['Int']['output'];
  /** The time of the first status check that returned this status */
  firstTs: Scalars['DateTime']['output'];
  /** The time of the most recent status check */
  lastTs: Scalars['DateTime']['output'];
  /** The observed status */
  status: ShardsStatus;
};

/** Represents a high level status aggregate of all the shards for a given task. */
export type ShardsStatus =
  /** Any task shard is `Failed` */
  | 'FAILED'
  /** All task shards have a `Primary` member. */
  | 'OK'
  /**
   * Any task shards are in `Pending` or `Backfill`, and none are `Failed`.
   * Or no task shards yet exist.
   */
  | 'PENDING';

/** Status information about the `sourceCapture` */
export type SourceCaptureStatus = {
  __typename?: 'SourceCaptureStatus';
  /**
   * If `up_to_date` is `false`, then this will contain the set of
   * `sourceCapture` collections that need to be added. This is provided
   * simply to aid in debugging in case the publication to add the bindings
   * fails.
   */
  addBindings: Array<Scalars['Collection']['output']>;
  /**
   * Whether the materialization bindings are up-to-date with respect to
   * the `sourceCapture` bindings. In normal operation, this should always
   * be `true`. Otherwise, there will be a controller `error` and the
   * publication status will contain details of why the update failed.
   */
  upToDate: Scalars['Boolean']['output'];
};

export type SpecPublicationHistoryItem = {
  __typename?: 'SpecPublicationHistoryItem';
  /**
   * Description of the publication, including any automated model updates
   * performed as part of the publication
   */
  detail?: Maybe<Scalars['String']['output']>;
  /** The live spec model that was published */
  model?: Maybe<Scalars['JSON']['output']>;
  /** The id of the publication */
  publicationId: Scalars['Id']['output'];
  /** Timestamp of the publication */
  publishedAt: Scalars['DateTime']['output'];
  /** The URL of an avatar image for the user who created the publication, if known */
  userAvatarUrl?: Maybe<Scalars['String']['output']>;
  /** The email of the user who created the publication, if known */
  userEmail?: Maybe<Scalars['String']['output']>;
  /** The full name of the user who created the publication, if known */
  userFullName?: Maybe<Scalars['String']['output']>;
  /** The id of the user who created the publication */
  userId: Scalars['UUID']['output'];
};

export type SpecPublicationHistoryItemConnection = {
  __typename?: 'SpecPublicationHistoryItemConnection';
  /** A list of edges. */
  edges: Array<SpecPublicationHistoryItemEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type SpecPublicationHistoryItemEdge = {
  __typename?: 'SpecPublicationHistoryItemEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node: SpecPublicationHistoryItem;
};

/**
 * A machine-readable summary of the status
 *
 * This summary is derived from multiple different sources of information about
 * a catalog item, and it attempts to coalesce all that information into a
 * single, simple characterization. The term "status" can mean different
 * things, but here we're primarily concerned with answering the question: "do
 * we see any problems that might be affecting the correct operation of the
 * task".
 */
export type StatusSummaryType =
  /** There's some sort of error with this catalog spec. */
  | 'ERROR'
  /** Things seem ...not bad */
  | 'OK'
  /**
   * The task is currently disabled. Only pertains to captures, derivations,
   * and materializations.
   */
  | 'TASK_DISABLED'
  /**
   * Something isn't fully working, but the condition is expected to clear
   * automatically soon. Nothing to worry about as long as the condition
   * doesn't persist for too long.
   */
  | 'WARNING';

/** The highest-level status of a publication. */
export type StatusType =
  /**
   * There was a failure to build or validate the drafted specs. This could
   * be due to a mistake in the drafted specs, or due to a failure to
   * validate the proposed changes with an external system connected to one
   * of the connected captures or materializations.
   */
  | 'buildFailed'
  /**
   * Optimistic locking failure for one or more specs in the publication. This case should
   * typically be retried by the publisher.
   */
  | 'buildIdLockFailure'
  /** The publication used the deprecated background flag, which is no longer supported. */
  | 'deprecatedBackground'
  /**
   * Returned when there are no draft specs (after pruning unbound
   * collections). There will not be any `draft_errors` in this case, because
   * there's no `catalog_name` to associate with an error. And it may not be
   * desirable to treat this as an error, depending on the scenario.
   */
  | 'emptyDraft'
  /**
   * One or more expected `last_pub_id`s did not match the actual `last_pub_id`, indicating that specs
   * have been changed since the draft was created.
   */
  | 'expectPubIdMismatch'
  /**
   * Something went wrong with the publication process. These errors can
   * typically be retried by the client.
   */
  | 'publishFailed'
  /** The publication has not yet been completed. */
  | 'queued'
  /**
   * The publication was successful. All drafted specs are now committed as
   * the live specs. Note that activation of the published specs in the data
   * plane happens asynchronously, after the publication is committed.
   * Therefore, it may take some time for the published changes to be
   * reflected in running tasks.
   */
  | 'success'
  /** Publication failed due to the failure of one or more tests. */
  | 'testFailed';

/** Result of testing storage health for a single data plane and store. */
export type StorageHealthItem = {
  __typename?: 'StorageHealthItem';
  /** Name of the data plane that was checked. */
  dataPlaneName: Scalars['String']['output'];
  /** Error message if the health check failed, or null if it passed. */
  error?: Maybe<Scalars['String']['output']>;
  /** The fragment store that was checked. */
  fragmentStore: Scalars['JSON']['output'];
};

/** A storage mapping that defines where collection data is stored. */
export type StorageMapping = {
  __typename?: 'StorageMapping';
  /** The catalog prefix this storage mapping applies to. */
  catalogPrefix: Scalars['Prefix']['output'];
  /** Optional description of this storage mapping. */
  detail?: Maybe<Scalars['String']['output']>;
  /** The storage definition containing stores and data plane assignments. */
  spec: Scalars['JSON']['output'];
  /** The current user's capability to this storage mapping's prefix. */
  userCapability: Capability;
};

export type StorageMappingConnection = {
  __typename?: 'StorageMappingConnection';
  /** A list of edges. */
  edges: Array<StorageMappingEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
};

/** An edge in a connection. */
export type StorageMappingEdge = {
  __typename?: 'StorageMappingEdge';
  /** A cursor for use in pagination */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge */
  node: StorageMapping;
};

/** Input type for querying storage mappings. */
export type StorageMappingsBy = {
  /**
   * Fetch storage mappings by exact catalog prefixes.
   * At least one of `exactPrefixes` or `underPrefix` must be provided.
   */
  exactPrefixes?: InputMaybe<Array<Scalars['Prefix']['input']>>;
  /**
   * Fetch all storage mappings under this prefix pattern.
   * For example, "acmeCo/" returns mappings for "acmeCo/", "acmeCo/team-a/", etc.
   * At least one of `exactPrefixes` or `underPrefix` must be provided.
   */
  underPrefix?: InputMaybe<Scalars['Prefix']['input']>;
};

/** Result of updating a storage mapping. */
export type UpdateStorageMappingResult = {
  __typename?: 'UpdateStorageMappingResult';
  /** The catalog prefix for which the storage mapping was updated. */
  catalogPrefix: Scalars['Prefix']['output'];
  /** Whether a republish is required because the primary storage bucket changed. */
  republish: Scalars['Boolean']['output'];
};

export type DataPlanesQueryVariables = Exact<{
  after?: InputMaybe<Scalars['String']['input']>;
}>;


export type DataPlanesQuery = { __typename?: 'QueryRoot', dataPlanes: { __typename?: 'DataPlaneConnection', edges: Array<{ __typename?: 'DataPlaneEdge', node: { __typename?: 'DataPlane', name: string, cloudProvider: DataPlaneCloudProvider, region: string, isPublic: boolean, fqdn: string, cidrBlocks: Array<string>, awsIamUserArn?: string | null, gcpServiceAccountEmail?: string | null, azureApplicationClientId?: string | null, azureApplicationName?: string | null } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null } } };

export type LiveSpecsQueryQueryVariables = Exact<{
  prefix: Scalars['Prefix']['input'];
  after?: InputMaybe<Scalars['String']['input']>;
}>;


export type LiveSpecsQueryQuery = { __typename?: 'QueryRoot', liveSpecs: { __typename?: 'LiveSpecRefConnection', edges: Array<{ __typename?: 'LiveSpecRefEdge', cursor: string, node: { __typename?: 'LiveSpecRef', catalogName: any, liveSpec?: { __typename?: 'LiveSpec', catalogType: CatalogType } | null } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null } } };

export type CreateStorageMappingMutationVariables = Exact<{
  catalogPrefix: Scalars['Prefix']['input'];
  spec: Scalars['JSON']['input'];
  detail?: InputMaybe<Scalars['String']['input']>;
}>;


export type CreateStorageMappingMutation = { __typename?: 'MutationRoot', createStorageMapping: { __typename?: 'CreateStorageMappingResult', catalogPrefix: any } };

export type UpdateStorageMappingMutationVariables = Exact<{
  catalogPrefix: Scalars['Prefix']['input'];
  spec: Scalars['JSON']['input'];
  detail?: InputMaybe<Scalars['String']['input']>;
}>;


export type UpdateStorageMappingMutation = { __typename?: 'MutationRoot', updateStorageMapping: { __typename?: 'UpdateStorageMappingResult', catalogPrefix: any, republish: boolean } };

export type TestConnectionHealthMutationVariables = Exact<{
  catalogPrefix: Scalars['Prefix']['input'];
  spec: Scalars['JSON']['input'];
}>;


export type TestConnectionHealthMutation = { __typename?: 'MutationRoot', testConnectionHealth: { __typename?: 'ConnectionHealthTestResult', results: Array<{ __typename?: 'StorageHealthItem', fragmentStore: any, dataPlaneName: string, error?: string | null }> } };

export type StorageMappingQueryQueryVariables = Exact<{
  underPrefix: Scalars['Prefix']['input'];
}>;


export type StorageMappingQueryQuery = { __typename?: 'QueryRoot', storageMappings: { __typename?: 'StorageMappingConnection', edges: Array<{ __typename?: 'StorageMappingEdge', cursor: string, node: { __typename?: 'StorageMapping', catalogPrefix: any, spec: any } }> } };

export type AlertingOverviewQueryQueryVariables = Exact<{
  prefix: Scalars['String']['input'];
  active?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type AlertingOverviewQueryQuery = { __typename?: 'QueryRoot', alerts: { __typename?: 'AlertConnection', edges: Array<{ __typename?: 'AlertEdge', node: { __typename?: 'Alert', alertType: AlertType, firedAt: any, catalogName: string, resolvedAt?: any | null, alertDetails: any } }> } };

export type ActiveAlertCountQueryVariables = Exact<{
  catalogName: Scalars['Name']['input'];
}>;


export type ActiveAlertCountQuery = { __typename?: 'QueryRoot', liveSpecs: { __typename?: 'LiveSpecRefConnection', edges: Array<{ __typename?: 'LiveSpecRefEdge', cursor: string, node: { __typename?: 'LiveSpecRef', activeAlerts?: Array<{ __typename?: 'Alert', alertType: AlertType }> | null } }> } };

export type ActiveAlertsQueryQueryVariables = Exact<{
  catalogName?: InputMaybe<Array<Scalars['Name']['input']> | Scalars['Name']['input']>;
}>;


export type ActiveAlertsQueryQuery = { __typename?: 'QueryRoot', liveSpecs: { __typename?: 'LiveSpecRefConnection', edges: Array<{ __typename?: 'LiveSpecRefEdge', node: { __typename?: 'LiveSpecRef', activeAlerts?: Array<{ __typename?: 'Alert', alertType: AlertType, catalogName: string, firedAt: any, alertDetails: any }> | null } }> } };

export type AlertHistoryQueryQueryVariables = Exact<{
  catalogName?: InputMaybe<Array<Scalars['Name']['input']> | Scalars['Name']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  last: Scalars['Int']['input'];
}>;


export type AlertHistoryQueryQuery = { __typename?: 'QueryRoot', liveSpecs: { __typename?: 'LiveSpecRefConnection', edges: Array<{ __typename?: 'LiveSpecRefEdge', node: { __typename?: 'LiveSpecRef', alertHistory?: { __typename?: 'AlertConnection', edges: Array<{ __typename?: 'AlertEdge', cursor: string, node: { __typename?: 'Alert', alertType: AlertType, catalogName: string, firedAt: any, resolvedAt?: any | null, alertDetails: any } }>, pageInfo: { __typename?: 'PageInfo', hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null } } | null } }> } };

export type PageInfoReverseFragment = { __typename?: 'PageInfo', hasPreviousPage: boolean, startCursor?: string | null, endCursor?: string | null };

export type AuthRolesQueryQueryVariables = Exact<{
  after?: InputMaybe<Scalars['String']['input']>;
}>;


export type AuthRolesQueryQuery = { __typename?: 'QueryRoot', prefixes: { __typename?: 'PrefixRefConnection', edges: Array<{ __typename?: 'PrefixRefEdge', node: { __typename?: 'PrefixRef', prefix: any, userCapability: Capability } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null } } };

export const PageInfoReverseFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PageInfoReverse"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PageInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}},{"kind":"Field","name":{"kind":"Name","value":"startCursor"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}}]} as unknown as DocumentNode<PageInfoReverseFragment, unknown>;
export const DataPlanesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DataPlanes"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"dataPlanes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"100"}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"cloudProvider"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"isPublic"}},{"kind":"Field","name":{"kind":"Name","value":"fqdn"}},{"kind":"Field","name":{"kind":"Name","value":"cidrBlocks"}},{"kind":"Field","name":{"kind":"Name","value":"awsIamUserArn"}},{"kind":"Field","name":{"kind":"Name","value":"gcpServiceAccountEmail"}},{"kind":"Field","name":{"kind":"Name","value":"azureApplicationClientId"}},{"kind":"Field","name":{"kind":"Name","value":"azureApplicationName"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}}]}}]}}]} as unknown as DocumentNode<DataPlanesQuery, DataPlanesQueryVariables>;
export const LiveSpecsQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LiveSpecsQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"prefix"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Prefix"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"liveSpecs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"by"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"prefix"},"value":{"kind":"Variable","name":{"kind":"Name","value":"prefix"}}}]}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"100"}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cursor"}},{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"catalogName"}},{"kind":"Field","name":{"kind":"Name","value":"liveSpec"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"catalogType"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}}]}}]}}]} as unknown as DocumentNode<LiveSpecsQueryQuery, LiveSpecsQueryQueryVariables>;
export const CreateStorageMappingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateStorageMapping"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"catalogPrefix"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Prefix"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"spec"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"JSON"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"detail"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createStorageMapping"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"catalogPrefix"},"value":{"kind":"Variable","name":{"kind":"Name","value":"catalogPrefix"}}},{"kind":"Argument","name":{"kind":"Name","value":"spec"},"value":{"kind":"Variable","name":{"kind":"Name","value":"spec"}}},{"kind":"Argument","name":{"kind":"Name","value":"detail"},"value":{"kind":"Variable","name":{"kind":"Name","value":"detail"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"catalogPrefix"}}]}}]}}]} as unknown as DocumentNode<CreateStorageMappingMutation, CreateStorageMappingMutationVariables>;
export const UpdateStorageMappingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateStorageMapping"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"catalogPrefix"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Prefix"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"spec"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"JSON"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"detail"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateStorageMapping"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"catalogPrefix"},"value":{"kind":"Variable","name":{"kind":"Name","value":"catalogPrefix"}}},{"kind":"Argument","name":{"kind":"Name","value":"spec"},"value":{"kind":"Variable","name":{"kind":"Name","value":"spec"}}},{"kind":"Argument","name":{"kind":"Name","value":"detail"},"value":{"kind":"Variable","name":{"kind":"Name","value":"detail"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"catalogPrefix"}},{"kind":"Field","name":{"kind":"Name","value":"republish"}}]}}]}}]} as unknown as DocumentNode<UpdateStorageMappingMutation, UpdateStorageMappingMutationVariables>;
export const TestConnectionHealthDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TestConnectionHealth"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"catalogPrefix"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Prefix"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"spec"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"JSON"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"testConnectionHealth"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"catalogPrefix"},"value":{"kind":"Variable","name":{"kind":"Name","value":"catalogPrefix"}}},{"kind":"Argument","name":{"kind":"Name","value":"spec"},"value":{"kind":"Variable","name":{"kind":"Name","value":"spec"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"results"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fragmentStore"}},{"kind":"Field","name":{"kind":"Name","value":"dataPlaneName"}},{"kind":"Field","name":{"kind":"Name","value":"error"}}]}}]}}]}}]} as unknown as DocumentNode<TestConnectionHealthMutation, TestConnectionHealthMutationVariables>;
export const StorageMappingQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"StorageMappingQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"underPrefix"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Prefix"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"storageMappings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"by"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"underPrefix"},"value":{"kind":"Variable","name":{"kind":"Name","value":"underPrefix"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cursor"}},{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"catalogPrefix"}},{"kind":"Field","name":{"kind":"Name","value":"spec"}}]}}]}}]}}]}}]} as unknown as DocumentNode<StorageMappingQueryQuery, StorageMappingQueryQueryVariables>;
export const AlertingOverviewQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AlertingOverviewQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"prefix"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"active"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"alerts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"by"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"prefix"},"value":{"kind":"Variable","name":{"kind":"Name","value":"prefix"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"active"},"value":{"kind":"Variable","name":{"kind":"Name","value":"active"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"alertType"}},{"kind":"Field","name":{"kind":"Name","value":"firedAt"}},{"kind":"Field","name":{"kind":"Name","value":"catalogName"}},{"kind":"Field","alias":{"kind":"Name","value":"alertDetails"},"name":{"kind":"Name","value":"arguments"}},{"kind":"Field","name":{"kind":"Name","value":"resolvedAt"}}]}}]}}]}}]}}]} as unknown as DocumentNode<AlertingOverviewQueryQuery, AlertingOverviewQueryQueryVariables>;
export const ActiveAlertCountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ActiveAlertCount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"catalogName"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Name"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"liveSpecs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"by"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"names"},"value":{"kind":"ListValue","values":[{"kind":"Variable","name":{"kind":"Name","value":"catalogName"}}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cursor"}},{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activeAlerts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"alertType"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<ActiveAlertCountQuery, ActiveAlertCountQueryVariables>;
export const ActiveAlertsQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ActiveAlertsQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"catalogName"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Name"}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"liveSpecs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"by"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"names"},"value":{"kind":"Variable","name":{"kind":"Name","value":"catalogName"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activeAlerts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"alertType"}},{"kind":"Field","name":{"kind":"Name","value":"catalogName"}},{"kind":"Field","alias":{"kind":"Name","value":"alertDetails"},"name":{"kind":"Name","value":"arguments"}},{"kind":"Field","name":{"kind":"Name","value":"firedAt"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<ActiveAlertsQueryQuery, ActiveAlertsQueryQueryVariables>;
export const AlertHistoryQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AlertHistoryQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"catalogName"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Name"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"before"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"last"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"liveSpecs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"by"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"names"},"value":{"kind":"Variable","name":{"kind":"Name","value":"catalogName"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"alertHistory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"before"},"value":{"kind":"Variable","name":{"kind":"Name","value":"before"}}},{"kind":"Argument","name":{"kind":"Name","value":"last"},"value":{"kind":"Variable","name":{"kind":"Name","value":"last"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cursor"}},{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"alertType"}},{"kind":"Field","alias":{"kind":"Name","value":"alertDetails"},"name":{"kind":"Name","value":"arguments"}},{"kind":"Field","name":{"kind":"Name","value":"catalogName"}},{"kind":"Field","name":{"kind":"Name","value":"firedAt"}},{"kind":"Field","name":{"kind":"Name","value":"resolvedAt"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PageInfoReverse"}}]}}]}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PageInfoReverse"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PageInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}},{"kind":"Field","name":{"kind":"Name","value":"startCursor"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}}]} as unknown as DocumentNode<AlertHistoryQueryQuery, AlertHistoryQueryQueryVariables>;
export const AuthRolesQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AuthRolesQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"prefixes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"by"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"minCapability"},"value":{"kind":"EnumValue","value":"read"}}]}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"7500"}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"prefix"}},{"kind":"Field","name":{"kind":"Name","value":"userCapability"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}}]}}]}}]} as unknown as DocumentNode<AuthRolesQueryQuery, AuthRolesQueryQueryVariables>;