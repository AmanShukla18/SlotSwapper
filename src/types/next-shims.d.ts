declare module 'next/headers' {
  export function cookies(): Promise<ReadonlyRequestCookies>;
  export function headers(): Headers;

  export interface ReadonlyRequestCookie {
    name: string;
    value: string;
  }

  export interface ReadonlyRequestCookies {
    get(name: string): ReadonlyRequestCookie | undefined;
    // other methods omitted for brevity
  }
}

declare module 'next/navigation' {
  export function redirect(url: string): void;
}
