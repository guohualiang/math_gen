// Math problem generation engine - ported from legacy vanilla app.js
// This contains the curriculum definition and problem creation logic.

export interface Problem {
    problem: string
    answer: string | number
    display: string
}

export const curriculum: Record<string, { id: string; name: string; nameEn: string }[]> = {
    "1": [
        { id: "add_sub_20", name: "20以内加减法", nameEn: "Add/Sub within 20" },
        { id: "add_sub_100_simple", name: "100以内整十数加减", nameEn: "Add/Sub multiples of 10" },
        { id: "add_sub_100_reg", name: "100以内不进位/不退位", nameEn: "Add/Sub within 100 (no regrouping)" },
        { id: "fill_blank_20", name: "填空题(20以内)", nameEn: "Fill in blanks (within 20)" },
    ],
    "2": [
        { id: "mul_table", name: "乘法表", nameEn: "Multiplication Table" },
        { id: "div_table", name: "除法表", nameEn: "Division Table" },
        { id: "add_sub_100_hard", name: "100以内进位/退位", nameEn: "Add/Sub within 100 (regrouping)" },
        { id: "mixed_novice", name: "混合运算(无括号)", nameEn: "Mixed Operations (no brackets)" },
        { id: "fill_blank_mul", name: "填空题(乘法)", nameEn: "Fill in blanks (Multiplication)" },
    ],
    "3": [
        { id: "mul_2d_1d", name: "两三位数乘一位数", nameEn: "2/3-digit × 1-digit" },
        { id: "div_2d_1d", name: "两位数除一位数", nameEn: "2-digit ÷ 1-digit" },
        { id: "add_sub_large", name: "万以内加减法", nameEn: "Add/Sub within 10,000" },
        { id: "frac_simple_add", name: "同分母分数加减", nameEn: "Fractions Add/Sub (same den.)" },
    ],
    "4": [
        { id: "mul_big", name: "三位数乘两位数", nameEn: "3-digit × 2-digit" },
        { id: "mixed_bracket", name: "混合运算(有括号)", nameEn: "Mixed Operations (with brackets)" },
        { id: "calc_law", name: "运算定律", nameEn: "Calculation Laws" },
        { id: "decimal_add_sub", name: "小数加减", nameEn: "Decimal Add/Sub" },
    ],
    "5": [
        { id: "decimal_mul_div", name: "小数乘除", nameEn: "Decimal Mul/Div" },
        { id: "equation_simple", name: "简易方程", nameEn: "Simple Equations" },
        { id: "frac_diff_add", name: "异分母分数加减", nameEn: "Fractions Add/Sub (diff den.)" },
    ],
    "6": [
        { id: "frac_mul_div", name: "分数乘除", nameEn: "Fraction Mul/Div" },
        { id: "percent_calc", name: "百分数与折扣", nameEn: "Percentages & Discounts" },
        { id: "ratio_solve", name: "比例计算", nameEn: "Solving Ratios" },
    ],
    "7": [
        { id: "neg_add_sub", name: "有理数加减", nameEn: "Rational Add/Sub (Negatives)" },
        { id: "neg_mixed", name: "有理数混合运算", nameEn: "Rational Mixed Operations" },
        { id: "poly_add_sub", name: "整式加减", nameEn: "Polynomial Add/Sub" },
        { id: "eq_linear", name: "一元一次方程", nameEn: "Linear Equations" },
    ],
    "8": [
        { id: "sqrt_calc", name: "平方根计算", nameEn: "Square Roots" },
        { id: "poly_mul", name: "整式乘法", nameEn: "Polynomial Multiplication" },
        { id: "frac_algebra", name: "分式运算", nameEn: "Algebraic Fractions" },
    ],
}

export const gradeNames: Record<string, { zh: string; en: string }> = {
    "1": { zh: "一年级", en: "Grade 1" },
    "2": { zh: "二年级", en: "Grade 2" },
    "3": { zh: "三年级", en: "Grade 3" },
    "4": { zh: "四年级", en: "Grade 4" },
    "5": { zh: "五年级", en: "Grade 5" },
    "6": { zh: "六年级", en: "Grade 6" },
    "7": { zh: "七年级", en: "Grade 7" },
    "8": { zh: "八年级", en: "Grade 8" },
}

