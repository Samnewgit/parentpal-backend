const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.use(express.json());

// CORS middleware to allow requests from frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.post('/api/anthropic', async (req, res) => {
  const { apiKey, prompt } = req.body;

  try {
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
      throw new Error(`Anthropic API request failed: ${errorText}`);
    }

    const data = await response.json();
    res.json({ content: data.content[0]?.text || 'No response received.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Backend server running on http://localhost:3000');
});