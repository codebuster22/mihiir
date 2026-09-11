/** Only send Cal.com booking URLs to the hosted Cal embed. */
export function getCalBookingLink(destination: string): string | null {
  try {
    const url = new URL(destination);
    if (
      url.protocol !== 'https:' ||
      !['cal.com', 'www.cal.com'].includes(url.hostname) ||
      url.username ||
      url.password ||
      url.port
    ) {
      return null;
    }

    const path = url.pathname.replace(/^\/+|\/+$/g, '');
    if (!path || !/^[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*$/.test(path)) {
      return null;
    }

    return `${path}${url.search}`;
  } catch {
    return null;
  }
}
