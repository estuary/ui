import type {
    PrefixedName_Change,
    PrefixedName_Errors,
} from 'src/components/inputs/PrefixedName/types';

import { useState } from 'react';

import { useIntl } from 'react-intl';

import { useEntityWorkflow } from 'src/context/Workflow';
import { useEntitiesStore_capabilities_adminable } from 'src/stores/Entities/hooks';
import { hasLength } from 'src/utils/misc-utils';
import { validateCatalogName } from 'src/validation';

interface Options {
    allowBlankName?: boolean;
    allowEndSlash?: boolean;
    defaultPrefix?: boolean;
    onChange?: PrefixedName_Change;
    onNameChange?: PrefixedName_Change;
    onPrefixChange?: PrefixedName_Change;
    prefixOnly?: boolean;
}

function useValidatePrefix({
    allowBlankName,
    allowEndSlash,
    defaultPrefix,
    onChange,
    onNameChange,
    onPrefixChange,
    prefixOnly,
}: Options) {
    const intl = useIntl();

    const workflow = useEntityWorkflow();

    // Store stuff
    const objectRoles = useEntitiesStore_capabilities_adminable(
        Boolean(workflow)
    );
    const singleOption = objectRoles.length === 1;

    // Fetch for the default value
    // const [selectedTenant, setSelectedTenant] = useTenantStore(useShallow((state) => [
    //     state.selectedTenant,
    //     state.setSelectedTenant,
    // ]));

    // Local State for editing
    const [errors, setErrors] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [nameError, setNameError] = useState<PrefixedName_Errors>(null);
    const [prefix, setPrefix] = useState(
        singleOption || defaultPrefix ? objectRoles[0] : '' //selectedTenant
    );
    const [prefixError, setPrefixError] = useState<PrefixedName_Errors>(null);

    const updateErrors = (prefixValue: string, nameValue: string) => {
        // Validate both inputs
        const prefixErrors = validateCatalogName(prefixValue, false, true);
        const nameErrors = validateCatalogName(
            nameValue,
            allowBlankName,
            allowEndSlash
        );

        // Array to keep list of errors in by going through each returned
        //  error and populating with the translated message
        const updatedErrors: string[] = [];
        const generateErrorList = (
            inputName: string,
            inputErrors: PrefixedName_Errors
        ) => {
            inputErrors?.forEach((inputError) => {
                updatedErrors.push(
                    intl.formatMessage({
                        id: `custom.prefixedName.${inputName}.${inputError}`,
                    })
                );
            });
        };

        // If there are any errors then populate the list
        if (prefixErrors) {
            generateErrorList('prefix', prefixErrors);
        }
        if (!prefixOnly && nameErrors) {
            generateErrorList('name', nameErrors);
        }

        // Generate the string by concat with space.
        //  Follows the style of JSONForms
        const errorString = hasLength(updatedErrors)
            ? updatedErrors.join(' \n')
            : null;

        // Set the local state
        setErrors(errorString);
        setPrefixError(prefixErrors);
        setNameError(nameErrors);

        return { prefixErrors, nameErrors, errorString };
    };

    const handlers = {
        setPrefix: (prefixValue: string) => {
            const { nameErrors, prefixErrors, errorString } = updateErrors(
                prefixValue,
                name
            );

            setPrefix(prefixValue);
            // setSelectedTenant(prefixValue);

            if (onPrefixChange) {
                onPrefixChange(prefixValue, errorString, {
                    prefix: prefixErrors,
                    name: nameError,
                });
            }

            if (onChange) {
                onChange(`${prefixValue}${name}`, errorString, {
                    prefix: prefixErrors,
                    name: nameErrors,
                });
            }
        },
        setName: (nameValue: string) => {
            // We don't allow spaces in names but users keep trying
            //      so making it easier on them and just replacing
            const processedValue = nameValue.replaceAll(/\s/g, '_');
            const { nameErrors, prefixErrors, errorString } = updateErrors(
                prefix,
                processedValue
            );

            setName(processedValue);

            if (onNameChange) {
                onNameChange(processedValue, errorString, {
                    prefix: prefixError,
                    name: nameError,
                });
            }

            if (onChange) {
                onChange(`${prefix}${processedValue}`, errorString, {
                    prefix: prefixErrors,
                    name: nameErrors,
                });
            }
        },
    };

    return {
        errors,
        handlers,
        name,
        nameError,
        objectRoles,
        prefix,
        prefixError,
        setPrefix,
        singleOption,
        updateErrors,
    };
}

export default useValidatePrefix;
