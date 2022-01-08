import diacritics from 'diacritics-map';
import stripColor from 'strip-color';
function getTitle(str) {
    if (/^\[[^\]]+\]\(/.test(str)) {
        var m = /^\[([^\]]+)\]/.exec(str);
        if (m)
            return m[1];
    }
    return str;
}
function slugify(str, options) {
    options = options || {};
    if (options.slugify === false)
        return str;
    if (typeof options.slugify === 'function') {
        return options.slugify(str, options);
    }
    str = getTitle(str);
    str = stripColor(str);
    str = str.toLowerCase();
    // `.split()` is often (but not always) faster than `.replace()`
    str = str.split(' ').join('-');
    str = str.split(/\t/).join('--');
    if (options.stripHeadingTags !== false) {
        str = str.split(/<\/?[^>]+>/).join('');
    }
    str = str.split(/[|$&`~=\\\/@+*!?({[\]})<>=.,;:'"^]/).join('');
    str = str
        .split(/[。？！，、；：“”【】（）〔〕［］﹃﹄“ ”‘’﹁﹂—…－～《》〈〉「」]/)
        .join('');
    str = replaceDiacritics(str);
    if (options.num) {
        str += '-' + options.num;
    }
    return str;
}
function replaceDiacritics(str) {
    return str.replace(/[À-ž]/g, function (ch) {
        return diacritics[ch] || ch;
    });
}
function detectMatter(str) {
    try {
        var matt = JSON.parse(str);
        return true;
    }
    catch (error) {
        return false;
    }
}
export { getTitle, slugify, replaceDiacritics, stripColor };
