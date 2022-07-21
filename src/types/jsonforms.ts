// THIS IS NOT AN EXHAUSTIVE LIST
//  These are only ones that have custom code written around them and are "common"
//  If a value/key/etc. is only used by a single component that that lives
//  in the component (ex: CatalogName)

export enum Options {
    multi = 'multi',
    format = 'format',
}

export enum Formats {
    password = 'password',
    dateTime = 'date-time',
}

export enum Patterns {
    dateTime = 'YYYY-MM-DDThh:mm:ssZ',
}
