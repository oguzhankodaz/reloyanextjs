export const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2,
    }).format(value);
  };

export const toTitleCase = (value: string) => {
  if (!value) return "";
  return value
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

// ========= Validators =========
export const isValidEmail = (email: string) => {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  return re.test(email.trim());
};

export const isValidPassword = (password: string) => {
  // Min 8 char, at least 1 letter and 1 number
  if (!password) return false;
  if (password.length < 8) return false;
  if (!/[A-Za-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
};

export const isValidName = (value: string) => {
  if (!value) return false;
  // Letters incl. Turkish, spaces, apostrophes and hyphens; min 2 chars
  const re = /^[A-Za-zÇĞİÖŞÜçğıöşü' -]{2,}$/;
  return re.test(value.trim());
};

export const isValidPhone = (phone: string) => {
  if (!phone) return true; // Phone is optional, so empty is valid
  // Turkish phone number format: +90 5XX XXX XX XX or 05XX XXX XX XX
  const re = /^(\+90\s?)?(5\d{2}\s?\d{3}\s?\d{2}\s?\d{2}|0\d{3}\s?\d{3}\s?\d{2}\s?\d{2})$/;
  return re.test(phone.trim());
};

export const isValidCompanyName = (value: string) => {
  if (!value) return false;
  // Allow letters/numbers basic punctuation & spaces; min 2 chars
  const re = /^[A-Za-zÇĞİÖŞÜçğıöşü0-9&()\/.,' -]{2,}$/;
  return re.test(value.trim());
};