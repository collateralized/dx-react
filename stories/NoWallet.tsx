import * as React from 'react'

import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { boolean } from '@storybook/addon-knobs'

import { storeInit, bcMetamask, makeProviderDecorator, CenterSectionDecorator } from './helpers'

const store = storeInit(bcMetamask)

import TextSquare from 'components/TextSquare'
import NoWallet from 'components/NoWallet'

storiesOf('NoWallet', module)
  .addDecorator(CenterSectionDecorator)
  .addDecorator(makeProviderDecorator(store))
  .addWithJSX('NoWallet[Solo]', () =>
    <NoWallet
      handleClick={action('ButtonCTA clicked')}
      hide={boolean('Hide/Show', false)}
    />,
)
  .addWithJSX('Both', (): any =>
    [
      <TextSquare />,
      <NoWallet
        handleClick={action('ButtonCTA clicked')}
        hide={boolean('Hide/Show', false)}
      />,
    ],
)