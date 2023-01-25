const minute = 60 * 1000, hour = 3600 * 1000, day = 3600 * 24 * 1000, week = 3600 * 24 * 7 * 1000;

const deltaToString = (d: number): (string | false) => {
  if (d < minute) {
    return `${Math.floor(d / 1000)}s`;
  } else if (d < hour) {
    return `${Math.floor(d / minute)}m`;
  } else if (d < day) {
    return `${Math.floor(d / hour)}h`;
  } else if (d < week) {
    return `${Math.floor(d / day)}d`;
  } else {
    return false
  }
}

const nowMs = (): number => {
  return new Date().getTime();
}

export const pastTime = (ms: number): string => {
  const d = deltaToString(nowMs() - ms)
  if (!d) {
    return new Date(ms).toISOString().split('T')[0];
  }
  return d
}
