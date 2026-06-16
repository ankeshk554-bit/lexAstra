const fs = require('fs');
const ipc = JSON.parse(fs.readFileSync('c:/AI project/lexastra/data/bare-acts/indian-penal-code.json', 'utf8'));

console.log('IPC Metadata:');
console.log('Name:', ipc.name);
console.log('Total Chapters:', ipc.chapters.length);

// Build IPC section lookup map
const ipcMap = {};
let totalSecs = 0;
for (const chap of ipc.chapters) {
  for (const sec of chap.sections) {
    totalSecs++;
    ipcMap[String(sec.number)] = sec;
  }
}
console.log('Total sections found:', totalSecs);
console.log('Sample sections:');
console.log('34:', ipcMap['34'] ? ipcMap['34'].title : 'not found');
console.log('120B:', ipcMap['120B'] ? ipcMap['120B'].title : 'not found');
console.log('300:', ipcMap['300'] ? ipcMap['300'].title : 'not found');
console.log('378:', ipcMap['378'] ? ipcMap['378'].title : 'not found');
console.log('405:', ipcMap['405'] ? ipcMap['405'].title : 'not found');
console.log('415:', ipcMap['415'] ? ipcMap['415'].title : 'not found');
console.log('498A:', ipcMap['498A'] ? ipcMap['498A'].title : 'not found');
