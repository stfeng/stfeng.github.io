function print(s) {
    document.write(s)
}

function setVal(id, val) {
    document.getElementById(id).value = val
}

function getVal(id) {
    return document.getElementById(id).value
}

function clearVal(id) {
    document.getElementById(id).value = ''
}


function historySize() {
    document.getElementById('historySize').value = history.length
}


function locationInfo() {
    setVal('locationProtocol', location.protocol)
    setVal('locationHostname', location.hostname)
    setVal('locationPort', location.port)
    setVal('locationHost', location.host)
    setVal('locationPathname', location.pathname)
    setVal('locationHash', location.hash)
    setVal('locationSearch', location.search)
}

function home() {
    location.assign('/');
    // location='/'
}

function refresh() {
    location.reload();
}

function back() {
    history.back();
}


function screen() {

    // console.log(navigator.userAgent);

    document.getElementById('widthHeight').value = screen.width + " * " + screen.height;

    // setVal('widthHeight', screen.width + " * " + screen.height)
    // setVal('availWidthHeight', screen.availWidth + " * " + screen.availHeight)
}


function navigator() {

    // console.log(navigator.userAgent);

    setVal('appName', navigator.appName)
    setVal('appVersion', navigator.appVersion)
    setVal('appCodeName', navigator.appCodeName)
    setVal('platform', navigator.platform)
    setVal('cookieEnabled', navigator.cookieEnabled)
    setVal('userAgent', navigator.userAgent)
}


function getInner() {
    document.getElementById('innerWidth').value = window.innerWidth
    document.getElementById('innerHeight').value = window.innerHeight
}

function getOuter() {
    document.getElementById('outerWidth').value = window.outerWidth
    document.getElementById('outerHeight').value = window.outerHeight
}


// 一个对象
function Hero(name) {
    this.name = name;
    this.kill = function () {
        document.write(this.name + "正在杀敌<br>")
    }
}

function toExponential() {
    // var n = new String("123");
    // document.getElementById('toExponential').value = n.length;

    // var n = new Number("123");
    // document.getElementById('toExponential').value = n.valueOf();


    // var gran = new Hero('gran');
    // gran.kill();


    Hero.prototype.keng = function () {
        document.write(this.name + "正在坑队友<br>")
    };

    var k = new Hero('k');
    k.keng();

}

function toFixed() {
    var n = new Number("123.6789678");
    document.getElementById('toFixed').value = n.toFixed(3);
}

// 复利计算
//p 本金
//r 利率
//n 年数
//m 每年追加
function f() {
    var p = document.getElementById('beginMoney').value;
    var r = document.getElementById('yearProfitPercent').value;
    var n = document.getElementById('yearCount').value;
    var m = document.getElementById('yearAddMoney').value;
    var p = parseFloat(p);
    var r = parseFloat(r) / 100;
    var n = parseInt(n);
    var m = parseFloat(m);
    document.getElementById('bjSum').value = bjSum(p, n, m);
    document.getElementById('lxSum').value = lxSum(p, r, n, m);
    document.getElementById('bxSum').value = bxSum(p, r, n, m);
}

// 本息和
function bxSum(p, r, n, m) {
    return p * (Math.pow(1 + r, n)) + m * (n - 1 + r);
}

// 本金和
function bjSum(p, n, m) {
    return p + (n - 1) * m;
}

// 利息和
function lxSum(p, r, n, m) {
    return bxSum(p, r, n, m) - bjSum(p, n, m);
}

var v;
document.write("变量 v = " + v)

// 加法
function cal(x, y) {
    return parseInt(x) + parseInt(y);
}

function answer() {
    document.getElementById('answer').value = cal(document.getElementById('x').value, document.getElementById('y').value)
}