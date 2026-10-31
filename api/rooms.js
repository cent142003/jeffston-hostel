'use strict';

/**
 * Read-only, same-origin bridge for the JCH live room feed.
 * Avoids depending exclusively on Google's cross-origin redirects on mobile.
 * No booking writes, cached prices, or payment operations occur here.
 */
const ROOMS_SOURCE =
  'https://script.google.com/macros/s/AKfycbzjBfEHdqU2pgfLJD3P5dNkMB888WYuY77VKvepAqcw4nGdfncFHuQ_KYD7piwbBCvH/exec?action=rooms';

module.exports = async function roomAvailability(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, max-age=0, s-maxage=0');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, rooms: [], error: 'GET is required' });
  }

  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), 10000);
  try {
    const upstream = await fetch(ROOMS_SOURCE, {
      method: 'GET',
      redirect: 'follow',
      cache: 'no-store',
      signal: abort.signal,
      headers: { Accept: 'application/json' }
    });
    if (!upstream.ok) throw new Error('Live feed HTTP ' + upstream.status);

    const payload = await upstream.json();
    if (payload?.ok !== true || !Array.isArray(payload.rooms)) {
      throw new Error('Invalid live room response');
    }

    return res.status(200).json({
      ok: true,
      updatedAt: payload.updatedAt || null,
      rooms: payload.rooms
    });
  } catch (error) {
    console.error('Read-only room availability bridge unavailable:', error.message);
    return res.status(503).json({
      ok: false,
      rooms: [],
      error: 'Live availability temporarily unavailable. Please retry.'
    });
  } finally {
    clearTimeout(timer);
  }
};
