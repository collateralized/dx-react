import React from 'react'

import AuctionContainer from 'components/AuctionContainer'
import AuctionHeader from 'components/AuctionHeader'
import AuctionPriceBar from 'containers/AuctionPriceBar'
import AuctionWalletSummary from 'containers/AuctionWalletSummary'
import ButtonCTA from 'components/ButtonCTA'
import AuctionAmountSummary from 'containers/AuctionAmountSummary'

export interface WalletPanelProps {
  activeProvider: string,
  checkUserStateAndSell(): void,
}

const WalletPanel: React.SFC<WalletPanelProps> = ({ activeProvider, checkUserStateAndSell }) => (
  <AuctionContainer auctionDataScreen="details">
    <AuctionHeader backTo="/order">
      Confirm Deposit Details
    </AuctionHeader>
    <AuctionAmountSummary />
    <AuctionPriceBar header="Price" />
    <AuctionWalletSummary />
      <h2><strong>Regular DutchX Auction Process</strong></h2>
      <p>
        <br></br>
        When submitting your order, you will be asked to sign transactions with {activeProvider || 'your Wallet provider'}.
        Explanations will be provided with each transaction.
        Upon final confirmation, your deposit will be added on your behalf to the next auction.
        <br/>
        <br/>
        Every auction takes approx. 6 hours.
      </p>
    <ButtonCTA onClick={checkUserStateAndSell}>
      Sell via regular auction process
    </ButtonCTA>
      <p>
      <br></br>
        OR
      </p>
      <h2><strong>Receive instant payouts</strong></h2>
      <p>
      <br></br>
      Receive 80% of OMG tokens instanly and the remaining 20% after the auction has ended (approx 6 hours). Fee: 0.1% of final auction receivables. Click <a href="">here</a> for more info
      </p>
    <ButtonCTA  className="instant-dx" onClick={checkUserStateAndSell}>
      Sell via InstantDX
    </ButtonCTA>
  </AuctionContainer>
)

export default WalletPanel
