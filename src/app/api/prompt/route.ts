import { NextRequest, NextResponse } from "next/server";

const llamaEndpoint = 'http://localhost:11434/api/chat';
export async function POST(req: NextRequest) {
  const content = (await req.json()).content;
  const model = req.nextUrl.searchParams.get('model') || 'gemma2:9b';

  try {
    const response = await fetch(llamaEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model, 
        messages: [{role: 'user', content}],
        stream: true // Set stream to true for streaming responses
      }),
    });

    // Create a ReadableStream from the response body
    const stream = response.body as ReadableStream;

    return new Response(stream, { headers: response.headers }); 
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error generating response.' });
  }
}
