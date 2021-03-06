var monad = require('../lib/monad');

function foo () {
    var m = monad.list();
    var a = do m {
        g = 3;
        x <- ['a', 'b', 'c', 'd'];
        y <- [1, 2];
        return [x, y, g];
    };
    return a;
}

function fibMonadic(n) {
    var ary = [], stateMonad, i, result;
    stateMonad = monad.stateT(monad.identity());
    for (i = 0; i < n; i += 1) {
        ary.push(fibMonadicStep(stateMonad));
    }
    result = stateMonad.exec(monad.sequence(stateMonad, ary), [0,1]);
    return result[1];
}

function fibMonadicStep(stateMonad) {
    return stateMonad.modify(
        function (xy) { var x = xy[0], y = xy[1]; return [y, x+y]; });
}

function contTest(x, y, k) {
    var cont = monad.contT(monad.identity());
    var square = function (x) {
        return do cont {
            return x * x;
        };
    };
    var add = function (x, y) {
        return do cont {
            return x + y;
        };
    };
    return cont.run(do cont {
        xx <- square(x);
        yy <- square(y);
        sum <- add(xx, yy);
        sum2 <- add(xx, yy);
        sum3 <- add(sum, sum2);
        return sum3;
    }, k);
}

function callCCTest(x, y) {
    var cont = monad.contT(monad.identity());
    var add = function (x, y) {
        return do cont {
            return x + y;
        };
    };
    var g = 0;
    return cont.run(do cont {
        sum <- add(x,y);
        msg <- cont.callCC(function (k) {
            return do cont {
                return console.log('foo');
                return console.log('bar');
                if (x === y) {
                    cont.suspend(function (resume) {
                        setTimeout(function () { resume('They are equal');}, 1000);
                    });
                } else if (x > y) {
                    k('x > y');
                } else {
                    return ('x < y');
                }
            };
        });
        return console.log('baz',msg);
        len <- return msg.length;
        return [msg, sum, len, g++];
    });
}

function loopTest1() {
    var cont = monad.contT(monad.identity());
    var start;
    cont.run(do cont {
        m <- cont.callCC(function (k) {
            return do cont { return start = k;
                             return 0; };
        });
        return console.log('hello world!', m);
        start(m + 1);
    });
}

function loopTest2() {
    var cont = monad.contT(monad.identity());
    var start;
    return cont.run(do cont {
        m <- cont.suspend(function (k) {
            start = k;
            k(0);
        });
        return console.log('hello world!', m);
        if (m < 10) {
            return start(m + 1);
        } else {
            return m;
        }
    });
}

exports.foo = foo;
exports.fibMonadic = fibMonadic;
exports.contTest = contTest;
exports.callCCTest = callCCTest;
exports.loopTest1 = loopTest1;
exports.loopTest2 = loopTest2;
