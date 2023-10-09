export default {
    tokens: `++id, 
             userId,  
             chainId, 
             contract, 
             name, 
             symbol,
             decimals,
             geckoId,
             extraInfo
            `,

    balances: `id, 
               token, 
               wallet, 
               chainId,
               userId,
               balance,
               balanceDecimal,
               balanceFiat,
               price,
               updatedAt
            `,

    settings: `++id,
              userId,
              data,
              updatedAt  
            `,

    nfts:  `id, 
            wallet,
            userId,
            chainId,
            nftInfo,
            balance,
            extraInfo,
            updatedAt  
           `
}