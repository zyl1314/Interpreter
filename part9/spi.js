const INTERGER = 'INTERGER';
const PLUS = 'PLUS';
const MINUS = 'MINUS';
const MUL = 'MUL';
const DIV = 'DIV';
const EOF = 'EOF';
const LPAREN = '(';
const RPAREN = ')';
const BEGIN = 'BEGIN';
const END = 'END';
const ASSIGN = 'ASSIGN';
const SEMI = 'SEMI';
const DOT = 'DOT';
const ID = 'ID';
const charReg = /[a-zA-Z]/;
const numReg = /[0-9]/;

class Token {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
}

const RESERVED_KEYWORDS = {
    [BEGIN]: new Token(BEGIN, 'BEGIN'),
    [END]: new Token(END, 'END')  
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

    peek() {
        let peek_pos = this.pos + 1;
        if (peek_pos >= this.text.length) {
            return undefined;
        } else {
            return this.text[peek_pos];
        }
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

    _id() {
        let result = '';
        while (this.current_char !== undefined && charReg.test(this.current_char)) {
            result += this.current_char;
            this.advance();
        }
        
        if (RESERVED_KEYWORDS[result]) {
            return RESERVED_KEYWORDS[result];
        } else {
            return new Token(ID, result);
        }
    }

    get_next_token() {
        
        while (this.current_char !== undefined) {
            if (this.current_char === ' ') {
                this.skip_whitespace();
                continue;
            }

            if (charReg.test(this.current_char)) {
                return this._id();
            }

            if (this.current_char === ':' && this.peek() === '=') {
                this.advance();
                this.advance();
                return new Token(ASSIGN, ':=');
            }

            if (this.current_char === '.') {
                this.advance();
                return new Token(DOT, '.');
            }

            if (this.current_char === ';') {
                this.advance();
                return new Token(SEMI, ';');
            }

            if (numReg.test(this.current_char)) {
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

class Compound extends AST {
    constructor() {
        super();
        this.children = [];
    }
}

class Assign extends AST {
    constructor(left, op, right) {
        super();
        this.left = left;
        this.token = this.op = this.op;
        this.right = right;
    }
}

class Var extends AST {
    constructor(token) {
        super();
        this.token = token;
        this.value = token.value;
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

class NoOp extends AST {
    constructor() {
        super();
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
        } else if (token.type === ID) {
            this.eat(ID);
            return new Var(token);
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

    assignment_statement() {
        let variable = new Var(this.current_token);
        this.eat(ID);
        let assign = this.current_token;
        this.eat(ASSIGN);
        let expr = this.expr();
        return new Assign(variable, assign, expr);
    }

    statement() {
        if (this.current_token.type === ID) {
            return this.assignment_statement();
        } else if (this.current_token.type === BEGIN) {
            return this.compound_statement();
        } else {
            return new NoOp();
        }
    }

    statement_list() {
        let nodes = [this.statement()];
        while (this.current_token.type === SEMI) {
            this.eat(SEMI);
            nodes.push(this.statement());
        }
        if (this.current_token.type === ID) this.error();
        return nodes;
    }

    compound_statement() {
        let node = new Compound();
        this.eat(BEGIN);
        node.children = this.statement_list();
        this.eat(END);
        return node;
    }

    program() {
        let node = this.compound_statement();
        this.eat(DOT);
        return node;
    }

    parse() {
        return this.program();
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

    visit_Compound(node) {
        node.children.forEach((child) => {
            this.visit(child);
        })
    }

    visit_Assign(node) {
        let left = node.left;
        let right = node.right;
        this.GLOBAL_SCOPE[left.value] = this.visit(right);
    }

    visit_Var(node) {
        let key = node.value;
        let value = this.GLOBAL_SCOPE[key];
        if (value) return value;
        throw new Error(`{key} is not defined`);
    }

    visit_NoOp() {}

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
        this.GLOBAL_SCOPE = {};
        let result = this.visit(tree);
        return result;
    }
}


// 测试
const lexer = new Lexer('BEGIN BEGIN X:=2+3; Y:=X+3*-3*(1+2) END; Z:=1 END.');
const parser = new Parser(lexer);
const interpreter = new Interpreter(parser);
interpreter.interpreter();
console.log(interpreter.GLOBAL_SCOPE);