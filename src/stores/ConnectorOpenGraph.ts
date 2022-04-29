import produce from 'immer';
import { devtoolsOptions } from 'utils/store-utils';
import create from 'zustand';
import { devtools } from 'zustand/middleware';

export interface State {
    connectors: {
        [key: string]: any;
    };
    getConnectorOpenGraph: (key: string) => any;
    setConnectorOpenGraph: (key: string, value: any) => void;
    setConnectorOpenGraphs: (newVal: any[]) => void;
}

const getInitialStateData = (): Pick<State, 'connectors'> => {
    return {
        connectors: {},
    };
};

const useConnectorOpenGraphStore = create<State>()(
    devtools(
        (set, get) => ({
            ...getInitialStateData(),
            getConnectorOpenGraph: (key) => {
                const response = get().connectors[key];

                console.log({ key, response });

                return response;
            },
            setConnectorOpenGraph: (key, value) => {
                set(
                    produce((state) => {
                        state.connectors[key] = value;
                    }),
                    false
                );
            },
            setConnectorOpenGraphs: (newVal) => {
                set(
                    produce((state) => {
                        newVal.map(
                            (connector) =>
                                (state.connectors[connector.id] = {
                                    image: connector.open_graph['en-US'].image,
                                })
                        );
                    }),
                    false
                );
            },
        }),
        devtoolsOptions('connector-open-graph-state')
    )
);

export const useConnectorOpenGraphSelectors = {
    getConnectorOpenGraph: (state: State) => state.getConnectorOpenGraph,
    setConnectorOpenGraphs: (state: State) => state.setConnectorOpenGraphs,
};

export default useConnectorOpenGraphStore;
