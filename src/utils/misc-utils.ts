import type { SortDirection } from '@mui/material';
import type {
    PostgrestFilterBuilder,
    PostgrestTransformBuilder,
} from '@supabase/postgrest-js';
import type { ProtocolStatus } from 'data-plane-gateway/types/gen/broker/protocol/broker';
import type { ReactElement, ReactNode } from 'react';
import type { BaseGrant, Grant_UserExt } from 'src/types';

import { isEmpty, isObject } from 'lodash';
import { createSearchParams } from 'react-router-dom';

import { derefSchema } from 'src/services/jsonforms';
import { logRocketConsole } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';

export const ESTUARY_SUPPORT_ROLE = 'estuary_support/';
export const DEMO_TENANT = 'demo/';

export const RESPONSE_DATA_LIMIT = 1000;

// Default size used when splitting up larged promises
export const CHUNK_SIZE = 10;

// Descriptions of these:
// https://github.com/gazette/core/blob/2580071332a6bf7f9302af1e513391f8c6539f5d/broker/protocol/protocol.proto#L20
export const JOURNAL_READ_WARNINGS = ['OFFSET_NOT_YET_AVAILABLE'];
export const JOURNAL_READ_ERRORS = [
    // temporary and quickly resolved
    'NO_JOURNAL_PRIMARY_BROKER',

    // journal is suspended
    // checked for data preview - ui/src/components/collection/DataPreview/HydrationError.tsx
    'SUSPENDED',

    // misc journal stuff
    'NOT_JOURNAL_PRIMARY_BROKER',
    'NOT_JOURNAL_BROKER',
    'INSUFFICIENT_JOURNAL_BROKERS',

    // peer disagreements
    'WRONG_ROUTE',
    'PROPOSAL_MISMATCH',

    // transaction failure
    'ETCD_TRANSACTION_FAILED',

    // access error
    'NOT_ALLOWED',

    // read failure
    'WRONG_APPEND_OFFSET',
    'INDEX_HAS_GREATER_OFFSET',
    'REGISTER_MISMATCH',
    'JOURNAL_NOT_FOUND',
];
export const journalStatusIsWarning = (status: ProtocolStatus | undefined) => {
    return status ? JOURNAL_READ_WARNINGS.includes(status) : false;
};
export const journalStatusIsError = (status: string | undefined) => {
    return status ? JOURNAL_READ_ERRORS.includes(status) : false;
};

// Max time stored in
//  go/flowctl-go/cmd-api-discover.go
//  go/flowctl-go/cmd-discover.go
export const MAX_DISCOVER_TIME = 30000;

export const stripPathing = (stringVal: string, tenantOnly?: boolean) => {
    if (!stringVal) return stringVal;

    if (tenantOnly) {
        return stringVal.substring(0, stringVal.indexOf('/') + 1);
    }
    return stringVal.substring(
        stringVal.lastIndexOf('/') + 1,
        stringVal.length
    );
};

export const splitPathAndName = (stringVal: string): string[] => {
    if (!stringVal) return [];

    const lastSlash = stringVal.lastIndexOf('/') + 1;
    return [stringVal.substring(0, lastSlash), stringVal.substring(lastSlash)];
};

export const hasLength = (val: string | any[] | null | undefined): boolean => {
    return Boolean(val && val.length > 0);
};

export const appendWithForwardSlash = (value: string): string =>
    hasLength(value) && !value.endsWith('/') ? `${value}/` : value;

export const encodeParamVal = (val: any) => {
    if (typeof val === 'boolean') {
        return val ? 1 : 0;
    }

    return val;
};

export const getPathWithParams = (
    baseURL: string,
    params: { [key: string]: string | string[] } | URLSearchParams
): string => {
    let newSearchParams;

    if (params instanceof URLSearchParams) {
        newSearchParams = params;
    } else {
        newSearchParams = createSearchParams(params);
    }

    return `${baseURL}?${newSearchParams.toString()}`;
};

export const getURL = (address: string, baseURL?: string | URL) => {
    try {
        return new URL(address, baseURL);
    } catch (error: unknown) {
        logRocketConsole(CustomEvents.URL_FORMAT_ERROR, { error });

        return null;
    }
};

