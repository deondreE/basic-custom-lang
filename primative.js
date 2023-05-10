globalEnv.def("fibJS", (n) => {
    if (n < 2) return n;
    return fibJS(n - 1) + fibJS(n - 2);
});

globalEnv.def("time", (fn) => {
    var t1 =  Date.now();
    var ret = fn();
    var t2 = Date.now();
    println("Time: " + (t2 - t1) + "ms");
    return ret;
});