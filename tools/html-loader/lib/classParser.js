"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (html) {
    var isRelevantAttr = arguments.length <= 1 || arguments[1] === undefined ? function () {
        return true;
    } : arguments[1];

    return parser.parse("tag", html, {
        currentTag: null,
        results: [],
        isRelevantAttr: isRelevantAttr
    }).results;
};

var _fastparse = require("fastparse");

var _fastparse2 = _interopRequireDefault(_fastparse);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var processMatch = function processMatch() {
    var withQuota = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];
    var doubleQuota = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

    return function (match, strUntilValue, name, value, index) {
        if (!this.isRelevantAttr(name)) return;
        this.results.push({
            start: index + strUntilValue.length,
            length: value.length,
            attr: name,
            value: value,
            quota: withQuota,
            doubleQuota: doubleQuota
        });
    };
};

var parser = new _fastparse2.default({
    tag: {
        "<!--.*?-->": true,
        "<![CDATA[.*?]]>": true,
        "<[!\\?].*?>": true,
        "<\/[^>]+>": true,
        "<([a-zA-Z\\-:]+)\\s*": function aZAZS() /*match, tagName*/{
            return "attribute";
        }
    },
    attribute: {
        "\\s+": true, // eat up whitespace
        ">": "tag", // end of attributes
        "(([a-zA-Z\\-:]+)\\s*=\\s*\")([^\"]*)\"": processMatch(true, true),
        "(([a-zA-Z\\-:]+)\\s*=\\s*\')([^\']*)\'": processMatch(true, false),
        "(([a-zA-Z\\-:]+)\\s*=\\s*)([^\\s>]+)": processMatch()
    }
});

;