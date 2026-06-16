async function checkUrl(url) {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    console.log(`${url} -> Status: ${res.status}`);
  } catch (err) {
    console.log(`${url} -> Error: ${err.message}`);
  }
}

async function main() {
  const urls = [
    'https://www.advocatekhoj.com/library/bareacts/codeofcivilprocedure/orderXXA.php',
    'https://www.advocatekhoj.com/library/bareacts/codeofcivilprocedure/orderXX-A.php',
  ];
  for (const url of urls) {
    await checkUrl(url);
  }
}

main();
