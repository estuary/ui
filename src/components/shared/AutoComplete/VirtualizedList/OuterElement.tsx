import React from 'react';

export const OuterElementContext = React.createContext({});

function OuterElementComponent(props: any, ref: any) {
    const { ownerState: _ownerState, ...outerProps } =
        React.useContext(OuterElementContext) as any;
    return <div ref={ref} {...props} {...outerProps} />;
}

export const OuterElement = React.forwardRef<HTMLDivElement>(
    OuterElementComponent
);
