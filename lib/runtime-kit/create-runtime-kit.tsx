"use client";

import type { Draft } from "immer";
import { createContext, createElement, useContext, useState } from "react";
import type { ReactNode } from "react";
import { useStore } from "zustand";
import { immer } from "zustand/middleware/immer";
import { createStore } from "zustand/vanilla";
import type { StoreApi } from "zustand/vanilla";

type Listener<T> = (payload: T) => void;

export interface RuntimeEvents<EventMap extends Record<string, unknown>> {
  emit: <K extends keyof EventMap & string>(
    type: K,
    payload: EventMap[K]
  ) => void;
  on: <K extends keyof EventMap & string>(
    type: K,
    listener: Listener<EventMap[K]>
  ) => () => void;
}

export type RuntimeSetState<Store extends object> = (
  next: (state: Draft<Store>) => void
) => void;

export interface RuntimeFeatureApi<Store extends object> {
  getState: () => Store;
  setState: RuntimeSetState<Store>;
  subscribe: StoreApi<Store>["subscribe"];
}

export interface RuntimeFeature<
  Store extends object,
  EventMap extends Record<string, unknown> = Record<string, never>,
> {
  key: string;
  createSlice: (
    set: RuntimeSetState<Store>,
    get: () => Store,
    store: RuntimeFeatureApi<Store>,
    events: RuntimeEvents<EventMap>
  ) => Partial<Store>;
  Setup?: () => ReactNode;
}

interface RuntimeContextValue<
  Store extends object,
  EventMap extends Record<string, unknown>,
> {
  api: StoreApi<Store>;
  events: RuntimeEvents<EventMap>;
}

const createEventBus = <
  EventMap extends Record<string, unknown>,
>(): RuntimeEvents<EventMap> => {
  const listeners = new Map<string, Set<Listener<unknown>>>();

  return {
    emit: (type, payload) => {
      const bucket = listeners.get(type);
      if (!bucket) {
        return;
      }
      for (const listener of bucket) {
        listener(payload);
      }
    },
    on: (type, listener) => {
      const bucket = listeners.get(type) ?? new Set();
      bucket.add(listener as Listener<unknown>);
      listeners.set(type, bucket);
      return () => {
        bucket.delete(listener as Listener<unknown>);
      };
    },
  };
};

export const createRuntimeKit = <
  Store extends object,
  EventMap extends Record<string, unknown> = Record<string, never>,
>(options: {
  features: readonly RuntimeFeature<Store, EventMap>[];
}) => {
  const RuntimeContext = createContext<RuntimeContextValue<
    Store,
    EventMap
  > | null>(null);

  const createRuntimeStore = (): RuntimeContextValue<Store, EventMap> => {
    const events = createEventBus<EventMap>();
    const api = createStore(
      immer((set, get, store) => {
        const slices = {} as Store;
        const setDraft: RuntimeSetState<Store> = (recipe) => {
          (set as (fn: (state: Draft<Store>) => void) => void)(recipe);
        };
        const featureApi: RuntimeFeatureApi<Store> = {
          getState: get as () => Store,
          setState: setDraft,
          subscribe: store.subscribe as StoreApi<Store>["subscribe"],
        };
        for (const feature of options.features) {
          Object.assign(
            slices,
            feature.createSlice(
              setDraft,
              get as () => Store,
              featureApi,
              events
            )
          );
        }
        return slices;
      })
    ) as unknown as StoreApi<Store>;

    return { api, events };
  };

  const Provider = ({ children }: { children: ReactNode }) => {
    const [value, setValue] = useState(() => createRuntimeStore());
    void setValue;

    return createElement(
      RuntimeContext.Provider,
      { value },
      ...options.features.map((feature) =>
        feature.Setup
          ? createElement(feature.Setup, { key: feature.key })
          : null
      ),
      children
    );
  };

  const useRuntimeValue = (): RuntimeContextValue<Store, EventMap> => {
    const value = useContext(RuntimeContext);
    if (!value) {
      throw new Error("Missing runtime Provider in tree");
    }
    return value;
  };

  const useRuntimeApi = (): StoreApi<Store> => useRuntimeValue().api;

  const useRuntimeEvents = (): RuntimeEvents<EventMap> =>
    useRuntimeValue().events;

  const useRuntimeFeatureStore = <T,>(selector: (state: Store) => T): T => {
    const api = useRuntimeApi();
    return useStore(api, selector);
  };

  return {
    Provider,
    createRuntimeStore,
    useRuntimeApi,
    useRuntimeEvents,
    useRuntimeFeatureStore,
  };
};

export type ImmerStoreApi<Store extends object> = StoreApi<Store>;
