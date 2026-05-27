import { MOCK_LATENCY_MS } from './constants';

/** Promise-based delay used in mock APIs to simulate network round-trip. */
export const delay = (ms = MOCK_LATENCY_MS) => new Promise<void>((res) => setTimeout(res, ms));
