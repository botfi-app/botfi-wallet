export default {
    tokens: `++id, 
             userId,  
             chainId, 
             contract, 
             name, 
             symbol,
             decimals
            `,
            
    balances: `++id, 
               tokenAddress, 
               userAddress, 
               userId,
               balance,
               balanceDecimal,
               updatedAt,
            `
}