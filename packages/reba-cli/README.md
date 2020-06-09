# reba-cli (JavaScript 转译器终端处理包)
 
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
