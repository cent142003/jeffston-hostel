'use strict';
// Only these public fields may enter requested-info emails. No resident data.
function publicAvailability(payload) {
  if (!payload || payload.ok !== true || !Array.isArray(payload.rooms)) throw Error('Unavailable feed');
  const rooms = [], issues = [];
  for (const r of payload.rooms) {
    const {capacity, occupied, availableBeds, rentAmount} = r;
    if (![capacity,occupied,availableBeds].every(Number.isInteger) || capacity < 1 || occupied < 0 || occupied > capacity || availableBeds !== capacity - occupied) {
      issues.push('Inconsistent room capacity'); continue;
    }
    if (r.status !== 'Available' || availableBeds <= 0) continue;
    if (!Number.isFinite(rentAmount) || rentAmount <= 0 || !/^[A-Z0-9 -]{1,24}$/i.test(r.code)) {
      issues.push('Invalid room price or code'); continue;
    }
    rooms.push({code:r.code, availableBeds, price:rentAmount, currency:'GHS', basis:'per resident per semester'});
  }
  return {rooms, issues};
}
function validateRequest(b) {
  if (!b || typeof b !== 'object' || Array.isArray(b)) throw Error('Enter your email address.');
  if (typeof b.email !== 'string' || b.email.length > 254 || !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+$/i.test(b.email.trim())) throw Error('Enter a valid email address.');
  if (b.marketing !== true && b.marketing !== false) throw Error('Choose whether to receive future updates.');
  if (!/^[a-f0-9-]{36}$/i.test(b.requestId || '')) throw Error('Refresh the page and try again.');
  if (b.company) throw Error('Unable to process request.');
  return {email:b.email.trim().toLowerCase(), marketing:b.marketing, requestId:b.requestId, consentVersion:'room-updates-2026-10-31'};
}
module.exports={publicAvailability,validateRequest};
