
export default {

    uni_v2: {
        "native_token":                                     "WETH",
        "get_amounts_out":                                  "getAmountsOut",
        "swap_tokens_for_exact_native":                     "swapTokensForExactETH",
        "swap_exact_tokens_for_native":                     "swapExactTokensForETH",
        "swap_exact_native_for_tokens":                     "swapExactETHForTokens",
        "swap_native_for_exact_tokens":                     "swapETHForExactTokens",
        "swap_exact_tokens_for_tokens":                     "swapExactTokensForTokens",
        "swap_exact_native_for_tokens_with_transfer_tax":   "swapExactETHForTokensSupportingFeeOnTransferTokens",
        "swap_exact_tokens_for_native_with_transfer_tax":   "swapExactTokensForETHSupportingFeeOnTransferTokens",
        "swap_exact_tokens_for_tokens_with_transfer_tax":   "swapExactTokensForTokensSupportingFeeOnTransferTokens"
    },

    uni_v3: {
        "native_token":                                     "",
        "get_amounts_out":                                  "quoteExactInput",
        "swap_tokens_for_exact_native":                     "swapTokensForExactETH",
        "swap_exact_tokens_for_native":                     "swapExactTokensForETH",
        "swap_exact_native_for_tokens":                     "swapExactETHForTokens",
        "swap_native_for_exact_tokens":                     "swapETHForExactTokens",
        "swap_exact_tokens_for_tokens":                     "swapExactTokensForTokens",
    },
    
    tjoe_v20: {
        "native_token":                                     "wavax",
        "get_amounts_out":                                  "findBestPathFromAmountIn",
        "swap_tokens_for_exact_native":                     "swapTokensForExactAVAX",
        "swap_exact_tokens_for_native":                     "swapExactTokensForAVAX",
        "swap_exact_native_for_tokens":                     "swapExactAVAXForTokens",
        "swap_native_for_exact_tokens":                     "swapAVAXForExactTokens",
        "swap_exact_tokens_for_tokens":                     "swapExactTokensForTokens",
        "swap_exact_native_for_tokens_with_transfer_tax":   "swapExactAVAXForTokensSupportingFeeOnTransferTokens",
        "swap_exact_tokens_for_native_with_transfer_tax":   "swapExactTokensForAVAXSupportingFeeOnTransferTokens",
        "swap_exact_tokens_for_tokens_with_transfer_tax":   "swapExactTokensForTokensSupportingFeeOnTransferTokens"
    },

    tjoe_v21: {
        "native_token":                                     "getWNATIVE",
        "get_amounts_out":                                  "findBestPathFromAmountIn",
        "swap_tokens_for_exact_native":                     "swapTokensForExactNATIVE",
        "swap_exact_tokens_for_native":                     "swapExactTokensForNATIVE",
        "swap_native_for_exact_tokens":                     "swapNATIVEForExactTokens",
        "swap_exact_native_for_tokens":                     "swapExactNATIVEForTokens",
        "swap_exact_tokens_for_tokens":                     "swapExactTokensForTokens",
        "swap_exact_native_for_tokens_with_transfer_tax":   "swapExactNATIVEForTokensSupportingFeeOnTransferTokens",
        "swap_exact_tokens_for_native_with_transfer_tax":   "swapExactTokensForNATIVESupportingFeeOnTransferTokens"
    },

    
}