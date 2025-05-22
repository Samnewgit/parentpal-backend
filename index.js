addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { apiKey, prompt } = await request.json();

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-7-sonnet-20250219',
        system: 'You are a parenting expert providing evidence-based solutions using trusted sources.',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 4000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(`Anthropic API request failed: ${errorText}`, { status: 500 });
    }

    const data = await response.json();
    return new Response(JSON.stringify({ content: data.content[0]?.text || 'No response received.' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}
