/**
 * Currency conversion utilities
 * Converts prices from USD to Moroccan Dirham (MAD)
 */

// Exchange rate: 1 USD = ~10 MAD (update this with current rate)
const USD_TO_MAD_RATE = 10;

/**
 * Convert USD to MAD
 * @param {number} usdAmount - Amount in USD
 * @returns {number} - Amount in MAD
 */
export const convertToMAD = (usdAmount) => {
  return parseFloat(usdAmount) * USD_TO_MAD_RATE;
};

/**
 * Format price in MAD
 * @param {number} usdAmount - Amount in USD
 * @param {boolean} showDecimals - Whether to show decimal places (default: true)
 * @returns {string} - Formatted price string with MAD symbol
 */
export const formatPriceMAD = (usdAmount, showDecimals = true) => {
  const madAmount = convertToMAD(usdAmount);
  const formatted = showDecimals ? madAmount.toFixed(2) : Math.round(madAmount);
  return `${formatted} DH`;
};

/**
 * Format price with USD as alternative
 * @param {number} usdAmount - Amount in USD
 * @returns {string} - Formatted price with both currencies
 */
export const formatPriceWithUSD = (usdAmount) => {
  const madAmount = convertToMAD(usdAmount);
  return `${madAmount.toFixed(2)} DH (${parseFloat(usdAmount).toFixed(2)} $)`;
};
