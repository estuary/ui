import type { PostgrestResponse } from '@supabase/postgrest-js';

export type KnownEvents =
    | 'Auth'
    | 'EndpointConfig'
    | 'JsonForms'
    | 'MonacoEditor'
    | 'ResetInvalidSetting'
    | 'SkimProjections'
    | 'StoreCleaner'
    | 'SourceCapture'
    | 'Task'
    | 'WorkflowStore'
    | 'evaluate_field_selection'
    | 'Error_Silent';

// TODO (enums) - please do not add more to the CustomEvents enum. Instead - use the
//  KnownEvents type
export enum CustomEvents {
    AUTHORIZE_TASK = 'AuthorizeTask',
    AUTH_SIGNOUT = 'Auth_Signout',
    DATA_FLOW_RESET = 'Data_Flow_Reset',
    BINDINGS_EXPECTED_MISSING = 'Bindings_Expected_Missing',
    BINDINGS_RESOURCE_CONFIG_MISSING = 'Bindings_Resource_Config_Missing',
    CAPTURE_CREATE = 'Capture_Create',
    CAPTURE_CREATE_CONFIG_CREATE = 'Capture_Create_Config_Create',
    CAPTURE_CREATE_CONFIG_EDIT = 'Capture_Create_Config_Edit',
    CAPTURE_DISCOVER = 'Capture_Discover',
    CAPTURE_EDIT = 'Capture_Edit',
    CAPTURE_INTERVAL = 'CaptureInterval',
    CAPTURE_MATERIALIZE_ATTEMPT = 'Capture_Materialize_Attempt',
    CAPTURE_MATERIALIZE_FAILED = 'Capture_Materialize_Failed',
    CAPTURE_MATERIALIZE_SUCCESS = 'Capture_Materialize_Success',
    CAPTURE_TEST = 'Capture_Test',
    COLLECTION_CREATE = 'Collection_Create',
    COLLECTION_SCHEMA = 'CollectionSchema',
    CONNECTOR_VERSION_MISSING = 'Connector_Version:Missing',
    CONNECTOR_VERSION_UNSUPPORTED = 'Connector_Version:Unsupported',
    DATA_PLANE_SELECTOR = 'Data_Plane_Selector',
    DATE_TIME_PICKER_CHANGE = 'Date_Time_Picker:Change',
    DIRECTIVE = 'Directive',
    DIRECTIVE_EXCHANGE_TOKEN = 'Directive:ExchangeToken',
    DIRECTIVE_GUARD_STATE = 'Directive:Guard:State',
    DRAFT_ID_SET = 'Draft_Id_Set',
    ENTITY_NOT_FOUND = 'Entity_Not_Found',
    ENTITY_SAVE = 'Entity_Save',
    ENTITY_STATUS = 'EntityStatus',
    ENTITY_RELATIONSHIPS = 'EntityRelationships',
    ERROR_BOUNDARY_DISPLAYED = 'Error_Boundary_Displayed',
    ERROR_BOUNDARY_PAYMENT_METHODS = 'Error_Boundary_Displayed:PaymentMethods',
    ERROR_DISPLAYED = 'Error_Displayed',
    ERROR_MISSING_MESSAGE = 'Error_Missing_Message',
    FIELD_SELECTION = 'FieldSelection',
    FIELD_SELECTION_REFRESH_AUTO = 'Field_Selection_Refresh:Auto',
    FIELD_SELECTION_REFRESH_MANUAL = 'Field_Selection_Refresh:Manual',
    FORM_STATE_PREVENTED = 'FormState:Prevented',
    FULL_PAGE_ERROR_DISPLAYED = 'Full_Page_Error_Displayed',
    HELP_DOCS = 'Help_Docs',
    INCOMPATIBLE_SCHEMA_CHANGE = 'IncompatibleSchemaChange',
    LAZY_LOADING = 'Lazy Loading',
    LOGIN = 'Login',
    LOGS_DOCUMENT_COUNT = 'Logs:Document:Count',
    JOURNAL_DATA = 'JournalData',
    JOURNAL_DATA_STATUS = 'JournalData:Status',
    JOURNAL_DATA_MAX_BYTES_NOT_ENOUGH = 'JournalData:MaxBytesNotEnough',
    JSON_FORMS_NULLABLE_UNSUPPORTED = 'JsonForms:Nullable:Unsupported',
    JSON_FORMS_TYPE_MISSING = 'JsonForms:Type:Missing',
    JSON_SCHEMA_DEREF = 'JsonSchema:Deref',
    MARKETPLACE_VERIFY = 'Marketplace:Verify',
    MATERIALIZATION_CREATE = 'Materialization_Create',
    MATERIALIZATION_CREATE_CONFIG_CREATE = 'Materialization_Create_Config_Create',
    MATERIALIZATION_CREATE_CONFIG_EDIT = 'Materialization_Create_Config_Edit',
    MATERIALIZATION_EDIT = 'Materialization_Edit',
    MATERIALIZATION_TEST = 'Materialization_Test',
    MATERIALIZATION_TEST_BACKGROUND = 'Materialization_Test_Background',
    NOTIFICATION_NETWORK_WARNING = 'Notification_Network_Warning',
    OAUTH_DEFAULTING = 'Oauth_Defaulting',
    OAUTH_SUCCESS_HANDLER = 'Oauth_Success_Handler',
    OAUTH_WINDOW_OPENING = 'Oauth_Window_Opening',
    OAUTH_WINDOW_OPENER = 'Oauth_Window_Opener',
    ONBOARDING = 'Onboarding',
    PROJECTION = 'Projection',
    REPUBLISH_PREFIX_FAILED = 'Republish_Prefix:Failed',
    STRIPE_FORM_LOADING_FAILED = 'Stripe_Form_Loading_Failed',
    SYNC_SCHEDULE = 'Sync_Schedule',
    SUPABASE_CALL_FAILED = 'Supabase_Call_Failed',
    SUPABASE_CALL_UNAUTHENTICATED = 'Supabase_Call_Unauthenticated',
    SWR_LOADING_SLOW = 'SWR_Loading_Slow',
    TRANSLATION_KEY_MISSING = 'Translation_Key_Missing',
    TRIAL_STORAGE = 'TrialStorage',
    UPDATE_AVAILABLE = 'Update_Available',
    URL_FORMAT_ERROR = 'URLFormatError',
}

export type CommonStatuses = 'success' | 'failed' | 'exception' | 'skipped';

export type SuccessResponse<T> = Pick<
    PostgrestResponse<T>,
    'status' | 'statusText' | 'count'
> & {
    data: T[];
};
