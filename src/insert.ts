import matter from 'gray-matter'
import toc from '.'

export function insert(str: string, options?: any) {
  options = options || {}

  var regex = options.regex || /(?:<!-- toc(?:\s*stop)? -->)/g
  var open =
    typeof options.open === 'string' ? options.open : '<!-- toc -->\n\n'
  var close =
    typeof options.close === 'string' ? options.close : '<!-- tocstop -->'
  var obj

  var newlines = ''
  var m = /\n+$/.exec(str)
  if (m) newlines = m[0]

  // does the file have front-matter?
  if (/^---/.test(str)) {
    // extract it temporarily so the syntax
    // doesn't get mistaken for a heading
    obj = matter(str)
    str = obj.content
  }

  var sections = split(str, regex)
  if (sections.length > 3) {
    throw new Error(
      'markdown-toc only supports one Table of Contents per file.',
    )
  }

  var last = sections[sections.length - 1]
  if (sections.length === 3) {
    sections.splice(1, 1, open + (options.toc || toc(last, options).content))
    sections.splice(2, 0, close)
  }

  if (sections.length === 2) {
    sections.splice(1, 0, open + toc(last, options).content + '\n\n' + close)
  }

  var resultString = sections.join('\n\n') + newlines
  // if front-matter was found, put it back now
  if (obj) {
    return matter.stringify(resultString, obj.data)
  }
  return resultString
}

function split(str: string, re: any) {
  return str.split(re).map(trim)
}

function trim(str: string) {
  return str.trim()
}
