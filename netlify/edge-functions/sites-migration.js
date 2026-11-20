// Redirect public page reads only. Netlify Forms still receives POST / unchanged.
const destination = 'https://jeffston-court-hostel.cent142003.chatgpt.site';
const pages = new Set(['/', '/index.html', '/hostel-near-legon/', '/hostel-near-upsa/', '/student-hostel-adenta/', '/hostel-near-academic-city/', '/room-updates/']);
export default function migrate(request) {
  const url = new URL(request.url);
  const pathname = url.pathname.endsWith('/') || url.pathname.includes('.') ? url.pathname : url.pathname + '/';
  if (!['GET', 'HEAD'].includes(request.method) || !pages.has(pathname)) return;
  const path = pathname === '/index.html' ? '/' : pathname;
  return new Response(null, {status: 301, headers: {Location: destination + path + url.search}});
}
export const config = {
  path: ['/', '/index.html', '/hostel-near-legon', '/hostel-near-legon/', '/hostel-near-upsa', '/hostel-near-upsa/', '/student-hostel-adenta', '/student-hostel-adenta/', '/hostel-near-academic-city', '/hostel-near-academic-city/', '/room-updates', '/room-updates/'],
  method: ['GET', 'HEAD']
};
