import { NextResponse } from 'next/server';

export function middleware(req) {
    const token = req.cookies.get('token'); // Si le token est dans les cookies

    if (!token) {
        return NextResponse.redirect(new URL('/login', req.url)); // Rediriger si non connecté
    }

    return NextResponse.next(); // Continuer si authentifié
}

export const config = {
    matcher: ['/dashboard/:path*'], // Sécuriser toutes les pages dans /dashboard
};
