class Token {
    constructor(type, value) {
        this.type = type;
        this.value = value;
        this.toString = () => `Token(${this.type},${this.value})`;
    }
}

class Lexer {
    constructor(text, debug) {
        this.text = text;
        this.debug = debug;
        this.pos = 0;
        this.currentChar = this.text[this.pos];
        this.error = () => {
            throw Error("Invalid character");
        };
        this.advance = () => {
            this.pos++;
            if (this.pos > this.text.length - 1) {
                this.currentChar = null;
            } else {
                this.currentChar = this.text[this.pos];
            }
        };
        this.skipWhitespace = () => {
            while (this.currentChar !== null && /\s/.test(this.currentChar)) {
                this.advance();
            }
        };
        this.integer = () => {
            // Returns a (multidigit) integer consumed from the input
            let result = [];
            while (this.currentChar !== null && /\d/.test(this.currentChar)) {
                result.push(this.currentChar);
                this.advance();
            }
            return parseInt(result.join(''));
        };

        this.identifier = () => {
            let result = [];
            while (this.currentChar !== null && /[a-zA-Z]/.test(this.currentChar)) {
                result.push(this.currentChar);
                this.advance();
            }
            return result.join("");
        };
        this.peekNextToken = () => {
            throw Error("NOT IMPLEMENTED YET");
        };
        this.getNextToken = () => {
            // Lexical analyzer also called Scanner
            while (this.currentChar !== null) {
                if (/\s/.test(this.currentChar)) {
                    this.skipWhitespace();
                    continue;
                }
                if (/\d/.test(this.currentChar)) {
                    if (this.debug)
                        console.log("returning INTEGER token");
                    return new Token(INTEGER, this.integer());
                }
                if (/[a-zA-Z]/.test(this.currentChar)) {
                    if (this.debug)
                        console.log("returning IDENTIFIER token");
                    return new Token(ID, this.identifier());
                }
                if ("+" === this.currentChar) {
                    this.advance();
                    if (this.debug)
                        console.log("returning PLUS token");
                    return new Token(PLUS, "+");
                }
                if ("-" === this.currentChar) {
                    this.advance();
                    if (this.debug)
                        console.log("returning MINUS token");
                    return new Token(MINUS, "-");
                }
                if ("*" === this.currentChar) {
                    this.advance();
                    if (this.debug)
                        console.log("returning MUL token");
                    return new Token(MUL, "*");
                }
                if ("/" === this.currentChar) {
                    this.advance();
                    if (this.debug)
                        console.log("returning DIV token");
                    return new Token(DIV, "/");
                }
                if ("=" === this.currentChar) {
                    this.advance();
                    if (this.debug)
                        console.log("returning ASSIGN token");
                    return new Token(ASSIGN, "=");
                }
                if ("(" === this.currentChar) {
                    this.advance();
                    if (this.debug)
                        console.log("returning LPAREN token");
                    return new Token(LPAREN, "(");
                }
                if (")" === this.currentChar) {
                    this.advance();
                    if (this.debug)
                        console.log("returning RPAREN token");
                    return new Token(RPAREN, ")");
                }
                this.error();
            }
            return new Token("EOF", null);
        };
    }
}

class Interpreter {
    constructor(lexer) {
        this.lexer = lexer;
        this.currentToken = this.lexer.getNextToken();
        this.error = () => {
            throw Error("invalid syntax");
        };
        this.eat = (tokenType) => {
            if (this.debug)
                console.log(`eat ${tokenType}`);
            if (this.currentToken.type == tokenType) {
                if (this.debug)
                    console.log("EAT", this.currentToken, tokenType);
                this.currentToken = this.lexer.getNextToken();
            } else {
                this.error();
            }
        };
        this.factor = () => {
            // factor : INTEGER | LPAREN expr RPAREN
            let token = this.currentToken;
            if (this.debug)
                console.log(`factor : ${token}`);
            if (token.type === INTEGER) {
                this.eat(INTEGER);
                return token.value;
            } else if (token.type === LPAREN) {
                this.eat(LPAREN);
                result = this.expr();
                this.eat(RPAREN);
                return result;
            }
        };
        this.term = () => {
            let result = this.factor();
            /**
             * while this.current_token.type in (MUL, DIV):
             * token = this.current_token
             * if token.type == MUL
             */
            while (this.currentToken.type === MUL || this.currentToken.type === DIV) {
                let token = this.currentToken;
                switch (token.type) {
                    case MUL:
                        this.eat(MUL);
                        result = result * this.factor();
                        break;
                    case DIV:
                        this.eat(DIV);
                        result = result / this.factor();
                        break;
                    default:
                        console.log("term default", this.currentToken);
                        break;
                }
            }
            return result;
        };
        this.expr = () => {
            /**
             * -> 14 + 2 * 3 - 6 / 2
             *
             * expr : term ((PLUS | MINUS) term)*
             * term : factor ((MUL | DIV) factor)*
             * factor : INTEGER
             */
            let result = this.term();
            if (this.debug)
                console.log(`expr : ${result}`);
            while (this.currentToken.type === PLUS || this.currentToken.type === MINUS) {
                let token = this.currentToken;
                if (this.debug)
                    console.log(`expr loop: ${result}`);
                switch (token.type) {
                    case PLUS:
                        this.eat(PLUS);
                        result = result + this.term();
                        break;
                    case MINUS:
                        this.eat(MINUS);
                        result = result - this.term();
                        break;
                }
            }
            return result;
        };
    }
}

