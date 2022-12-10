import { jest } from '@jest/globals'
import { createElement as h } from 'react'
import { act, render } from '@testing-library/react'
import createStore from '../src/index.js'
import { Provider, connect, useStore } from '../src/react.js'

const NO_CHILDREN = undefined

describe(`integrations/preact${global.IS_PREACT_8 ? '-8' : ''}`, () => {
  describe('<Provider>', () => {
    afterEach(() => {
      render(null, document.body)
    })

    it('should provide the store in context', () => {
      let context

      const Child = () => {
        context = useStore()
        return null
      }

      render(h(Provider, { store: 'a' }, h(Child)), document.body)
      expect(context).toBe('a')

      render(null, document.body)

      const store = { name: 'obj' }
      render(h(Provider, { store }, h(Child)), document.body)
      expect(context).toBe(store)
    })
  })

  describe('connect()', () => {
    afterEach(() => {
      render(null, document.body)
    })

    it('should pass mapped state as props', () => {
      const state = { a: 'b' }
      const store = { subscribe: jest.fn(), unsubscribe: jest.fn(), getState: () => state }
      const Child = jest.fn()
      const ConnectedChild = connect(Object)(Child)
      render(h(Provider, { store }, h(ConnectedChild)), document.body)
      expect(Child).toHaveBeenCalledWith({ a: 'b', store, children: NO_CHILDREN }, expect.anything())
      expect(store.subscribe).toBeCalled()
    })

    it('should transform string selector', () => {
      const state = { a: 'b', b: 'c', c: 'd' }
      const store = { subscribe: jest.fn(), unsubscribe: jest.fn(), getState: () => state }
      const Child = jest.fn()
      const ConnectedChild = connect('a, b')(Child)
      render(h(Provider, { store }, h(ConnectedChild)), document.body)
      expect(Child).toHaveBeenCalledWith({ a: 'b', b: 'c', store, children: NO_CHILDREN }, expect.anything())
      expect(store.subscribe).toBeCalled()
    })

    it('should subscribe to store on mount', async () => {
      const store = { subscribe: jest.fn(), unsubscribe: jest.fn(), getState: () => ({}) }
      jest.spyOn(store, 'subscribe')
      const ConnectedChild = connect(Object)(() => null)

      render(h(Provider, { store }, h(ConnectedChild)), document.body)

      expect(store.subscribe).toBeCalledWith(expect.any(Function))
    })

    it('should unsubscribe from store when unmounted', async () => {
      const store = createStore()
      jest.spyOn(store, 'unsubscribe')
      const ConnectedChild = connect(Object)(() => null)
      const { unmount } = render(h(Provider, { store }, h(ConnectedChild)), document.body)
      // TODO check why unmount is needed, ie why doesnt it work calling render(null, document.body)
      unmount()
      expect(store.unsubscribe).toBeCalled()
    })

    it('should subscribe to store', async () => {
      const store = createStore()
      const Child = jest.fn()
      jest.spyOn(store, 'subscribe')
      jest.spyOn(store, 'unsubscribe')
      const ConnectedChild = connect(Object)(Child)

      const { unmount } = render(h(Provider, { store }, h(ConnectedChild)), document.body)

      expect(store.subscribe).toBeCalledWith(expect.any(Function))
      expect(Child).toHaveBeenCalledWith({ store, children: NO_CHILDREN }, expect.anything())

      Child.mockClear()

      act(() => store.setState({ a: 'b' }))

      expect(Child).toHaveBeenCalledWith({ a: 'b', store, children: NO_CHILDREN }, expect.anything())

      unmount()

      expect(store.unsubscribe).toBeCalled()

      Child.mockClear()

      act(() => store.setState({ c: 'd' }))

      expect(Child).not.toHaveBeenCalled()
    })

    it('should run mapStateToProps and update when outer props change', async () => {
      const state = {}
      const store = { subscribe: jest.fn(), unsubscribe: () => {}, getState: () => state }
      const Child = jest.fn().mockName('<Child>').mockReturnValue(42)
      let mappings = 0

      // Jest mock return values are broken :(
      const mapStateToProps = jest.fn((state, props) => ({
        mappings: ++mappings,
        ...props,
      }))

      const ConnectedChild = connect(mapStateToProps)(Child)
      render(h(Provider, { store }, h(ConnectedChild)), document.body)

      expect(mapStateToProps).toHaveBeenCalledTimes(1)
      expect(mapStateToProps).toHaveBeenCalledWith({}, { children: NO_CHILDREN })
      // first render calls mapStateToProps
      expect(Child).toHaveBeenCalledWith({ mappings: 1, store, children: NO_CHILDREN }, expect.anything())

      mapStateToProps.mockClear()
      Child.mockClear()

      render(h(Provider, { store }, h(ConnectedChild, { a: 'b' })), document.body)

      expect(mapStateToProps).toHaveBeenCalledTimes(1)
      expect(mapStateToProps).toHaveBeenCalledWith({}, { a: 'b', children: NO_CHILDREN })
      // outer props were changed
      expect(Child).toHaveBeenCalledWith({ mappings: 2, a: 'b', store, children: NO_CHILDREN }, expect.anything())

      mapStateToProps.mockClear()
      Child.mockClear()

      render(h(Provider, { store }, h(ConnectedChild, { a: 'b' })), document.body)

      expect(mapStateToProps).toHaveBeenCalledTimes(1)
      expect(mapStateToProps).toHaveBeenCalledWith({}, { a: 'b', children: NO_CHILDREN })

      // re-rendered, but outer props were not changed
      expect(Child).toHaveBeenCalledWith({ mappings: 3, a: 'b', store, children: NO_CHILDREN }, expect.anything())
    })
  })
})
