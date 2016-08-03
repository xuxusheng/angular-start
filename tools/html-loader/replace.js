/**
 *
 * Created by huangjin on 16/5/12.
 */

module.exports = function (style) {
    style = style || {}
    return function (classNames) {
        return classNames.split(' ').map(function (cls) {
            return style[cls] || cls
        }).join(' ')
    }
}