export const base64RemovePadding = (state: string | null) => {
    return state ? state.replace(/[=]{1,2}$/, '') : state;
};

export const timeoutCleanUp = (pollerTimeout: number | null | undefined) => {
    if (pollerTimeout) {
        window.clearInterval(pollerTimeout);
    }
};

const INTERVAL_MAX = 5000;
const INTERVAL_INCREMENT = 500;
export const incrementInterval = (
    interval: number,
    max: number | undefined = INTERVAL_MAX
) => (interval < max ? interval + INTERVAL_INCREMENT : max);

export const arrayToMatrix = (arr: any[], width: number) =>
    arr.reduce(
        (rows, key, index) =>
            (index % width == 0
                ? rows.push([key])
                : rows[rows.length - 1].push(key)) && rows,
        []
    );

export const unescapeString = (stringVal: string) => {
    return stringVal.replaceAll(/\\"/g, '"');
};

// For awhile we need to support the old (pre sql) derivation key
const derivationKeys = ['derivation', 'derive'];

type SpecContainsDerivationResponse =
    | {
          isDerivation: false;
          derivationKey: null;
      }
    | {
          isDerivation: true;
          derivationKey: string;
      };
export const specContainsDerivation = (
    spec?: any
): SpecContainsDerivationResponse => {
    let isDerivation = false;
    let derivationKey = null;

    derivationKeys.some((key) => {
        if (spec?.[key]) {
            isDerivation = true;
            derivationKey = key;
            return true;
        }

        return false;
    });

    return { isDerivation, derivationKey };
};

export const compareInitialCharacterType = (a: any, b: any): number | null => {
    // See if the values start with alphanumeric
    const aIsAlphabetical = a.localeCompare('a') >= 0;
    const bIsAlphabetical = b.localeCompare('a') >= 0;

    // If a isn't alpha and b is then return >0 to put b first
    if (!aIsAlphabetical && bIsAlphabetical) {
        return 1;
    }

    // If a is alpha and b isn't then return <0 to put a first
    if (aIsAlphabetical && !bIsAlphabetical) {
        return -1;
    }

    // If a and b have the same classification then return null
    // to indicate that additional logic is required to determine
    // the sort order.
    return null;
};

export const basicSort_string = (
    a: any,
    b: any,
    sortDirection: SortDirection
) => {
    const sortResult = compareInitialCharacterType(a, b);

    if (typeof sortResult === 'number') {
        return sortResult;
    }

    // If we're here we know both strings are alphanumeric and can do normal sorts
    // ascending means compare a to b
    if (sortDirection === 'asc') {
        return a.localeCompare(b);
    }

    // descending means to flip the comparison order
    return b.localeCompare(a);
};

export const getDereffedSchema = async (val: any) => {
    const response = val ? await derefSchema(val) : val;
    return response;
};

export const configCanBeEmpty = (schema: any) => {
    if (!schema) {
        return false;
    }

    return Boolean(!schema.properties || isEmpty(schema.properties));
};

export const isReactElement = (value: ReactNode): value is ReactElement =>
    isObject(value) && 'props' in value;

export const isPostgrestFetcher = <T = any>(
    value:
        | PostgrestFilterBuilder<any, any, T, any, any>
        | PostgrestTransformBuilder<any, any, T, any, any>
        | Function
): value is
    | PostgrestFilterBuilder<any, any, T, any, any>
    | PostgrestTransformBuilder<any, any, T, any, any> =>
    isObject(value) && 'throwOnError' in value;

export const isGrant_UserExt = (
    value: Grant_UserExt | BaseGrant
): value is Grant_UserExt => isObject(value) && 'user_email' in value;

export const getAuthHeader = (token?: string) => {
    return {
        Authorization: `Bearer ${token}`,
    };
};
export const isPromiseFulfilledResult = <T>(
    value: PromiseSettledResult<T>
): value is PromiseFulfilledResult<T> => value.status === 'fulfilled';

export const hasOwnProperty = (
    value: null | object | undefined,
    property: PropertyKey
) => {
    if (!value) {
        return false;
    }

    const stringifiedProperty =
        typeof property === 'string' ? property : property.toString();

    return Object.keys(value).includes(stringifiedProperty);
};
