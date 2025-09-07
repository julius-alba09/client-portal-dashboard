import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens, fetchUserDatabases } from '@/lib/notion-oauth';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      console.error('Notion OAuth error:', error);
      return NextResponse.redirect(new URL('/settings?error=oauth_error', request.url));
    }

    // Validate required parameters
    if (!code) {
      return NextResponse.redirect(new URL('/settings?error=missing_code', request.url));
    }

    // Validate state parameter for CSRF protection
    let stateData: { returnUrl: string; timestamp: number } = { returnUrl: '/settings', timestamp: 0 };
    if (state) {
      try {
        stateData = JSON.parse(Buffer.from(state, 'base64url').toString());
        
        // Check if state is not too old (10 minutes max)
        const tenMinutes = 10 * 60 * 1000;
        if (Date.now() - stateData.timestamp > tenMinutes) {
          return NextResponse.redirect(new URL('/settings?error=expired_state', request.url));
        }
      } catch (e) {
        console.error('Invalid state parameter:', e);
        return NextResponse.redirect(new URL('/settings?error=invalid_state', request.url));
      }
    }

    try {
      // Exchange authorization code for access tokens
      const tokens = await exchangeCodeForTokens(code);

      // Fetch available databases to validate the integration
      const databases = await fetchUserDatabases(tokens.access_token);

      // In a real application, you would save these tokens to your database
      // For now, we'll store them in a secure HTTP-only cookie for the demo
      const response = NextResponse.redirect(new URL(`${stateData.returnUrl}?connected=true`, request.url));
      
      // Store tokens in secure HTTP-only cookies (for demo purposes)
      // In production, encrypt these values and store in a proper database
      response.cookies.set('notion_access_token', tokens.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1 year (Notion tokens don't expire)
        path: '/',
      });

      response.cookies.set('notion_workspace_info', JSON.stringify({
        workspace_name: tokens.workspace_name,
        workspace_id: tokens.workspace_id,
        workspace_icon: tokens.workspace_icon,
        bot_id: tokens.bot_id,
        databases_count: databases.length,
        connected_at: new Date().toISOString(),
      }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: '/',
      });

      return response;

    } catch (tokenError) {
      console.error('Error exchanging code for tokens:', tokenError);
      return NextResponse.redirect(new URL('/settings?error=token_exchange_failed', request.url));
    }

  } catch (error) {
    console.error('Error in Notion OAuth callback:', error);
    return NextResponse.redirect(new URL('/settings?error=callback_error', request.url));
  }
}
