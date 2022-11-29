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

// These are DayJS formats!
// https://day.js.org/docs/en/display/format
export enum Patterns {
    date = 'YYYY-MM-DD',
    dateTime = 'YYYY-MM-DDTHH:mm:ssZ',
    time = 'HH:mm:ss',
}

export enum Annotations {
    advanced = 'advanced',
    oAuthProvider = 'x-oauth2-provider',
    multiline = 'multiline',
    order = 'order',
    secret = 'secret',
}
