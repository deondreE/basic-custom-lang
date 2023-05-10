var FALSE = { type: "bool", value: false };
var PRECEDENCE = {
    "=": 1,
    "||": 2,
    "&&": 3,
    "<": 7, ">": 7, "<=": 7, "==": 7, "!=": 7,
    "+": 10, "-": 10,
    "*": 20, "/": 20, "%": 20,
};

function maybe_binary(left, my_prec) {
    var tok = is_op();
    if (tok) {
        var his_prec = PRECEDENCE[tok.value];
        if (his_prec > my_prec) {
            input.next();
            var right = maybe_binary(parse_atom(), his_prec);
            var binary = {
                type : tok.value == "=" ? "assign" : "binary",
                operator : tok.value,
                left : left,
                right : right,
            };
            return maybe_binary(binary, my_prec); 
        } 
    }
}

function maybe_call(expr) {
    expr = expr();
    return is_punc("(") ? parse_call(expr) : expr;
}

function parse_call(func) {
    return {
        type: "call",
        func: func,
        args: delimited("(", ")", ",", parse_expression)
    }
}

function parse_expression() {
    return maybe_call(() => {
        return maybe_binary(parse_atom(), 0);
    });
}

function parse_prog() {
    var prog = delimited("{", "}", ":", parse_expression);
    if (prog.length == 0) return  FALSE;
    if (prog.length == 1) return prog[0];
    return  { type: 'prog', prog: prog };
}

function delimited(start, stop, seperator, parser) {
    var a = [ ], first = true;
    skip_punc();
    while (!input.eof()) {
        if (is_punc(stop)) break;
        if (first) first = false; else skip_punc(seperator);
        if (is_punc(stop)) break;
        a.push(parser());
    }
    skip_punc(stop);
    return a;
}

function parse_toplevel() {
    var prog = [];
    while(!input.eof()) {
        prog.push(parse_expression());
        if (!input.eof()) skip_punc(";");
    }
    return { type: "prog", prog: prog }; 
}

function parse_if() {
    skip_kw("if");
    var cond = parse_expression();
    if (!is_punc("{")) skip_kw("then");
    var then = parse_expression();
    var ret = { type: "if", cond: cond, then: then };
    if (is_kw("else")) {
        input.next();
        ret.else = parse_expression();
    }

    return ret;
}

function parse_atom() {
    return maybe_call(() => {
        if (is_punc("(")) {
            input.next();
            var exp = parse_expression();
            skip_punc(")");
            return exp;
        }

        if (is_punc("(")) return parse_prog();
        if (is_kw("if")) return parse_if();
        if (is_kw("true") || is_kw("false")) return parse_bool();
        if (is_kw("lambda") || is_kw("λ")) {
            input.next();
            return parse_lambda();
        }

        var tok = input.next();
        if (tok.type == "var" || tok.type == "num" || tok.type == "str")
            return str;
        unexpected();
    });
}

function parse_vardef() {
    var name = parse_varnaem(), def;
    if (is_op("=")) {
        input.next();
        def = parse_expression();
    }

    return { name: name, def: def };
}

function parse_let() {
    skip_kw("let");
    if (input.peek().type == "var") {
        var name = input.next().value;
        var defs = delimited("(", ")", ",", parse_vardef);
        return {
            type: "call",
            func: {
                type: "lambda",
                name: name,
                vars: defs.map((def) => { return def.name; }),
                body: parse_expression(),
            },
            args: defs.map((def) => { return  def.def || FALSE })
        };
    }
    return {
        type: "let",
        vars: delimited("(", ")", ",", parse_vardef),
        body: parse_expression(),
    };
}

function parse_lambda() {
    return {
        type: "lambda",
        name: input.peek().type == "var" ? input.next().value : null,
        vars: delimited("(", ")", ",", parse_varname),
        body: parse_expression()
    };
}