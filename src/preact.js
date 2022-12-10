import { h, createContext } from 'preact'
import { useContext, useState, useEffect, useMemo } from 'preact/hooks'
import { assign, wrapActions, select } from './util.js'

const Context = createContext()

export const useStore = () => useContext(Context)

/**
 * Wire a component up to the store. Passes state as props, re-renders on change.
 *
 * @param {Function|Array|String} mapStateToProps  A function mapping of store state to prop values, or an array/CSV of properties to map.
 * @param {Function|Object} [actions] 				Action functions (pure state mappings), or a factory returning them. Every action function gets current state as the first parameter and any other params next
 * @returns {Component} ConnectedComponent
 * @example
 * const Foo = connect('foo,bar')( ({ foo, bar }) => <div /> )
 * @example
 * const actions = { someAction }
 * const Foo = connect('foo,bar', actions)( ({ foo, bar, someAction }) => <div /> )
 * @example
 * @connect( state => ({ foo: state.foo, bar: state.bar }) )
 * export class Foo { render({ foo, bar }) { } }
 */
export function connect(mapStateToProps, actions) {
  if (typeof mapStateToProps !== 'function') {
    mapStateToProps = select(mapStateToProps || [])
  }

  return (Child) =>
    function Wrapper(props) {
      const store = useContext(Context)
      const [state, setState] = useState(() => mapStateToProps(store ? store.getState() : {}, props))
      const wrappedActions = useMemo(() => (actions ? wrapActions(actions, store) : { store }), [store])

      useEffect(() => {
        const update = () => {
          const mapped = mapStateToProps(store ? store.getState() : {}, props)

          for (const i in mapped) {
            if (mapped[i] !== state[i]) {
              return setState(mapped)
            }
          }

          for (const i in state) {
            if (!(i in mapped)) {
              return setState(mapped)
            }
          }
        }

        return store.subscribe(update)
      }, [store])

      return h(Child, assign(assign(assign({}, wrappedActions), props), state))
    }
}

/**
 * Provider exposes a store (passed as `props.store`) into context.
 *
 * Generally, an entire application is wrapped in a single `<Provider>` at the root.
 *
 * @param {Object} props
 * @param {Store} props.store		A {Store} instance to expose via context.
 */
export function Provider(props) {
  return h(Context.Provider, { value: props.store }, props.children)
}
