// Normalize math expressions to handle different notations
export function normalizeMathExpression(expr: string): string {
  return expr
    // Remove all whitespace
    .replace(/\s+/g, '')
    // Convert ^ to ** for exponentiation
    .replace(/\^/g, '**')
    // Convert multiplication symbols
    .replace(/×/g, '*')
    .replace(/·/g, '*')
    // Convert division symbols
    .replace(/÷/g, '/')
    // Convert minus signs
    .replace(/−/g, '-')
    // Convert pi to 'pi' (will be replaced with Math.PI later) 
    .replace(/π/g, 'pi')
    // Convert theta to 'theta'
    .replace(/θ/g, 'theta')
    // Convert infinity to 'Infinity'
    .replace(/∞/g, 'Infinity');
}

// Compare two math expressions for equality
export function areMathExpressionsEqual(expr1: string, expr2: string): boolean {
  const normalized1 = normalizeMathExpression(expr1)
  const normalized2 = normalizeMathExpression(expr2)
  return normalized1 === normalized2
}

// Validate a math expression
export function validateMathExpression(expr: string): boolean {
  try {
    // Remove special characters that we handle
    const cleanExpr = expr
      .replace(/[²³]/g, '2') // Replace superscripts with regular numbers
      .replace(/\^/g, '**') // Replace ^ with ** for power operations
      .replace(/[×·]/g, '*') // Replace multiplication symbols
      .replace(/÷/g, '/') // Replace division symbol
      .replace(/−/g, '-') // Replace minus sign
      .replace(/π/g, 'Math.PI') // Replace pi
      .replace(/θ/g, 'theta') // Replace theta
      .replace(/∞/g, 'Infinity') // Replace infinity

    // Try to parse the expression
    // This will throw if the expression is invalid
    Function(`"use strict"; return ${cleanExpr}`)()
    return true
  } catch (e) {
    return false
  }
}

// Format a math expression for display
export function formatMathExpression(expr: string): string {
  return expr
    // Convert powers to superscripts where possible
    .replace(/\^2/g, '²')
    .replace(/\^3/g, '³')
    // Format multiplication
    .replace(/\*/g, '×')
    // Format division
    .replace(/\//g, '÷')
    // Format pi
    .replace(/\bpi\b/g, 'π')
    // Format theta
    .replace(/\btheta\b/g, 'θ')
    // Format infinity
    .replace(/\bInfinity\b/g, '∞')
}

// Parse a math expression to evaluate it
export function evaluateMathExpression(expr: string, x?: number): number {
  try {
    const cleanExpr = normalizeMathExpression(expr)
      .replace(/π/g, 'Math.PI')
      .replace(/sin/g, 'Math.sin')
      .replace(/cos/g, 'Math.cos')
      .replace(/tan/g, 'Math.tan')
      .replace(/sqrt/g, 'Math.sqrt')
      .replace(/abs/g, 'Math.abs')

    if (x !== undefined) {
      // If x is provided, replace x with its value
      return Function('x', `"use strict"; return ${cleanExpr}`)(x)
    } else {
      return Function(`"use strict"; return ${cleanExpr}`)()
    }
  } catch (e) {
    throw new Error(`Invalid math expression: ${expr}`)
  }
}
