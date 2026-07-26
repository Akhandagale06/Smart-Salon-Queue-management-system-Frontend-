export const formatServiceName = (name, t) => {
  if (!name) return '';
  const trimmed = name.trim();

  // 1. Try direct lookup in i18n
  const directKey = `serviceNames.${trimmed}`;
  const translated = t(directKey, { defaultValue: null });
  if (translated && translated !== directKey) {
    return translated;
  }

  // 2. Handle combo services (e.g., "Haircut + Beard Shave" or "Hair Cut & Shave")
  if (trimmed.includes('+') || trimmed.includes('&') || trimmed.toLowerCase().includes(' and ')) {
    const parts = trimmed.split(/\s*(\+|&|and)\s*/i);
    const translatedParts = parts.map(part => {
      const p = part.trim();
      if (p === '+' || p === '&' || p.toLowerCase() === 'and') {
        return '+';
      }
      const partKey = `serviceNames.${p}`;
      const pTrans = t(partKey, { defaultValue: null });
      return (pTrans && pTrans !== partKey) ? pTrans : p;
    });
    return translatedParts.join(' ');
  }

  return trimmed;
};
