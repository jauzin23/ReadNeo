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

function processAscii(asciiLines) {
  let start = 0;
  while (start < asciiLines.length && asciiLines[start].replace(/\x1b\[[0-9;]*m/g, '').trim().length === 0) start++;
  let end = asciiLines.length - 1;
  while (end >= 0 && asciiLines[end].replace(/\x1b\[[0-9;]*m/g, '').trim().length === 0) end--;
  
  if (start > end) return [];
  
  const trimmedLines = asciiLines.slice(start, end + 1);
  
  let minSpaces = Infinity;
  for (const line of trimmedLines) {
    const plain = line.replace(/\x1b\[[0-9;]*m/g, '');
    if (plain.trim().length > 0) {
      const match = plain.match(/^ */);
      if (match) minSpaces = Math.min(minSpaces, match[0].length);
    }
  }
  
  if (minSpaces === Infinity || minSpaces === 0) return trimmedLines;
  
  return trimmedLines.map(line => {
    // This simple approach might break ANSI escape codes if they are at the very beginning of the line before spaces.
    // Assuming ASCII generator puts ANSI codes *after* leading spaces, or just doing a basic slice.
    // For safety, let's just use string replace for the leading spaces.
    let spacesToRemove = minSpaces;
    let result = '';
    let i = 0;
    while (i < line.length && spacesToRemove > 0) {
      if (line[i] === ' ') {
        spacesToRemove--;
      } else if (line[i] === '\x1b') {
        const match = line.slice(i).match(/^\x1b\[[0-9;]*m/);
        if (match) {
          result += match[0];
          i += match[0].length - 1;
        }
      } else {
        break; // Should not happen if minSpaces is correct
      }
      i++;
    }
    result += line.slice(i);
    return result;
  });
}

function renderSvg(asciiLinesInput, data, theme) {
  const asciiLines = processAscii(asciiLinesInput);
  
  const statsFontSize = 20;
  const statsCharWidth = 12;
  const statsLineHeight = 26;

  const asciiFontSize = 14;
  const asciiCharWidth = 8.4;
  const asciiLineHeight = 18;
  
  const maxAsciiLen = Math.max(...asciiLines.map(l => l.replace(/\x1b\[[0-9;]*m/g, '').trimEnd().length), 0);

  // Determine LINE_WIDTH dynamically based on content to make everything align perfectly
  let maxLenNeeded = data.header.length + 3; // Ensure title has at least a space and 2 dashes
  for (const group of data.groups) {
    if (group.items.length === 0) continue;
    if (group.name !== 'Info') {
      maxLenNeeded = Math.max(maxLenNeeded, group.name.length + 3);
    }
    for (const item of group.items) {
      const keyLen = item.key.length;
      const valLen = String(item.value).length;
      maxLenNeeded = Math.max(maxLenNeeded, keyLen + valLen + 6); // `. key ... value` (prefix 2 + key + space 1 + min 2 dots + space 1 + value)
    }
  }
  const LINE_WIDTH = Math.max(38, maxLenNeeded);

  // Build the list of rows for the stats panel
  const rows = [];
  const titleDividerLength = LINE_WIDTH - data.header.length - 1;
  const titleDividerStr = '─'.repeat(Math.max(0, titleDividerLength));
  rows.push({ type: 'title', text: data.header, divider: titleDividerStr });

  for (const group of data.groups) {
    if (group.items.length === 0) continue;
    
    if (group.name !== 'Info') {
      // Add empty row before the group header (enter on github stats)
      rows.push({ type: 'empty' });
      
      // Calculate group header divider length
      const dividerLength = LINE_WIDTH - group.name.length - 1;
      const dividerStr = '─'.repeat(Math.max(0, dividerLength));
      rows.push({ type: 'group-header', name: group.name, divider: dividerStr });
    }
    
    // Add items
    for (const item of group.items) {
      rows.push({
        type: 'item',
        key: item.key,
        value: String(item.value),
        isGitHubStats: group.name !== 'Info'
      });
    }
  }

  const asciiHeight = asciiLines.length * asciiLineHeight;
  const statsHeight = rows.length * statsLineHeight;
  
  const height = Math.max(Math.max(asciiHeight, statsHeight) + 80, 200);
  const asciiYOffset = asciiHeight < statsHeight ? (height - asciiHeight) / 2 : 40;
  const statsYOffset = statsHeight < asciiHeight ? (height - statsHeight) / 2 : 40;

  const statsX = 40 + (maxAsciiLen * asciiCharWidth) + 40; // 40px padding between ascii and stats
  
  const statsWidth = LINE_WIDTH * statsCharWidth;
  const width = statsX + statsWidth + 40; // 40px right padding

  let asciiContent = '';
  for (let i = 0; i < asciiLines.length; i++) {
    const y = i * asciiLineHeight;
    const asciiRaw = asciiLines[i] || '';
    const plainAscii = asciiRaw.replace(/\x1b\[[0-9;]*m/g, '').trimEnd();
    asciiContent += `<tspan x="0" y="${y}">${plainAscii.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</tspan>\n`;
  }

  let statsContent = '';
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const y = i * statsLineHeight;
    if (row.type === 'title') {
      statsContent += `<tspan x="0" y="${y}" class="title">${row.text}</tspan><tspan class="divider"> ${row.divider}</tspan>\n`;
    } else if (row.type === 'divider') {
      statsContent += `<tspan x="0" y="${y}" class="divider">${row.text}</tspan>\n`;
    } else if (row.type === 'group-header') {
      statsContent += `<tspan x="0" y="${y}" class="title">${row.name}</tspan><tspan class="divider"> ${row.divider}</tspan>\n`;
    } else if (row.type === 'item') {
      const keyStr = row.key;
      const valStr = row.value;
      const dotsCount = Math.max(2, LINE_WIDTH - keyStr.length - valStr.length - 4);
      const dots = '.'.repeat(dotsCount);
      const valClass = row.isGitHubStats ? 'value-num' : 'value';
      statsContent += `<tspan x="0" y="${y}" class="cc">. </tspan><tspan class="key">${keyStr}</tspan><tspan class="cc"> ${dots} </tspan><tspan class="${valClass}">${valStr}</tspan>\n`;
    } else if (row.type === 'empty') {
      statsContent += `<tspan x="0" y="${y}"> </tspan>\n`;
    }
  }

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <style>
    @font-face {
      src: local('Consolas'), local('Consolas Bold');
      font-family: 'ConsolasFallback';
      font-display: swap;
      size-adjust: 109%;
    }

    text, tspan {
      font-family: 'ConsolasFallback', Consolas, monospace;
      white-space: pre;
    }

    .bg { fill: #161b22; }
    .ascii { 
      fill: #50fa7b; 
      font-size: ${asciiFontSize}px;
    }
    .info-text {
      font-size: ${statsFontSize}px;
    }
    .key { fill: #ffa657; }
    .value { fill: #a5d6ff; }
    .value-num { fill: #bd93f9; }
    .cc { fill: #616e7f; }
    .divider {
      fill: #616e7f;
      font-weight: bold;
    }
    .title {
      fill: #8be9fd;
      font-weight: bold;
    }

    @media (prefers-color-scheme: light) {
      .bg { fill: #ffffff; }
      .ascii { fill: #116329; }
      .key { fill: #d4560f; }
      .value { fill: #0550ae; }
      .value-num { fill: #8250df; }
      .cc { fill: #6e7781; }
      .divider {
        fill: #6e7781;
        font-weight: bold;
      }
      .title { fill: #0969da; }
    }
  </style>

  <rect class="bg" width="100%" height="100%" rx="12" />

  <!-- ASCII ART -->
  <g transform="translate(40 ${asciiYOffset})">
    <text class="ascii" xml:space="preserve">
${asciiContent}
    </text>
  </g>

  <!-- INFO PANEL -->
  <g transform="translate(${statsX} ${statsYOffset})">
    <text class="info-text" xml:space="preserve">
${statsContent}
    </text>
  </g>
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
