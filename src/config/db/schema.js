export default {
    tokens: `++id, 
             userId,  
             chainId, 
             contract, 
             name, 
             symbol,
             decimals
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
            `
}