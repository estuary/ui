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
import {
    and,
    CombinatorRendererProps,
    createCombinatorRenderInfos,
    createDefaultValue,
    isOneOfControl,
    JsonSchema,
    OwnPropsOfControl,
    RankedTester,
    rankWith,
    schemaMatches,
} from '@jsonforms/core';
import { JsonFormsDispatch, withJsonFormsOneOfProps } from '@jsonforms/react';
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
import { forIn, keys } from 'lodash';
import isEmpty from 'lodash/isEmpty';
import { useCallback, useState } from 'react';
import CombinatorProperties from './CombinatorProperties';

export interface OwnOneOfProps extends OwnPropsOfControl {
    indexOfFittingSchema?: number;
}

const discriminator = 'discriminator';

export const getDiscriminator = (schema: any) => {
    return (schema as any)[discriminator]
        ? (schema as any)[discriminator].propertyName
        : null;
};

export const getDefaultValue = (
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
                : createDefaultValue(val);
    });

    return defaultVal;
};

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

    // Customization: Run through the elements and clear out the ones without elements
    oneOfRenderInfos.map((renderer) => {
        const { uischema: rendererUischema } = renderer as any;
        rendererUischema.elements = rendererUischema.elements.filter(
            (el: any) => el !== null
        );
        return renderer;
    });

    const openNewTab = (newIndex: number) => {
        const tabSchema = oneOfRenderInfos[newIndex].schema;
        const { properties: tabSchemaProps } = tabSchema;

        // Customization: Handle setting the oneOf discriminator properly
        const defaultVal = getDefaultValue(
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
    }, [handleChange, createDefaultValue, newSelectedIndex]);

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

export default withJsonFormsOneOfProps(
    Custom_MaterialOneOfRenderer_Discriminator
);