class AST {
    constructor() {}
}
class AssignOp extends AST {
    constructor(left, token, right) {
        super();
        this.left = left;
        this.token = this.op = token;
        this.right = right;
        this.type = "AssignOp";
    }
}
class BinOp extends AST {
    constructor(left, op, right) {
        super();
        this.left = left;
        this.op = op;
        //this.token = this.op;
        this.right = right;
        this.type = "BinOp";
    }
}

class Num extends AST {
    constructor(token) {
        super();
        //this.token = token;
        this.value = token.value;
        this.type = "Num";
    }
}
class Var extends AST {
    constructor(token) {
        super();
        this.token = token;
        this.value = token.value;
        this.type = "Var";
    }
}
class UnaryOp extends AST {
    constructor(op, expr) {
        super();
        this.token = this.op = op;
        this.expr = expr;
        this.type = "UnaryOp";
    }
}

const INTEGER = "INTEGER";
const RPAREN = "RPAREN";
const LPAREN = "LPAREN";
const MUL = "MUL";
const DIV = "DIV";
const PLUS = "PLUS";
const MINUS = "MINUS";
const ID = "ID";
const ASSIGN = "ASSIGN";
/**
 * expression      ::= factor | expression operator expression
 * factor          ::= number | identifier | assignment | '(' expression ')'
 * assignment      ::= identifier '=' expression
 * operator        ::= '+' | '-' | '*' | '/' | '%'
 * identifier      ::= letter | '_' { identifier-char }
 * identifier-char ::= '_' | letter | digit
 * number          ::= { digit } [ '.' digit { digit } ]
 * letter          ::= 'a' | 'b' | ... | 'y' | 'z' | 'A' | 'B' | ... | 'Y' | 'Z'
 * digit           ::= '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
 */

class Parser {
    constructor(lexer, debug) {
        this.lexer = lexer;
        this.debug = debug;
        this.currentToken = this.lexer.getNextToken();
    }
    error() {
        throw Error("invalid syntax");
    }
    eat(tokenType) {
        if (this.debug)
            console.log(`eat ${tokenType} ${this.currentToken}`);
        if (this.currentToken.type === tokenType) {
            this.currentToken = this.lexer.getNextToken();
        } else {
            this.error();
        }
    }
    term() {
        // term : factor ((MUL|DIV) factor)*
        let node = this.factor();
        while (this.currentToken.type === MUL ||
            this.currentToken.type === DIV) {
            let token = this.currentToken;
            if (token.type === MUL) {
                this.eat(MUL);
            } else if (token.type === DIV) {
                this.eat(DIV);
            }
            node = new BinOp(node, token, this.factor());
        }
        return node;
    }

    factor() {
        /**
         * factor   : PLUS factor
         *          | MINUS factor
         *          | INTEGER 
         *          | LPAREN expr RPAREN
         */

        let token = this.currentToken;
        if (this.debug)
            console.log(`factor ${token}`);
        if (token.type === PLUS) {
            this.eat(PLUS);
            let node = new UnaryOp(token, this.factor());
            return node;
        } else if (token.type == MINUS) {
            this.eat(MINUS);
            let node = new UnaryOp(token, this.factor());
            return node;
        } else if (token.type === INTEGER) {
            this.eat(INTEGER);
            return new Num(token);
        } else if (token.type === LPAREN) {
            this.eat(LPAREN);
            let node = this.expr();
            this.eat(RPAREN);
            return node;
        }
    }

