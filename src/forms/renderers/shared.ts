import { createDefaultValue } from '@jsonforms/core';
import { forIn } from 'lodash';
import { getDiscriminator } from './Overrides/material/complex/MaterialOneOfRenderer_Discriminator';

export const getDiscriminatorDefaultValue = (
    tabSchemaProps: any,
    discriminatorProperty: string
) => {
    // Go through all the props and set them into the object.
    //  If it is the discriminator then try to set the default
    //      value, then the const, and finally default to an empty string.
    //  If it is any other value then go ahead and create the value
    const defaultVal: {
        [k: string]: any;
    } = {};
    forIn(tabSchemaProps, (val: any, key: string) => {
        defaultVal[key] =
            key === discriminatorProperty
                ? val.default ?? val.const ?? ''
                : createDefaultValue(val, tabSchemaProps);
    });

    return defaultVal;
};

// This is a custom way of finding the discriminator index because JSON Forms
//  relies on validating each option with AJV. This is great and clever when creating
//  a schema. However, when we edit a schema we can end up with an option that
//  contains errors. The NetSuite connector Authentication is what caught this. the
//  `user_pass` option contains two fields that are encrypted and so they are empty
//  during edit. This mean that JsonForms would not find the
export const getDiscriminatorIndex = (schema: any, data: any, keyword: any) => {
    let indexOfFittingSchema: number | undefined;

    const discriminatorProperty = getDiscriminator(schema);

    if (
        discriminatorProperty &&
        schema &&
        keyword &&
        typeof schema[keyword] !== 'undefined'
    ) {
        schema[keyword].some((keywordSchema: any, index: number) => {
            const defaultVal = getDiscriminatorDefaultValue(
                keywordSchema.properties,
                discriminatorProperty
            );

            if (
                data[discriminatorProperty] ===
                defaultVal[discriminatorProperty]
            ) {
                indexOfFittingSchema = index;
                return true;
            }

            return false;
        });
    }

    return indexOfFittingSchema;
};
