import {
  Condition,
  ConditionNode,
  Operand,
  FunctionOperand,
  ExpressionOperand,
  ConditionOperand
} from "./conditions";

export class ConditionsParserError {
  constructor(public at: number, public code: string) {}
}

export class ConditionsParser {
  readonly ERROR_OperatorExpected = "OPERATOR_EXPECTED";
  readonly ERROR_RightPartExpected = "RIGHTPART_EXPECTED";
  readonly ERROR_ExpressionExpected = "EXPRESSION_EXPECTED";
  readonly ERROR_EndExpected = "END_EXPECTED";
  private text: string;
  private root: ConditionNode;
  private expressionNodes: Array<any>;
  private node: any;
  private at: number;
  private length: number;
  private errorValue: ConditionsParserError;
  public parse(text: string, root: ConditionNode): boolean {
    this.setProperties(text, root);
    return this.parseText();
  }
  public createCondition(text: string): ConditionNode {
    var root = new ConditionNode();
    if (!this.parse(text, root)) {
      root = null;
    }
    return root;
  }
  public parseExpression(text: string): Operand {
    this.setProperties(text, new ConditionNode());
    return this.readExpressionOperand();
  }
  public get error(): ConditionsParserError {
    return this.errorValue;
  }
  private createError(code: string) {
    if (this.errorValue) return;
    this.errorValue = new ConditionsParserError(this.at, code);
  }
  private setProperties(text: string, root: ConditionNode) {
    this.text = text;
    this.at = 0;
    this.length = this.text.length;
    this.root = root;
    this.root.clear();
    this.node = this.root;
    this.expressionNodes = [];
    this.expressionNodes.push(this.node);
    this.errorValue = null;
  }
  public toString(root: ConditionNode): string {
    return root.toString();
  }
  private parseText(): boolean {
    var res = this.readConditions();
    if (this.at < this.length) {
      this.createError(this.ERROR_EndExpected);
    }
    return res && this.at >= this.length;
  }
  private readConditions(): boolean {
    var res = this.readCondition();
    if (!res) return res;
    var connective = this.readConnective();
    if (connective) {
      this.addConnective(connective);
      return this.readConditions();
    }
    return true;
  }
  private readCondition(): boolean {
    var expRes = this.readExpression();
    if (expRes < 0) return false;
    if (expRes == 1) return true;
    var left = this.readExpressionOperand();
    if (!left) {
      this.createError(this.ERROR_ExpressionExpected);
      return false;
    }
    var op = this.readOperator();
    if (!op) {
      if (left.isBoolean) {
        var c = new Condition();
        c.left = left;
        this.addCondition(c);
        return true;
      }
      this.createError(this.ERROR_OperatorExpected);
      return false;
    }
    var c = new Condition();
    c.left = left;
    c.operator = op;
    if (!Condition.isNoRightOperation(op)) {
      var right = this.readExpressionOperand(true);
      if (!right) {
        this.createError(this.ERROR_RightPartExpected);
        return false;
      }
      c.right = right;
    }
    this.addCondition(c);
    return true;
  }
  private readOperand(): Operand {
    var ar = this.readArray();
    if (ar) return new Operand(ar);
    var str = this.readString();
    if (!str) return null;
    var params = this.readParameters();
    if (params) {
      var res = new FunctionOperand(str);
      res.parameters = params;
      return res;
    }
    return new Operand(str);
  }
  private readNotOperand(): boolean {
    this.skip();
    var savedAt = this.at;
    var str = this.readString();
    if (!!str && (str.toLowerCase() == "not" || str == "!")) return true;
    this.at = savedAt;
    return false;
  }
  private readExpression(): number {
    var isNot = this.readNotOperand();
    if (this.at >= this.length || this.ch != "(") return 0;
    this.at++;
    this.pushExpression();
    var res = this.readConditions();
    if (res) {
      this.skip();
      res = this.ch == <string>")";
      this.at++;
      this.popExpression(isNot);
      return 1;
    }
    return -1;
  }
  private readExpressionOperand(isRightCondition: boolean = false): Operand {
    var expr = this.readExpressionOperandCore(0, isRightCondition);
    if (expr == null) return null;
    if (!expr.right) return expr.left;
    return expr;
  }
  private readExpressionOperandCore(
    brackets: number = 0,
    isRightCondition: boolean = false
  ): ExpressionOperand {
    var expressions = this.readExpressionOperandsCore(
      brackets,
      isRightCondition
    );
    return this.makeExpressionOperandCore(expressions);
  }
  private makeExpressionOperandCore(
    expressions: Array<ExpressionOperand>
  ): ExpressionOperand {
    if (expressions.length == 0) return null;
    if (expressions.length == 1) return expressions[0];
    var res = new ExpressionOperand();
    res.left = expressions[0].left;
    res.operator = expressions[0].operator;
    this.buildExpressionBinaryTree(expressions, 1, res);
    return res;
  }
  private buildExpressionBinaryTree(
    list: Array<ExpressionOperand>,
    index: number,
    parent: ExpressionOperand
  ) {
    if (index >= list.length) return;
    var right = list[index].left;
    if (index == list.length - 1) {
      parent.right = right;
      return;
    }
    var operator = list[index].operator;
    var expr = new ExpressionOperand();
    if (
      this.isHighPriorityOperand(parent.operator) &&
      !this.isHighPriorityOperand(operator)
    ) {
      expr.left = parent.left;
      expr.right = right;
      expr.operator = parent.operator;
      parent.operator = operator;
      parent.left = expr;
      this.buildExpressionBinaryTree(list, index + 1, parent);
    } else {
      expr.left = right;
      expr.operator = operator;
      parent.right = expr;
      this.buildExpressionBinaryTree(list, index + 1, expr);
    }
  }
  private readExpressionOperandsCore(
    brackets: number,
    isRightCondition: boolean
  ): Array<ExpressionOperand> {
    var res = new Array<ExpressionOperand>();
    var operand = null;
    var operator = null;
    while (this.at <= this.length) {
      if (this.isCloseBracket(this.ch)) {
        this.at++;
        break;
      }
      this.skip();
      if (this.isOpenBracket(this.ch)) {
        this.at++;
        operand = this.readExpressionOperandCore(brackets + 1);
      } else {
        operand = this.readOperand();
      }
      if (!operand) {
        this.nextOnCloseBrackets();
        break;
      }
      operator = this.readOperandOperator();
      if (!operator) {
        if (
          !isRightCondition &&
          this.nextOnCloseBrackets() &&
          brackets == 0 &&
          this.expressionNodes.length > 0
        ) {
          this.popExpression(false);
          var expr = new ExpressionOperand();
          expr.left = operand;
          res.push(expr);
          operand = this.makeExpressionOperandCore(res);
          res = [];
          operator = this.readOperandOperator();
        }
        if (!operator) break;
      }
      var expr = new ExpressionOperand();
      expr.left = operand;
      expr.operator = operator;
      res.push(expr);
    }
    if (!!operand) {
      var expr = new ExpressionOperand();
      expr.left = operand;
      res.push(expr);
    }
    return res;
  }
  private nextOnCloseBrackets(): boolean {
    if (this.isCloseBracket(this.ch)) {
      this.at++;
      return true;
    }
    return false;
  }
  private get ch(): string {
    return this.text.charAt(this.at);
  }
  private skip() {
    while (this.at < this.length && this.isSpace(this.ch)) this.at++;
  }
  private isSpace(c: string): boolean {
    return c == " " || c == "\n" || c == "\t" || c == "\r";
  }
  private isQuotes(c: string): boolean {
    return c == "'" || c == '"';
  }
  private isComma(c: string): boolean {
    return c == ",";
  }
  private isOperatorChar(c: string): boolean {
    return (
      c == ">" ||
      c == "<" ||
      c == "=" ||
      c == "!" ||
      c == "+" ||
      c == "-" ||
      c == "*" ||
      c == "^" ||
      c == "/" ||
      c == "%"
    );
  }
  private isOpenBracket(c: string): boolean {
    return c == "(";
  }
  private isCloseBracket(c: string): boolean {
    return c == ")";
  }
  private isBrackets(c: string): boolean {
    return this.isOpenBracket(c) || this.isCloseBracket(c);
  }
  private readArray(): Array<any> {
    this.skip();
    if (this.at >= this.length) return null;
    if (this.ch !== "[") return null;
    this.at++;
    var res = [];
    while (this.at < this.length) {
      var str = this.readString();
      if (str) res.push(str);
      this.skip();
      var c = this.ch;
      if (c == ",") this.at++;
      if (c == "]") {
        this.at++;
        break;
      }
    }
    return res;
  }
  private readString(): string {
    this.skip();
    if (this.at >= this.length) return null;
    var start = this.at;
    var hasQuotes = this.isQuotes(this.ch);
    var hasBraces = this.ch == "{";
    if (hasQuotes) this.at++;
    var isFirstOpCh = this.isOperatorChar(this.ch);
    var isPrevEspape = false;
    while (this.at < this.length) {
      if (hasBraces) {
        var isBrace = this.ch == "}";
        this.at++;
        if (isBrace) break;
        else continue;
      }
      if (!hasQuotes && this.isSpace(this.ch)) break;
      if (this.isQuotes(this.ch) && !isPrevEspape) {
        if (hasQuotes) this.at++;
        break;
      }
      if (!hasQuotes) {
        if (this.ch != "-" && isFirstOpCh != this.isOperatorChar(this.ch))
          break;
        if (this.isBrackets(this.ch) || this.isComma(this.ch)) break;
        if (this.ch === "]") break;
      }
      isPrevEspape = this.ch === "\\";
      this.at++;
    }
    if (this.at <= start) return null;
    var res = this.text.substr(start, this.at - start);
    if (res) {
      if (res.length > 1 && this.isQuotes(res[0])) {
        var len = res.length - 1;
        if (this.isQuotes(res[res.length - 1])) len--;
        res = res.substr(1, len);
      }
    }
    return res;
  }
  private readParameter(): Operand {
    var openedBrackets = 0;
    var startIndex = this.at;
    while (this.at < this.length) {
      if (this.isOpenBracket(this.ch)) openedBrackets++;
      if (this.isCloseBracket(this.ch)) openedBrackets--;
      if (openedBrackets < 0) break;
      if (openedBrackets === 0 && this.ch === ",") break;
      this.at++;
    }
    var paramStr = this.text.substring(startIndex, this.at);
    if (!paramStr) return null;
    var parser = new ConditionsParser();
    var node = new ConditionNode();
    if (parser.parse(paramStr, node)) {
      return new ConditionOperand(node);
    }
    return parser.parseExpression(paramStr);
  }
  private readParameters(): Array<Operand> {
    if (!this.isOpenBracket(this.ch)) return null;
    var params = [];
    while (this.at < this.length && !this.isCloseBracket(this.ch)) {
      this.at++;
      var operand = this.readParameter(); //this.readExpressionOperand();
      if (operand) {
        params.push(operand);
      }
    }
    this.at++;
    return params;
  }
  private isHighPriorityOperand(op: string): boolean {
    return op == "*" || op == "^" || op == "/" || op == "%";
  }
  private readOperandOperator(): string {
    this.skip();
    if (
      this.ch == "+" ||
      this.ch == "-" ||
      this.ch == "*" ||
      this.ch == "^" ||
      this.ch == "/" ||
      this.ch == "%"
    ) {
      var res = this.ch;
      this.at++;
      return res;
    }
    return null;
  }
  private readOperator(): string {
    this.skip();
    var curAt = this.at;
    var op = this.readString();
    if (!op) return null;
    op = op.toLowerCase();
    if (op == ">") op = "greater";
    if (op == "<") op = "less";
    if (op == ">=" || op == "=>") op = "greaterorequal";
    if (op == "<=" || op == "=<") op = "lessorequal";
    if (op == "=" || op == "==") op = "equal";
    if (op == "<>" || op == "!=") op = "notequal";
    if (op == "equals") op = "equal";
    if (op == "notequals") op = "notequals";
    if (op == "contain" || op == "*=") op = "contains";
    if (op == "notcontain") op = "notcontains";
    if (Condition.isCorrectOperator(op)) return op;
    this.at = curAt;
    return null;
  }
  private readConnective(): string {
    var con = this.readString();
    if (!con) return null;
    con = con.toLowerCase();
    if (con == "&" || con == "&&") con = "and";
    if (con == "|" || con == "||") con = "or";
    if (con != "and" && con != "or") con = null;
    return con;
  }
  private pushExpression() {
    var node = null;
    this.expressionNodes.push(node);
    this.node = node;
  }
  private makeNodeCondition() {
    if (!this.node || !this.node.children) {
      this.node = new ConditionNode();
      this.expressionNodes[this.expressionNodes.length - 1] = this.node;
    }
  }
  private popExpression(isNot: boolean) {
    var node = this.expressionNodes.pop();
    this.node = this.expressionNodes[this.expressionNodes.length - 1];
    if (node) {
      node.isNot = isNot;
      this.makeNodeCondition();
      this.node.children.push(node);
    }
  }
  private addCondition(c: Condition) {
    this.makeNodeCondition();
    this.node.children.push(c);
  }
  private addConnective(con: string) {
    this.makeNodeCondition();
    if (this.node.children.length < 2) {
      this.node.connective = con;
    } else {
      if (this.node.connective != con) {
        var oldCon = this.node.connective;
        var oldChildren = this.node.children;
        this.node.clear();
        this.node.connective = con;
        var oldNode = new ConditionNode();
        oldNode.connective = oldCon;
        oldNode.children = oldChildren;
        this.node.children.push(oldNode);
        var newNode = new ConditionNode();
        this.node.children.push(newNode);
        this.node = newNode;
      }
    }
  }
}
