declare function generate(options: any): (md: any) => void;
declare function bullets(arr: any, options: any): string;
declare function highest(arr: any): any;
/**
 * Turn headings into anchors
 */
declare function linkify(tok: any, options: any): any;
declare function titleize(str: string, opts: any): any;
declare function strip(str: string, opts: any): any;
declare function toc(str: string, options?: any): any;
declare namespace toc {
    var bullets: typeof import(".").bullets;
    var linkify: typeof import(".").linkify;
    var slugify: typeof import("./utils").slugify;
    var titleize: typeof import(".").titleize;
    var plugin: typeof generate;
    var strip: typeof import(".").strip;
    var insert: typeof import("./insert").insert;
}
export { toc, generate as plugin, linkify, highest, bullets, titleize, strip };
export default toc;
