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
    OwnPropsOfControl,
    RankedTester,
} from '@jsonforms/core';

import { useCallback, useRef, useState } from 'react';

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Tab,
    Tabs,
    Typography,
} from '@mui/material';

import {
    and,
    createCombinatorRenderInfos,
    decode,
    isOneOfControl,
    rankWith,
    schemaMatches,
} from '@jsonforms/core';
import { JsonFormsDispatch } from '@jsonforms/react';

import isEmpty from 'lodash/isEmpty';

import CombinatorProperties from 'src/forms/overrides/material/complex/CombinatorProperties';
import { INJECTED } from 'src/forms/renderers/OAuth/shared';
import {
    discriminator,
    getDiscriminator,
    getDiscriminatorDefaultValue,
} from 'src/forms/shared';
import { withCustomJsonFormsOneOfDiscriminatorProps } from 'src/services/jsonforms/JsonFormsContext';
import { logRocketEvent } from 'src/services/shared';
import { hasOwnProperty } from 'src/utils/misc-utils';

const renderer = 'Custom_MaterialOneOfRenderer_Discriminator';

export interface OwnOneOfProps extends OwnPropsOfControl {
    indexOfFittingSchema?: number;
}

// Customization: do not prompt user if they are:
//  only the discriminator is changing
//      ex: first click of authentication (usually will only contain discriminator)
//  only the discriminator is changing and others are blank or INJECTED
//      ex: clicks after the first of authentication
//      ex: any click off a tab that is for oAuth
//  the data is totally empty (ex: parsers)
function skipTabChangePrompt(data: any, prop: string): boolean {
    // No data at all - we can skip
    if (isEmpty(data)) {
        return true;
    }

    for (const key in data) {
        // If it is the discriminator we can ignore
        if (key === prop) {
            continue;
        }

        const value = data[key];

        // Check if value is a non-null object - recurse into it
        if (typeof value === 'object' && value !== null) {
            if (!skipTabChangePrompt(value, prop)) {
                return false;
            }
        }
        // For non-object values, check if they're non-empty and not INJECTED
        else if (value !== '' && value !== INJECTED) {
            return false;
        }
    }

    return true;
}

export const Custom_MaterialOneOfRenderer_Discriminator = ({
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
}: CombinatorRendererProps) => {
    const defaultDiscriminator = useRef(true);
    const [open, setOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(
        indexOfFittingSchema || 0
    );
    const [newSelectedIndex, setNewSelectedIndex] = useState(0);
    const handleClose = useCallback(() => setOpen(false), [setOpen]);
    const cancel = useCallback(() => {
        setOpen(false);
    }, [setOpen]);

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

        // Customization: Handle setting the oneOf discriminator properly
        const defaultVal = getDiscriminatorDefaultValue(
            tabSchemaProps,
            discriminatorProperty
        );

        handleChange(path, defaultVal);
        setSelectedIndex(newIndex);
    };

    const confirm = useCallback(() => {
        handleChange(path, null);
        openNewTab(newSelectedIndex);
        setOpen(false);
    }, [handleChange, newSelectedIndex]);

    const handleTabChange = useCallback(
        (_event: any, newOneOfIndex: number) => {
            setNewSelectedIndex(newOneOfIndex);

            // Customization: Skip prompting when changing tab
            if (skipTabChangePrompt(data, discriminatorProperty)) {
                logRocketEvent('JsonForms', {
                    renderer,
                    skippingTabChangePrompt: true,
                });
                openNewTab(newOneOfIndex);
                return;
            }

            setOpen(true);
        },
        [setOpen, setSelectedIndex, data]
    );

    // Customization : Need to handle defaulting for Pydantic schemas
    //  They will return an `enum` with a single value and that will not
    //  be defaulted properly unless it is rendered. Since we are hiding the
    //  discriminator now we need to make sure it is set
    // We should set this for both edit and create. This is mainly to support
    //  the source-shopify-native connector as it can contain multiple discriminators
    //  in the stores array. If we do not set this on edit then the user cannot add
    //  new stores.
    if (defaultDiscriminator.current) {
        if (required && !hasOwnProperty(data, discriminatorProperty)) {
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
                [discriminatorProperty]: defaultVal?.[discriminatorProperty],
            });
        }
    }

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
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {'Clear form?'}
                </DialogTitle>

                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Your data will be cleared if you navigate away from this
                        tab. Do you want to proceed?
                    </DialogContentText>
                </DialogContent>

                <DialogActions>
                    <Button variant="text" onClick={cancel} color="primary">
                        No
                    </Button>

                    <Button
                        onClick={confirm}
                        color="primary"
                        variant="outlined"
                        autoFocus
                        id={`oneOf-${id}-confirm-yes`}
                    >
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export const materialOneOfControlTester_Discriminator: RankedTester = rankWith(
    10,
    and(
        isOneOfControl,
        schemaMatches((schema) => Object.hasOwn(schema, discriminator))
    )
);

export default withCustomJsonFormsOneOfDiscriminatorProps(
    Custom_MaterialOneOfRenderer_Discriminator
);
