/**
 * Format estimated wait time in minutes.
 * If wait time is > 30 minutes, converts to hours (e.g. 45 mins -> 0.75 hr / 1 hr 15 mins).
 *
 * @param {number|string} minutes Estimated wait time in minutes
 * @param {function} t i18next translation function
 * @returns {string} Formatted wait time string
 */
export const formatWaitTime = (minutes, t) => {
  const mins = parseInt(minutes, 10) || 0;
  if (mins <= 0) {
    const minsUnit = t ? t('common.mins', { defaultValue: 'mins' }) : 'mins';
    return `0 ${minsUnit}`;
  }

  if (mins > 30) {
    const wholeHours = Math.floor(mins / 60);
    const remMins = mins % 60;
    const hrUnit = wholeHours === 1
      ? (t ? t('common.hr', { defaultValue: 'hr' }) : 'hr')
      : (t ? t('common.hrs', { defaultValue: 'hrs' }) : 'hrs');
    const minsUnit = t ? t('common.mins', { defaultValue: 'mins' }) : 'mins';

    // If exact hour multiple (e.g. 60 min -> 1 hr, 120 min -> 2 hrs)
    if (remMins === 0) {
      return `${wholeHours} ${hrUnit}`;
    }

    // If under 60 mins (e.g. 35 - 59 mins)
    if (wholeHours === 0) {
      const formattedHours = Number((mins / 60).toFixed(2));
      const singleHrUnit = t ? t('common.hr', { defaultValue: 'hr' }) : 'hr';
      return `${formattedHours} ${singleHrUnit}`;
    }

    // If over 60 mins with remaining mins (e.g. 75 mins -> 1 hr 15 mins)
    const singleHrUnit = t ? t('common.hr', { defaultValue: 'hr' }) : 'hr';
    return `${wholeHours} ${singleHrUnit} ${remMins} ${minsUnit}`;
  }

  const minsUnit = t ? t('common.mins', { defaultValue: 'mins' }) : 'mins';
  return `${mins} ${minsUnit}`;
};
