import type { Schema } from 'src/types';

import { createDefaultValue } from '@jsonforms/core';

import { forIn } from 'lodash';

import { hasLength } from 'src/utils/misc-utils';

export const discriminator = 'discriminator';

export const getDiscriminator = (schema: any) => {
    if (schema?.[discriminator]) {
        if (schema[discriminator].propertyName) {
            return schema[discriminator].propertyName;
        }

        // TODO (JSONForms) - AJV does not support discriminator.mapping
        //  We might want to end up adding custom handling for this
        //  however it seems we are fine for now (as of 2026 Q1)
        // if (schema[discriminator].mapping) {...wire up this handling somehow?...}
    }

    return null;
};

export const getDiscriminatorDefaultValue = (
    tabSchemaProps: any,
    discriminatorProperty: string
): Schema => {
    // Go through all the props and set them into the object.
    //  If it is the discriminator then try to set the default
    //      value, then the const, and finally default to an empty string.
    //  If it is any other value then go ahead and create the value
    const defaultVal: Schema = {};
    forIn(tabSchemaProps, (val: any, key: string) => {
        defaultVal[key] =
            key === discriminatorProperty
                ? (val.default ?? val.const ?? '')
                : createDefaultValue(val, tabSchemaProps);
    });

    return defaultVal;
};

// This is a custom way of finding the discriminator index because JSON Forms
//  relies on validating each option with AJV. This is great and clever when creating
//  a schema. However, when we edit a schema we can end up with an option that
//  contains errors. The NetSuite connector Authentication is what caught this. the
//  `user_pass` option contains two fields that are encrypted and so they are empty
//  during edit. This mean that JsonForms would not find them
export const getDiscriminatorIndex = (schema: any, data: any, keyword: any) => {
    const discriminatorProperty = getDiscriminator(schema);

    if (
        !discriminatorProperty ||
        !data ||
        !data[discriminatorProperty] ||
        !schema ||
        !schema[keyword]
    ) {
        return;
    }

    let indexOfFittingSchema: number | undefined;
    schema[keyword].some((keywordSchema: any, index: number) => {
        const defaultVal = getDiscriminatorDefaultValue(
            keywordSchema.properties,
            discriminatorProperty
        );

        if (data[discriminatorProperty] === defaultVal[discriminatorProperty]) {
            indexOfFittingSchema = index;
            return true;
        }

        return false;
    });

    return indexOfFittingSchema;
};

const ARRAY_REGEX = /^\d+$/;

const splitPath = (path: string) => path.split('.');

const isArrayIndex = (segment: any) =>
    segment && typeof segment === 'string' && ARRAY_REGEX.test(segment);

// Just for OAuth (as of 2026 Q1)
export const isInsideArray = (path: string): boolean => {
    if (!path || typeof path !== 'string') {
        return false;
    }

    return hasLength(path) && splitPath(path).some(isArrayIndex);
};

/**
 * Extracts array context from a JSONForms path.
 * Given a path like "stores.2.credentials", returns:
 *   { arrayField: "stores", index: 2, rest: "credentials" }
 * Returns null if the path is not inside an array.
 */
export const getArrayContext = (
    path: string
): { arrayField: string; index: number; rest: string } | null => {
    if (!path || typeof path !== 'string') {
        return null;
    }

    const segments = splitPath(path);

    for (let i = 0; i < segments.length; i++) {
        if (isArrayIndex(segments[i])) {
            return {
                arrayField: segments.slice(0, i).join('.'),
                index: parseInt(segments[i], 10),
                rest: segments.slice(i + 1).join('.'),
            };
        }
    }

    return null;
};
