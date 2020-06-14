# reba
return javascript bady version

## reba-cli
1. 全局安装 `npm i reba-cli -g`
2. 查看帮助 `reba --help`

```
  -V, --version 框架版本        
  -ft, --file-type <fileType> 文件类型也就是文件后缀名
  -f, --file 输入的是文件
  -nf, --no-file 输入的不是文件（是源码）
  -as, --alignment-space <number> 输出文件格式空格（默认4）
  -d, --generate-folder <generateFolder>  生成源码默认文件夹
  -dfn, --default-file-name <defaultFileName>  通过源码输入时处理后默认输出文件名
  -ngf, --no-generate-file 直接输出
  -gf, --generate-file 输出到指定文件夹           
  -tl, --test-lexical  输出词法token              
  -tp, --test-parser  输出语法树
  -te, --test-env  输出转译后的语法树 （只开发了Demo 箭头函数转译插件）                              
  -h, --help   帮助                              
```
3. 使用reba `reba 'const xx = 10;' -nf` 你会在当前文件夹看见一个`lib`目录其中有一个`index.js`文件包含着本代码
4. 查看token `reba 'const xx = 10;' -nf -tl`

```
{
    "isFile": false,
    "tokenInformations": [
        {
            "filePath": "",
            "tokens": [
                {
                    "type": "const",
                    "lexeme": "const",
                    "position": {
                        "start": 0,
                        "end": 5,
                        "row": 1
                    }
                },
                {
                    "type": "variableName",
                    "lexeme": "xx",
                    "position": {
                        "start": 6,
                        "end": 8,
                        "row": 1
                    }
                },
                {
                    "type": "equal",
                    "lexeme": "=",
                    "position": {
                        "start": 9,
                        "end": 9,
                        "row": 1
                    }
                },
                {
                    "type": "number",
                    "lexeme": "10",
                    "position": {
                        "start": 11,
                        "end": 12,
                        "row": 1
                    }
                },
                {
                    "type": "semicolon",
                    "lexeme": ";",
                    "position": {
                        "start": 13,
                        "end": 13,
                        "row": 1
                    }
                }
            ]
        }
    ]
}
```

5. 查看语法树  `reba 'const xx = 10;' -nf -tp`

```
[
    {
        "isFile": false,
        "ast": {
            "sourceType": "module",
            "body": [
                {
                    "type": "VariableDeclaration",
                    "kind": "const",
                    "declarations": [
                        {
                            "type": "VariableDeclarator",
                            "id": {
                                "type": "Identifier",
                                "name": "xx"
                            },
                            "init": {
                                "type": "Literal",
                                "value": "10"
                            }
                        }
                    ],
                    "comments": []
                }
            ],
            "type": "Program"
        },
        "filePath": ""
    }
]
```

6. 终端输出 `reba 'const xx = 10;' -nf -ngf`
7. 文件夹或文件处理并直接输出 `reba 'lib' -ngf` （第二个参数需要指定含有js代码的文件夹或者文件）
8. 转译 `reba '()=>{}' -nf -ngf`
9. 其余功能可以对参数排列组合

## reba-core
1. 安装 `npm i reba-core`
2. 引用 `const rebaCore = require('reba-core');`
3. 使用

```
rebaCore.reba("源码或者文件", {
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
    },
    test: {
        // 当指定此配置为true时，只会输出token，并结束程序。
        lexical: false,
        // 当指定此配置为true时，只会输出语法树，并结束程序。
        parser: false,
        // 当指定此配置为true时，只会输出修改后的语法树，并结束程序。
        preset: false
    }
});
```

## reba-lexical
1. 安装 `npm i reba-lexical`
2. 引用 `const lexical = require("reba-lexical");`
3. 使用
```
lexical("源码或者文件", {
    // 文件类型
    fileType: 'js',
    // 输入的是否是文件
    file: true,
})
```
## reba-parser 使用方法如上
1. 安装 `npm i reba-parser`
2. 引用 `const rebaParser = require("reba-parser");`
```
rebaParser.parser("源码或者文件", {
    // 文件类型
    fileType: 'js',
    // 输入的是否是文件
    file: true,
})
// 或者
rebaParser.rebaParser("token 信息");
```

