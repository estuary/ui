import type { BaseComponentProps } from 'src/types';

import { createContext, useContext, useState } from 'react';

import FullPageSpinner from 'src/components/fullPage/Spinner';

const OnLoadSpinnerContext = createContext<{
    setLoading: (val: boolean) => void;
    loading: boolean;
}>({
    setLoading: () => {},
    loading: true,
});

interface Props extends BaseComponentProps {
    defaultState: boolean;
}

//      NOT INTENDED FOR ALL FULL PAGE SPINNERS
// This is used only for the initial loading of the application.
//  It only works if some component later in the nexting sets this
//   back to false so it won't show anymore.
const OnLoadSpinnerProvider = ({ children, defaultState }: Props) => {
    const [loading, setLoading] = useState(defaultState);

    return (
        <OnLoadSpinnerContext.Provider value={{ loading, setLoading }}>
            {loading ? <FullPageSpinner /> : null}

            {children}
        </OnLoadSpinnerContext.Provider>
    );
};

const useOnLoadSpinner = () => {
    return useContext(OnLoadSpinnerContext);
};

export { OnLoadSpinnerProvider, useOnLoadSpinner };
