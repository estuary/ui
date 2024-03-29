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
    CombinatorKeyword,
    CombinatorRendererProps,
    getUISchemas,
    mapStateToControlProps,
    OwnPropsOfControl,
    StatePropsOfCombinator,
} from '@jsonforms/core';
import {
    ctxDispatchToControlProps,
    withJsonFormsContext,
} from '@jsonforms/react';
import { getDiscriminatorIndex } from 'forms/renderers/shared';
import React, { ComponentType } from 'react';

// All these functions are customized just so we can end up with the custom function
//  mapCustomStateToCombinatorRendererProps calling into out own getDiscriminatorIndex
// based on : packages/core/src/util/renderer.ts @ mapStateToCombinatorRendererProps
export const mapCustomStateToCombinatorRendererProps = (
    state: any, // JsonFormsState,
    ownProps: OwnPropsOfControl,
    keyword: CombinatorKeyword
): StatePropsOfCombinator => {
    const { data, schema, rootSchema, ...props } = mapStateToControlProps(
        state,
        ownProps
    );

    const indexOfFittingSchema: any = getDiscriminatorIndex(
        schema,
        data,
        keyword
    );

    // @ts-expect-error this is how it works in the original so leaving it
    return {
        data,
        schema,
        rootSchema,
        ...props,
        indexOfFittingSchema,
        uischemas: getUISchemas(state),
    };
};

// based on : packages/react/src/JsonFormsContext.tsx @ withContextToOneOfProps
const withCustomContextToOneOfProps =
    (
        Component: ComponentType<CombinatorRendererProps>
    ): ComponentType<OwnPropsOfControl> =>
    // eslint-disable-next-line react/display-name
    ({ ctx, props }: any) => {
        const oneOfProps = mapCustomStateToCombinatorRendererProps(
            { jsonforms: { ...ctx } },
            props,
            'oneOf'
        );
        const dispatchProps = ctxDispatchToControlProps(ctx.dispatch);
        return <Component {...props} {...oneOfProps} {...dispatchProps} />;
    };

// based on : packages/react/src/JsonFormsContext.tsx @ withJsonFormsOneOfProps
export const withCustomJsonFormsOneOfDiscriminatorProps = (
    Component: ComponentType<CombinatorRendererProps>,
    memoize = true
): ComponentType<OwnPropsOfControl> =>
    withJsonFormsContext(
        withCustomContextToOneOfProps(
            memoize ? React.memo(Component) : Component
        )
    );
