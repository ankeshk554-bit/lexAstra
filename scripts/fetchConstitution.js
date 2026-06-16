const fs = require('fs');
const https = require('https');
const path = require('path');

const url = 'https://raw.githubusercontent.com/civictech-India/constitution-of-india/master/constitution_of_india.json';
const targetPath = path.join(__dirname, '..', 'data', 'constitution.js');

https.get(url, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const parsedData = JSON.parse(data);
      
      const constitutionObj = {
        id: 'constitution-of-india',
        slug: 'constitution-of-india',
        name: 'The Constitution of India',
        year: 1950,
        sectionCount: parsedData.length,
        category: 'Constitutional',
        description: 'The supreme law of India. It lays down the framework that demarcates fundamental political code, structure, procedures, powers, and duties of government institutions and sets out fundamental rights, directive principles, and the duties of citizens.',
        lastUpdated: '2025-01-15',
        isNew: false,
        replacedBy: null,
        replaces: null,
        transitionNote: null,
        chapters: []
      };

      // Since the raw JSON doesn't group by chapters/parts perfectly, 
      // we'll group them into chunks of 50 articles or put them all in one "Part".
      // Let's create a single chapter for all articles to ensure nothing is lost,
      // or group by Parts if we can parse it. The raw JSON has "article" (number), "title", "description".
      
      const sections = parsedData.map(item => ({
        number: String(item.article),
        title: item.title,
        text: item.description
      }));

      constitutionObj.chapters.push({
        number: 'Articles',
        title: 'Complete Text of the Constitution',
        sections: sections
      });

      const fileContent = `export const constitution = ${JSON.stringify(constitutionObj, null, 2)};\n`;
      fs.writeFileSync(targetPath, fileContent, 'utf8');
      console.log(`Successfully wrote ${sections.length} articles to data/constitution.js`);
      
    } catch (e) {
      console.error('Error parsing JSON:', e.message);
    }
  });

}).on('error', (err) => {
  console.error('Error fetching data:', err.message);
});
