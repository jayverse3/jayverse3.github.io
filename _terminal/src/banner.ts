// Static FIGlet output: ANSI Shadow. No generator is shipped.
// https://github.com/patorjk/figlet.js/tree/main/fonts
const artwork: readonly string[] = [
  '██╗   ██╗██╗███╗   ██╗ ██████╗      ██╗██╗███████╗    ██╗   ██╗ █████╗ ███╗   ██╗ ██████╗',
  '╚██╗ ██╔╝██║████╗  ██║██╔════╝      ██║██║██╔════╝    ╚██╗ ██╔╝██╔══██╗████╗  ██║██╔════╝',
  ' ╚████╔╝ ██║██╔██╗ ██║██║  ███╗     ██║██║█████╗       ╚████╔╝ ███████║██╔██╗ ██║██║  ███╗',
  '  ╚██╔╝  ██║██║╚██╗██║██║   ██║██   ██║██║██╔══╝        ╚██╔╝  ██╔══██║██║╚██╗██║██║   ██║',
  '   ██║   ██║██║ ╚████║╚██████╔╝╚█████╔╝██║███████╗       ██║   ██║  ██║██║ ╚████║╚██████╔╝',
  '   ╚═╝   ╚═╝╚═╝  ╚═══╝ ╚═════╝  ╚════╝ ╚═╝╚══════╝       ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝',
];

const steps = 32;
function gradient(from: string, to: string): string[] {
  const channels = (hex: string) => [1, 3, 5].map(offset => parseInt(hex.slice(offset, offset + 2), 16));
  const start = channels(from);
  const end = channels(to);
  return Array.from({ length: steps }, (_, index) =>
    '#' + start.map((value, channel) => Math.round(value + (end[channel] - value) * index / (steps - 1)).toString(16).padStart(2, '0')).join(''));
}

// Indexed colors let xterm recolor existing banners when the theme changes.
export function bannerPalette(theme: 'light' | 'dark'): string[] {
  return theme === 'light'
    ? gradient('#3b6db0', '#187980')
    : gradient('#83aaf2', '#75d0c2');
}

export function bannerRows(columns: number): string[] {
  const width = Math.max(...artwork.map(row => row.length));
  return width <= columns ? [...artwork] : ['Yingjie Yang'];
}

export function renderBanner(columns: number): string[] {
  const rows = bannerRows(columns);
  const width = Math.max(...rows.map(row => row.length));
  return rows.map(row => {
    let previous = -1;
    const colored = [...row].map((character, column) => {
      if (character === ' ') return character;
      const index = 16 + Math.round(column / Math.max(1, width - 1) * (steps - 1));
      const color = index === previous ? '' : '\x1b[38;5;' + index + 'm';
      previous = index;
      return color + character;
    }).join('');
    return colored + '\x1b[0m';
  });
}
