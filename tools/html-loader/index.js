/*
 MIT License http://www.opensource.org/licenses/mit-license.php
 Author Tobias Koppers @sokra
 */

// html代码压缩模块，用法：http://www.aichengxu.com/view/25981
var htmlMinifier = require('html-minifier');

var attrParse = require('./lib/attributesParser')
var classParse = require('./lib/classParser').default

// https://www.npmjs.com/package/loader-utils
var loaderUtils = require('loader-utils');

var url = require('url');

// object-assign 这个库只对外暴露了一个函数，它的作用就是将参数中的几个对象合并到一起，用法：http://www.codesec.net/view/204364.html
var assign = require('object-assign');

// Compiles JavaScript written using template strings to use ES5-compatible syntax. For example, this:
// https://github.com/esnext/es6-templates
var compile = require('es6-templates').compile;

var path = require('path')
var fs = require('fs')

function randomIdent() {
    return 'xxxHTMLLINKxxx' + Math.random() + Math.random() + 'xxx';
}

function randomClassPlaceholder() {
    return '666CLASSPLACEHOLDER666' + Date.now() + Math.random() + '|666'
}

var replaceFnPath = 'htmlReplaceFn'
var defaultExt = '.scss';
var defaultRelevantAttr = [
    {
        attr: 'class',
        isExpression: false
    },
    {
        attr: 'ng-class',
        isExpression: true
    }
]
var defaultAttributes = ['img:src']
var doubleQuotaReg = /"([^"]+)"/g
var singleQuotaReg = /'([^']+)'/g

module.exports = function (content) {
    this.cacheable && this.cacheable();
    var callback = this.async();
    var query = loaderUtils.parseQuery(this.query);

    var ext = query.ext || defaultExt;
    var p = path.parse(this.resourcePath);
    p.ext = ext;
    p.base = p.name + p.ext;
    var cssFullPath = path.format(p);
    var cssPath = './' + p.name + ext
    //var cssPath = path.join('.',)
    fs.access(cssFullPath, fs.F_OK, function (err) {
        var htmlResult = []
        var classIdMap = {}
        var tagAttrMap = {};
        if (!err) {
            // css require
            var relevantAttr = defaultRelevantAttr
            var classAttrMap = {}
            var classAttrList = relevantAttr.map(function (r) {
                classAttrMap[r.attr] = !!r.isExpression
                return r.attr
            })

            var classLinks = classParse(content, function (attr) {
                return classAttrList.indexOf(attr) > -1
            })
            classLinks.reverse()
            var htmlArr = Array.from(content)
            classLinks.forEach(function (pos) {
                var insert = []
                if (classAttrMap[pos.attr]) {
                    var raw = pos.value
                    if (pos.quota) {
                        if (pos.doubleQuota) {
                            raw = raw.replace(singleQuotaReg, ($0, $1) => {
                                var ident
                                do {
                                    ident = randomClassPlaceholder();
                                } while (classIdMap[ident]);
                                classIdMap[ident] = $1;
                                return `'${ident}'`
                            })
                        } else {
                            raw = raw.replace(doubleQuotaReg, ($0, $1) => {
                                var ident
                                do {
                                    ident = randomClassPlaceholder();
                                } while (classIdMap[ident]);
                                classIdMap[ident] = $1;
                                return `"${ident}"`
                            })
                        }
                    }
                    insert = Array.from(raw)
                } else {
                    var ident
                    do {
                        ident = randomClassPlaceholder();
                    } while (classIdMap[ident]);
                    classIdMap[ident] = pos.value;
                    insert = ident
                }
                htmlArr.splice(pos.start, pos.length, ...insert)
            })
            content = htmlArr.join('')
            htmlResult.push('var _s = require("' + cssPath + '");')
            htmlResult.push('var _r = require("' + replaceFnPath + '")(_s);')

        }

        // only replace src
        var attributes = defaultAttributes
        if (query.attrs !== undefined) {
            if (typeof query.attrs === 'string')
                attributes = query.attrs.split(' ');
            else if (Array.isArray(query.attrs))
                attributes = query.attrs;
            else if (query.attrs === false)
                attributes = [];
            else
                throw new Error('Invalid value to query parameter attrs');
        }
        var root = query.root;
        var links = attrParse(content, function (tag, attr) {
            return attributes.indexOf(tag + ':' + attr) >= 0
        });
        links.reverse();

        content = [content];
        links.forEach(function (link) {
            if (!loaderUtils.isUrlRequest(link.value, root)) return;

            var uri = url.parse(link.value);
            if (uri.hash !== null && uri.hash !== undefined) {
                uri.hash = null;
                link.value = uri.format();
                link.length = link.value.length;
            }

            do {
                var ident = randomIdent();
            } while (tagAttrMap[ident]);
            tagAttrMap[ident] = link.value;
            var x = content.pop();
            content.push(x.substr(link.start + link.length));
            content.push(ident);
            content.push(x.substr(0, link.start));
        });
        content.reverse();
        content = content.join('');
        if (typeof query.minimize === 'boolean' ? query.minimize : this.minimize) {
            var minimizeOptions = assign({}, query);

            [
                'removeComments',
                'collapseWhitespace',
                'collapseBooleanAttributes',
                'removeAttributeQuotes',
                'removeRedundantAttributes',
                'useShortDoctype',
                'removeEmptyAttributes',
                'removeOptionalTags'
            ].forEach(function (name) {
                if (typeof minimizeOptions[name] === 'undefined') {
                    minimizeOptions[name] = true;
                }
            });

            content = htmlMinifier.minify(content, minimizeOptions);
        }

        if (query.interpolate) {
            content = compile('`' + content + '`').code;
        } else {
            content = JSON.stringify(content);
        }
        htmlResult.push(
            'module.exports = ' + content.replace(/xxxHTMLLINKxxx[0-9\.]+xxx/g, function (match) {
                if (!tagAttrMap[match]) return match;
                return '" + require(' + JSON.stringify(loaderUtils.urlToRequest(tagAttrMap[match], root)) + ') + "';
            }).replace(/666CLASSPLACEHOLDER666[0-9\.]+\|666/g, function (match) {
                if (!classIdMap[match]) return match;
                return '" + _r("' + classIdMap[match] + '") + "';
            }) + ';'
        )

        callback(null, htmlResult.join('\r\n'))
    })

}
