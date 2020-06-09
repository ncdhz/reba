module.exports = class {

    // 可以是一个对象也可以是 一个对象数组, 甚至可以是一个方法
    constructor(operation) {
        this.operation = operation;
        this.data = {};
    }
    
    pushOperation(operation){
        this.operation = operation;
        return this;
    }
    pushBefore(before){
        this.before = before;
        return this;
    }
    pushAfter(after){
        this.after = after;
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
    /**
     * 用于运行选择器中的方法
     * @param {要执行方法名} functionName 
     * @param  {参数} params 
     */
    run(functionName, ...params) {
        const that = this;
        const data = this.data;
        const returnData = [];
        let paramLen = 0;

        /**
         * 通过方法所在对象找到方法加以执行
         * @param {方法路径数组} funNameArray 
         * @param {方法所在对象} fun 
         */
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

        /**
         * 找出路径对应对象中的函数
         * @param {方法路径} funName 
         */
        function anaObj(funName){
            const funNameArray = funName.split(".");
            if (funNameArray.length === 1) {
                if (that.operation instanceof Array) {
                    for (let index = 0; index < that.operation.length; index++) {
                        let element = undefined;
                        if (that.operation[index].hasOwnProperty("value")) {
                            element = that.operation[index]["value"];
                        }
                        if(typeof element === "object") {
                            if (element && element[funName]) {
                                funArr(element[funName], element);
                            }
                        } else if(typeof element === "function" && 
                            that.operation[index].hasOwnProperty("name") &&
                            that.operation[index]["name"] === funNameArray[0]){
                            funArr(element, null);
                        }
                        
                    }
                } else if (typeof that.operation === "object") {
                    funArr(that.operation[funName], that.operation);
                }  
            } else if (funNameArray.length > 1) {
                if (that.operation instanceof Array) {
                    for (let index = 0; index < that.operation.length; index++) {
                        let element = that.operation[index];
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

        /**
         * 解析路径中的,传给 分析对象
         * @param {所有方法路径和} funName 
         */
        function stringRun(funName){
            const  funNameArray = funName.split(",");
            for (let index = 0; index < funNameArray.length; index++) {
                anaObj(funNameArray[index]);
            }
        }
        /**
         * 执行方法
         * @param {方法} fun 
         * @param {方法所在对象} object 
         */
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

        /**
         * 运行方法并把返回值加入到最后一个参数
         * @param {方法} fun 
         */
        function runFunAndJoinReturnData(fun) {
            let param = params[paramLen];
            if (typeof fun === "function") {
                if (param instanceof Array) {
                    param.push(returnData);
                } else {
                    param = [returnData];
                }
                const re = fun.apply(null, param);
                if(re) returnData.push(re);
            }
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
                
                if (obj.hasOwnProperty("after")) runFunAndJoinReturnData(obj.after);
            } else if (that.hasOwnProperty("defaultRun")) {
                funArr(that["defaultRun"], null);
            }
        }
        // 运行前必须运行
        if (this.hasOwnProperty("before")) {
            this["before"]();
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
            const after = this["after"];
            runFunAndJoinReturnData(after);
        }

        return returnData.length === 1 ? 
        returnData[0]:returnData.length === 0 
        ? null : returnData;
    }
}