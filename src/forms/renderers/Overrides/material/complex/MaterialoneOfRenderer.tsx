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
    CombinatorRendererProps,
    createCombinatorRenderInfos,
    createDefaultValue,
    isOneOfControl,
    JsonSchema,
    OwnPropsOfControl,
    RankedTester,
    rankWith,
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
import isEmpty from 'lodash/isEmpty';
import { useCallback, useState } from 'react';
import { createJSONFormDefaults } from 'services/ajv';
import CombinatorProperties from './CombinatorProperties';

export interface OwnOneOfProps extends OwnPropsOfControl {
    indexOfFittingSchema?: number;
}

export const Custom_MaterialOneOfRenderer = ({
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
        (schema as JsonSchema).oneOf,
        rootSchema,
        'oneOf',
        uischema,
        path,
        uischemas
    );

    const openNewTab = (newIndex: number) => {
        const tabSchema = oneOfRenderInfos[newIndex].schema;
        const { properties, required } = tabSchema;
        const propertyKeys = Object.keys(properties ?? {});
        let defaultVal = null;

        if (
            required?.length === 1 &&
            propertyKeys.length === 1 &&
            properties?.[required[0]]
        ) {
            const onlyOneRequired = properties[required[0]];
            const foo = propertyKeys[0];
            defaultVal = {};
            if (onlyOneRequired.properties) {
                defaultVal[foo] = createJSONFormDefaults(
                    onlyOneRequired.properties
                );
            } else {
                defaultVal[foo] = onlyOneRequired.default;
            }
        }

        handleChange(
            path,
            defaultVal !== null ? defaultVal : createDefaultValue(tabSchema)
        );
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
            if (isEmpty(data)) {
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
            <b>This is the custom one!</b>
            <Tabs value={selectedIndex} onChange={handleTabChange}>
                {oneOfRenderInfos.map((oneOfRenderInfo) => (
                    <Tab
                        key={oneOfRenderInfo.label}
                        label={oneOfRenderInfo.label}
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
                    <Button onClick={cancel} color="primary">
                        No
                    </Button>
                    <Button
                        onClick={confirm}
                        color="primary"
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

export const materialOneOfControlTester: RankedTester = rankWith(
    4,
    isOneOfControl
);

export default withJsonFormsOneOfProps(Custom_MaterialOneOfRenderer);
