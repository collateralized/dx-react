/* eslint no-console:0 */
const { getTokenBalances, getTokenDeposits, deployed, getAllStatsForTokenPair } = require('./utils/contracts')(artifacts)
const { getTime } = require('./utils')(web3)

const getTimeStr = (timestamp) => {
  const date = new Date(Math.abs(timestamp))
  const hh = date.getUTCHours()
  const mm = date.getUTCMinutes()
  const ss = date.getUTCSeconds()

  return `${hh ? `${hh} hour(s) ` : ''}${mm ? `${mm} minute(s) ` : ''}${ss ? `${ss} second(s) ` : ''}`
}

const getNumDenStr = ([num, den]) => `${num}/${den} = ${(num / den).toFixed(8)}`

/**
 * truffle exec trufflescripts/get_auction_stats.js
 * prints stats for the current and past ETH -> GNO auctions
 */

/* eslint no-console: 0 */
module.exports = async () => {
  console.warn(`
    WARNING:
    --------------------------------------------------------------------------
    TESTS WILL NOT WORK IF PRICE_ORACLE DOES NOT YET SET A USD VALUE FOR ETHER!
    --------------------------------------------------------------------------
  `)
  const { dx, eth, gno } = await deployed

  const { ETH: dxETH, GNO: dxGNO, TUL: dxTUL, OWL: dxOWL } = await getTokenBalances(dx.address)

  console.log(`Exchange holds:\t${dxETH} ETH\t${dxGNO} GNO\t${dxTUL} TUL\t${dxOWL} OWL`)

  const [master, seller, buyer] = web3.eth.accounts

  const [masterDeposits, sellerDeposits, buyerDeposits] = await Promise.all([
    getTokenDeposits(master),
    getTokenDeposits(seller),
    getTokenDeposits(buyer),
  ])

  console.log('Deposits in the Exchange')
  console.log(`  Master:\t${masterDeposits.ETH}\tETH,\t${masterDeposits.GNO}\tGNO`)
  console.log(`  Seller:\t${sellerDeposits.ETH}\tETH,\t${sellerDeposits.GNO}\tGNO`)
  console.log(`  Buyer:\t${buyerDeposits.ETH}\tETH,\t${buyerDeposits.GNO}\tGNO,`)

  const now = getTime()
  const stats = await getAllStatsForTokenPair({ sellToken: eth, buyToken: gno, accounts: [master, seller, buyer] })

  const {
    sellTokenOraclePrice,
    buyTokenOraclePrice,
    latestAuctionIndex,
    auctionStart,
    sellVolumeCurrent,
    sellVolumeNext,
    buyVolume,
    auctions,
  } = stats

  console.log('\nAuction pair ETH -> GNO')

  if (sellTokenOraclePrice && buyTokenOraclePrice) {
    console.log(`Oracle prices:
    1 ETH = ${getNumDenStr(sellTokenOraclePrice)} ETH
    1 GNO = ${getNumDenStr(buyTokenOraclePrice)} ETH
    `)
  }

  console.log(`
    sellVolumeCurrent:\t${sellVolumeCurrent}
    sellVolumeNext:\t${sellVolumeNext}
    buyVolume:\t${buyVolume}
  `)

  console.log(`latestAuctionIndex:\t${latestAuctionIndex}`)

  console.log(`now:\t\t\t${new Date(now * 1000).toTimeString()}`)

  if (auctionStart === 0) {
    console.log('auction has never run before')
  } else if (auctionStart === 1) {
    console.log('auction is in 10 min waiting period')
  } else {
    const timeUntilStart = auctionStart - now
    const timeStr = getTimeStr(timeUntilStart * 1000)

    if (timeUntilStart > 0) {
      console.log(`next auction starts in\t\t${timeStr}`)
    } else if (timeUntilStart < 0) {
      console.log(`auction started\t\t${timeStr}ago`)
    } else {
      console.log('auction just started')
    }
  }

  console.log('======================================')

  for (const auctionStats of auctions) {
    const {
      auctionIndex,
      closingPrice,
      // sellVolume,
      // buyVolume,
      extraTokens,
      isLatestAuction,
      accounts,
      price,
    } = auctionStats

    console.log(`
    Auction index ${auctionIndex} ${isLatestAuction ? '(latest)' : ''}
    ______________________________________
    
    extraTokens:\t${extraTokens}
  `)

    let closingPriceStr

    if (closingPrice.some(n => n > 0)) {
      closingPriceStr = `1 ETH = ${getNumDenStr(closingPrice)} GNO`
    } else {
      closingPriceStr = 'N/A'
    }

    console.log(`    closingPrice: ${closingPriceStr}`)

    if (price) console.log(`\n  currentPrice: 1 ETH = ${getNumDenStr(price)} GNO`)

    if (isLatestAuction && price && sellTokenOraclePrice && buyTokenOraclePrice) {
      const [num, den] = price

      const amountToClearAuction = Math.floor((sellVolumeCurrent * num) / den) - buyVolume

      if (amountToClearAuction > 0) console.log(`  to clear auction buy\t${amountToClearAuction} GNO`)

      const timeWhenAuctionClears = 86400 + auctionStart

      if (auctionStart === 1 || auctionStart > now) {
        console.log('  auction haven\'t started yet')
      } else if (now < timeWhenAuctionClears) {
        const timeUntilAuctionClears = getTimeStr((now - timeWhenAuctionClears) * 1000)
        console.log(`  will clear with time in ${timeUntilAuctionClears}`)
      }
    }

    if (accounts && Object.keys(accounts).length) {
      console.log('\n\tsellerBalance,\tbuyerBalance,\tclaimedAmount')
      for (const account of Object.keys(accounts)) {
        const { sellerBalance, buyerBalance, claimedAmount } = accounts[account]

        const accountName = account === seller ? 'Seller' : account === buyer ? 'Buyer' : account === master ? 'Master' : account

        console.log(`  ${accountName}:\t${sellerBalance},\t\t${buyerBalance},\t\t${claimedAmount}`)
      }
    }

    console.log('=============================')
  }
}
