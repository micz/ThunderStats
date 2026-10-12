// Local date from "YYYYMMDD" (noon by default, far from the DST changes)
export function day(key, hours = 12, minutes = 0) {
  return new Date(Number(key.slice(0, 4)), Number(key.slice(4, 6)) - 1, Number(key.slice(6, 8)), hours, minutes);
}
