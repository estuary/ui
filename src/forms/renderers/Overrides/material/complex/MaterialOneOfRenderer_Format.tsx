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
    JsonSchema,
    OwnPropsOfControl,
    RankedTester,
    rankWith,
    scopeEndsWith,
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
import { has } from 'lodash';
import isEmpty from 'lodash/isEmpty';
import { useCallback, useState } from 'react';
import CombinatorProperties from './CombinatorProperties';

export interface OwnOneOfProps extends OwnPropsOfControl {
    indexOfFittingSchema?: number;
}

export const Custom_MaterialOneOfRenderer_Format = ({
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
        (schema as JsonSchema).oneOf as JsonSchema[],
        rootSchema,
        'oneOf',
        uischema,
        path,
        uischemas
    );

    // Run through the elements and clear out the ones without elements
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
        const defaultVal: {
            formatter: string;
            settings?: any;
        } = {
            formatter: tabSchemaProps?.formatter.default ?? '',
        };

        if (has(tabSchemaProps, 'settings')) {
            defaultVal.settings = {};
        }

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
            if (isEmpty(data) || !has(data, 'settings')) {
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

export const FORMAT_SCOPE = 'format';

export const materialOneOfControlTester_Format: RankedTester = rankWith(
    10,
    scopeEndsWith(FORMAT_SCOPE)
);

export default withJsonFormsOneOfProps(Custom_MaterialOneOfRenderer_Format);
