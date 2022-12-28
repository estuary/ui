/* eslint-disable @typescript-eslint/no-unnecessary-condition */
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
import { Generate, JsonSchema, Layout, UISchemaElement } from '@jsonforms/core';
import { JsonFormsDispatch } from '@jsonforms/react';
import omit from 'lodash/omit';
import React from 'react';

interface CombinatorPropertiesProps {
    rootSchema: JsonSchema;
    schema: JsonSchema;
    combinatorKeyword: 'oneOf' | 'anyOf';
    path: string;
}

export const isLayout = (uischema: UISchemaElement): uischema is Layout =>
    Object.hasOwn(uischema, 'elements');

export class CombinatorProperties extends React.Component<
    CombinatorPropertiesProps,
    {}
> {
    render() {
        const { schema, combinatorKeyword, path, rootSchema } = this.props;

        const otherProps: JsonSchema = omit(
            schema,
            combinatorKeyword
        ) as JsonSchema;
        const foundUISchema: UISchemaElement = Generate.uiSchema(
            otherProps,
            'VerticalLayout',
            undefined,
            rootSchema
        );
        let isLayoutWithElements = false;
        if (
            foundUISchema !== null &&
            isLayout(foundUISchema) &&
            foundUISchema.elements.length > 0
        ) {
            // Customization: generateUiSchema used to return null when a schema without
            // a type or combinator was passed. We decided that was an error, and made it
            // instead return a special NullType error control to make schema debugging easier.
            // In order to retain the previous behavior, the consequence is that we now have to
            // explicitly check for that error conmponent, instead of relying on a null return
            isLayoutWithElements =
                foundUISchema.elements[0].type !== 'NullType';
        }

        if (isLayoutWithElements) {
            return (
                <JsonFormsDispatch
                    schema={otherProps}
                    path={path}
                    uischema={foundUISchema}
                />
            );
        }

        return null;
    }
}

export default CombinatorProperties;
