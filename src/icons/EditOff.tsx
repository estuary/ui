import React from 'react';

import { IconoirContext } from 'iconoir-react';

function SvgEditOff(
    passedProps: React.SVGProps<SVGSVGElement>,
    svgRef?: React.Ref<SVGSVGElement>
) {
    const context = React.useContext(IconoirContext);
    const props = {
        ...context,
        ...passedProps,
    };

    return (
        <svg
            width="1.5em"
            height="1.5em"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            color="currentColor"
            ref={svgRef}
            {...props}
        >
            <path
                d="M14.363 5.652L15.843 4.172C16.0287 3.98619 16.2492 3.8388 16.492 3.73824C16.7347 3.63768 16.9948 3.58592 17.2575 3.58592C17.5202 3.58592 17.7804 3.63768 18.0231 3.73824C18.2658 3.8388 18.4863 3.98619 18.672 4.172L20.086 5.586C20.461 5.96105 20.6716 6.46967 20.6716 7C20.6716 7.53032 20.461 8.03894 20.086 8.41399L18.606 9.894M14.363 5.652L18.606 9.894M14.363 5.652L11.6007 8.41399M18.606 9.894L15.8439 12.6564M8.47583 11.5386L4.74701 15.267C4.41499 15.599 4.21038 16.0373 4.16901 16.505L3.92701 19.245C3.91401 19.3907 3.93312 19.5374 3.98298 19.6749C4.03285 19.8123 4.11226 19.9372 4.21562 20.0407C4.31897 20.1441 4.44376 20.2236 4.58119 20.2736C4.71862 20.3236 4.86534 20.3429 5.01101 20.33L7.75101 20.088C8.21943 20.0471 8.65847 19.8424 8.99101 19.51L12.7189 15.7817"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            <path
                d="M3 5L19 21"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    );
}

const ForwardRef = React.forwardRef(SvgEditOff);

export default ForwardRef;
