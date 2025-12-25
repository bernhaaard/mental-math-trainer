/**
 * Secure Mathematical Expression Evaluator
 *
 * This module provides a secure way to evaluate arithmetic expressions without using
 * eval() or Function constructor. It implements a recursive descent parser that
 * supports basic arithmetic operations with proper order of operations (PEMDAS).
 *
 * Security Features:
 * - Whitelist validation: only allows digits, operators, parentheses, decimal points
 * - No eval() or Function constructor
 * - Maximum expression length limit
 * - Rejects any injection attempts
 */

const MAX_EXPRESSION_LENGTH = 500;

/**
 * Whitelist of allowed characters in expressions
 * Only digits, arithmetic operators, parentheses, decimal points, and whitespace
 */
const ALLOWED_CHARS_REGEX = /^[0-9+\-*/().\s]+$/;

/**
 * Evaluates a mathematical expression securely
 *
 * @param expression - The mathematical expression to evaluate
 * @returns The numeric result of the evaluation
 * @throws Error if the expression is invalid, contains disallowed characters, or is too long
 *
 * @example
 * evaluateExpression("2 + 2") // returns 4
 * evaluateExpression("(50 - 3) * (50 + 3)") // returns 2491
 * evaluateExpression("2 + 3 * 4") // returns 14 (respects order of operations)
 */
export function evaluateExpression(expression: string): number {
  // Validate input is a string
  if (typeof expression !== 'string') {
    throw new Error('Expression must be a string');
  }

  // Check length limit
  if (expression.length > MAX_EXPRESSION_LENGTH) {
    throw new Error(`Expression exceeds maximum length of ${MAX_EXPRESSION_LENGTH} characters`);
  }

  // Check for empty expression
  if (expression.trim().length === 0) {
    throw new Error('Expression cannot be empty');
  }

  // Security: Whitelist validation - only allow safe characters
  if (!ALLOWED_CHARS_REGEX.test(expression)) {
    throw new Error('Expression contains invalid characters. Only numbers, +, -, *, /, (, ), and . are allowed');
  }

  // Remove all whitespace for easier parsing
  const normalized = expression.replace(/\s+/g, '');

  // Parse and evaluate using recursive descent parser
  const parser = new ExpressionParser(normalized);
  const result = parser.parse();

  // Validate result
  if (!isFinite(result)) {
    throw new Error('Expression resulted in an invalid number (Infinity or NaN)');
  }

  return result;
}

/**
 * Recursive Descent Parser for arithmetic expressions
 *
 * Grammar:
 * expression := term (('+' | '-') term)*
 * term       := factor (('*' | '/') factor)*
 * factor     := number | '(' expression ')' | '-' factor
 * number     := [0-9]+ ('.' [0-9]+)?
 */
class ExpressionParser {
  private expression: string;
  private position: number;

  constructor(expression: string) {
    this.expression = expression;
    this.position = 0;
  }

  /**
   * Parse the entire expression
   */
  parse(): number {
    const result = this.parseExpression();

    // Ensure we consumed the entire expression
    if (this.position < this.expression.length) {
      throw new Error(`Unexpected character at position ${this.position}: '${this.expression[this.position]}'`);
    }

    return result;
  }

  /**
   * Parse an expression: term (('+' | '-') term)*
   */
  private parseExpression(): number {
    let result = this.parseTerm();

    while (this.position < this.expression.length) {
      const char = this.expression[this.position];

      if (char === '+') {
        this.position++;
        result += this.parseTerm();
      } else if (char === '-') {
        this.position++;
        result -= this.parseTerm();
      } else {
        break;
      }
    }

    return result;
  }

  /**
   * Parse a term: factor (('*' | '/') factor)*
   */
  private parseTerm(): number {
    let result = this.parseFactor();

    while (this.position < this.expression.length) {
      const char = this.expression[this.position];

      if (char === '*') {
        this.position++;
        result *= this.parseFactor();
      } else if (char === '/') {
        this.position++;
        const divisor = this.parseFactor();
        if (divisor === 0) {
          throw new Error('Division by zero');
        }
        result /= divisor;
      } else {
        break;
      }
    }

    return result;
  }

  /**
   * Parse a factor: number | '(' expression ')' | '-' factor
   */
  private parseFactor(): number {
    // Skip any leading whitespace (should already be removed, but defensive)
    while (this.position < this.expression.length && this.expression[this.position] === ' ') {
      this.position++;
    }

    if (this.position >= this.expression.length) {
      throw new Error('Unexpected end of expression');
    }

    const char = this.expression[this.position];

    // Handle negative numbers (unary minus)
    if (char === '-') {
      this.position++;
      return -this.parseFactor();
    }

    // Handle parentheses
    if (char === '(') {
      this.position++;
      const result = this.parseExpression();

      if (this.position >= this.expression.length || this.expression[this.position] !== ')') {
        throw new Error('Missing closing parenthesis');
      }

      this.position++;
      return result;
    }

    // Handle numbers
    if (char !== undefined && (this.isDigit(char) || char === '.')) {
      return this.parseNumber();
    }

    throw new Error(`Unexpected character at position ${this.position}: '${char}'`);
  }

  /**
   * Parse a number: [0-9]+ ('.' [0-9]+)?
   */
  private parseNumber(): number {
    const start = this.position;
    let hasDecimal = false;

    // Parse integer part
    while (this.position < this.expression.length) {
      const char = this.expression[this.position];
      if (char === undefined || !this.isDigit(char)) break;
      this.position++;
    }

    // Parse decimal part if present
    if (this.position < this.expression.length && this.expression[this.position] === '.') {
      if (hasDecimal) {
        throw new Error('Invalid number format: multiple decimal points');
      }
      hasDecimal = true;
      this.position++;

      // Must have at least one digit after decimal point
      const nextChar = this.expression[this.position];
      if (this.position >= this.expression.length || nextChar === undefined || !this.isDigit(nextChar)) {
        // Allow trailing decimal point (e.g., "5.")
        if (this.position > start + 1) {
          const numStr = this.expression.substring(start, this.position - 1);
          return parseFloat(numStr);
        }
        throw new Error('Invalid number format');
      }

      while (this.position < this.expression.length) {
        const digitChar = this.expression[this.position];
        if (digitChar === undefined || !this.isDigit(digitChar)) break;
        this.position++;
      }
    }

    if (this.position === start) {
      throw new Error('Expected number');
    }

    const numStr = this.expression.substring(start, this.position);
    const result = parseFloat(numStr);

    if (!isFinite(result)) {
      throw new Error(`Invalid number: ${numStr}`);
    }

    return result;
  }

  /**
   * Check if a character is a digit
   */
  private isDigit(char: string): boolean {
    return char >= '0' && char <= '9';
  }
}
