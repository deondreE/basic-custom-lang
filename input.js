function InputStream(input) {
    var pos = 0, line = 0, col = 0;

    return {
        next : next,
        peek : peek,
        eof : eof,
        croak: croak,
    };

    function next() {
        var ch = input.charAt(pos++);
        if (ch == '\n') line++, col = 0;
        return ch;
    }

    function peek() {
        return input.charAt(pos);
    }

    function eof() {
        return peek() == '';
    }

    function croak() {
        throw new Error(msg + " (" + line + ":" + col + ")");
    }
}

function read_next() {
    read_while(is_whitespace);
    if (input.eof()) return null;
    var ch = input.peek();
    if (ch == "#") {
        skip_comment();
        return read_next();
    }
    if (ch == '"') return read_string();
    if (is_digit(ch)) return {
        type: "punc",
        value: input.next(),
    };
    if (is_op_char(ch)) return {
        type: "op",
        value: read_while(is_op_char)
    };
    input.croak("Can't handle character: " + ch);
}

export { InputStream };