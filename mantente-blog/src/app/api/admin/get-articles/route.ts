import { NextResponse } from 'next/server';
import { getAllArticles } from '@/lib/articles';

export async function GET() {
  try {
    const articles = getAllArticles();
    return NextResponse.json({ articles });
  } catch (error) {
    console.error('Error getting articles:', error);
    return NextResponse.json({ error: 'Failed to get articles' }, { status: 500 });
  }
}