    identifier() {
        let token = this.currentToken;
        while (token.type === ID) {
            this.eat(ID);
            return new Var(token);
        }
    }
    assignment() {
        // assignment : identifier ASSIGN expr
        let node = this.identifier();
        while (this.currentToken.type === ASSIGN) {
            let token = this.currentToken;
            this.eat(ASSIGN);
            return new AssignOp(node, token, this.expr());
        }
        return node;
    }

    expr() {
        /**
         * 
         * expr :   assignment 
         *      | term ((PLUS | MINUS) term)* 
         * assignment : identifier ASSIGN expr
         * term : factor ((MUL | DIV) factor)*
         * factor : INTEGER | LPAREN expr RPAREN
         */
        let node = this.assignment();
        
        //let node = this.term();
/*         if (node !== null || node !== undefined) {
            while (this.currentToken.type === PLUS ||
                this.currentToken.type === MINUS) {
                let token = this.currentToken;
                if (token.type === PLUS) {
                    this.eat(PLUS);
                } else if (token.type === MINUS) {
                    this.eat(MINUS);
                }
                node = new BinOp(node, token, this.term());
            }
        } */
        /*         if (node === undefined || node === null) {
                    console.log("Look for assignment");
                    node = this.assignment();
                } */
        return node;
    }
    parse() {
        /**
         * statement    :  expr
         */
        let node = this.expr();
        console.log("parse expr -> ", JSON.stringify(node));
        if (this.currentToken.type !== "EOF") {
            this.error();
        }
        return node;
    }
}

class NodeVisitor {
    constructor() {}
    visit(node) {
        let methodName = `visit_${node.type}`;
        /* if (this.debug)  */
        console.log(`visit ${methodName}`);
        try {
            return this[methodName].call(this, node);
        } catch (e) {
            console.log("try/catch " + e);
            return this.genericVisit(node);
        }
    }
    genericVisit(node) {
        console.log(JSON.stringify(node, null, 2));
        throw Error(`No visit method found for ${node.left.value} ${node.type} ${node.right.value}; `);
    }
}

class InterpreterVisitor extends NodeVisitor {
    constructor(parser) {
        super();
        this.parser = parser;
        this.interpret = () => {
            let tree = this.parser.parse();
            return this.visit(tree);
        };
    }
    visit_BinOp(node) {
        if (this.debug)
            console.log(`visitBinOp ${node.toString()}`);
        if (node.op.type === PLUS) {
            return this.visit(node.left) + this.visit(node.right);
        } else if (node.op.type === MINUS) {
            return this.visit(node.left) - this.visit(node.right);
        } else if (node.op.type === MUL) {
            return this.visit(node.left) * this.visit(node.right);
        } else if (node.op.type === DIV) {
            return this.visit(node.left) / this.visit(node.right);
        } else if (node.op.type === ASSIGN) {
            return this.visit_AssignOp.call(this, node);
        }
    }
    visit_Num(node) {
        return node.value;
    }
    visit_UnaryOp(node) {
        let op = node.op.type;
        if (op === PLUS) {
            return +this.visit(node.expr);
        } else if (op === MINUS) {
            return -this.visit(node.expr);
        }
    }
    visit_AssignOp(node) {
        console.log("Assignment FOO ", node);

    }
}
/* InterpreterVisitor.prototype = Object.create(NodeVisitor.prototype);
InterpreterVisitor.prototype.constructor = InterpreterVisitor;
 */ // unit test
let lexer = new Lexer("x = 1", true);
/* let token = lexer.getNextToken();
while(token.type !== "EOF") {
    console.log(token);
    token = lexer.getNextToken();
} */

/* console.assert(lexer.getNextToken().type === INTEGER, "expected INTEGER");
console.assert(lexer.getNextToken().type === PLUS, "expected PLUS");
console.assert(lexer.getNextToken().type === INTEGER, "expected INTEGER");
 */
// let interpreter = new Interpreter(lexer);
// let finish = interpreter.expr();

let parser = new Parser(lexer);
parser.parse();
let interpreterVisitor = new InterpreterVisitor(parser);
let visitorResult = interpreterVisitor.interpret();
console.log(visitorResult);