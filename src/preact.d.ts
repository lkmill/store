// T - Wrapped component props
// S - Wrapped component state
// K - Store state
// I - Injected props to wrapped component

declare module '@bmp/store/preact' {
  import * as Preact from 'preact'
  import { StateMapper, Store, ActionCreatorMap, WrappedActionCreatorMap } from '@bmp/store'

  export function useStore<K, E>(): Store<K, E>

  export function connect<T, S, K, I, A extends ActionCreatorMap<K, E>, E = any>(
    mapStateToProps: string | Array<string> | StateMapper<T, K, I> | null,
    actions?: A,
  ): (
    Child:
      | Preact.ComponentConstructor<T & I & WrappedActionCreatorMap<A>, S>
      | Preact.AnyComponent<T & I & WrappedActionCreatorMap<A>, S>,
  ) => Preact.ComponentConstructor<T | (T & I), S>

  export interface ProviderProps<K, E> {
    store: Store<K, E>
  }

  export const Provider: Preact.FunctionComponent<ProviderProps<K, E>>
}
