// THIS IS NOT AN EXHAUSTIVE LIST
//  These are only ones that have custom code written around them and are "common"
//  If a value/key/etc. is only used by a single component that that lives
//  in the component (ex: CatalogName)

export enum Options {
    multi = 'multi',
    nullable = 'nullable',
    format = 'format',
    oauthProvider = 'oauth_provider',
    oauthFields = 'oauth_fields',
    oauthPathToFields = 'oauth_path_to_fields',
    multiLineSecret = 'multiLineSecret',
    sshEndpoint = 'sshEndpoint',
}

export enum Formats {
    password = 'password',
    date = 'date',
    dateTime = 'date-time',
    time = 'time',
}

// These are Date Fns formats!
// https://date-fns.org/v2.29.3/docs/format
export enum Patterns {
    date = 'yyyy-MM-dd',
    dateTime = "yyyy-MM-dd'T'HH:mm:ss'Z'",
    time = "HH:mm:ss'Z'",
}

// THESE ARE ADDED TO AJV AS KEYWORDS (ui/src/services/ajv.ts)
export enum Annotations {
    advanced = 'advanced', // Should be collapsed by default (over ridden if section contains required fields)
    oAuthProvider = 'x-oauth2-provider', // Used to display OAuth
    iamAuth = 'x-iam-auth', // Used for iam authentication
    multiline = 'multiline', // text input should expect multiple lines
    order = 'order', // Used to order the fields in the UI
    secret = 'secret', // render as a password
    secretAirbyte = 'airbyte_secret', // render as a password
    defaultResourceConfigName = 'x-collection-name', // Used to default name in resource configs
    hiddenField = 'x-hidden-field', // The field or control will be marked as hidden using JSONForms `Rules`
    inferSchema = 'x-infer-schema', // Indicates that schema inference should be enabled in the UI
    deltaUpdates = 'x-delta-updates', // SourceCapture - Shows 'deltaUpdates' optional setting
    targetSchema = 'x-schema-name', // SourceCapture - Shows 'targetSchema' optional setting
    discriminator = 'discriminator', // Used to know what field in a complex oneOf should be unique (ex: parser)
}

export enum CustomTypes {
    missingType = 'MissingType',
}
