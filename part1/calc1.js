const INTERGER = 'INTERGER';
const PLUS = 'PLUS';
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
    }

    error() {
        throw new Error('Error parsing input');
    }

    get_next_token() {
        const text = this.text;

        if (this.pos > text.length - 1) return new Token(EOF, null);

        let current_char = text[this.pos];
        if ('0' <= current_char && current_char <= '9') {
            this.pos += 1;
            return new Token(INTERGER, Number(current_char));
        }

        if (current_char === '+') {
            this.pos += 1;
            return new Token(PLUS, current_char);
        }

        this.error();
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
        this.eat(PLUS);

        const right = this.current_token;
        this.eat(INTERGER);

        const result = left.value + right.value;
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