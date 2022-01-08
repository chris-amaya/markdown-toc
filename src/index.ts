import Remarkable from 'remarkable';
import merge from 'mixin-deep';

import {getTitle, slugify} from './utils';
import pick from 'object.pick';
import li from 'list-item';
import mdlink from 'markdown-link';
import {insert} from './insert';

function generate(options?: any) {
  var opts = merge({firsth1: true, maxdepth: 6}, options);
  var stripFirst = opts.firsth1 === false;
  if (typeof opts.linkify === 'undefined') opts.linkify = true;

  return function (md: any) {
    md.renderer.render = function (tokens: any): any {
      tokens = tokens.slice();
      var seen = {} as any;
      var len = tokens.length,
        i = 0,
        num = 0;
      var tocstart = -1;
      var arr = [];
      var res = {} as any;

      while (len--) {
        var token = tokens[i++];
        if (/<!--[ \t]*toc[ \t]*-->/.test(token.content)) {
          tocstart = token.lines[1];
        }

        if (token.type === 'heading_open') {
          tokens[i].lvl = tokens[i - 1].hLevel;
          tokens[i].i = num++;
          arr.push(tokens[i]);
        }
      }

      var result = [];
      res.json = [];

      // exclude headings that come before the actual
      // table of contents.
      var alen = arr.length,
        j = 0;
      while (alen--) {
        var tok = arr[j++];

        if (tok.lines && tok.lines[0] > tocstart) {
          var val = tok.content;
          if (tok.children && tok.children[0].type === 'link_open') {
            if (tok.children[1].type === 'text') {
              val = tok.children[1].content;
            }
          }

          if (!seen.hasOwnProperty(val)) {
            seen[val] = 0;
          } else {
            seen[val]++;
          }

          tok.seen = opts.num = seen[val];
          tok.slug = slugify(val, opts);
          res.json.push(pick(tok, ['content', 'slug', 'lvl', 'i', 'seen']));
          if (opts.linkify) tok = linkify(tok, opts);
          result.push(tok);
        }
      }

      opts.highest = highest(result);
      res.highest = opts.highest;
      res.tokens = tokens;

      if (stripFirst) result = result.slice(1);
      res.content = bullets(result, opts);
      res.content += opts.append || '';
      return res;
    };
  };
}

function bullets(arr: any, options: any) {
  var opts = merge({indent: '  '}, options);
  opts.chars = opts.chars || opts.bullets || ['-', '*', '+'];
  var unindent = 0;

  var listitem = li(opts);
  var fn = typeof opts.filter === 'function' ? opts.filter : null;

  // Keep the first h1? This is `true` by default
  if (opts && opts.firsth1 === false) {
    unindent = 1;
  }

  var len = arr.length;
  var res = [];
  var i = 0;

  while (i < len) {
    var ele = arr[i++];
    ele.lvl -= unindent;
    if (fn && !fn(ele.content, ele, arr)) {
      continue;
    }

    if (ele.lvl > opts.maxdepth) {
      continue;
    }

    var lvl = ele.lvl - opts.highest;
    res.push(listitem(lvl, ele.content, opts));
  }
  return res.join('\n');
}

function highest(arr: any) {
  var res = arr.slice().sort(function (a: any, b: any) {
    return a.lvl - b.lvl;
  });
  if (res && res.length) {
    return res[0].lvl;
  }
  return 0;
}

/**
 * Turn headings into anchors
 */

function linkify(tok: any, options: any) {
  var opts = merge({}, options);
  if (tok && tok.content) {
    opts.num = tok.seen;
    var text = titleize(tok.content, opts);
    var slug = slugify(tok.content, opts);
    // slug = querystring.escape(slug);
    slug = encodeURIComponent(slug);
    if (opts && typeof opts.linkify === 'function') {
      return opts.linkify(tok, text, slug, opts);
    }
    tok.content = mdlink(text, '#' + slug);
  }
  return tok;
}

function titleize(str: string, opts: any) {
  if (opts && opts.strip) {
    return strip(str, opts);
  }
  if (opts && opts.titleize === false) return str;
  if (opts && typeof opts.titleize === 'function') {
    return opts.titleize(str, opts);
  }
  str = getTitle(str);
  str = str.split(/<\/?[^>]+>/).join('');
  str = str.split(/[ \t]+/).join(' ');
  return str.trim();
}

function strip(str: string, opts: any) {
  opts = opts || {};
  if (!opts.strip) return str;
  if (typeof opts.strip === 'function') {
    return opts.strip(str, opts);
  }
  if (Array.isArray(opts.strip) && opts.strip.length) {
    var res = opts.strip.join('|');
    var re = new RegExp(res, 'g');
    str = str.trim().replace(re, '');
    return str.replace(/^-|-$/g, '');
  }
  return str;
}

function toc(str: string, options?: any) {
  return new Remarkable().use(generate(options)).render(str);
}

// toc.utils = utils;
toc.bullets = bullets;
toc.linkify = linkify;
toc.slugify = slugify;
toc.titleize = titleize;
toc.plugin = generate;
toc.strip = strip;
toc.insert = insert;

export {toc, generate as plugin, linkify, highest, bullets, titleize, strip};

export default toc;
