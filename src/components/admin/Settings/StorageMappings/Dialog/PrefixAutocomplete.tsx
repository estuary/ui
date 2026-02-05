import type { FieldValues, Path } from 'react-hook-form';

import { useCallback, useMemo } from 'react';

import { Autocomplete, TextField } from '@mui/material';

import { Controller, useFormContext } from 'react-hook-form';
import { gql, useQuery } from 'urql';

import { useStorageMappings } from 'src/api/storageMappingsGql';
import { validateCatalogName } from 'src/validation';

interface BasePrefixesQueryResponse {
    prefixes: {
        edges: {
            cursor: string;
            node: {
                prefix: string;
            };
        }[];
    };
}

interface LiveSpecsQueryResponse {
    liveSpecs: {
        edges: {
            cursor: string;
            node: {
                catalogName: string;
                liveSpec: {
                    catalogType: string;
                };
            };
        }[];
    };
}

const BasePrefixesQuery = gql<BasePrefixesQueryResponse>`
    query BasePrefixesQuery {
        prefixes(by: { minCapability: admin }, first: 20) {
            edges {
                node {
                    prefix
                }
            }
        }
    }
`;

const LiveSpecsQuery = gql<
    LiveSpecsQueryResponse,
    {
        prefix: string;
    }
>`
    query LiveSpecsQuery($prefix: String!) {
        liveSpecs(by: { prefix: $prefix }, first: 100) {
            edges {
                cursor
                node {
                    catalogName
                    liveSpec {
                        catalogType
                    }
                }
            }
        }
    }
`;
export function useBasePrefixes() {
    const [{ data: prefixData }] = useQuery({
        query: BasePrefixesQuery,
    });

    const basePrefixes = useMemo(() => {
        return prefixData?.prefixes.edges.map((edge) => edge.node.prefix) ?? [];
    }, [prefixData]);

    return basePrefixes;
}

type ValidateFn = (value: string) => true | string;
type ValidateRecord = Record<string, ValidateFn>;

interface PrefixAutocompleteProps<
    TFieldValues extends FieldValues,
    TName extends Path<TFieldValues> = Path<TFieldValues>,
> {
    name: TName;
    label: string;
    required?: boolean;
    helperText?: string;
    onChangeValidate?: ValidateRecord;
    onBlurValidate?: ValidateRecord;
}

export function PrefixAutocomplete<
    TFieldValues extends FieldValues,
    TName extends Path<TFieldValues> = Path<TFieldValues>,
>({
    name,
    label,
    required = false,
    helperText,
    onChangeValidate,
    onBlurValidate,
}: PrefixAutocompleteProps<TFieldValues, TName>) {
    const basePrefixes = useBasePrefixes();
    const validatePrefix = (value: string) =>
        validateCatalogName(value, false, true) != null;

    const [{ data: liveSpecData }] = useQuery({
        query: LiveSpecsQuery,
        variables: { prefix: basePrefixes[0] },
        pause: basePrefixes.length === 0,
    });

    const { storageMappings } = useStorageMappings();

    const branches = useMemo(() => {
        const leaves =
            liveSpecData?.liveSpecs.edges.map(
                (edge) => edge.node.catalogName
            ) ?? [];

        for (const mapping of storageMappings) {
            leaves.push(mapping.catalogPrefix);
        }

        const allBranches = new Set<string>();

        for (const leaf of leaves) {
            const parts = leaf.split('/').filter(Boolean);
            let path = '';
            for (const part of parts) {
                path += `${part}/`;
                allBranches.add(path);
            }
        }

        return Array.from(allBranches).sort();
    }, [liveSpecData, storageMappings]);

    const {
        control,
        setError,
        clearErrors,
        formState: { errors },
    } = useFormContext<TFieldValues>();

    const internalOnChangeValidate: ValidateRecord = useMemo(
        () => ({
            startsWithTenant: (value: string) => {
                if (
                    value &&
                    basePrefixes.length > 0 &&
                    !basePrefixes.some(
                        (prefix) =>
                            prefix.startsWith(value) || value.startsWith(prefix)
                    )
                ) {
                    return `Must start with one of: ${basePrefixes.join(', ')}`;
                }
                return true;
            },
        }),
        [validatePrefix, label]
    );

    const internalOnBlurValidate: ValidateRecord = useMemo(
        () => ({
            validBasePrefix: (value: string) => {
                if (!value && required) return `${label} is required`;

                if (basePrefixes.length === 0) return true;

                if (!value.endsWith('/')) {
                    return 'Prefix must end with a forward slash (/)';
                }

                const hasValidPrefix = basePrefixes.some((prefix) =>
                    value.startsWith(prefix)
                );
                return (
                    hasValidPrefix ||
                    `Must start with one of: ${basePrefixes.join(', ')}`
                );
            },
        }),
        [basePrefixes]
    );

    const runValidators = (
        value: string,
        validators: ValidateRecord | undefined
    ): string | null => {
        if (!validators) return null;
        for (const validate of Object.values(validators)) {
            const result = validate(value);
            if (result !== true) {
                return result;
            }
        }
        return null;
    };

    const allBlurValidate = useMemo(
        () => ({ ...internalOnBlurValidate, ...onBlurValidate }),
        [internalOnBlurValidate, onBlurValidate]
    );

    const allOnChangeValidate = useMemo(
        () => ({ ...internalOnChangeValidate, ...onChangeValidate }),
        [internalOnChangeValidate, onChangeValidate]
    );

    // const allValidate = useMemo(
    //     () => ({ ...allBlurValidate, ...allOnChangeValidate }),
    //     [allBlurValidate, allOnChangeValidate]
    // );

    // Get nested error by path
    const error = name.split('.').reduce<unknown>((obj, key) => {
        if (obj && typeof obj === 'object' && key in obj) {
            return (obj as Record<string, unknown>)[key];
        }
        return undefined;
    }, errors) as { message?: string } | undefined;

    const hasError = !!error;
    const errorMessage = error?.message;

    const handleValidation = useCallback(
        (value: string, validators: ValidateRecord) => {
            const errorMessage = runValidators(value, validators);
            if (errorMessage) {
                setError(name, { type: 'validate', message: errorMessage });
            } else {
                clearErrors(name);
            }
        },
        [name, setError, clearErrors]
    );

    return (
        <>
            <Controller
                name={name}
                control={control}
                rules={{
                    validate: allOnChangeValidate,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                    <Autocomplete
                        freeSolo
                        options={branches}
                        inputValue={value ?? ''}
                        onInputChange={(_event, newInputValue, reason) => {
                            onChange(newInputValue);
                        }}
                        onChange={(_event, newValue) => {
                            onChange(newValue ?? '');
                        }}
                        onBlur={() => {
                            onBlur();
                            handleValidation(value ?? '', allBlurValidate);
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label={label}
                                required={required}
                                error={hasError}
                                helperText={errorMessage ?? helperText}
                                size="small"
                            />
                        )}
                    />
                )}
            />
            {/* {basePrefixes.join(', ')} <br />
            {JSON.stringify(storageMappings, null, 2)} */}
            {/* has error: {hasError.toString()}
            <br />
            errors: <pre>{JSON.stringify(errors, null, 2)}</pre> */}
        </>
    );
}
