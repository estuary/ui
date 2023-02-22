// THIS IS NOT AN EXHAUSTIVE LIST
//  These are only ones that have custom code written around them and are "common"
//  If a value/key/etc. is only used by a single component that that lives
//  in the component (ex: CatalogName)

export enum Options {
    multi = 'multi',
    format = 'format',
    oauthProvider = 'oauth_provider',
    oauthFields = 'oauth_fields',
    oauthPathToFields = 'oauth_path_to_fields',
    multiLineSecret = 'multiLineSecret',
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

export enum Annotations {
    advanced = 'advanced',
    oAuthProvider = 'x-oauth2-provider',
    multiline = 'multiline',
    order = 'order',
    secret = 'secret',
    defaultResourceConfigName = 'x-collection-name',
    inferSchema = 'x-infer-schema',
}
