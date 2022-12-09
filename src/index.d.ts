// T - Wrapped component props
// S - Wrapped component state
// K - Store state
// I - Injected props to wrapped component

export type Listener<K, E = undefined> = (state: K, action?: Action<K, E>, update?: Partial<K>) => void
export type Unsubscribe = () => void

export type Action<K, E = undefined> = (
  getState: () => K,
  dispatch: (action: Action<K, E>) => Promise<void> | void,
  extraArg: E,
) => Promise<Partial<K> | void> | Partial<K> | void

export type ActionCreator<K, E = undefined> = (...args: any[]) => Action<K, E>

export type ActionCreatorMap<K, E = undefined> = {
  [actionCreator: string]: ActionCreator<K, E>
}

export type WrappedActionCreatorMap<A> = {
  [P in keyof A]: (...args: any[]) => Promise<void> | void
}

export interface Store<K, E = undefined> {
  dispatch(action: Action<K, E>): Promise<void> | void
  getState(): K
  setState<U extends keyof K>(update: Pick<K, U>, overwrite?: boolean, action?: Action<K, E>): void
  subscribe(f: Listener<K, E>): Unsubscribe
  unsubscribe(f: Listener<K, E>): void
}

export default function createStore<K, E = undefined>(state?: K, extraArg?: E): Store<K, E>

export type StateMapper<T, K, I> = (state: K, props: T) => I
