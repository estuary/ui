/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable import/no-named-as-default */
/* eslint-disable react-hooks/exhaustive-deps */
/*

/*
  The MIT License
  
  Copyright (c) 2017-2019 EclipseSource Munich
  https://github.com/eclipsesource/jsonforms
  
  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:
  
  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.
  
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
*/
import type {
    CombinatorRendererProps,
    JsonSchema,
    RankedTester,
} from '@jsonforms/core';

import { useEffect, useRef, useState } from 'react';

import { Tab, Tabs, Typography } from '@mui/material';

import {
    and,
    createCombinatorRenderInfos,
    createDefaultValue,
    decode,
    isOneOfControl,
    isOneOfEnumControl,
    not,
    rankWith,
} from '@jsonforms/core';
import { JsonFormsDispatch } from '@jsonforms/react';

import CombinatorProperties from 'src/forms/overrides/material/complex/CombinatorProperties';
import {
    getDiscriminator,
    getDiscriminatorDefaultValue,
} from 'src/forms/shared';
import { withCustomJsonFormsOneOfDiscriminatorProps } from 'src/services/jsonforms/JsonFormsContext';
import { getUnionOptions } from 'src/services/jsonforms/shared';
import { logRocketEvent } from 'src/services/shared';
import { hasOwnProperty } from 'src/utils/misc-utils';

const renderer = 'Custom_MaterialOneOfRenderer';

