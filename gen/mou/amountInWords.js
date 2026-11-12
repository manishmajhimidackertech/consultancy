/*
 * Rupee amounts in words, for the fee clause of the MOU.
 *
 * Counted in the Nepali way, by lakh and crore rather than by million, so
 * 1,50,000 reads "One Lakh Fifty Thousand" as it would on a cheque here.
 */

const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];
const TENS = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
];

function belowHundredInWords(number) {
  if (number < 20) {
    return ONES[number];
  }

  return [TENS[Math.floor(number / 10)], ONES[number % 10]].filter(Boolean).join(" ");
}

function numberInWords(number) {
  if (number === 0) {
    return "Zero";
  }

  const crore = Math.floor(number / 10000000);
  const lakh = Math.floor((number % 10000000) / 100000);
  const thousand = Math.floor((number % 100000) / 1000);
  const hundred = Math.floor((number % 1000) / 100);
  const rest = number % 100;

  const words = [];
  if (crore > 0) {
    // Beyond 99 crore the count of crores is itself read the same way.
    words.push(`${numberInWords(crore)} Crore`);
  }
  if (lakh > 0) {
    words.push(`${belowHundredInWords(lakh)} Lakh`);
  }
  if (thousand > 0) {
    words.push(`${belowHundredInWords(thousand)} Thousand`);
  }
  if (hundred > 0) {
    words.push(`${ONES[hundred]} Hundred`);
  }
  if (rest > 0) {
    words.push(belowHundredInWords(rest));
  }

  return words.join(" ");
}

/** 10500 as "Rupees Ten Thousand Five Hundred only". */
function amountInWords(amount) {
  return `Rupees ${numberInWords(Math.round(amount))} only`;
}

/** 150000 as "NPR 1,50,000". */
function formatAmount(amount) {
  return `NPR ${Math.round(amount).toLocaleString("en-IN")}`;
}
