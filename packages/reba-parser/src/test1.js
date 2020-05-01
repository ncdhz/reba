const selector = require("reba-tools").selector

const xx = {
    xx:function(){
        console.log(11);
    },
    yy: function () {
        console.log(22);
    }
}
const select = new selector(xx);
select.push("lllll", "xx").push("lllll", "yy").run("lllll")