const Custom_MaterialOneOfRenderer = ({
    handleChange,
    schema,
    path,
    renderers,
    cells,
    rootSchema,
    id,
    visible,
    indexOfFittingSchema,
    uischema,
    uischemas,
    data,
    enabled,
    required,
    config,
}: CombinatorRendererProps) => {
    const unionOptions = getUnionOptions(config);

    const defaultDiscriminator = useRef(true);
    // A form tracking its unions keeps the selected option, which the data
    // alone can't always tell
    const [selectedIndex, setSelectedIndex] = useState(
        unionOptions?.getSelectedOption(path) ?? (indexOfFittingSchema || 0)
    );

    const possibleSchemas = (schema as JsonSchema).oneOf as JsonSchema[];
    const oneOfRenderInfos = createCombinatorRenderInfos(
        possibleSchemas,
        rootSchema,
        'oneOf',
        uischema,
        path,
        uischemas
    );

    const discriminatorProperty = getDiscriminator(schema);

    oneOfRenderInfos.map((oneOfRenderer) => {
        const { uischema: rendererUischema } = oneOfRenderer as any;

        rendererUischema.elements = rendererUischema.elements.filter(
            (el: any) => {
                // We now want to try to hide the input that is rendering the discriminator
                //  since we are rendering the tabs this is just duplicating information
                //      This is not supported out of the box https://jsonforms.discourse.group/t/use-default-uischema-and-only-apply-rule-to-one-field/1742
                //  So we have to look at the pathSegments and filter our the one that matches the discriminator
                //      This should be safe according to JSONForms https://jsonforms.discourse.group/t/hiding-a-specific-path-when-rendering-a-complex-oneof/2795
                const pathSegments = el?.scope?.split('/');
                if (pathSegments && pathSegments.length > 0) {
                    // Get the last segment as that should match property names
                    //  based on `isRequired` in jsonforms/packages/core/src/mappers/renderer.ts
                    const renderOneOfOption =
                        decode(pathSegments[pathSegments.length - 1]) !==
                        discriminatorProperty;

                    logRocketEvent('JsonForms', {
                        renderer,
                        renderOneOfOption,
                    });

                    return renderOneOfOption;
                }

                // Default to rendering things as this is how JsonForms handles things
                return true;
            }
        );

        return oneOfRenderer;
    });

    const openNewTab = (newIndex: number) => {
        const tabSchema = oneOfRenderInfos[newIndex].schema;
        const { properties: tabSchemaProps } = tabSchema;

        // Customization: Handle setting the oneOf discriminator properly.
        // Without one, the option's defaults, as JSON Forms sets them.
        const defaultVal = discriminatorProperty
            ? getDiscriminatorDefaultValue(
                  tabSchemaProps,
                  discriminatorProperty
              )
            : createDefaultValue(tabSchema, rootSchema);

        // Its own fields come back as last entered. The discriminator and
        // const fields are the option's, so they come from the defaults.
        const fields = Object.keys(tabSchemaProps ?? {}).filter(
            (key) =>
                key !== discriminatorProperty &&
                tabSchemaProps?.[key].const === undefined
        );

        handleChange(
            path,
            unionOptions
                ? unionOptions.switchOption(path, newIndex, defaultVal, fields)
                : defaultVal
        );
        setSelectedIndex(newIndex);
    };

    const handleTabChange = (_event: unknown, newOneOfIndex: number) =>
        openNewTab(newOneOfIndex);

    // Customization : Need to handle defaulting for Pydantic schemas
    //  They will return an `enum` with a single value and that will not
    //  be defaulted properly unless it is rendered. Since we are hiding the
    //  discriminator now we need to make sure it is set
    // We should set this for both edit and create. This is mainly to support
    //  the source-shopify-native connector as it can contain multiple discriminators
    //  in the stores array. If we do not set this on edit then the user cannot add
    //  new stores.
    // We need to wait for data to exist so that we do not override any setting the user
    //  is setting and spread out default value into the data
    useEffect(() => {
        if (
            defaultDiscriminator.current &&
            discriminatorProperty &&
            required &&
            data &&
            !hasOwnProperty(data, discriminatorProperty)
        ) {
            const defaultVal = getDiscriminatorDefaultValue(
                possibleSchemas?.[selectedIndex]?.properties,
                discriminatorProperty
            );

            logRocketEvent('JsonForms', {
                renderer,
                defaultingDiscriminatorProperty: true,
                defaultDiscriminator: defaultVal?.[discriminatorProperty],
            });

            defaultDiscriminator.current = false;

            handleChange(path, {
                ...data,
                [discriminatorProperty]: defaultVal?.[discriminatorProperty],
            });
        }
        // We really only care about data so that once that is "changed" and exists
        //  then we can make sure the default discriminator is set on it
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    const singleOption = oneOfRenderInfos.length === 1;

    if (!visible) {
        return null;
    }

    return (
        <>
            <CombinatorProperties
                schema={schema}
                combinatorKeyword="oneOf"
                path={path}
            />
            {singleOption ? (
                // TODO (jsonforms) - we have wanted to hide this but some
                //  connectors work better with it showing (ex: materialize-iceberg)
                //  so we left it in for now.
                <Typography sx={{ fontWeight: 500, fontSize: 14 }}>
                    {oneOfRenderInfos[0].label}
                </Typography>
            ) : (
                <Tabs value={selectedIndex} onChange={handleTabChange}>
                    {oneOfRenderInfos.map((oneOfRenderInfo) => (
                        <Tab
                            key={oneOfRenderInfo.label}
                            label={oneOfRenderInfo.label}
                            disabled={!enabled}
                        />
                    ))}
                </Tabs>
            )}
            {oneOfRenderInfos.map(
                (oneOfRenderInfo, oneOfIndex) =>
                    selectedIndex === oneOfIndex && (
                        <JsonFormsDispatch
                            key={oneOfIndex}
                            schema={oneOfRenderInfo.schema}
                            uischema={oneOfRenderInfo.uischema}
                            path={path}
                            renderers={renderers}
                            cells={cells}
                        />
                    )
            )}
        </>
    );
};

// Every oneOf of objects, with or without a discriminator, so the
// stored-secret handling lives in one renderer. Above JSON Forms' stock
// renderer (3). A oneOf of consts is an enum, which keeps its own renderer.
export const materialOneOfControlTester: RankedTester = rankWith(
    10,
    and(isOneOfControl, not(isOneOfEnumControl))
);

export const MaterialOneOfRenderer = withCustomJsonFormsOneOfDiscriminatorProps(
    Custom_MaterialOneOfRenderer
);
