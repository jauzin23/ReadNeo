function parseAnsi(line, theme) {
  const ansiRegex = /\x1b\[[0-9;]*m/g;
  let match;
  let lastIndex = 0;
  let currentColor = null;
  const segments = [];

  const colorMap = {
    30: theme.black,
    31: theme.red,
    32: theme.green,
    33: theme.yellow,
    34: theme.blue,
    35: theme.magenta,
    36: theme.cyan,
    37: theme.white,
    90: theme.brightBlack,
    91: theme.brightRed,
    92: theme.brightGreen,
    93: theme.brightYellow,
    94: theme.brightBlue,
    95: theme.brightMagenta,
    96: theme.brightCyan,
    97: theme.brightWhite,
  };

  while ((match = ansiRegex.exec(line)) !== null) {
    const textSegment = line.slice(lastIndex, match.index);
    if (textSegment) {
      segments.push({ text: textSegment, color: currentColor });
    }
    const codeStr = match[0].slice(2, -1);
    const codes = codeStr.split(';').map(Number);
    for (const code of codes) {
      if (code === 0) currentColor = null;
      else if (colorMap[code]) currentColor = colorMap[code];
    }
    lastIndex = ansiRegex.lastIndex;
  }
  const remaining = line.slice(lastIndex);
  if (remaining) {
    segments.push({ text: remaining, color: currentColor });
  }
  return segments;
}

function renderSvg(asciiLines, detailsLines, theme) {
  const lineHeight = 20;
  const charWidth = 9;
  const maxLines = Math.max(asciiLines.length, detailsLines.length);
  const height = maxLines * lineHeight + 80;
  const width = 800;

  const maxAsciiLen = Math.max(...asciiLines.map(l => l.replace(/\x1b\[[0-9;]*m/g, '').length));

  let linesContent = '';

  for (let i = 0; i < maxLines; i++) {
    const y = 60 + i * lineHeight;
    let tspanContent = '';

    const asciiRaw = asciiLines[i] || '';
    const plainAscii = asciiRaw.replace(/\x1b\[[0-9;]*m/g, '');
    const padding = ' '.repeat(Math.max(0, maxAsciiLen - plainAscii.length + 4));

    const segments = parseAnsi(asciiRaw, theme);
    if (segments.length === 0) {
      segments.push({ text: plainAscii, color: theme.ascii });
    }
    for (const seg of segments) {
      const color = seg.color || theme.ascii;
      tspanContent += `<tspan fill="${color}">${seg.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</tspan>`;
    }
    
    tspanContent += `<tspan fill="transparent">${padding}</tspan>`;

    const detailRaw = detailsLines[i] || '';
    if (detailRaw) {
      if (detailRaw.includes(':')) {
        const parts = detailRaw.split(':');
        const label = parts[0] + ':';
        const val = parts.slice(1).join(':');
        tspanContent += `<tspan fill="${theme.label}">${label}</tspan><tspan fill="${theme.value}">${val}</tspan>`;
      } else {
        tspanContent += `<tspan fill="${theme.title}">${detailRaw}</tspan>`;
      }
    }

    linesContent += `<text x="20" y="${y}" font-family="monospace" font-size="14" xml:space="preserve">${tspanContent}</text>\n`;
  }

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="${theme.background}" rx="10" />
  <circle cx="20" cy="20" r="6" fill="#ff5f56" />
  <circle cx="40" cy="20" r="6" fill="#ffbd2e" />
  <circle cx="60" cy="20" r="6" fill="#27c93f" />
  <g>${linesContent}</g>
</svg>
`.trim();
}

const themes = {
  dracula: {
    background: '#282a36',
    ascii: '#50fa7b',
    title: '#8be9fd',
    label: '#ff79c6',
    value: '#f8f8f2',
    black: '#000000',
    red: '#ff5555',
    green: '#50fa7b',
    yellow: '#f1fa8c',
    blue: '#bd93f9',
    magenta: '#ff79c6',
    cyan: '#8be9fd',
    white: '#f8f8f2',
    brightBlack: '#6272a4',
    brightRed: '#ff6e6e',
    brightGreen: '#69ff94',
    brightYellow: '#ffffa5',
    brightBlue: '#d6acff',
    brightMagenta: '#ff92df',
    brightCyan: '#a4ffff',
    brightWhite: '#ffffff'
  }
};

module.exports = { renderSvg, themes };
