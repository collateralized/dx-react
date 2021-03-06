import { Middleware, Action } from 'redux'

const NoScroll = () => (next: Function) => async (action: any) => {
  const { type } = action as Action
  if (action.payload && action.payload.modalProps && action.payload.modalProps.header !== 'Order confirmation' || type !== 'CLOSE_MODAL' && type !== 'OPEN_MODAL') return next(action as Action)

  try {
    const root = document && document.getElementById('root')
    if (type === 'OPEN_MODAL') {
      document && document.body && document.body.classList.add('noScroll')
      root && root.classList.add('noScroll')
    } else if (type === 'CLOSE_MODAL') {
      document && document.body && document.body.classList.remove('noScroll')
      root && root.classList.remove('noScroll')
    }

    return next(action as Action)
  } catch (e) {
    // Unable to load or parse stored state, proceed as usual
  }
}

export default NoScroll as Middleware
