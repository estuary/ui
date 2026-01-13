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
        //  however it seems we are fine for now (Q1 2026)
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

// Currently (Q1 2026) just for when OAuth
export const isInsideArray = (path: any) => {
    if (!path) {
        return false;
    }

    return (
        hasLength(path) &&
        path.split('.').some((segment: string) => /^\d+$/.test(segment))
    );
};
