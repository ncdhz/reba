module.exports = class {

    // 可以是一个对象也可以是 一个对象数组, 甚至可以是一个方法
    constructor(operation) {
        this.operation = operation;
        this.data = {};
    }
    pushBefore(after){
        this.after = after;
        return this;
    }
    pushAfter(before){
        this.before = before;
        return this;
    }
    /**
     * 用于给选择器填充对象
     * @param {选择名称可以是一个数组直接是一个名字} nameArray
     * @param {选择器调用钱调用的函数} before 
     * @param {选择器调用后调用的函数} after 
     * @param {当前 name 需要执行的函数 可以直接是函数 也可以是一个数组 或者一个 字符串} runFunction
     */
    push(nameArray, runFunction = undefined, before = undefined, after = undefined) {
        
        const data = this.data;
        function pushObjtoThis(name) {
            data[name] = {};
            if (before) data[name].before = before;
            if (after) data[name].after = after;
            if (runFunction) data[name].runFunction = runFunction;
        }
        if (nameArray instanceof Array) {
            for (let index = 0; index < nameArray.length; index++) {
                pushObjtoThis(nameArray[index]);
            }
        } else {
            pushObjtoThis(nameArray);
        }
        return this;
    }
    /**
     * 用于打开正则匹配 最后找到函数的一项是否用正则匹配
     */
    openRegExp(){
        this.RegExp = true;
        return this;
    }
    /**
     * 关闭正则匹配
     */
    closeRegExp() {
        this.RegExp = false;
        return this;
    }
    /**
     * 等没有匹配的函数时使用
     * @param {默认运行的函数} defaultRun 
     */
    pushDefaultRun(defaultRun = undefined) {
        if (defaultRun) this["defaultRun"] = defaultRun;
        return this;
    }

    run(functionName, ...params) {
        const that = this;
        const data = this.data;
        const returnData = [];
        let paramLen = 0;

        function runObj(funNameArray,fun) {
            let obj = fun;
            for (let index = 1; index < funNameArray.length ; index++) {
                const element = funNameArray[index];
                obj = fun;
                if (fun) fun = fun[element];
                else return;
            }

            funArr(fun, obj);
        }

        function anaObj(funName){
            const funNameArray = funName.split(".");

            if (funNameArray.length === 1) {
                if (typeof that.operation === "object") {
                    funArr(that.operation[funName], that.operation);
                } else if (that.operation instanceof Array) {
                    for (let index = 0; index < that.operation.length; index++) {
                        const element = undefined;
                        if (that.operation[index].hasOwnProperty("value")) {
                            element = that.operation[index]["value"];
                        }
                        if (element && element[funName]) {
                            funArr(element[funName], element);
                        }
                    }
                    
                }
            } else if (funNameArray.length > 1) {

                if (that.operation instanceof Array) {
                    for (let index = 0; index < that.operation.length; index++) {
                        const element = that.operation[index];
                        if (element.hasOwnProperty("name") && element["name"] === funNameArray[0]) {
                            if (element.hasOwnProperty("value")) {
                                runObj(funNameArray, element["value"]);
                            }
                        }
                    }
                } else if (typeof that.operation === "object") {
                    runObj(funNameArray, that.operation[funNameArray[0]]);
                }
            }
        }

        function stringRun(funName){
            const  funNameArray = funName.split(",");

            for (let index = 0; index < funNameArray.length; index++) {
                anaObj(funNameArray[index]);
            }
        }

        function funArr(fun,object){
            let re = undefined;
            if (typeof fun === "function") {
                if (params[paramLen]) {
                    re = fun.apply(object, params[paramLen]);
                } else {
                    re = fun.apply(object,null);
                }
                paramLen++;
            } else if (typeof fun === "string") {
                stringRun(fun);
            }
            if (re) returnData.push(re);
        }

        function dataAna(obj){
            if (obj) {

                if (obj.hasOwnProperty("before")) obj.before();
                if (obj.runFunction instanceof Array) {
                    for (let index = 0; index < obj.runFunction.length; index++) {
                        funArr(obj.runFunction[index], null);
                    }
                } else if (obj.runFunction) {
                    funArr(obj.runFunction, null);

                } else if (functionName) stringRun(functionName);

                if (obj.hasOwnProperty("after")) obj.after();
            } else if (that.hasOwnProperty("defaultRun")) {
                funArr(that["defaultRun"], null);
            }
        }
        // 运行前必须运行
        if (this.hasOwnProperty("before")) {
            funArr(this["before"], null);
        }
        
        if(this.RegExp) {
            let sign = true;
            for (const key in data) {
                if (new RegExp(key).test(functionName)) {
                    dataAna(data[key]);
                    sign = false;
                }
            }
            if (sign&&this.hasOwnProperty("defaultRun")) {
                funArr(this["defaultRun"], null);
            }
        }else {
            dataAna(data[functionName]);
        }
        // 运行后必须运行
        if(this.hasOwnProperty("after")) {
            funArr(this["after"], null);
        }
        return returnData.length === 1 ? 
        returnData[0]:returnData.length === 0 
        ? undefined : returnData;
    }
}