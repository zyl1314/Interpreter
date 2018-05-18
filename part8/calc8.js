const INTERGER = 'INTERGER';
const PLUS = 'PLUS';
const MINUS = 'MINUS';
const MUL = 'MUL';
const DIV = 'DIV';
const EOF = 'EOF';
const LPAREN = '(';
const RPAREN = ')';

class Token {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
}

class Lexer {
    constructor(text) {
        this.text = text;
        this.pos = 0;
        this.current_char = text[0];
    }

    error() {
        throw new Error('Error parsing input');
    }

    advance() {
        this.pos++;
        if (this.pos > this.text.length - 1) {
            this.current_char = undefined;
        } else {
            this.current_char = this.text[this.pos];
        }
    }

    skip_whitespace() {
        while (this.current_char !== undefined && this.current_char === ' ') {
            this.advance();
        }
    }

    interger() {
        let result = '';
        while ('0' <= this.current_char && this.current_char <= '9') {
            result += this.current_char;
            this.advance();
        }

        return Number(result);
    }

    get_next_token() {
        while (this.current_char !== undefined) {
            if (this.current_char === ' ') {
                this.skip_whitespace();
                continue;
            }

            if ('0' <= this.current_char && this.current_char <= '9') {
                return new Token(INTERGER, this.interger());
            }

            if (this.current_char === '+') {
                this.advance();
                return new Token(PLUS, '+');
            }

            if (this.current_char === '-') {
                this.advance();
                return new Token(MINUS, '-');
            }

            if (this.current_char === '*') {
                this.advance();
                return new Token(MUL, '*');
            }

            if (this.current_char === '/') {
                this.advance();
                return new Token(DIV, '/');
            }

            if (this.current_char === '(') {
                this.advance();
                return new Token(LPAREN, '(');
            }

            if (this.current_char === ')') {
                this.advance();
                return new Token(RPAREN, ')');
            }

            this.error();
        }

        return new Token(EOF, null);
    }

}

class AST {
    constructor() {

    }
}

class Num extends AST {
    constructor(token) {
        super();
        this.token = token;
        this.value = token.value;
    }
}

class BinOp extends AST {
    constructor(left, op, right) {
        super();
        this.left = left;
        this.token = this.op = op;
        this.right = right;
    }
}

class UnaryOp extends AST {
    constructor(op, expr) {
        super();
        this.token = this.op = op;
        this.expr = expr;
    }
}

class Parser {
    constructor(lexer) {
        this.lexer = lexer;
        this.current_token = this.lexer.get_next_token();
    }

    error() {
        throw new Error('Error parsing input');
    }

    eat(token_type) {
        if (this.current_token.type === token_type) {
            this.current_token = this.lexer.get_next_token();
        } else {
            this.error();
        }
    }

    factor() {
        const token = this.current_token;
        if (token.type === INTERGER) {
            this.eat(INTERGER);
            return new Num(token);
        } else if (token.type === PLUS || token.type === MINUS) {
            if (token.type === PLUS) {
                this.eat(PLUS);
            } else {
                this.eat(MINUS);
            }
            return new UnaryOp(token, this.factor());
        } else if (token.type === LPAREN) {
            this.eat(LPAREN);
            let node = this.expr();
            this.eat(RPAREN);
            return node;
        }
    }

    term() {
        let node = this.factor();
        while (this.current_token.type === MUL || this.current_token.type === DIV) {
            let token = this.current_token;
            if (token.type === MUL) {
                this.eat(MUL);
            } else {
                this.eat(DIV);
            }
            node = new BinOp(node, token, this.factor());
        }
        return node;
    }

    expr() {
        let node = this.term();
        while (this.current_token.type === PLUS || this.current_token.type === MINUS) {
            let token = this.current_token;
            if (token.type === PLUS) {
                this.eat(PLUS);
            } else {
                this.eat(MINUS);
            }
            node = new BinOp(node, token, this.term());
        }
        
        return node;
    }

    parse() {
        return this.expr();
    }
}

class NodeVisistor {
    constructor() {

    }

    visit(node) {
        let method_name = `visit_${node.constructor.name}`;
        let visitor = this[method_name];
        if (!visitor) throw new Error(`no ${method_name} method`);
        return visitor.call(this, node);
    }
}

class Interpreter extends NodeVisistor{
    constructor(parser) {
        super();
        this.parser = parser;
    }

    visit_BinOp(node) {
        if (node.op.type === PLUS) {
            return this.visit(node.left) + this.visit(node.right);
        } else if (node.op.type === MINUS) {
            return this.visit(node.left) - this.visit(node.right);
        } else if (node.op.type === MUL) {
            return this.visit(node.left) * this.visit(node.right);
        } else if (node.op.type === DIV) {
            return this.visit(node.left) / this.visit(node.right);
        }
    }

    visit_UnaryOp(node) {
        if (node.op.type === PLUS) {
            return this.visit(node.expr);
        } else if (node.op.type === MINUS) {
            return -this.visit(node.expr);
        }
    }

    visit_Num(node) {
        return node.value;
    }

    interpreter() {
        let tree = this.parser.parse();
        return this.visit(tree);
    }
}

function main() {
    process.stdin.setEncoding('utf8');
    process.stdout.write('calc>');
    process.stdin.on('data', function (chunk) {
        const lexer = new Lexer(String(chunk).slice(0, -2))
        const parser = new Parser(lexer);
        const interpreter = new Interpreter(parser);
        const result = interpreter.interpreter();
        process.stdout.write(result + '\n');
        process.stdout.write('calc>');
    });
}

main();
