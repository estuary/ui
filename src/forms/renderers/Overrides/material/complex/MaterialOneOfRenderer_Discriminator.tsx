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

import { useCallback, useState } from 'react';

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Hidden,
    Tab,
    Tabs,
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

import { keys } from 'lodash';
import isEmpty from 'lodash/isEmpty';

import CombinatorProperties from 'src/forms/renderers/Overrides/material/complex/CombinatorProperties';
import {
    discriminator,
    getDiscriminator,
    getDiscriminatorDefaultValue,
} from 'src/forms/renderers/shared';
import { withCustomJsonFormsOneOfDiscriminatorProps } from 'src/services/jsonforms/JsonFormsContext';

export interface OwnOneOfProps extends OwnPropsOfControl {
    indexOfFittingSchema?: number;
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
}: CombinatorRendererProps) => {
    const [open, setOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(
        indexOfFittingSchema || 0
    );
    const [newSelectedIndex, setNewSelectedIndex] = useState(0);
    const handleClose = useCallback(() => setOpen(false), [setOpen]);
    const cancel = useCallback(() => {
        setOpen(false);
    }, [setOpen]);

    const oneOfRenderInfos = createCombinatorRenderInfos(
        (schema as JsonSchema).oneOf as JsonSchema[],
        rootSchema,
        'oneOf',
        uischema,
        path,
        uischemas
    );

    const discriminatorProperty = getDiscriminator(schema);

    oneOfRenderInfos.map((renderer) => {
        const { uischema: rendererUischema } = renderer as any;
        rendererUischema.elements = rendererUischema.elements.filter(
            (el: any) => {
                // Remove any that are missing elements or somehow don't have scope (should never happen)
                if (el === null || !el.scope) return false;

                // We now want to try to hide the input that is rendering the discriminator
                //  since we are rendering the tabs this is just duplicating information
                //      This is not supported out of the box https://jsonforms.discourse.group/t/use-default-uischema-and-only-apply-rule-to-one-field/1742
                //  So we have to look at the pathSegments and filter our the one that matches the discriminator
                //      This should be safe according to JSONForms https://jsonforms.discourse.group/t/hiding-a-specific-path-when-rendering-a-complex-oneof/2795
                const pathSegments = el.scope?.split('/');
                if (pathSegments && pathSegments.length > 0) {
                    // Get the last segment as that should match property names
                    //  based on `isRequired` in jsonforms/packages/core/src/mappers/renderer.ts
                    return (
                        decode(pathSegments[pathSegments.length - 1]) !==
                        discriminatorProperty
                    );
                }

                return true;
            }
        );

        return renderer;
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
            // Customization: do not prompt user if they are only
            //  overwriting the discriminator as it is a single property.
            const keysInData = keys(data);
            if (
                (keysInData.length === 1 &&
                    keysInData[0] === discriminatorProperty) ||
                isEmpty(data)
            ) {
                openNewTab(newOneOfIndex);
            } else {
                setOpen(true);
            }
        },
        [setOpen, setSelectedIndex, data]
    );

    return (
        <Hidden xsUp={!visible}>
            <CombinatorProperties
                schema={schema}
                combinatorKeyword="oneOf"
                path={path}
            />
            <Tabs value={selectedIndex} onChange={handleTabChange}>
                {oneOfRenderInfos.map((oneOfRenderInfo) => (
                    <Tab
                        key={oneOfRenderInfo.label}
                        label={oneOfRenderInfo.label}
                        disabled={!enabled}
                    />
                ))}
            </Tabs>
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
        </Hidden>
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
