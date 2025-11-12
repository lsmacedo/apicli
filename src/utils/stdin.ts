export async function readStdin(): Promise<string | null> {
  if (process.stdin.isTTY) {
    return null;
  }

  return new Promise((resolve) => {
    let data = '';

    process.stdin.setEncoding('utf-8');

    process.stdin.on('data', (chunk) => {
      data += chunk;
    });

    process.stdin.on('end', () => {
      resolve(data.trim() || null);
    });

    process.stdin.on('error', () => {
      resolve(null);
    });
  });
}
