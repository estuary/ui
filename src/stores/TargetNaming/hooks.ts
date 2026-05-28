import { useTargetNamingStore } from 'src/stores/TargetNaming/Store';

export const useTargetNaming_model = () =>
    useTargetNamingStore((state) => state.model);

export const useTargetNaming_setModel = () =>
    useTargetNamingStore((state) => state.setModel);

export const useTargetNaming_strategy = () =>
    useTargetNamingStore((state) => state.targetNamingStrategy);

export const useTargetNaming_setStrategy = () =>
    useTargetNamingStore((state) => state.setTargetNamingStrategy);

export const useTargetNaming_saving = () =>
    useTargetNamingStore((state) => state.saving);

export const useTargetNaming_setSaving = () =>
    useTargetNamingStore((state) => state.setSaving);

export const useTargetNaming_resetState = () =>
    useTargetNamingStore((state) => state.resetState);
