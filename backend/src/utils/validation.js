const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function validateDateRange(startDate, endDate) {
  const errors = [];

  if (!startDate || !DATE_REGEX.test(startDate)) {
    errors.push('Start date is required and must be in YYYY-MM-DD format.');
  }
  if (!endDate || !DATE_REGEX.test(endDate)) {
    errors.push('End date is required and must be in YYYY-MM-DD format.');
  }

  if (errors.length) return { valid: false, errors };

  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { valid: false, errors: ['Invalid date values.'] };
  }

  if (start > end) {
    errors.push('Start date must be before or equal to end date.');
  }

  const diffDays = (end - start) / (1000 * 60 * 60 * 24);
  if (diffDays > 365) {
    errors.push('Date range cannot exceed 365 days.');
  }

  const minDate = new Date('1940-01-01');
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);

  if (start < minDate || end > maxDate) {
    errors.push('Date range must be between 1940 and one year from today.');
  }

  return { valid: errors.length === 0, errors };
}

export function validateLocationQuery(query) {
  if (!query || typeof query !== 'string' || query.trim().length < 2) {
    return { valid: false, errors: ['Location must be at least 2 characters.'] };
  }
  if (query.trim().length > 200) {
    return { valid: false, errors: ['Location query is too long (max 200 characters).'] };
  }
  return { valid: true, errors: [] };
}

export function validateUpdatePayload(body) {
  const errors = [];
  const allowed = ['location_query', 'start_date', 'end_date', 'weather_description'];

  const keys = Object.keys(body);
  if (!keys.length) {
    return { valid: false, errors: ['No fields provided to update.'] };
  }

  for (const key of keys) {
    if (!allowed.includes(key)) {
      errors.push(`Field "${key}" cannot be updated.`);
    }
  }

  if (body.location_query) {
    const locCheck = validateLocationQuery(body.location_query);
    errors.push(...locCheck.errors);
  }

  if (body.start_date || body.end_date) {
    if (!body.start_date || !body.end_date) {
      errors.push('Both start_date and end_date must be provided when updating dates.');
    } else {
      const dateCheck = validateDateRange(body.start_date, body.end_date);
      errors.push(...dateCheck.errors);
    }
  }

  return { valid: errors.length === 0, errors };
}
