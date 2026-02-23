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

// Simplified problem generation covering grades 1-8
export function createProblem(type: string, diff: number): Problem {
    let problem = '', answer: string | number = 0

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
    } else if (type === 'mul_table') {
        const a = randInt(2, 9); const b = randInt(2, 9)
        problem = `${a} × ${b}`; answer = a * b
    } else if (type === 'div_table') {
        const a = randInt(2, 9); const b = randInt(2, 9)
        problem = `${a * b} ÷ ${a}`; answer = b
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
    } else if (type === 'mul_big') {
        const a = randInt(100, 999); const b = randInt(10, 99)
        problem = `${a} × ${b}`; answer = a * b
    } else if (type === 'decimal_add_sub') {
        const a = +(randInt(1, 99) / 10).toFixed(1); const b = +(randInt(1, 99) / 10).toFixed(1)
        const op = pickOp()
        if (op === '+') { problem = `${a} + ${b}`; answer = +(a + b).toFixed(1) }
        else { const big = Math.max(a, b); const small = Math.min(a, b); problem = `${big} - ${small}`; answer = +(big - small).toFixed(1) }
    } else if (type === 'decimal_mul_div') {
        const a = +(randInt(1, 99) / 10).toFixed(1); const b = randInt(2, 9)
        problem = `${a} × ${b}`; answer = +(a * b).toFixed(1)
    } else if (type === 'neg_add_sub') {
        const a = randInt(-50, 50); const b = randInt(-50, 50)
        const op = pickOp()
        if (op === '+') { problem = `(${a}) + (${b})`; answer = a + b }
        else { problem = `(${a}) - (${b})`; answer = a - b }
    } else if (type === 'neg_mixed') {
        const a = randInt(-20, 20); const b = randInt(-20, 20); const c = randInt(-20, 20)
        problem = `(${a}) + (${b}) - (${c})`; answer = a + b - c
    } else if (type === 'eq_linear') {
        const ans = randInt(1, 20); const a = randInt(2, 9); const b = randInt(1, 50)
        problem = `${a}x + ${b} = ${a * ans + b}`; answer = ans
    } else if (type === 'sqrt_calc') {
        const a = randInt(1, 20)
        problem = `√${a * a}`; answer = a
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
