import { useTargetNamingStore } from 'src/stores/TargetNaming/Store';

export const useTargetNaming_model = () =>
    useTargetNamingStore((state) => state.model);

export const useTargetNaming_setModel = () =>
    useTargetNamingStore((state) => state.setModel);

export const useTargetNaming_strategy = () =>
    useTargetNamingStore((state) => state.strategy);

export const useTargetNaming_setStrategy = () =>
    useTargetNamingStore((state) => state.setStrategy);

export const useTargetNaming_resetState = () =>
    useTargetNamingStore((state) => state.resetState);
