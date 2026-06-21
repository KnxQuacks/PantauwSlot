import { next } from '@vercel/edge';

export const config = {
  // Hanya berlaku untuk endpoint proxy ke JKT48 (bukan endpoint sync)
  matcher: '/api/v1/:path*',
};

export default function middleware(request: Request) {
  const url = new URL(request.url);

  // 1. Cek Custom Header (Kunci Rahasia)
  // Pengecualian: Gambar (.jpg, .png) tidak bisa mengirim custom header lewat tag <img>
  const isImageRequest = url.pathname.match(/\.(jpg|jpeg|png|gif|webp)$/i);

  if (!isImageRequest) {
    const authToken = request.headers.get('x-pantauw-auth');
    const expectedToken = process.env.VITE_PANTAUW_SECRET || 'pantauw-secure-v1-9982';

    if (authToken !== expectedToken) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', message: 'Access Denied. Bot/Scraper Detected.' }),
        { status: 403, headers: { 'content-type': 'application/json' } }
      );
    }

    // 2. Cek Origin atau Referer (Untuk memblokir cURL / Postman / Bot VPS murni)
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');

    // Jika origin ada (browser fetch), pastikan dari domain kita
    const allowedOrigins = ['https://pantauw-slot.vercel.app', 'http://localhost:5173'];
    if (origin && !allowedOrigins.includes(origin)) {
      return new Response(
        JSON.stringify({ error: 'Forbidden', message: 'Origin not allowed.' }),
        { status: 403, headers: { 'content-type': 'application/json' } }
      );
    }

    // Jika tanpa origin dan tanpa referer (biasanya script Python / cURL)
    if (!origin && !referer && url.hostname !== 'localhost') {
      return new Response(
        JSON.stringify({ error: 'Forbidden', message: 'Direct API access forbidden. Use browser.' }),
        { status: 403, headers: { 'content-type': 'application/json' } }
      );
    }
  }

  // Lolos semua pengecekan (atau ini adalah request gambar)
  // Ubah Referer menjadi jkt48.com agar tidak diblokir hotlinking oleh server JKT48
  const requestHeaders = new Headers(request.headers);
  if (isImageRequest) {
    requestHeaders.set('referer', 'https://jkt48.com');
    requestHeaders.set('origin', 'https://jkt48.com');
  }

  return next({
    request: {
      headers: requestHeaders,
    },
  });
}
