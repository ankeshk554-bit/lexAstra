async function testApiRoute() {
  try {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }],
        examMode: 'General'
      })
    });

    console.log('API Route Status:', response.status);
    console.log('API Route Status Text:', response.statusText);
    const text = await response.text();
    console.log('API Route Response Body:', text);
  } catch (error) {
    console.error('API Route Error:', error);
  }
}

testApiRoute();
