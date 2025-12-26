import { NextRequest, NextResponse } from 'next/server';
import { saveArticle } from '@/lib/articles';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, excerpt, content, date, readTime, slug } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const savedSlug = saveArticle({
      title,
      excerpt: excerpt || '',
      content,
      date: date || new Date().toISOString().split('T')[0],
      readTime: readTime || 5,
      slug
    });

    return NextResponse.json({ success: true, slug: savedSlug });
  } catch (error) {
    console.error('Error saving article:', error);
    return NextResponse.json({ error: 'Failed to save article' }, { status: 500 });
  }
}