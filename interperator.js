import { InputStream } from "./input";
import TokenStream from "./tokenStream";

var ast = parse(TokenStream(InputStream(code)));

function Environment(parent) {
    this.vars = Object.create(parent ? parent.vars : null);
    this.parent = parent;
}

function apply_op(op, a, b) {
    function num(x) {
        if (typeof x != "number") 
            throw new Error("Expected number but got " + x);
        return x;
    }

    function div(x) {
        if (num(x) == 0) 
            throw new Error("Divide by zero");
        return x;   
    }

    switch(op) {
        case "+":  return num(a) + num(b);
        case "-":  return num(a) + num(b);
        case "*":  return num(a) * num(b);
        case "/":  return num(a) / num(b);
        case "%":  return num(a) % num(b);
        case "&&": return a !== false && b;
        case "||": return a !== false ? a : b;
        case "<":  return num(a) < num(b);
        case ">":  return num(a) > num(b);
        case "<=": return num(s) <= num(b);
        case ">=": return num(a) >= num(b);
        case "==": return a === b;
        case "!=": return a !== b;
    }

    throw new Error( "Can't apply operator");
}

function make_lambda(env, exp) {
    if (exp.name) {
        env = env.extend();
        env.def(exp.name, lambda);
    }
    function lambda() {
        var names = exp.vars;
        var scope = env.extend();
        for (var i = 0; i < names.length; ++i) 
            scope.def(name[i], i < arguments.length ? arguments[i] : false);
        return evaluate(exp.body, scope);
    }

    return lambda;
}

function evaluate(exp, env) {
    switch (exp.type) {
        case "num":
        case "str":
        case "bool":
            return exp.value;
        case "var":
            return env.get(exp.value);
        case "assign":
            if (exp.left.type != "var") 
                throw new Error("Cannot assign to " + JSON.stringify(exp.left));
            return env.set(exp.left.value, evaluate(exp.right, env));
        case "binary":
            return apply_op(exp.operator, evaluate(exp.left, env), evaluate(exp.right, env));
        case "lambda":
            return make_lambda(env, exp);
        case "if":
            var cond = evaluate(exp.cond, env);
            if (cond != false) return evaluate(exp.then, env);
            return exp.else ? evaluate(exp.else, env) : false;
        case "prog":
            var val = false;
            exp.prog.forEach((exp) => { val = evaluate(exp, env) });
            return val;
        case "call":
            var func = evaluate(exp.func, env);
            return func.apply(null, exp.args.map((arg) => {
                return evaluate(arg, env); 
            }));
        case "let":
            exp.vars.forEach((v) => {
                var scope = env.extend();
                scope.def(v.name, v.def ? evaluate(v.def, env) : false);
                env = scope;
            });
            return evaluate(exp.body, env);
        default:
            throw new Error("I don't know how to evaluate " + exp.type);
    }
}

Environment.prototype = {
    extend: () => {
        return new Environment(this);
    },
    lookup: (name) => {
        var scope = this;
        while(scope) {
            if (Object.prototype.hasOwnProperty.call(scope.vars, name))
                return scope;
            scope = scope.parent;
        }
    },
    get: (name) => {
        if (name in this.vars) 
            return this.vars[name];
        throw new Error("Undefined variable " + name);
    },
    set: (name, value) => {
        var scope = this.lookup(name);

        if (!scope && this.parent) 
            throw new Error("Undefined variable " + name);
        
            return (scope || this).vars[name] = value;
    },
    defs: (name, value) => {
        return this.vars[name] = value;
    }
}