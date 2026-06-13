const d = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];

const p = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

function verhoeffChecksum(digits) {
  let c = 0;
  const numDigits = digits.slice().reverse();
  for (let i = 0; i < numDigits.length; i += 1) {
    c = d[c][p[(i + 1) % 8][numDigits[i]]];
  }
  return c === 0;
}

export function validatePAN(pan, loanType = 'Personal') {
  if (!pan) return { valid: false, error: 'PAN is required' };
  const cleaned = pan.toUpperCase().trim();
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (!panRegex.test(cleaned)) {
    return { valid: false, error: 'PAN must be 10 characters: 5 letters, 4 digits, 1 letter (e.g., AAAAA9999A)' };
  }
  const entityType = cleaned[3];
  if (loanType === 'Personal' || loanType === 'Home') {
    if (entityType !== 'P') {
      return { valid: false, error: 'For personal/home loans, 4th PAN character must be P (individual)' };
    }
  } else if (loanType === 'Business') {
    if (!['P', 'C', 'F'].includes(entityType)) {
      return { valid: false, error: 'For business loans, PAN must be Individual (P), Company (C), or Firm (F)' };
    }
  }
  return { valid: true, error: null };
}

export function validateAadhaar(aadhaar) {
  if (!aadhaar) return { valid: false, error: 'Aadhaar number is required' };
  const cleaned = aadhaar.replace(/\s/g, '');
  if (!/^\d{12}$/.test(cleaned)) {
    return { valid: false, error: 'Aadhaar must be exactly 12 digits' };
  }
  const digits = cleaned.split('').map(Number);
  if (!verhoeffChecksum(digits)) {
    return { valid: false, error: 'Invalid Aadhaar number (checksum failed)' };
  }
  return { valid: true, error: null };
}

export function validateGST(gst) {
  if (!gst) return { valid: false, error: 'GST number is required' };
  const cleaned = gst.toUpperCase().trim();
  if (!/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d[Z]{1}[A-Z\d]{1}$/.test(cleaned)) {
    return { valid: false, error: 'GST must be 15 characters: 2 state digits + 10 PAN + 1 entity + Z + 1 checksum' };
  }
  return { valid: true, error: null };
}

export function validateMobile(mobile) {
  if (!mobile) return { valid: false, error: 'Mobile number is required' };
  const cleaned = mobile.replace(/\s/g, '');
  if (!/^[6-9]\d{9}$/.test(cleaned)) {
    return { valid: false, error: 'Mobile must start with 6-9 and be exactly 10 digits' };
  }
  return { valid: true, error: null };
}

export function validateEmail(email) {
  if (!email) return { valid: false, error: 'Email is required' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { valid: false, error: 'Enter a valid email address' };
  }
  return { valid: true, error: null };
}
