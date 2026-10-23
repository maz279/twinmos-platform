// Minimal local typing for the jsdom import used by the prototype menu
// importer (the package ships without bundled types and @types/jsdom is not a
// declared dependency of this workspace).
declare module 'jsdom' {
  export class JSDOM {
    constructor(html?: string, options?: Record<string, unknown>);
    window: any;
  }
}
