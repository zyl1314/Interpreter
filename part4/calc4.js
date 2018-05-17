const INTERGER = 'INTERGER';
const MUL = 'MUL';
const DIV = 'DIV';
const EOF = 'EOF';

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

            if (this.current_char === '*') {
                this.advance();
                return new Token(MUL, '*');
            }

            if (this.current_char === '/') {
                this.advance();
                return new Token(DIV, '/');
            }

            this.error();
        }

        return new Token(EOF, null);
    }

}

class Interpreter {
    constructor(lexer) {
        this.lexer = lexer;
        this.current_token = this.lexer.get_next_token();
    }

    error() {
        throw new Error('Error parsing input');
    }

    factor() {
        const token = this.current_token;
        this.eat(INTERGER);
        return token.value;
    }

    eat(token_type) {
        if (this.current_token.type === token_type) {
            this.current_token = this.lexer.get_next_token();
        } else {
            this.error();
        }
    }

    expr() {
        let result = this.factor();
        while (true) {
            const token = this.current_token;
            if (token.type === EOF) break;
            if (token.type === MUL) {
                this.eat(MUL);
                result *= this.factor();
            } else {
                this.eat(DIV);
                result /= this.factor();
            }
        }
        
        return result;
    }
}

function main() {
    process.stdin.setEncoding('utf8');
    process.stdout.write('calc>');
    process.stdin.on('data', function (chunk) {
        const lexer = new Lexer(String(chunk).slice(0, -2))
        const interpreter = new Interpreter(lexer);
        const result = interpreter.expr();
        process.stdout.write(result + '\n');
        process.stdout.write('calc>');
    });
}

main();