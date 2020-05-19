module.exports = {

    lexical: {
        // 文件类型
        fileType: 'js',
        // 输入的是否是文件
        file: true,
    },

    generator: {
        // 用于指定生成文件的时对齐空格
        alignmentSpace: 4,
        // 生成源码时默认文件夹
        generateFolder: 'lib',
        // 当输入数据为源码时，默认生成文件的文件名
        defaultFileName: 'index.js',
        // 是否生成文件
        generateFile: true
    }
}