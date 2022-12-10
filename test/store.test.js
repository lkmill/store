import { jest } from '@jest/globals'
import createStore from '../src/index.js'

describe('createStore()', () => {
  it('should be instantiable', () => {
    const store = createStore()
    expect(store).toMatchObject({
      setState: expect.any(Function),
      getState: expect.any(Function),
      subscribe: expect.any(Function),
      unsubscribe: expect.any(Function),
    })
  })

  it('should update state in-place', () => {
    const store = createStore()
    expect(store.getState()).toMatchObject({})
    store.setState({ a: 'b' })
    expect(store.getState()).toMatchObject({ a: 'b' })
    store.setState({ c: 'd' })
    expect(store.getState()).toMatchObject({ a: 'b', c: 'd' })
    store.setState({ a: 'x' })
    expect(store.getState()).toMatchObject({ a: 'x', c: 'd' })
    store.setState({ c: null })
    expect(store.getState()).toMatchObject({ a: 'x', c: null })
    store.setState({ c: undefined })
    expect(store.getState()).toMatchObject({ a: 'x', c: undefined })
  })

  it('should invoke subscriptions', () => {
    const store = createStore()

    const sub1 = jest.fn()
    const sub2 = jest.fn()
    let action

    const rval = store.subscribe(sub1)
    expect(rval).toBeInstanceOf(Function)

    const update1 = { a: 'b' }
    store.setState(update1)
    expect(sub1).toBeCalledWith(store.getState(), action, update1)

    store.subscribe(sub2)
    const update2 = { c: 'd' }
    store.setState(update2)

    expect(sub1).toHaveBeenCalledTimes(2)
    expect(sub1).toHaveBeenLastCalledWith(store.getState(), action, update2)
    expect(sub2).toBeCalledWith(store.getState(), action, update2)
  })

  it('should unsubscribe', () => {
    const store = createStore()

    const sub1 = jest.fn()
    const sub2 = jest.fn()
    const sub3 = jest.fn()

    store.subscribe(sub1)
    store.subscribe(sub2)
    const unsub3 = store.subscribe(sub3)

    store.setState({ a: 'b' })
    expect(sub1).toBeCalled()
    expect(sub2).toBeCalled()
    expect(sub3).toBeCalled()

    sub1.mockClear()
    sub2.mockClear()
    sub3.mockClear()

    store.unsubscribe(sub2)

    store.setState({ c: 'd' })
    expect(sub1).toBeCalled()
    expect(sub2).not.toBeCalled()
    expect(sub3).toBeCalled()

    sub1.mockClear()
    sub2.mockClear()
    sub3.mockClear()

    store.unsubscribe(sub1)

    store.setState({ e: 'f' })
    expect(sub1).not.toBeCalled()
    expect(sub2).not.toBeCalled()
    expect(sub3).toBeCalled()

    sub3.mockClear()

    unsub3()

    store.setState({ g: 'h' })
    expect(sub1).not.toBeCalled()
    expect(sub2).not.toBeCalled()
    expect(sub3).not.toBeCalled()
  })
})
