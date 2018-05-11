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
        if (this.pos >= this.text.length) {
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
        while (!isNaN(this.current_char)) {
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

            if (!isNaN(this.current_char)) {
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

    eat(token_type) {
        if (this.current_token.type === token_type) {
            this.current_token = this.get_next_token();
        } else {
            this.error();
        }
    }

    expr() {
        this.current_token = this.get_next_token();

        const left = this.current_token;
        this.eat(INTERGER);

        const op = this.current_token;
        if (op.type === PLUS) {
            this.eat(PLUS);
        } else {
            this.eat(MINUS);
        }

        const right = this.current_token;
        this.eat(INTERGER);
        
        let result;
        if (op.type === PLUS) {
             result = left.value + right.value;
        } else {
             result = left.value - right.value;
        }
        
        return result;
    }
}

function main() {
    process.stdin.setEncoding('utf8');
    process.stdout.write('calc>');
    process.stdin.on('data', function (chunk) {
        const interpreter = new Interpreter(String(chunk));
        const result = interpreter.expr();
        process.stdout.write(result + '\n');
        process.stdout.write('calc>');
    });
}

main();