import { Meta } from "../types/Iothers";
export type TOBE = any;


export function stringifyMeta(meta: Meta): Record<string, string> {
    const result: Record<string, string> = {};
    for (const key in meta) {
      const typedKey = key as keyof Meta;
      result[typedKey] = String(meta[typedKey]);
    }
    return result;
  }