export const difficultyNames: Record<number, { zh: string; en: string }> = {
    1: { zh: "入门", en: "Beginner" },
    2: { zh: "基础", en: "Basic" },
    3: { zh: "进阶", en: "Advanced" },
    4: { zh: "挑战", en: "Challenge" },
}

function randInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function pickOp(): string {
    return Math.random() < 0.5 ? '+' : '-'
}

function gcd(a: number, b: number): number {
    a = Math.abs(a); b = Math.abs(b)
    while (b) { [a, b] = [b, a % b] }
    return a
}

function lcm(a: number, b: number): number {
    return (a * b) / gcd(a, b)
}

// Complete problem generation covering all curriculum types for grades 1-8
export function createProblem(type: string, diff: number): Problem {
    let problem = '', answer: string | number = 0

    // === GRADE 1 ===
    if (type === 'add_sub_20') {
        const max = diff <= 2 ? (diff === 1 ? 10 : 20) : 20
        const a = randInt(1, max)
        const b = randInt(1, max)
        const op = pickOp()
        if (op === '+') {
            const s = a + b
            if (s <= max) { problem = `${a} + ${b}`; answer = s }
            else { problem = `${s} - ${a}`; answer = b }
        } else {
            const big = Math.max(a, b); const small = Math.min(a, b)
            problem = `${big} - ${small}`; answer = big - small
        }
    } else if (type === 'add_sub_100_simple') {
        const a = randInt(1, 9) * 10
        const b = randInt(1, 9) * 10
        const op = pickOp()
        if (op === '+') { problem = `${a} + ${b}`; answer = a + b }
        else { const big = Math.max(a, b); const small = Math.min(a, b); problem = `${big} - ${small}`; answer = big - small }
    } else if (type === 'add_sub_100_reg') {
        // Addition/subtraction within 100, no regrouping (no carrying/borrowing)
        const tens1 = randInt(1, 8); const ones1 = randInt(1, 8)
        const tens2 = randInt(1, 9 - tens1); const ones2 = randInt(1, 9 - ones1)
        const a = tens1 * 10 + ones1; const b = tens2 * 10 + ones2
        const op = pickOp()
        if (op === '+') { problem = `${a} + ${b}`; answer = a + b }
        else { const big = Math.max(a, b); const small = Math.min(a, b); problem = `${big} - ${small}`; answer = big - small }
    } else if (type === 'fill_blank_20') {
        // Fill-in-the-blank: _ + b = c or a + _ = c
        const ans = randInt(1, 10); const b = randInt(1, 10)
        const total = ans + b
        if (Math.random() < 0.5) {
            problem = `__ + ${b} = ${total}`; answer = ans
        } else {
            problem = `${b} + __ = ${total}`; answer = ans
        }

        // === GRADE 2 ===
    } else if (type === 'mul_table') {
        const a = randInt(2, 9); const b = randInt(2, 9)
        problem = `${a} × ${b}`; answer = a * b
    } else if (type === 'div_table') {
        const a = randInt(2, 9); const b = randInt(2, 9)
        problem = `${a * b} ÷ ${a}`; answer = b
    } else if (type === 'add_sub_100_hard') {
        // Addition/subtraction within 100 WITH regrouping (carrying/borrowing)
        const a = randInt(18, 99); const b = randInt(11, 99 - a > 0 ? 99 - a : 50)
        const op = pickOp()
        if (op === '+') {
            const sum = a + b
            if (sum <= 100) { problem = `${a} + ${b}`; answer = sum }
            else { problem = `${a + b} - ${a}`; answer = b }
        } else {
            const big = Math.max(a, b); const small = Math.min(a, b)
            problem = `${big} - ${small}`; answer = big - small
        }
    } else if (type === 'mixed_novice') {
        // Mixed operations without brackets: a ○ b ○ c (following order of operations)
        const a = randInt(2, 9); const b = randInt(2, 9); const c = randInt(1, 9)
        const ops = ['+', '-', '×']
        const op1 = ops[randInt(0, 2)]
        const op2 = ops[randInt(0, 1)] // + or -
        if (op1 === '×') {
            const prod = a * b
            if (op2 === '+') { problem = `${a} × ${b} + ${c}`; answer = prod + c }
            else { problem = `${a} × ${b} - ${c}`; answer = prod - c }
        } else {
            problem = `${a} + ${b} × ${c}`; answer = a + b * c
        }
    } else if (type === 'fill_blank_mul') {
        // Fill-in-the-blank: _ × b = c or a × _ = c
        const a = randInt(2, 9); const b = randInt(2, 9)
        const product = a * b
        if (Math.random() < 0.5) {
            problem = `__ × ${b} = ${product}`; answer = a
        } else {
            problem = `${a} × __ = ${product}`; answer = b
        }

        // === GRADE 3 ===
    } else if (type === 'mul_2d_1d') {
        const a = randInt(10, diff >= 3 ? 999 : 99); const b = randInt(2, 9)
        problem = `${a} × ${b}`; answer = a * b
    } else if (type === 'div_2d_1d') {
        const b = randInt(2, 9); const ans = randInt(10, 99)
        problem = `${b * ans} ÷ ${b}`; answer = ans
    } else if (type === 'add_sub_large') {
        const a = randInt(100, 9999); const b = randInt(100, 9999)
        const op = pickOp()
        if (op === '+') { problem = `${a} + ${b}`; answer = a + b }
        else { const big = Math.max(a, b); const small = Math.min(a, b); problem = `${big} - ${small}`; answer = big - small }
    } else if (type === 'frac_simple_add') {
        // Same-denominator fraction add/sub
        const den = randInt(2, 12)
        const num1 = randInt(1, den - 1)
        const num2 = randInt(1, den - 1)
        const op = pickOp()
        if (op === '+') {
            const numR = num1 + num2
            problem = `${num1}/${den} + ${num2}/${den}`
            const g = gcd(numR, den)
            answer = numR >= den ? `${numR / g}/${den / g}` : `${numR / g}/${den / g}`
        } else {
            const big = Math.max(num1, num2); const small = Math.min(num1, num2)
            const numR = big - small
            problem = `${big}/${den} - ${small}/${den}`
            if (numR === 0) { answer = '0' }
            else { const g = gcd(numR, den); answer = `${numR / g}/${den / g}` }
        }

        // === GRADE 4 ===
    } else if (type === 'mul_big') {
        const a = randInt(100, 999); const b = randInt(10, 99)
        problem = `${a} × ${b}`; answer = a * b
    } else if (type === 'mixed_bracket') {
        // Mixed operations WITH brackets
        const a = randInt(2, 20); const b = randInt(2, 20); const c = randInt(2, 9)
        const templates = [
            { p: `(${a} + ${b}) × ${c}`, a: (a + b) * c },
            { p: `(${a} - ${Math.min(a - 1, b)}) × ${c}`, a: (a - Math.min(a - 1, b)) * c },
            { p: `${c} × (${a} + ${b})`, a: c * (a + b) },
            { p: `${a * c} ÷ ${c} + ${b}`, a: a + b },
        ]
        const t = templates[randInt(0, templates.length - 1)]
        problem = t.p; answer = t.a
    } else if (type === 'calc_law') {
        // Calculation laws: commutative, associative, distributive
        const a = randInt(2, 50); const b = randInt(2, 50); const c = randInt(2, 9)
        // Distributive law: a × (b + c) = a × b + a × c
        const x = randInt(2, 9); const y = randInt(10, 50); const z = 100 - y
        problem = `${x} × ${y} + ${x} × ${z}`; answer = x * 100
    } else if (type === 'decimal_add_sub') {
        const a = +(randInt(1, 99) / 10).toFixed(1); const b = +(randInt(1, 99) / 10).toFixed(1)
        const op = pickOp()
        if (op === '+') { problem = `${a} + ${b}`; answer = +(a + b).toFixed(1) }
        else { const big = Math.max(a, b); const small = Math.min(a, b); problem = `${big} - ${small}`; answer = +(big - small).toFixed(1) }

        // === GRADE 5 ===
    } else if (type === 'decimal_mul_div') {
        const a = +(randInt(1, 99) / 10).toFixed(1); const b = randInt(2, 9)
        if (Math.random() < 0.5) {
            problem = `${a} × ${b}`; answer = +(a * b).toFixed(1)
        } else {
            const product = +(a * b).toFixed(1)
            problem = `${product} ÷ ${b}`; answer = a
        }
    } else if (type === 'equation_simple') {
        // Simple equations: ax + b = c or ax - b = c or x + a = b
        const x = randInt(1, diff >= 3 ? 50 : 20)
        const variant = randInt(1, diff >= 3 ? 4 : 3)
        if (variant === 1) {
            // x + a = b
            const a = randInt(1, 50)
            problem = `x + ${a} = ${x + a}`; answer = x
        } else if (variant === 2) {
            // x - a = b (ensure positive)
            const a = randInt(1, x > 1 ? x - 1 : 1)
            problem = `x - ${a} = ${x - a}`; answer = x
        } else if (variant === 3) {
            // ax = b
            const a = randInt(2, 9)
            problem = `${a}x = ${a * x}`; answer = x
        } else {
            // ax + b = c
            const a = randInt(2, 9); const b = randInt(1, 30)
            problem = `${a}x + ${b} = ${a * x + b}`; answer = x
        }
    } else if (type === 'frac_diff_add') {
        // Different-denominator fraction add/sub
        const den1 = randInt(2, 8); let den2 = randInt(2, 8)
        while (den2 === den1) den2 = randInt(2, 8)
        const num1 = randInt(1, den1 - 1); const num2 = randInt(1, den2 - 1)
        const commonDen = lcm(den1, den2)
        const newNum1 = num1 * (commonDen / den1); const newNum2 = num2 * (commonDen / den2)
        const op = pickOp()
        if (op === '+') {
            const resultNum = newNum1 + newNum2
            const g = gcd(resultNum, commonDen)
            problem = `${num1}/${den1} + ${num2}/${den2}`
            answer = `${resultNum / g}/${commonDen / g}`
        } else {
            const big = Math.max(newNum1, newNum2); const small = Math.min(newNum1, newNum2)
            const resultNum = big - small
            if (big === newNum1) { problem = `${num1}/${den1} - ${num2}/${den2}` }
            else { problem = `${num2}/${den2} - ${num1}/${den1}` }
            if (resultNum === 0) { answer = '0' }
            else { const g = gcd(resultNum, commonDen); answer = `${resultNum / g}/${commonDen / g}` }
        }

        // === GRADE 6 ===
    } else if (type === 'frac_mul_div') {
        // Fraction multiplication and division
        const num1 = randInt(1, 8); const den1 = randInt(2, 9)
        const num2 = randInt(1, 8); const den2 = randInt(2, 9)
        if (Math.random() < 0.5) {
            // Multiplication
            const rNum = num1 * num2; const rDen = den1 * den2
            const g = gcd(rNum, rDen)
            problem = `${num1}/${den1} × ${num2}/${den2}`
            answer = `${rNum / g}/${rDen / g}`
        } else {
            // Division (multiply by reciprocal)
            const rNum = num1 * den2; const rDen = den1 * num2
            const g = gcd(rNum, rDen)
            problem = `${num1}/${den1} ÷ ${num2}/${den2}`
            answer = `${rNum / g}/${rDen / g}`
        }
    } else if (type === 'percent_calc') {
        // Percentage calculations
        const percents = [10, 15, 20, 25, 30, 40, 50, 60, 75, 80]
        const pct = percents[randInt(0, percents.length - 1)]
        const base = randInt(2, 20) * 10
        if (Math.random() < 0.5) {
            problem = `${base} × ${pct}%`; answer = (base * pct) / 100
        } else {
            // Discount: what is the final price?
            const discount = pct
            problem = `${base} - ${base} × ${discount}%`
            answer = base - (base * discount) / 100
        }
    } else if (type === 'ratio_solve') {
        // Solving ratios: a:b = c:x or a:b = x:d
        const a = randInt(2, 10); const b = randInt(2, 10)
        const multiplier = randInt(2, 8)
        if (Math.random() < 0.5) {
            problem = `${a}:${b} = ${a * multiplier}:x`; answer = b * multiplier
        } else {
            problem = `${a}:${b} = x:${b * multiplier}`; answer = a * multiplier
        }

        // === GRADE 7 ===
    } else if (type === 'neg_add_sub') {
        const a = randInt(-50, 50); const b = randInt(-50, 50)
        const op = pickOp()
        if (op === '+') { problem = `(${a}) + (${b})`; answer = a + b }
        else { problem = `(${a}) - (${b})`; answer = a - b }
    } else if (type === 'neg_mixed') {
        const a = randInt(-20, 20); const b = randInt(-20, 20); const c = randInt(-20, 20)
        if (diff >= 3) {
            // Include multiplication
            const x = randInt(-10, 10); const y = randInt(2, 9)
            problem = `(${x}) × ${y} + (${a})`; answer = x * y + a
        } else {
            problem = `(${a}) + (${b}) - (${c})`; answer = a + b - c
        }
    } else if (type === 'poly_add_sub') {
        // Polynomial add/sub: combine like terms
        const a = randInt(1, 15); const b = randInt(1, 15)
        const c = randInt(1, 10); const d = randInt(1, 10)
        if (Math.random() < 0.5) {
            problem = `${a}x + ${b}x`; answer = `${a + b}x`
        } else {
            const big = Math.max(a, b); const small = Math.min(a, b)
            problem = `${big}x - ${small}x + ${c}`
            answer = `${big - small}x+${c}`
        }
    } else if (type === 'eq_linear') {
        const ans = randInt(1, 20); const a = randInt(2, 9); const b = randInt(1, 50)
        if (diff >= 3) {
            // ax + b = cx + d form
            const c = randInt(1, a - 1)
            const d = (a - c) * ans + b
            problem = `${a}x + ${b} = ${c}x + ${d}`; answer = ans
        } else {
            problem = `${a}x + ${b} = ${a * ans + b}`; answer = ans
        }

        // === GRADE 8 ===
    } else if (type === 'sqrt_calc') {
        if (diff >= 3) {
            const a = randInt(1, 10); const b = randInt(1, 10)
            const sq = a * a + b * b // Not a perfect square necessarily
            const perfect = randInt(1, 15)
            problem = `√${perfect * perfect}`; answer = perfect
        } else {
            const a = randInt(1, 20)
            problem = `√${a * a}`; answer = a
        }
    } else if (type === 'poly_mul') {
        // Polynomial multiplication: (a+b)(c+d) or special products
        const a = randInt(1, 10); const b = randInt(1, 10)
        if (Math.random() < 0.5) {
            // (x + a)(x + b) = x² + (a+b)x + ab
            problem = `(x + ${a})(x + ${b})`
            answer = `x²+${a + b}x+${a * b}`
        } else {
            // (x + a)² = x² + 2ax + a²
            problem = `(x + ${a})²`
            answer = `x²+${2 * a}x+${a * a}`
        }
    } else if (type === 'frac_algebra') {
        // Algebraic fractions: simplify or compute
        const a = randInt(2, 9); const b = randInt(2, 9)
        const c = randInt(2, 9)
        // a/x + b/x = (a+b)/x
        problem = `${a}/x + ${b}/x`
        const g = gcd(a + b, 1)
        answer = `${a + b}/x`
    } else {
        // Fallback: simple addition
        const a = randInt(1, 50); const b = randInt(1, 50)
        problem = `${a} + ${b}`; answer = a + b
    }

    return { problem, answer, display: `${problem} = ` }
}

export function generateProblems(type: string, diff: number, count: number): Problem[] {
    const problems: Problem[] = []
    const seen = new Set<string>()
    const maxAttempts = count * 3
    let attempts = 0

    while (problems.length < count && attempts < maxAttempts) {
        const p = createProblem(type, diff)
        if (!seen.has(p.problem)) {
            seen.add(p.problem)
            problems.push(p)
        }
        attempts++
    }

    // Fill remaining if needed
    while (problems.length < count) {
        problems.push(createProblem(type, diff))
    }

    return problems
}
