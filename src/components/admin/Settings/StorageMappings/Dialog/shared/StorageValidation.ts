import type { ProgressiveRules } from 'src/components/shared/RHFFields/types';

export const storeValidation = {
    azureContainerName: {
        partial: {
            maxLength: {
                value: 62,
                message: 'Container name cannot exceed 62 characters',
            },
            pattern: {
                value: /^[a-z0-9][a-z0-9-]*$/,
                message:
                    'Lowercase letters, numbers, and hyphens only, and must start with a letter or number',
            },
        },
        final: {
            required: 'Container name is required',
            minLength: {
                value: 3,
                message: 'Container name must be at least 3 characters',
            },
            pattern: {
                value: /^[a-z0-9][a-z0-9\-]*[a-z0-9]$/,
                message:
                    'Lowercase letters, numbers, and hyphens only, and must start and end with a letter or number',
            },
        },
    },
    azureStorageAccountName: {
        partial: {
            maxLength: {
                value: 24,
                message: 'Storage account name cannot exceed 24 characters',
            },
            pattern: {
                value: /^[a-z0-9]+$/,
                message: 'Lowercase letters and numbers only',
            },
        },
        final: {
            required: 'Storage account name is required',
            minLength: {
                value: 3,
                message: 'Storage account name must be at least 3 characters',
            },
        },
    },
    azureAccountTenantId: {
        final: {
            required: 'Account tenant ID is required',
        },
    },
    awsBucket: {
        partial: {
            pattern: {
                value: /^[a-z0-9][a-z0-9\-\.]*$/,
                message:
                    'Bucket name must start with a letter or number and contain only lowercase letters, numbers, hyphens, and periods',
            },
        },
        final: {
            required: 'Bucket is required',
            pattern: {
                value: /^(([a-z0-9]|[a-z0-9][a-z0-9\-]*[a-z0-9])\.)*([a-z0-9]|[a-z0-9][a-z0-9\-]*[a-z0-9])$/,
                message:
                    'Must contain only lowercase letters, numbers, hyphens, and periods',
            },
        },
    },
    gcpBucket: {
        partial: {
            maxLength: {
                value: 62,
                message: 'Bucket name cannot exceed 62 characters',
            },
            pattern: {
                value: /^[a-z0-9][a-z0-9\-_\.]*$/,
                message:
                    'Bucket name must start with a letter or number and contain only lowercase letters, numbers, hyphens, underscores, and periods',
            },
        },
        final: {
            required: 'Bucket is required',
            pattern: {
                value: /^[a-z0-9][a-z0-9\-_\.]*[a-z0-9]$/,
                message:
                    'Bucket name must start and end with a letter or number and contain only lowercase letters, numbers, hyphens, underscores, and periods',
            },
            minLength: {
                value: 3,
                message: 'Bucket name must be at least 3 characters',
            },
        },
    },
    storagePrefix: {
        partial: {
            pattern: {
                value: /^[a-zA-Z0-9]([a-zA-Z0-9_\-.]|\/{1}(?!\/))*[a-zA-Z0-9/]?$/,
                message:
                    'Prefix must start with a letter or number and can only contain letters, numbers, hyphens, underscores, periods, and forward slashes',
            },
        },
    },
} as const satisfies Record<string, ProgressiveRules>;
