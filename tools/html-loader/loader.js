/**
 * Created by huangjin on 16/5/12.
 */
module.exports = loader
function loader() {
    return [
        // require.resolve 方法，用于从文件名取得绝对路径
        require.resolve('./index.js')
    ].join('!')
}
