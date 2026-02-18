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
    CombinatorKeyword,
    CombinatorRendererProps,
    LayoutProps,
    OwnPropsOfControl,
    OwnPropsOfLayout,
    StatePropsOfCombinator,
} from '@jsonforms/core';
import type { ComponentType } from 'react';

import React from 'react';

import {
    getUISchemas,
    mapStateToControlProps,
    Resolve,
    update,
} from '@jsonforms/core';
import {
    ctxDispatchToControlProps,
    ctxToLayoutProps,
    withJsonFormsContext,
} from '@jsonforms/react';

import { getDiscriminatorIndex } from 'src/forms/shared';
import {
    CHILDREN_HAVE_VALUE,
    LAYOUT_PATH,
} from 'src/services/jsonforms/shared';

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
        Component: ComponentType<React.PropsWithChildren<CombinatorRendererProps>>
    ): ComponentType<React.PropsWithChildren<OwnPropsOfControl>> =>
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
    Component: ComponentType<React.PropsWithChildren<CombinatorRendererProps>>,
    memoize = true
): ComponentType<React.PropsWithChildren<OwnPropsOfControl>> =>
    withJsonFormsContext(
        withCustomContextToOneOfProps(
            memoize ? React.memo(Component) : Component
        )
    );

// Custom Layout for CollapsibleGroup
// Used to allow groups that are optional to remove all of their own properties via
//  a passed in `handleChange`
export interface CustomLayoutProps extends LayoutProps {
    childrenHaveValue?: boolean;
    clearSettings: (path: string, value: any) => void;
}

// based on : packages/react/src/JsonFormsContext.tsx
const withCustomContextToLayoutProps =
    (Component: any): any =>
    // eslint-disable-next-line react/display-name
    ({ ctx, props }: any) => {
        const layoutProps = ctxToLayoutProps(ctx, props) as CustomLayoutProps;

        // So we know to disable the "clear settings" button we want
        //  to see if the children have data
        if (layoutProps.uischema.options?.[LAYOUT_PATH]) {
            // Only add the handleChange if there is a layout path to clear
            // based on : jsonforms/packages/examples/src/examples/onChange.ts
            layoutProps.clearSettings = () => {
                ctx.dispatch(
                    update(
                        layoutProps.uischema.options?.[LAYOUT_PATH],
                        () => undefined
                    )
                );
            };

            const childData = Resolve.data(
                layoutProps.data,
                props.uischema.options.layoutPath
            );

            layoutProps.uischema.options[CHILDREN_HAVE_VALUE] =
                Boolean(childData);
        }

        return <Component {...props} {...layoutProps} />;
    };

// based on : packages/react/src/JsonFormsContext.tsx
export const withCustomJsonFormsLayoutProps = <T extends LayoutProps>(
    Component: ComponentType<React.PropsWithChildren<T>>,
    memoize = true
): ComponentType<React.PropsWithChildren<T & OwnPropsOfLayout>> =>
    withJsonFormsContext(
        withCustomContextToLayoutProps(
            memoize ? React.memo(Component) : Component
        )
    );
