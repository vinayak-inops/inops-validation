// src/utils/time.ts
/**
 * Time utilities
 *
 * Provides a timestamp generator that returns a ISO-like string in Indian
 * Standard Time (IST, UTC+5:30) with 9-digit fractional seconds (nanosecond-like)
 * precision. JavaScript cannot produce true nanoseconds across environments,
 * so this function combines millisecond precision from Date with higher-
 * resolution timers when available to produce a 9-digit fractional field.
 */

export class TimeUtils {
  /**
   * Return current timestamp in IST formatted like:
   *  2025-09-17T08:30:45.912124364
   *
   * Uses Date for calendar fields and milliseconds, then appends up to 9
   * fractional digits by combining ms*1e6 with a high-resolution fraction
   * when available (performance.now() or process.hrtime), or randomized
   * digits as a fallback.
   */
  public static nowIST(): string {
    const local = new Date();

    // Convert local time to UTC (ms since epoch), then add IST offset (+5:30)
    const utcMs = local.getTime() + local.getTimezoneOffset() * 60000;
    const istOffsetMinutes = 5 * 60 + 30; // 5 hours 30 minutes
    const istMs = utcMs + istOffsetMinutes * 60 * 1000;
    const istDate = new Date(istMs);

    const pad = (n: number, width = 2) => String(n).padStart(width, "0");

    const year = istDate.getFullYear();
    const month = pad(istDate.getMonth() + 1);
    const day = pad(istDate.getDate());
    const hours = pad(istDate.getHours());
    const minutes = pad(istDate.getMinutes());
    const seconds = pad(istDate.getSeconds());

    const milliseconds = istDate.getMilliseconds(); // 0..999

    // Start fractional nanoseconds from milliseconds
    let nanos = milliseconds * 1_000_000; // ms -> ns

    // Try to improve precision using high-resolution timers
    try {
      // Browser or Node (globalThis.performance)
      const perf: any = (globalThis as any).performance;
      if (perf && typeof perf.now === "function") {
        // performance.now() returns milliseconds (float) since some epoch (page load),
        // use its fractional part to add sub-millisecond precision
        const perfNow = perf.now();
        const fracMs = perfNow - Math.floor(perfNow); // fractional ms part
        const extraNs = Math.floor(fracMs * 1_000_000); // convert fractional ms to ns (up to 999999)
        nanos += extraNs;
      } else if (typeof process !== "undefined" && typeof (process as any).hrtime === "function") {
        // Node.js high-resolution time tuple [seconds, nanoseconds]
        const hr: [number, number] = (process as any).hrtime();
        // use the nanoseconds part modulo 1e6 to add sub-millisecond precision
        const extraNs = hr[1] % 1_000_000;
        nanos += extraNs;
      } else {
        // Fallback: pseudo-random extra nanoseconds to fill digits
        nanos += Math.floor(Math.random() * 1_000_000);
      }
    } catch {
      // any failure: fall back to randomized extra ns
      nanos += Math.floor(Math.random() * 1_000_000);
    }

    // Ensure exactly 9 fractional digits
    const frac = String(nanos).padStart(9, "0").slice(0, 9);

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${frac}`;
  }
}

export default TimeUtils;