## reba-preset-evn
1. 安装 `npm i reba-preset-evn`
2. 引用 `const preset = require("reba-preset-evn");`
3. 使用
```
preset("语法树",{
    // 配置暂时为空
});
```

## reba-generator
1. 安装 `npm i reba-generator`
2. 引用 `const rebaGenerator = require("reba-generator");`
3. 使用
```
rebaGenerator.generator("源码或者文件", {
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
})
// 或者
rebaGenerator.rebaGenerator("语法树", {
    // 用于指定生成文件的时对齐空格
    alignmentSpace: 4,
    // 生成源码时默认文件夹
    generateFolder: 'lib',
    // 当输入数据为源码时，默认生成文件的文件名
    defaultFileName: 'index.js',
    // 是否生成文件
    generateFile: true
})
```
## reba-traverser
1. 安装 `npm i reba-parser`
2. 被操作对象构建
```
const selector = require("reba-traverser").selector;  
const obj = {  
    one:function(param) {  
        console.log("one: "+ param);  
},
    two: function (param) {  
        console.log("two: "+param);  
    }  
}  
const select = new selector(obj);    
```
3. 向选择器中添加对象
```
select.push("demo1",()=>{  
    console.log("demo1")  
}).push("demo2",[()=>{  
    console.log("demo2-1")  
}, () => {  
    console.log("demo2-2")  
}]).push("demo3","one").push("demo4",["one",()=>{  
    console.log("demo4")  
}]).push("demo5",["one","two"]).push(["demo6","demo7"],()=>{  
    console.log("demo6 and demo7")  
}).pushDefaultRun(()=>{  
    console.log("default")  
});  
```
4. 执行
```
//  选择器运行，通过刚才构建的方法对应法则找到对应的方法进行执行。
select.run("demo1");  
// demo1  
select.run("demo2");  
// demo2-1  
select.run("demo3",["demo3"]);  
// one: demo3  
select.run("demo4",["demo4"]);  
// one: demo4  
// demo4  
select.run("demo5",["demo5"],["demo5"]);  
// one: demo5  
// two: demo5  
select.run("demo6");  
// demo6 and demo7  
select.run("demo7");  
// demo6 and demo7  
select.run("demo8");  
// default  
```
5. 构建多被操作对象
```
const selector = require("reba-traverser").selector;  
const obj_1 = {  
    one:function(param) {  
        console.log("one_1: "+ param);  
    }  
}  
const obj_2 = {  
    one: function (param) {  
        console.log("one_2: " + param);  
    }  
}  
const select = new selector([  
    {  
        name:"obj_1",  
        value: obj_1  
    },  
    {  
        name: "obj_2",  
        value: obj_2  
    }  
]);  
```
6. one方法
```
select.push("obj_1_one","obj_1.one");  
select.run("obj_1_one", ["obj_1_one"]);  
// one_1: obj_1_one  
```
7. 前后执行方法
```
const selector = require("reba-traverser").selector;  
const select = new selector();  
select.pushBefore(()=>{  
    console.log("main before");  
}).pushAfter(()=>{  
    console.log("main after");  
}).push("test",()=>{  
    console.log("test");  
},()=>{  
    console.log("test before");  
},()=>{  
    console.log("test after");  
});  
select.run("test");  
// main before  
// test before  
// test  
// test after  
// main after  
```
8. 返回数据
```
const selector = require("reba-traverser").selector;  
const select = new selector();  
select.push("demo1",()=>{  
    return "demo1";  
}).push("demo2",[()=>{  
    return "demo2-1"  
},()=>{  
    return "demo2-2"  
}]).push("demo3",()=>{  
    return "demo3"  
},undefined,(arg)=>{  
    arg[0] = 100;  
});  
console.log(select.run("demo1"));  
// demo1  
console.log(select.run("demo2"));  
// [ 'demo2-1', 'demo2-2' ]  
console.log(select.run("demo3"));  
// 100  
```
