const INTERGER = 'INTERGER';
const PLUS = 'PLUS';
const MINUS = 'MINUS';
const EOF = 'EOF';

class Token {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
}

class Interpreter {
    constructor(text) {
        this.text = text;
        this.pos = 0;
        this.current_token = null;
        this.current_char = this.text[this.pos];
    }

    error() {
        throw new Error('Error parsing input');
    }

    advance() {
        this.pos += 1;
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

            this.error();
        }

        return new Token(EOF, null);
    }

    term() {
        const token = this.current_token;
        this.eat(INTERGER);
        return token.value;
    }

    eat(token_type) {
        if (this.current_token.type === token_type) {
            this.current_token = this.get_next_token();
        } else {
            this.error();
        }
    }

    expr() {
        this.current_token = this.get_next_token();

        let result = this.term();
        while (true) {
            const token = this.current_token;
            if (token.type === EOF) break;
            if (token.type === PLUS) {
                this.eat(PLUS);
                result += this.term();
            } else {
                this.eat(MINUS);
                result -= this.term();
            }
        }
        
        return result;
    }
}

function main() {
    process.stdin.setEncoding('utf8');
    process.stdout.write('calc>');
    process.stdin.on('data', function (chunk) {
        const interpreter = new Interpreter(String(chunk).slice(0, -2));
        const result = interpreter.expr();
        process.stdout.write(result + '\n');
        process.stdout.write('calc>');
    });
}

main();