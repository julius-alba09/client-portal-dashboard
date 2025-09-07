import { NextRequest, NextResponse } from 'next/server';
import { getNotionAuthUrl } from '@/lib/notion-oauth';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const returnUrl = searchParams.get('returnUrl') || '/settings';
    
    // Generate a state parameter for CSRF protection
    const state = Buffer.from(JSON.stringify({
      returnUrl,
      timestamp: Date.now(),
      // You might want to add user ID here when implementing proper user management
    })).toString('base64url');

    // Get the Notion authorization URL
    const authUrl = getNotionAuthUrl(state);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Error initiating Notion OAuth:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Notion authorization' },
      { status: 500 }
    );
  }
}
