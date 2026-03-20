const { TextEncoder, TextDecoder } = require('util');

const sseData = ['data: Hello\n\n', 'data:  world\n\n', 'data: [DONE]\n\n'].join('');
const encoder = new TextEncoder();
const encoded = encoder.encode(sseData);
let position = 0;
let buffer = '';
const decoder = new TextDecoder();

function processLine(line) {
  const trimmed = line.trim();
  if (!trimmed.startsWith('data: ')) return false;
  const token = trimmed.slice(6);
  if (token === '[DONE]') {
    console.log('DONE');
    return true;
  }
  console.log('TOKEN', token);
  return false;
}

while (position < encoded.length) {
  const chunk = encoded.slice(position, position + 20);
  position += 20;
  buffer += decoder.decode(chunk, { stream: true });
  const lines = buffer.split('\n');
  buffer = lines.pop() ?? '';
  for (const line of lines) {
    if (processLine(line)) process.exit(0);
  }
}

if (buffer.startsWith('data: ')) {
  processLine(buffer);
}
