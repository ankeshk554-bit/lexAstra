const apiKey = 'sk-b787a477759c4cf58c764b5c843afbbe';

async function testApiKey() {
  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: 'Say hello' }],
        max_tokens: 10
      })
    });

    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    const text = await response.text();
    console.log('Response Body:', text);
  } catch (error) {
    console.error('Error:', error);
  }
}

testApiKey();
