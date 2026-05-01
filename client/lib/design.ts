export const DEPT_COLORS: Record<number, { fg: string; bg: string; dark_fg: string; dark_bg: string }> = {
  1: { fg: '#5b8a72', bg: '#e3ede5', dark_fg: '#7baa90', dark_bg: '#2c3934' },
  2: { fg: '#6a8caf', bg: '#dde6f0', dark_fg: '#88a8c8', dark_bg: '#25303a' },
  3: { fg: '#c8855a', bg: '#f3e4d7', dark_fg: '#d39872', dark_bg: '#3a2e25' },
  4: { fg: '#9a7caf', bg: '#e7dff0', dark_fg: '#b39bca', dark_bg: '#322a3c' },
  5: { fg: '#a98a4f', bg: '#efe6d3', dark_fg: '#c2a572', dark_bg: '#352e22' },
};

export function deptColor(id: number, dark = false) {
  const c = DEPT_COLORS[id] ?? DEPT_COLORS[1];
  return dark ? { fg: c.dark_fg, bg: c.dark_bg } : { fg: c.fg, bg: c.bg };
}

export function avatarColor(seed: number | string): [string, string] {
  const palette: [string, string][] = [
    ['#5b8a72', '#e3ede5'], ['#6a8caf', '#dde6f0'], ['#c8855a', '#f3e4d7'],
    ['#9a7caf', '#e7dff0'], ['#a98a4f', '#efe6d3'], ['#7a8a5b', '#e8edd9'],
  ];
  let h = 0;
  for (const ch of String(seed)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return palette[h % palette.length];
}

export function formatSalary(n: number) {
  return '$' + Number(n).toLocaleString('en-US');
}
