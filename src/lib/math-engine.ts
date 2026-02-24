// Math problem generation engine - exact port from legacy vanilla app.js
// This contains the curriculum definition and exact difficulty configurations.

export interface Problem {
    problem: string
    answer: string | number
    display: string
    isFillBlank?: boolean
    hasRemainder?: boolean
    isFraction?: boolean
    isEquation?: boolean
    isAlgebraic?: boolean
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

// === 3. Utility Functions (from legacy app.js) ===
function rand(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function randChoice<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]
}

function fmtFrac(n: Extract<number, string> | any, d: Extract<number, string> | any): string {
    return `<span class="fraction"><span class="frac-top">${n}</span><span class="frac-bottom">${d}</span></span>`
}

// Parenthesize negative numbers
function p(num: number): string {
    return num < 0 ? `(${num})` : String(num)
}

// Greatest common divisor
function gcd(a: number, b: number): number {
    a = Math.abs(a)
    b = Math.abs(b)
    while (b) {
        ;[a, b] = [b, a % b]
    }
    return a
}

// Least common multiple
function lcm(a: number, b: number): number {
    return Math.abs(a * b) / gcd(a, b)
}

// Simplify fraction
function simplifyFrac(n: number, d: number): [number, number] {
    const g = gcd(n, d)
    return [n / g, d / g]
}

// Round to decimal places
function roundTo(num: number, places: number): number {
    const factor = Math.pow(10, places)
    return Math.round(num * factor) / factor
}

// === 4. Difficulty Configuration ===
// Each level has dramatically different parameters
const DIFF_CONFIG: any = {
    // Grade 1: add_sub_20
    add_sub_20: {
        1: { max: 10, ops: 1 },           // 入门: 1-10, single op
        2: { max: 20, ops: 1 },           // 基础: 1-20, single op  
        3: { max: 20, ops: 2 },           // 进阶: chain 2 operations
        4: { max: 20, ops: 3 }            // 挑战: chain 3 operations
    },
    add_sub_100: {
        1: { min: 10, max: 50 },          // 入门: small tens
        2: { min: 10, max: 100 },         // 基础: full range
        3: { min: 100, max: 500 },        // 进阶: hundreds
        4: { min: 100, max: 1000, ops: 2 } // 挑战: thousands + chain
    },
    mul_table: {
        1: { maxA: 5, maxB: 5 },          // 入门: 1-5 × 1-5
        2: { maxA: 9, maxB: 9 },          // 基础: full table
        3: { maxA: 12, maxB: 12 },        // 进阶: extended table
        4: { maxA: 15, maxB: 15 }         // 挑战: large multipliers
    },
    div: {
        1: { maxDivisor: 5, maxQuotient: 9 },
        2: { maxDivisor: 9, maxQuotient: 9 },
        3: { maxDivisor: 12, maxQuotient: 20, remainder: true },
        4: { maxDivisor: 15, maxQuotient: 50, remainder: true }
    },
    decimal: {
        1: { places: 1, max: 10 },        // 入门: 1 decimal place, small
        2: { places: 2, max: 100 },       // 基础: 2 places
        3: { places: 2, max: 1000 },      // 进阶: larger numbers
        4: { places: 3, max: 10000 }      // 挑战: 3 places, very large
    },
    fraction: {
        1: { maxDen: 6, simple: true },
        2: { maxDen: 10, simple: true },
        3: { maxDen: 12, simple: false },
        4: { maxDen: 20, simple: false, mixed: true }
    },
    equation: {
        1: { maxCoef: 3, maxConst: 10 },
        2: { maxCoef: 6, maxConst: 20 },
        3: { maxCoef: 10, maxConst: 50, twoStep: true },
        4: { maxCoef: 15, maxConst: 100, twoStep: true, negative: true }
    },
    negative: {
        1: { range: 10 },
        2: { range: 20 },
        3: { range: 50, multiOp: true },
        4: { range: 100, multiOp: true, powers: true }
    }
}

// === 5. Problem Generators ===
export function createProblem(type: string, diff: number): Problem {
    let a, b, c, d, e, op, problem = '', answer: string | number = 0
    let isFillBlank = false
    let isFraction = false
    let isEquation = false
    let isAlgebraic = false
    let hasRemainder = false

    // --- Grade 1 ---
    if (type === "add_sub_20") {
        const cfg = DIFF_CONFIG.add_sub_20[diff];
        if (diff <= 2) {
            op = Math.random() > 0.5 ? "+" : "-";
            if (op === "+") {
                a = rand(1, cfg.max - 1);
                b = rand(1, cfg.max - a);
                answer = a + b;
            } else {
                a = rand(3, cfg.max);
                b = rand(1, a - 1);
                answer = a - b;
            }
            problem = `${a} ${op} ${b}`;
        } else if (diff === 3) {
            // Two operations: a + b - c
            a = rand(5, 15);
            b = rand(1, 10);
            c = rand(1, a + b - 1);
            answer = a + b - c;
            problem = `${a} + ${b} - ${c}`;
        } else {
            // Three operations
            a = rand(3, 10);
            b = rand(1, 8);
            c = rand(1, 6);
            d = rand(1, 5);
            answer = a + b - c + d;
            problem = `${a} + ${b} - ${c} + ${d}`;
        }
    } else if (type === "add_sub_100_simple") {
        if (diff === 1) {
            op = Math.random() > 0.5 ? "+" : "-";
            a = rand(1, 5) * 10;
            b = rand(1, 5) * 10;
            if (op === "-" && a < b) [a, b] = [b, a];
            answer = op === "+" ? a + b : a - b;
            problem = `${a} ${op} ${b}`;
        } else if (diff === 2) {
            op = Math.random() > 0.5 ? "+" : "-";
            a = rand(1, 9) * 10;
            b = rand(1, 9) * 10;
            if (op === "-" && a < b) [a, b] = [b, a];
            answer = op === "+" ? a + b : a - b;
            problem = `${a} ${op} ${b}`;
        } else if (diff === 3) {
            a = rand(2, 5) * 10;
            b = rand(2, 5) * 10;
            c = rand(1, 4) * 10;
            if (a + b - c < 0) c = rand(1, Math.floor((a + b) / 10)) * 10;
            answer = a + b - c;
            problem = `${a} + ${b} - ${c}`;
        } else {
            a = rand(3, 9) * 10;
            b = rand(2, 7) * 10;
            c = rand(1, 5) * 10;
            d = rand(1, 4) * 10;
            answer = a + b - c + d;
            problem = `${a} + ${b} - ${c} + ${d}`;
        }
    } else if (type === "add_sub_100_reg") {
        if (diff === 1) {
            let a1 = rand(1, 4), a2 = rand(1, 4);
            let b1 = rand(1, 5 - a1), b2 = rand(1, 5 - a2);
            a = a1 * 10 + a2;
            b = b1 * 10 + b2;
            answer = a + b;
            problem = `${a} + ${b}`;
        } else if (diff === 2) {
            let a1 = rand(1, 8), a2 = rand(1, 8);
            let b1 = rand(1, 9 - a1), b2 = rand(1, 9 - a2);
            a = a1 * 10 + a2;
            b = b1 * 10 + b2;
            answer = a + b;
            problem = `${a} + ${b}`;
        } else if (diff === 3) {
            op = Math.random() > 0.5 ? "+" : "-";
            if (op === "+") {
                let a1 = rand(1, 8), a2 = rand(1, 8);
                let b1 = rand(1, 9 - a1), b2 = rand(1, 9 - a2);
                a = a1 * 10 + a2;
                b = b1 * 10 + b2;
                answer = a + b;
            } else {
                let a1 = rand(3, 9), a2 = rand(3, 9);
                let b1 = rand(1, a1 - 1), b2 = rand(1, a2 - 1);
                a = a1 * 10 + a2;
                b = b1 * 10 + b2;
                answer = a - b;
            }
            problem = `${a} ${op} ${b}`;
        } else {
            let a1 = rand(2, 5), a2 = rand(2, 5);
            let b1 = rand(1, 4), b2 = rand(1, 4);
            let c1 = rand(1, 3), c2 = rand(1, 3);
            a = a1 * 10 + a2;
            b = b1 * 10 + b2;
            c = c1 * 10 + c2;
            answer = a + b - c;
            problem = `${a} + ${b} - ${c}`;
        }
    } else if (type === "fill_blank_20") {
        isFillBlank = true;
        if (diff === 1) {
            a = rand(3, 10);
            b = rand(1, a - 1);
            c = a - b;
            if (Math.random() > 0.5) {
                answer = c;
                problem = `${b} + __ = ${a}`;
            } else {
                answer = b;
                problem = `${a} - __ = ${c}`;
            }
        } else if (diff === 2) {
            a = rand(5, 20);
            b = rand(1, a - 1);
            c = a - b;
            if (Math.random() > 0.5) {
                answer = c;
                problem = `${b} + __ = ${a}`;
            } else {
                answer = b;
                problem = `${a} - __ = ${c}`;
            }
        } else if (diff === 3) {
            a = rand(5, 12);
            b = rand(2, 6);
            c = rand(1, a + b - 1);
            const result = a + b - c;
            const mode = rand(1, 3);
            if (mode === 1) {
                answer = a;
                problem = `__ + ${b} - ${c} = ${result}`;
            } else if (mode === 2) {
                answer = b;
                problem = `${a} + __ - ${c} = ${result}`;
            } else {
                answer = c;
                problem = `${a} + ${b} - __ = ${result}`;
            }
        } else {
            const mode = rand(1, 2);
            if (mode === 1) {
                a = rand(3, 8);
                b = rand(2, 6);
                c = rand(2, 6);
                answer = b + c - a;
                problem = `__ + ${a} = ${b} + ${c}`;
            } else {
                a = rand(10, 18);
                b = rand(2, Math.floor(a / 2));
                answer = b;
                problem = `${a} - __ - __ = ${a - 2 * b}（两个空填相同的数）`;
            }
        }
    }

    // --- Grade 2 ---
    else if (type === "mul_table") {
        const cfg = DIFF_CONFIG.mul_table[diff];
        a = rand(2, cfg.maxA);
        b = rand(2, cfg.maxB);
        if (diff >= 3) {
            c = rand(1, 20);
            answer = a * b + c;
            problem = `${a} × ${b} + ${c}`;
        } else {
            answer = a * b;
            problem = `${a} × ${b}`;
        }
    } else if (type === "div_table") {
        const cfg = DIFF_CONFIG.div[diff];
        b = rand(2, cfg.maxDivisor);
        c = rand(2, cfg.maxQuotient);
        if (cfg.remainder && diff >= 3) {
            const remainder = rand(1, b - 1);
            a = b * c + remainder;
            answer = `${c}...${remainder}`;
        } else {
            a = b * c;
            answer = c;
        }
        problem = `${a} ÷ ${b}`;
    } else if (type === "add_sub_100_hard") {
        const cfg = DIFF_CONFIG.add_sub_100[diff];
        op = Math.random() > 0.5 ? "+" : "-";
        if (diff <= 2) {
            a = rand(cfg.min, cfg.max - 20);
            b = rand(cfg.min, cfg.max - a);
            if (op === "-" && a < b) [a, b] = [b, a];
            answer = op === "+" ? a + b : a - b;
            problem = `${a} ${op} ${b}`;
        } else if (diff === 3) {
            a = rand(cfg.min, cfg.max);
            b = rand(cfg.min, cfg.max);
            if (op === "-" && a < b) [a, b] = [b, a];
            answer = op === "+" ? a + b : a - b;
            problem = `${a} ${op} ${b}`;
        } else {
            a = rand(100, 500);
            b = rand(100, 400);
            c = rand(50, 200);
            answer = a + b - c;
            problem = `${a} + ${b} - ${c}`;
        }
    } else if (type === "mixed_novice") {
        if (diff === 1) {
            a = rand(5, 20);
            b = rand(2, 5);
            c = rand(2, 5);
            answer = a + b * c;
            problem = `${a} + ${b} × ${c}`;
        } else if (diff === 2) {
            if (Math.random() > 0.5) {
                a = rand(10, 50);
                b = rand(2, 9);
                c = rand(2, 9);
                answer = a + b * c;
                problem = `${a} + ${b} × ${c}`;
            } else {
                b = rand(3, 8);
                c = rand(2, 6);
                a = rand(b * c + 10, 80);
                answer = a - b * c;
                problem = `${a} - ${b} × ${c}`;
            }
        } else if (diff === 3) {
            a = rand(2, 6);
            b = rand(2, 6);
            c = rand(2, 6);
            d = rand(2, 6);
            answer = a * b + c * d;
            problem = `${a} × ${b} + ${c} × ${d}`;
        } else {
            a = rand(20, 60);
            b = rand(3, 8);
            c = rand(2, 5);
            const div = rand(2, 4);
            d = div * rand(3, 8);
            answer = a + b * c - d / div;
            problem = `${a} + ${b} × ${c} - ${d} ÷ ${div}`;
        }
    } else if (type === "fill_blank_mul") {
        isFillBlank = true;
        if (diff === 1) {
            a = rand(2, 5);
            b = rand(2, 5);
            c = a * b;
            if (Math.random() > 0.5) {
                answer = b;
                problem = `${a} × __ = ${c}`;
            } else {
                answer = a;
                problem = `__ × ${b} = ${c}`;
            }
        } else if (diff === 2) {
            a = rand(2, 9);
            b = rand(2, 9);
            c = a * b;
            if (Math.random() > 0.5) {
                answer = b;
                problem = `${a} × __ = ${c}`;
            } else {
                answer = a;
                problem = `__ × ${b} = ${c}`;
            }
        } else if (diff === 3) {
            const mode = rand(1, 2);
            if (mode === 1) {
                a = rand(2, 9);
                b = rand(2, 9);
                c = a * b;
                answer = b;
                problem = `${c} ÷ ${a} = __`;
            } else {
                a = rand(2, 9);
                b = rand(2, 9);
                c = a * b;
                answer = a;
                problem = `${c} ÷ __ = ${b}`;
            }
        } else {
            const mode = rand(1, 3);
            if (mode === 1) {
                a = rand(2, 6);
                b = rand(5, 15);
                const x = rand(2, 8);
                c = x * a + b;
                answer = x;
                problem = `__ × ${a} + ${b} = ${c}`;
            } else if (mode === 2) {
                a = rand(2, 6);
                const x = rand(3, 9);
                b = rand(1, a * x - 1);
                c = a * x - b;
                answer = x;
                problem = `${a} × __ - ${b} = ${c}`;
            } else {
                b = rand(2, 5);
                a = rand(2, 6);
                const x = rand(2, 6);
                c = (a + x) * b;
                answer = x;
                problem = `(${a} + __) × ${b} = ${c}`;
            }
        }
    }

    // --- Grade 3 ---
    else if (type === "mul_2d_1d") {
        if (diff === 1) {
            a = rand(11, 50);
            b = rand(2, 5);
        } else if (diff === 2) {
            a = rand(11, 99);
            b = rand(2, 9);
        } else if (diff === 3) {
            a = rand(100, 999);
            b = rand(2, 9);
        } else {
            if (Math.random() > 0.5) {
                a = rand(1000, 9999);
                b = rand(2, 9);
            } else {
                a = rand(100, 999);
                b = rand(11, 25);
            }
        }
        answer = a * b;
        problem = `${a} × ${b}`;
    } else if (type === "div_2d_1d") {
        if (diff === 1) {
            b = rand(2, 5);
            const quotient = rand(11, 20);
            a = quotient * b;
            answer = quotient;
            problem = `${a} ÷ ${b}`;
            hasRemainder = false;
        } else if (diff === 2) {
            b = rand(2, 9);
            const quotient = rand(11, 50);
            const remainder = Math.random() > 0.5 ? rand(1, b - 1) : 0;
            a = quotient * b + remainder;
            answer = remainder === 0 ? quotient : `${quotient}...${remainder}`;
            problem = `${a} ÷ ${b}`;
            hasRemainder = remainder > 0;
        } else if (diff === 3) {
            b = rand(3, 9);
            const quotient = rand(50, 99);
            const remainder = rand(1, b - 1);
            a = quotient * b + remainder;
            answer = `${quotient}...${remainder}`;
            problem = `${a} ÷ ${b}`;
            hasRemainder = true;
        } else {
            b = rand(11, 30);
            const quotient = rand(10, 50);
            const remainder = Math.random() > 0.3 ? rand(1, b - 1) : 0;
            a = quotient * b + remainder;
            answer = remainder === 0 ? quotient : `${quotient}...${remainder}`;
            problem = `${a} ÷ ${b}`;
            hasRemainder = remainder > 0;
        }
    } else if (type === "add_sub_large") {
        if (diff === 1) {
            a = rand(100, 500);
            b = rand(100, 400);
            answer = a + b;
            problem = `${a} + ${b}`;
        } else if (diff === 2) {
            op = Math.random() > 0.5 ? "+" : "-";
            a = rand(100, 2000);
            b = rand(100, 1500);
            if (op === "-" && a < b) [a, b] = [b, a];
            answer = op === "+" ? a + b : a - b;
            problem = `${a} ${op} ${b}`;
        } else if (diff === 3) {
            a = rand(1000, 5000);
            b = rand(500, 3000);
            c = rand(200, 1500);
            if (a + b - c < 0) c = rand(100, Math.floor((a + b) / 2));
            answer = a + b - c;
            problem = `${a} + ${b} - ${c}`;
        } else {
            a = rand(1000, 9999);
            b = rand(500, 5000);
            c = rand(200, 2000);
            d = rand(100, 1000);
            answer = a + b - c + d;
            problem = `${a} + ${b} - ${c} + ${d}`;
        }
    } else if (type === "frac_simple_add") {
        isFraction = true;
        if (diff === 1) {
            const den = rand(2, 4);
            const n1 = rand(1, den - 1);
            const n2 = rand(1, den - n1);
            const [simpN, simpD] = simplifyFrac(n1 + n2, den);
            answer = simpD === 1 ? `${simpN}` : `${simpN}/${simpD}`;
            problem = `${fmtFrac(n1, den)} + ${fmtFrac(n2, den)}`;
        } else if (diff === 2) {
            const den = rand(3, 8);
            const n1 = rand(1, den - 1);
            const n2 = rand(1, den - n1);
            const [simpN, simpD] = simplifyFrac(n1 + n2, den);
            answer = simpD === 1 ? `${simpN}` : `${simpN}/${simpD}`;
            problem = `${fmtFrac(n1, den)} + ${fmtFrac(n2, den)}`;
        } else if (diff === 3) {
            const den = rand(3, 12);
            const n1 = rand(2, den - 1);
            const n2 = rand(1, n1 - 1);
            op = Math.random() > 0.5 ? "+" : "-";
            if (op === "+") {
                const adjustedN2 = rand(1, den - n1);
                const [simpN, simpD] = simplifyFrac(n1 + adjustedN2, den);
                answer = simpD === 1 ? `${simpN}` : `${simpN}/${simpD}`;
                problem = `${fmtFrac(n1, den)} + ${fmtFrac(adjustedN2, den)}`;
            } else {
                const [simpN, simpD] = simplifyFrac(n1 - n2, den);
                answer = simpD === 1 ? `${simpN}` : `${simpN}/${simpD}`;
                problem = `${fmtFrac(n1, den)} - ${fmtFrac(n2, den)}`;
            }
        } else {
            const den = rand(4, 12);
            const n1 = rand(2, Math.floor(den / 2));
            const n2 = rand(1, Math.floor(den / 3));
            const n3 = rand(1, Math.floor(den / 4));
            const result = n1 + n2 - n3;
            const [simpN, simpD] = simplifyFrac(Math.abs(result), den);
            answer = result < 0 ? `-${simpN}/${simpD}` : (simpD === 1 ? `${simpN}` : `${simpN}/${simpD}`);
            problem = `${fmtFrac(n1, den)} + ${fmtFrac(n2, den)} - ${fmtFrac(n3, den)}`;
        }
    }

    // --- Grade 4 ---
    else if (type === "mul_big") {
        if (diff === 1) {
            a = rand(10, 50);
            b = rand(2, 9);
        } else if (diff === 2) {
            a = rand(100, 300);
            b = rand(11, 30);
        } else if (diff === 3) {
            a = rand(100, 999);
            b = rand(20, 99);
        } else {
            a = rand(500, 9999);
            b = rand(50, 999);
        }
        answer = a * b;
        problem = `${a} × ${b}`;
    } else if (type === "mixed_bracket") {
        if (diff === 1) {
            a = rand(5, 15);
            b = rand(5, 15);
            c = rand(2, 5);
            answer = (a + b) * c;
            problem = `(${a} + ${b}) × ${c}`;
        } else if (diff === 2) {
            a = rand(10, 50);
            b = rand(10, 50);
            c = rand(2, 9);
            answer = (a + b) * c;
            problem = `(${a} + ${b}) × ${c}`;
        } else if (diff === 3) {
            a = rand(10, 50);
            b = rand(10, 50);
            c = rand(3, 9);
            d = rand(10, 30);
            answer = (a + b) * c - d;
            problem = `(${a} + ${b}) × ${c} - ${d}`;
        } else {
            a = rand(10, 30);
            b = rand(10, 30);
            c = rand(5, 20);
            d = rand(2, 5);
            answer = (a + b) * (c - d);
            problem = `(${a} + ${b}) × (${c} - ${d})`;
        }
    } else if (type === "calc_law") {
        if (diff === 1) {
            a = rand(2, 5);
            answer = 25 * 4 * a;
            problem = `25 × 4 × ${a}`;
        } else if (diff === 2) {
            const mode = rand(1, 2);
            if (mode === 1) {
                const comm = rand(11, 50);
                const x = rand(11, 88);
                const y = 100 - x;
                answer = comm * 100;
                problem = `${comm} × ${x} + ${comm} × ${y}`;
            } else {
                a = rand(2, 9) * 4;
                answer = 25 * a;
                problem = `25 × ${a}`;
            }
        } else if (diff === 3) {
            const mode = rand(1, 2);
            if (mode === 1) {
                const comm = rand(50, 150);
                const x = rand(11, 88);
                const y = 100 - x;
                answer = comm * 100;
                problem = `${comm} × ${x} + ${comm} × ${y}`;
            } else {
                a = rand(100, 200);
                answer = a * 99;
                problem = `${a} × 99`;
            }
        } else {
            const mode = rand(1, 3);
            if (mode === 1) {
                a = rand(100, 500);
                answer = a * 101;
                problem = `${a} × 101`;
            } else if (mode === 2) {
                a = rand(100, 999);
                b = rand(100, 999);
                answer = a * 100 + b * 100;
                problem = `${a} × 100 + ${b} × 100`;
            } else {
                a = rand(50, 200);
                answer = a * 125 * 8;
                problem = `${a} × 125 × 8`;
            }
        }
    } else if (type === "decimal_add_sub") {
        const cfg = DIFF_CONFIG.decimal[diff];
        op = Math.random() > 0.5 ? "+" : "-";
        const factor = Math.pow(10, cfg.places);
        a = roundTo(rand(10, cfg.max) / factor, cfg.places);
        b = roundTo(rand(10, cfg.max) / factor, cfg.places);
        if (op === "-" && a < b) [a, b] = [b, a];
        answer = roundTo(op === "+" ? a + b : a - b, cfg.places);
        problem = `${a.toFixed(cfg.places)} ${op} ${b.toFixed(cfg.places)}`;
    }

    // --- Grade 5 ---
    else if (type === "decimal_mul_div") {
        const cfg = DIFF_CONFIG.decimal[diff];
        if (diff === 1) {
            const mode = rand(1, 3);
            if (mode === 1) {
                a = roundTo(rand(11, 99) / 10, 1);
                b = rand(2, 9);
                answer = roundTo(a * b, 1);
                problem = `${a.toFixed(1)} × ${b}`;
            } else if (mode === 2) {
                a = rand(2, 9);
                b = roundTo(rand(11, 99) / 10, 1);
                answer = roundTo(a * b, 1);
                problem = `${a} × ${b.toFixed(1)}`;
            } else {
                b = rand(2, 9);
                c = rand(2, 9);
                a = roundTo(b * c / 10, 1);
                answer = c;
                problem = `${(a * 10).toFixed(0)} ÷ ${b}`;
            }
        } else if (diff === 2) {
            const mode = rand(1, 4);
            if (mode === 1) {
                a = roundTo(rand(11, 99) / 10, 1);
                b = roundTo(rand(11, 99) / 10, 1);
                answer = roundTo(a * b, 2);
                problem = `${a.toFixed(1)} × ${b.toFixed(1)}`;
            } else if (mode === 2) {
                b = rand(2, 9);
                c = roundTo(rand(11, 99) / 10, 1);
                a = roundTo(c * b, 1);
                answer = c;
                problem = `${a.toFixed(1)} ÷ ${b}`;
            } else if (mode === 3) {
                a = rand(10, 50);
                b = roundTo(rand(2, 9) / 10 + rand(1, 9), 1);
                c = Math.floor(a / b);
                a = roundTo(c * b, 1);
                answer = c;
                problem = `${a.toFixed(1)} ÷ ${b.toFixed(1)}`;
            } else {
                a = rand(10, 99);
                b = Math.random() > 0.5 ? 0.1 : 0.01;
                answer = roundTo(a * b, b === 0.1 ? 1 : 2);
                problem = `${a} × ${b}`;
            }
        } else if (diff === 3) {
            const mode = rand(1, 5);
            if (mode === 1) {
                a = roundTo(rand(101, 999) / 100, 2);
                b = roundTo(rand(101, 999) / 100, 2);
                answer = roundTo(a * b, 4);
                problem = `${a.toFixed(2)} × ${b.toFixed(2)}`;
            } else if (mode === 2) {
                b = roundTo(rand(11, 50) / 10, 1);
                c = roundTo(rand(11, 99) / 10, 1);
                a = roundTo(b * c, 2);
                answer = c;
                problem = `${a.toFixed(2)} ÷ ${b.toFixed(1)}`;
            } else if (mode === 3) {
                a = roundTo(rand(11, 50) / 10, 1);
                b = rand(3, 9);
                c = roundTo(rand(11, 50) / 10, 1);
                answer = roundTo(a * b + c, 2);
                problem = `${a.toFixed(1)} × ${b} + ${c.toFixed(1)}`;
            } else if (mode === 4) {
                b = roundTo(rand(2, 9) / 10, 1);
                c = rand(5, 15);
                a = roundTo(b * c, 1);
                answer = c;
                problem = `${a.toFixed(1)} ÷ ${b.toFixed(1)}`;
            } else {
                a = roundTo(rand(11, 50) / 10, 1);
                b = rand(2, 6);
                c = rand(2, 5);
                const product = roundTo(a * b, 1);
                answer = roundTo(product / c, 2);
                problem = `${a.toFixed(1)} × ${b} ÷ ${c}`;
            }
        } else {
            const mode = rand(1, 6);
            if (mode === 1) {
                a = roundTo(rand(1001, 9999) / 1000, 3);
                b = roundTo(rand(101, 999) / 100, 2);
                answer = roundTo(a * b, 5);
                problem = `${a.toFixed(3)} × ${b.toFixed(2)}`;
            } else if (mode === 2) {
                a = roundTo(rand(11, 50) / 10, 1);
                b = roundTo(rand(11, 30) / 10, 1);
                c = roundTo(rand(11, 20) / 10, 1);
                answer = roundTo(a * b * c, 3);
                problem = `${a.toFixed(1)} × ${b.toFixed(1)} × ${c.toFixed(1)}`;
            } else if (mode === 3) {
                a = roundTo(rand(11, 30) / 10, 1);
                b = rand(2, 6);
                c = rand(2, 4);
                d = roundTo(rand(11, 20) / 10, 1);
                answer = roundTo((a * b / c) * d, 3);
                problem = `${a.toFixed(1)} × ${b} ÷ ${c} × ${d.toFixed(1)}`;
            } else if (mode === 4) {
                a = roundTo(rand(11, 50) / 10, 1);
                b = roundTo(rand(11, 50) / 10, 1);
                c = roundTo(rand(11, 30) / 10, 1);
                answer = roundTo((a + b) * c, 2);
                problem = `(${a.toFixed(1)} + ${b.toFixed(1)}) × ${c.toFixed(1)}`;
            } else if (mode === 5) {
                a = roundTo(rand(11, 50) / 10, 1);
                b = roundTo(rand(11, 30) / 10, 1);
                const divisor = rand(2, 5);
                c = roundTo(divisor * rand(11, 30) / 10, 1);
                d = divisor;
                answer = roundTo(a * b - c / d, 2);
                problem = `${a.toFixed(1)} × ${b.toFixed(1)} - ${c.toFixed(1)} ÷ ${d}`;
            } else {
                a = roundTo(rand(101, 999) / 100, 2);
                const power = randChoice([0.01, 0.001, 100, 1000]);
                if (power >= 1) {
                    answer = roundTo(a * power, 0);
                    problem = `${a.toFixed(2)} × ${power}`;
                } else {
                    answer = roundTo(a / power, 0);
                    problem = `${a.toFixed(2)} ÷ ${power}`;
                }
            }
        }
    } else if (type === "equation_simple") {
        isEquation = true;
        const cfg = DIFF_CONFIG.equation[diff];
        if (diff === 1) {
            const coef = rand(2, cfg.maxCoef);
            const x = rand(2, 10);
            const result = coef * x;
            answer = x;
            problem = `${coef}x = ${result}`;
        } else if (diff === 2) {
            const coef = rand(2, cfg.maxCoef);
            const x = rand(2, 12);
            const constant = rand(1, cfg.maxConst);
            op = Math.random() > 0.5 ? "+" : "-";
            const result = op === "+" ? coef * x + constant : coef * x - constant;
            answer = x;
            problem = `${coef}x ${op} ${constant} = ${result}`;
        } else if (diff === 3) {
            const mode = rand(1, 3);
            if (mode === 1) {
                const coef = rand(3, cfg.maxCoef);
                const x = rand(5, 20);
                const constant = rand(10, cfg.maxConst);
                const result = coef * x + constant;
                answer = x;
                problem = `${coef}x + ${constant} = ${result}`;
            } else if (mode === 2) {
                const coef = rand(2, 6);
                const add = rand(2, 8);
                const x = rand(3, 15);
                const result = coef * (x + add);
                answer = x;
                problem = `${coef}(x + ${add}) = ${result}`;
            } else {
                const coef = rand(2, cfg.maxCoef);
                const x = rand(3, 12);
                const bVal = coef * x + rand(10, 30);
                const cVal = bVal - coef * x;
                answer = x;
                problem = `${coef}x = ${bVal} - ${cVal}`;
            }
        } else {
            const mode = rand(1, 4);
            if (mode === 1) {
                const aVal = rand(2, 8);
                const bVal = rand(3, 12);
                answer = aVal * bVal;
                problem = `x ÷ ${aVal} = ${bVal}`;
            } else if (mode === 2) {
                const coef1 = rand(2, 8);
                const coef2 = rand(2, 6);
                const x = rand(3, 10);
                const result = (coef1 + coef2) * x;
                answer = x;
                problem = `${coef1}x + ${coef2}x = ${result}`;
            } else if (mode === 3) {
                const coef = rand(2, 5);
                const sub = rand(2, 6);
                const add = rand(3, 10);
                const x = rand(sub + 2, 15);
                const result = coef * (x - sub) + add;
                answer = x;
                problem = `${coef}(x - ${sub}) + ${add} = ${result}`;
            } else {
                const aVal = rand(2, 5);
                const bVal = rand(2, 10);
                const x = rand(2, 8) * aVal;
                const result = x / aVal + bVal;
                answer = x;
                problem = `x ÷ ${aVal} + ${bVal} = ${result}`;
            }
        }
    } else if (type === "frac_diff_add") {
        isFraction = true;
        if (diff === 1) {
            let d1 = rand(2, 4);
            let d2 = rand(2, 4);
            while (d1 === d2) d2 = rand(2, 4);
            const commonDen = lcm(d1, d2);
            const n1 = 1, n2 = 1;
            const newN1 = n1 * (commonDen / d1);
            const newN2 = n2 * (commonDen / d2);
            const [simpN, simpD] = simplifyFrac(newN1 + newN2, commonDen);
            answer = simpD === 1 ? `${simpN}` : `${simpN}/${simpD}`;
            problem = `${fmtFrac(n1, d1)} + ${fmtFrac(n2, d2)}`;
        } else if (diff === 2) {
            let d1 = rand(2, 6);
            let d2 = rand(2, 6);
            while (d1 === d2) d2 = rand(2, 6);
            const commonDen = lcm(d1, d2);
            const n1 = rand(1, d1 - 1);
            const n2 = rand(1, d2 - 1);
            const newN1 = n1 * (commonDen / d1);
            const newN2 = n2 * (commonDen / d2);
            const [simpN, simpD] = simplifyFrac(newN1 + newN2, commonDen);
            answer = simpD === 1 ? `${simpN}` : `${simpN}/${simpD}`;
            problem = `${fmtFrac(n1, d1)} + ${fmtFrac(n2, d2)}`;
        } else if (diff === 3) {
            let d1 = rand(3, 12);
            let d2 = rand(2, 12);
            while (d1 === d2) d2 = rand(2, 12);
            const commonDen = lcm(d1, d2);
            const n1 = rand(2, d1 - 1);
            const n2 = rand(1, d2 - 1);
            const newN1 = n1 * (commonDen / d1);
            const newN2 = n2 * (commonDen / d2);
            op = Math.random() > 0.5 ? "+" : "-";
            let resultN;
            if (op === "+") {
                resultN = newN1 + newN2;
            } else {
                if (newN1 < newN2) [d1, d2] = [d2, d1];
                resultN = Math.abs(newN1 - newN2);
            }
            const [simpN, simpD] = simplifyFrac(resultN, commonDen);
            answer = simpD === 1 ? `${simpN}` : `${simpN}/${simpD}`;
            problem = `${fmtFrac(n1, d1)} ${op} ${fmtFrac(n2, d2)}`;
        } else {
            let d1 = rand(2, 6);
            let d2 = rand(2, 6);
            let d3 = rand(2, 6);
            while (d1 === d2) d2 = rand(2, 6);
            while (d3 === d1 || d3 === d2) d3 = rand(2, 6);
            const commonDen = lcm(lcm(d1, d2), d3);
            const n1 = rand(1, d1 - 1);
            const n2 = rand(1, d2 - 1);
            const n3 = rand(1, d3 - 1);
            const newN1 = n1 * (commonDen / d1);
            const newN2 = n2 * (commonDen / d2);
            const newN3 = n3 * (commonDen / d3);
            const resultN = newN1 + newN2 - newN3;
            const [simpN, simpD] = simplifyFrac(Math.abs(resultN), commonDen);
            answer = resultN < 0 ? `-${simpN}/${simpD}` : (simpD === 1 ? `${simpN}` : `${simpN}/${simpD}`);
            problem = `${fmtFrac(n1, d1)} + ${fmtFrac(n2, d2)} - ${fmtFrac(n3, d3)}`;
        }
    }

    // --- Grade 6 ---
    else if (type === "frac_mul_div") {
        isFraction = true;
        if (diff === 1) {
            const n1 = rand(1, 3), d1 = rand(4, 6);
            const n2 = rand(1, 3), d2 = rand(4, 6);
            const resN = n1 * n2;
            const resD = d1 * d2;
            const [simpN, simpD] = simplifyFrac(resN, resD);
            answer = simpD === 1 ? `${simpN}` : `${simpN}/${simpD}`;
            problem = `${fmtFrac(n1, d1)} × ${fmtFrac(n2, d2)}`;
        } else if (diff === 2) {
            const n1 = rand(1, 5), d1 = rand(6, 9);
            const n2 = rand(1, 5), d2 = rand(6, 9);
            op = Math.random() > 0.5 ? "×" : "÷";
            let resN, resD;
            if (op === "×") {
                resN = n1 * n2;
                resD = d1 * d2;
            } else {
                resN = n1 * d2;
                resD = d1 * n2;
            }
            const [simpN, simpD] = simplifyFrac(resN, resD);
            answer = simpD === 1 ? `${simpN}` : `${simpN}/${simpD}`;
            problem = `${fmtFrac(n1, d1)} ${op} ${fmtFrac(n2, d2)}`;
        } else if (diff === 3) {
            const mode = rand(1, 2);
            if (mode === 1) {
                const n1 = rand(1, 5), d1 = rand(6, 12);
                const whole = rand(2, 6);
                const resN = n1 * whole;
                const [simpN, simpD] = simplifyFrac(resN, d1);
                answer = simpD === 1 ? `${simpN}` : `${simpN}/${simpD}`;
                problem = `${fmtFrac(n1, d1)} × ${whole}`;
            } else {
                const whole = rand(2, 6);
                const n2 = rand(1, 4), d2 = rand(5, 8);
                const resN = whole * d2;
                const resD = n2;
                const [simpN, simpD] = simplifyFrac(resN, resD);
                answer = simpD === 1 ? `${simpN}` : `${simpN}/${simpD}`;
                problem = `${whole} ÷ ${fmtFrac(n2, d2)}`;
            }
        } else {
            const mode = rand(1, 3);
            if (mode === 1) {
                const n1 = rand(1, 4), d1 = rand(5, 8);
                const n2 = rand(1, 3), d2 = rand(4, 6);
                const n3 = rand(1, 3), d3 = rand(4, 6);
                const resN = n1 * n2 * d3;
                const resD = d1 * d2 * n3;
                const [simpN, simpD] = simplifyFrac(resN, resD);
                answer = simpD === 1 ? `${simpN}` : `${simpN}/${simpD}`;
                problem = `${fmtFrac(n1, d1)} × ${fmtFrac(n2, d2)} ÷ ${fmtFrac(n3, d3)}`;
            } else if (mode === 2) {
                let d1 = rand(2, 4), d2 = rand(2, 4);
                while (d1 === d2) d2 = rand(2, 4);
                const n1 = rand(1, d1 - 1), n2 = rand(1, d2 - 1);
                const commonDen = lcm(d1, d2);
                const sumN = n1 * (commonDen / d1) + n2 * (commonDen / d2);
                const mult = rand(2, 5);
                const [simpN, simpD] = simplifyFrac(sumN * mult, commonDen);
                answer = simpD === 1 ? `${simpN}` : `${simpN}/${simpD}`;
                problem = `(${fmtFrac(n1, d1)} + ${fmtFrac(n2, d2)}) × ${mult}`;
            } else {
                const n1 = rand(1, 4), d1 = rand(5, 8);
                const mult = rand(2, 4) * d1;
                const n2 = rand(1, 3), d2 = d1;
                const result1 = n1 * mult / d1;
                const [simpN, simpD] = simplifyFrac(result1 * d2 + n2, d2);
                answer = simpD === 1 ? `${simpN}` : `${simpN}/${simpD}`;
                problem = `${fmtFrac(n1, d1)} × ${mult} + ${fmtFrac(n2, d2)}`;
            }
        }
    } else if (type === "percent_calc") {
        if (diff === 1) {
            a = rand(10, 100);
            const pct = rand(1, 9) * 10;
            answer = a * pct / 100;
            problem = `${a} × ${pct}%`;
        } else if (diff === 2) {
            const mode = rand(1, 2);
            if (mode === 1) {
                a = rand(20, 200);
                const pct = rand(1, 19) * 5;
                answer = roundTo(a * pct / 100, 2);
                problem = `${a} × ${pct}%`;
            } else {
                a = rand(10, 50);
                b = rand(50, 200);
                answer = roundTo(a * b / 100, 2);
                problem = `${b}的${a}%是多少`;
            }
        } else if (diff === 3) {
            const mode = rand(1, 3);
            if (mode === 1) {
                const original = rand(50, 200);
                const discount = rand(1, 4) * 10;
                answer = original * (100 - discount) / 100;
                problem = `原价${original}元，打${(100 - discount) / 10}折后的价格`;
            } else if (mode === 2) {
                a = rand(50, 150);
                const increase = rand(1, 5) * 10;
                answer = a * (100 + increase) / 100;
                problem = `${a}增加${increase}%后是多少`;
            } else {
                const original = rand(100, 200);
                const discount = rand(1, 4) * 10;
                const sale = original * (100 - discount) / 100;
                answer = discount;
                problem = `原价${original}元，现价${sale}元，打了几折`;
            }
        } else {
            const mode = rand(1, 3);
            if (mode === 1) {
                const original = rand(100, 300);
                const disc1 = rand(1, 3) * 10;
                const disc2 = rand(1, 2) * 10;
                answer = roundTo(original * (100 - disc1) / 100 * (100 - disc2) / 100, 2);
                problem = `${original}元先打${(100 - disc1) / 10}折，再打${(100 - disc2) / 10}折`;
            } else if (mode === 2) {
                const original = rand(50, 150);
                const pct = rand(2, 8) * 10;
                const final = original * pct / 100;
                answer = original;
                problem = `某数的${pct}%是${final}，求这个数`;
            } else {
                const before = rand(80, 150);
                const after = rand(100, 200);
                const change = roundTo((after - before) / before * 100, 1);
                answer = change;
                problem = `从${before}变到${after}，增加了百分之几`;
            }
        }
    } else if (type === "ratio_solve") {
        isEquation = true;
        if (diff === 1) {
            c = rand(2, 6);
            b = rand(2, 6);
            a = c * rand(1, 5);
            answer = a * b / c;
            problem = `x : ${a} = ${b} : ${c}，求 x`;
        } else if (diff === 2) {
            const mode = rand(1, 2);
            if (mode === 1) {
                c = rand(2, 6);
                b = rand(2, 8);
                a = rand(2, 10);
                answer = roundTo(a * c / b, 2);
                problem = `${a} : x = ${b} : ${c}，求 x`;
            } else {
                c = rand(2, 8);
                b = rand(2, 8);
                a = rand(2, 10);
                answer = roundTo(a * b / c, 2);
                problem = `x : ${a} = ${b} : ${c}，求 x`;
            }
        } else if (diff === 3) {
            const mode = rand(1, 2);
            if (mode === 1) {
                a = rand(1, 4);
                b = rand(1, 4);
                const total = (a + b) * rand(5, 15);
                answer = `${total * a / (a + b)}和${total * b / (a + b)}`;
                problem = `把${total}按${a}:${b}分配`;
            } else {
                a = rand(2, 6);
                b = rand(2, 6);
                c = a * rand(2, 5);
                answer = b * c / a;
                problem = `${a} : ${b} = ${c} : x，求 x`;
            }
        } else {
            const mode = rand(1, 3);
            if (mode === 1) {
                a = rand(1, 3);
                b = rand(1, 3);
                c = rand(1, 3);
                const total = (a + b + c) * rand(6, 12);
                answer = `${total * a / (a + b + c)}, ${total * b / (a + b + c)}, ${total * c / (a + b + c)}`;
                problem = `把${total}按${a}:${b}:${c}分配`;
            } else if (mode === 2) {
                a = rand(2, 5);
                b = rand(2, 5);
                const scale = rand(3, 8);
                answer = `${a * scale}:${b * scale}`;
                problem = `${a}:${b}放大${scale}倍后的比`;
            } else {
                const g = rand(2, 6);
                a = g * rand(2, 5);
                b = g * rand(2, 5);
                const [simpA, simpB] = [a / gcd(a, b), b / gcd(a, b)];
                answer = `${simpA}:${simpB}`;
                problem = `把${a}:${b}化成最简比`;
            }
        }
    }

    // --- Grade 7 ---
    else if (type === "neg_add_sub") {
        const cfg = DIFF_CONFIG.negative[diff];
        if (diff === 1) {
            a = rand(1, cfg.range) * (Math.random() > 0.5 ? 1 : -1);
            b = rand(1, cfg.range) * (Math.random() > 0.5 ? 1 : -1);
            op = Math.random() > 0.5 ? "+" : "-";
            answer = op === "+" ? a + b : a - b;
            problem = `${p(a)} ${op} ${p(b)}`;
        } else if (diff === 2) {
            const mode = rand(1, 3);
            if (mode === 1) {
                a = rand(1, cfg.range) * (Math.random() > 0.5 ? 1 : -1);
                b = rand(1, cfg.range) * (Math.random() > 0.5 ? 1 : -1);
                op = Math.random() > 0.5 ? "+" : "-";
                answer = op === "+" ? a + b : a - b;
                problem = `${p(a)} ${op} ${p(b)}`;
            } else if (mode === 2) {
                a = -rand(3, cfg.range);
                b = rand(1, cfg.range) * (Math.random() > 0.5 ? 1 : -1);
                op = Math.random() > 0.5 ? "+" : "-";
                answer = op === "+" ? Math.abs(a) + b : Math.abs(a) - b;
                problem = `|${a}| ${op} ${p(b)}`;
            } else {
                a = rand(1, Math.floor(cfg.range / 2)) * (Math.random() > 0.5 ? 1 : -1);
                b = rand(1, Math.floor(cfg.range / 2)) * (Math.random() > 0.5 ? 1 : -1);
                c = rand(1, Math.floor(cfg.range / 2)) * (Math.random() > 0.5 ? 1 : -1);
                answer = a + b + c;
                problem = `${p(a)} + ${p(b)} + ${p(c)}`;
            }
        } else if (diff === 3) {
            const mode = rand(1, 4);
            if (mode === 1) {
                a = rand(10, cfg.range) * (Math.random() > 0.5 ? 1 : -1);
                b = rand(5, cfg.range) * (Math.random() > 0.5 ? 1 : -1);
                c = rand(5, cfg.range) * (Math.random() > 0.5 ? 1 : -1);
                const op1 = Math.random() > 0.5 ? "+" : "-";
                const op2 = Math.random() > 0.5 ? "+" : "-";
                const val1 = op1 === "+" ? a + b : a - b;
                answer = op2 === "+" ? val1 + c : val1 - c;
                problem = `${p(a)} ${op1} ${p(b)} ${op2} ${p(c)}`;
            } else if (mode === 2) {
                a = -rand(5, cfg.range);
                b = -rand(3, Math.floor(cfg.range / 2));
                c = rand(1, Math.floor(cfg.range / 2)) * (Math.random() > 0.5 ? 1 : -1);
                op = Math.random() > 0.5 ? "+" : "-";
                answer = op === "+" ? Math.abs(a) + Math.abs(b) + c : Math.abs(a) - Math.abs(b) + c;
                problem = op === "+" ? `|${a}| + |${b}| + ${p(c)}` : `|${a}| - |${b}| + ${p(c)}`;
            } else if (mode === 3) {
                a = rand(5, Math.floor(cfg.range / 2)) * (Math.random() > 0.5 ? 1 : -1);
                b = rand(5, Math.floor(cfg.range / 2)) * (Math.random() > 0.5 ? 1 : -1);
                c = rand(3, Math.floor(cfg.range / 3)) * (Math.random() > 0.5 ? 1 : -1);
                d = rand(3, Math.floor(cfg.range / 3)) * (Math.random() > 0.5 ? 1 : -1);
                answer = a + b - c + d;
                problem = `${p(a)} + ${p(b)} - ${p(c)} + ${p(d)}`;
            } else {
                a = rand(10, cfg.range) * (Math.random() > 0.5 ? 1 : -1);
                b = rand(5, Math.floor(cfg.range / 2)) * (Math.random() > 0.5 ? 1 : -1);
                answer = b;
                problem = `${p(a)} + ${p(-a)} + ${p(b)}`;
            }
        } else {
            const mode = rand(1, 5);
            if (mode === 1) {
                a = -rand(10, cfg.range);
                b = -rand(5, Math.floor(cfg.range / 2));
                c = rand(5, Math.floor(cfg.range / 2)) * (Math.random() > 0.5 ? 1 : -1);
                answer = Math.abs(Math.abs(a) - Math.abs(b)) + c;
                problem = `||${a}| - |${b}|| + ${p(c)}`;
            } else if (mode === 2) {
                a = rand(10, Math.floor(cfg.range / 2)) * (Math.random() > 0.5 ? 1 : -1);
                b = rand(10, Math.floor(cfg.range / 2)) * (Math.random() > 0.5 ? 1 : -1);
                c = rand(5, Math.floor(cfg.range / 3)) * (Math.random() > 0.5 ? 1 : -1);
                d = rand(5, Math.floor(cfg.range / 3)) * (Math.random() > 0.5 ? 1 : -1);
                e = rand(5, Math.floor(cfg.range / 4)) * (Math.random() > 0.5 ? 1 : -1);
                answer = a - b + c - d + e;
                problem = `${p(a)} - ${p(b)} + ${p(c)} - ${p(d)} + ${p(e)}`;
            } else if (mode === 3) {
                a = rand(20, cfg.range) * (Math.random() > 0.5 ? 1 : -1);
                b = -rand(10, Math.floor(cfg.range / 2));
                c = rand(10, Math.floor(cfg.range / 2)) * (Math.random() > 0.5 ? 1 : -1);
                d = -rand(5, Math.floor(cfg.range / 3));
                answer = a + Math.abs(b) - c + Math.abs(d);
                problem = `${p(a)} + |${b}| - ${p(c)} + |${d}|`;
            } else if (mode === 4) {
                isFraction = true;
                const n1 = rand(1, 5) * (Math.random() > 0.5 ? 1 : -1);
                const d1 = rand(2, 6);
                const n2 = rand(1, 5) * (Math.random() > 0.5 ? 1 : -1);
                const d2 = d1;
                const answerNum = n1 + n2;
                answer = answerNum % d1 === 0 ? `${answerNum / d1}` : `${answerNum}/${d1}`;
                const frac1 = n1 < 0 ? `(-${fmtFrac(Math.abs(n1), d1)})` : fmtFrac(n1, d1);
                const frac2 = n2 < 0 ? `(-${fmtFrac(Math.abs(n2), d2)})` : fmtFrac(n2, d2);
                problem = `${frac1} + ${frac2}`;
            } else {
                a = rand(10, cfg.range);
                b = -rand(10, Math.floor(cfg.range / 2));
                c = rand(5, Math.floor(cfg.range / 2)) * (Math.random() > 0.5 ? 1 : -1);
                d = rand(5, Math.floor(cfg.range / 3)) * (Math.random() > 0.5 ? 1 : -1);
                answer = a + Math.abs(b) - c + d;
                problem = `-${p(-a)} + |${b}| - ${p(c)} + ${p(d)}`;
            }
        }
    } else if (type === "neg_mixed") {
        const cfg = DIFF_CONFIG.negative[diff];
        if (diff === 1) {
            const mode = rand(1, 2);
            if (mode === 1) {
                a = -rand(2, 6);
                b = rand(2, 6);
                answer = a * b;
                problem = `${p(a)} × ${b}`;
            } else {
                b = rand(2, 6);
                a = b * rand(2, 6);
                answer = -a / b;
                problem = `${a} ÷ ${p(-b)}`;
            }
        } else if (diff === 2) {
            const mode = rand(1, 3);
            if (mode === 1) {
                a = -rand(2, 5);
                b = rand(2, 6);
                c = rand(1, 10);
                answer = a * b + c;
                problem = `${p(a)} × ${b} + ${c}`;
            } else if (mode === 2) {
                a = rand(10, 30);
                b = -rand(2, 5);
                c = rand(2, 5);
                answer = a - b * c;
                problem = `${a} - ${p(b)} × ${c}`;
            } else {
                a = rand(5, 15);
                answer = 4 + a;
                problem = `(-2)² + ${a}`;
            }
        } else if (diff === 3) {
            const mode = rand(1, 4);
            if (mode === 1) {
                a = -rand(2, 5);
                b = rand(2, 6);
                d = rand(2, 4);
                c = d * rand(2, 6);
                answer = a * b - c / d;
                problem = `${p(a)} × ${b} - ${c} ÷ ${d}`;
            } else if (mode === 2) {
                a = rand(2, 5);
                b = rand(2, 5);
                answer = -8 + a * b;
                problem = `-2³ + ${p(-a)} × ${p(-b)}`;
            } else if (mode === 3) {
                a = -rand(5, 15);
                b = -rand(2, 4);
                c = rand(2, 5);
                answer = Math.abs(a) - b * c;
                problem = `|${a}| - ${p(b)} × ${c}`;
            } else {
                a = rand(3, 8);
                b = rand(2, 6);
                c = -rand(2, 5);
                answer = (a + b) * c;
                problem = `(${a} + ${b}) × ${p(c)}`;
            }
        } else {
            const mode = rand(1, 5);
            if (mode === 1) {
                a = rand(3, 10);
                b = rand(2, 4);
                c = rand(1, 2);
                const bSquared = b * b;
                answer = -1 * a - bSquared / c;
                problem = `(-1)³ × ${a} - ${p(-b)}² ÷ ${c * c === bSquared ? c : 1}`;
            } else if (mode === 2) {
                a = rand(5, 15);
                b = -rand(3, 8);
                c = -rand(2, 4);
                d = rand(10, 30);
                answer = (a - b) * c + d;
                problem = `[${a} - ${p(b)}] × ${p(c)} + ${d}`;
            } else if (mode === 3) {
                a = -rand(3, 8);
                b = -rand(2, 6);
                c = rand(2, 4);
                answer = Math.abs(a) * Math.abs(b) - c * c;
                problem = `|${a}| × |${b}| - ${p(-c)}²`;
            } else if (mode === 4) {
                b = rand(2, 5);
                a = b * rand(3, 8);
                c = rand(2, 5);
                d = rand(2, 4);
                e = rand(5, 15);
                answer = a / (-b) + c * (-d) - e;
                problem = `${a} ÷ ${p(-b)} + ${c} × ${p(-d)} - ${e}`;
            } else {
                a = rand(2, 4);
                b = rand(10, 20);
                c = rand(2, 4);
                d = rand(2, 3);
                answer = (-a) * (b + (-c) * d);
                problem = `${p(-a)} × [${b} + ${p(-c)} × ${d}]`;
            }
        }
    } else if (type === "poly_add_sub") {
        isAlgebraic = true;
        if (diff === 1) {
            const c1 = rand(2, 6), c2 = rand(1, 4);
            answer = `${c1 + c2}a`;
            problem = `${c1}a + ${c2}a`;
        } else if (diff === 2) {
            const c1 = rand(3, 9), c2 = rand(2, 8), c3 = rand(1, c1);
            answer = `${c1 - c3}a + ${c2}b`;
            problem = `${c1}a - ${c3}a + ${c2}b`;
        } else if (diff === 3) {
            const c1 = rand(3, 9), c2 = rand(2, 9), c3 = rand(1, c1), c4 = rand(1, c2);
            const aCoef = c1 - c3;
            const bCoef = c2 - c4;
            answer = aCoef === 0 ? `${bCoef}b` : (bCoef === 0 ? `${aCoef}a` : `${aCoef}a + ${bCoef}b`);
            problem = `${c1}a + ${c2}b - ${c3}a - ${c4}b`;
        } else {
            const mode = rand(1, 2);
            if (mode === 1) {
                const c1 = rand(2, 8), c2 = rand(2, 8), c3 = rand(1, 6), c4 = rand(1, 6);
                const aCoef = c1 - c3;
                const bCoef = c2 - c4;
                answer = `${aCoef}x + ${bCoef}y`;
                problem = `${c1}x + ${c2}y - ${c3}x - ${c4}y`;
            } else {
                const c1 = rand(2, 6), c2 = rand(1, 5), c3 = rand(1, c1);
                const x2Coef = c1 - c3;
                answer = `${x2Coef}x² + ${c2}x`;
                problem = `${c1}x² + ${c2}x - ${c3}x²`;
            }
        }
    } else if (type === "eq_linear") {
        isEquation = true;
        if (diff === 1) {
            const mode = rand(1, 2);
            if (mode === 1) {
                const coef = rand(2, 5);
                const x = rand(2, 10);
                answer = x;
                problem = `${coef}x = ${coef * x}`;
            } else {
                const aVal = rand(3, 15);
                const x = rand(2, 12);
                answer = x;
                problem = `x + ${aVal} = ${x + aVal}`;
            }
        } else if (diff === 2) {
            const mode = rand(1, 2);
            if (mode === 1) {
                const coef = rand(2, 5);
                const add = rand(1, 5);
                const x = rand(2, 10);
                answer = x;
                problem = `${coef}(x + ${add}) = ${coef * (x + add)}`;
            } else {
                const coef = rand(2, 6);
                const sub = rand(1, 10);
                const x = rand(3, 12);
                answer = x;
                problem = `${coef}x - ${sub} = ${coef * x - sub}`;
            }
        } else if (diff === 3) {
            const mode = rand(1, 2);
            if (mode === 1) {
                const coef1 = rand(3, 8);
                const coef2 = rand(1, coef1 - 1);
                const x = rand(2, 8);
                const const1 = rand(1, 10);
                const const2 = (coef1 - coef2) * x + const1;
                answer = x;
                problem = `${coef1}x + ${const1} = ${coef2}x + ${const2}`;
            } else {
                const coef1 = rand(2, 5);
                const sub1 = rand(1, 4);
                const x = rand(5, 12);
                const result = coef1 * (x - sub1);
                answer = x;
                problem = `${coef1}(x - ${sub1}) = ${result}`;
            }
        } else {
            const mode = rand(1, 3);
            if (mode === 1) {
                const aVal = rand(2, 4);
                const bVal = rand(2, 4);
                const x = aVal * bVal * rand(1, 3);
                const result = x / aVal + x / bVal;
                answer = x;
                problem = `x/${aVal} + x/${bVal} = ${result}`;
            } else if (mode === 2) {
                const bVal = rand(2, 5);
                const cVal = rand(2, 8);
                const aVal = rand(1, 10);
                const x = bVal * cVal + aVal;
                answer = x;
                problem = `(x - ${aVal}) ÷ ${bVal} = ${cVal}`;
            } else {
                const coef1 = rand(4, 10);
                const coef2 = rand(2, coef1 - 1);
                const x = rand(3, 10);
                const const1 = rand(5, 20);
                const const2 = (coef1 - coef2) * x + const1;
                answer = x;
                problem = `${coef1}x + ${const1} = ${coef2}x + ${const2}`;
            }
        }
    }

    // --- Grade 8 ---
    else if (type === "sqrt_calc") {
        isAlgebraic = true;
        const bases = [2, 3, 5, 6, 7];
        if (diff === 1) {
            const base = randChoice([2, 3, 5]);
            const mult = randChoice([4, 9, 16]);
            const coef = Math.sqrt(mult);
            answer = `${coef}√${base}`;
            problem = `√${base * mult}`;
        } else if (diff === 2) {
            const base = randChoice(bases);
            const c1 = rand(2, 5);
            const c2 = rand(1, 4);
            answer = `${c1 + c2}√${base}`;
            problem = `${c1}√${base} + ${c2}√${base}`;
        } else if (diff === 3) {
            const base = randChoice([2, 3, 5]);
            answer = `4√${base}`;
            problem = `√${base * 4} + √${base * 9} - √${base}`;
        } else {
            const mode = rand(1, 3);
            if (mode === 1) {
                answer = `4√3`;
                problem = `√12 + √27 - √3`;
            } else if (mode === 2) {
                answer = `4`;
                problem = `√8 × √2`;
            } else {
                answer = `5√2`;
                problem = `2√18 - 3√8 + √50`;
            }
        }
    } else if (type === "poly_mul") {
        isAlgebraic = true;
        if (diff === 1) {
            a = rand(1, 4);
            b = rand(1, 4);
            answer = `x² + ${a + b}x + ${a * b}`;
            problem = `(x + ${a})(x + ${b})`;
        } else if (diff === 2) {
            a = rand(1, 5);
            b = rand(1, 5);
            const mode = rand(1, 2);
            if (mode === 1) {
                answer = a === b ? `x² - ${a * b}` : `x² + ${a - b}x - ${a * b}`;
                problem = `(x + ${a})(x - ${b})`;
            } else {
                answer = `x² - ${a + b}x + ${a * b}`;
                problem = `(x - ${a})(x - ${b})`;
            }
        } else if (diff === 3) {
            const mode = rand(1, 3);
            if (mode === 1) {
                a = rand(1, 5);
                answer = `a² + ${2 * a}a + ${a * a}`;
                problem = `(a + ${a})²`;
            } else if (mode === 2) {
                a = rand(1, 5);
                answer = `a² - ${a * a}`;
                problem = `(a - ${a})(a + ${a})`;
            } else {
                a = rand(1, 4);
                b = rand(1, 4);
                answer = `2x² + ${2 * b + a}x + ${a * b}`;
                problem = `(2x + ${a})(x + ${b})`;
            }
        } else {
            const mode = rand(1, 3);
            if (mode === 1) {
                a = rand(2, 3);
                b = rand(1, 4);
                c = rand(2, 3);
                d = rand(1, 4);
                answer = `${a * c}x² + ${a * d + b * c}x + ${b * d}`;
                problem = `(${a}x + ${b})(${c}x + ${d})`;
            } else if (mode === 2) {
                a = rand(1, 3);
                answer = `x³ + ${3 * a}x² + ${3 * a * a}x + ${a * a * a}`;
                problem = `(x + ${a})³`;
            } else {
                a = rand(1, 3);
                b = rand(1, 3);
                answer = `4a² - ${9 * b * b}b²`;
                problem = `(2a - ${3 * b}b)(2a + ${3 * b}b)`;
            }
        }
    } else if (type === "frac_algebra") {
        isAlgebraic = true;
        if (diff === 1) {
            a = rand(2, 5);
            answer = `${a}x`;
            problem = `${fmtFrac(`${a}x²`, "x")}`;
        } else if (diff === 2) {
            a = rand(2, 4);
            b = rand(2, 4);
            answer = `${a}/${b}`;
            problem = `${fmtFrac("a", `${b}`)} × ${fmtFrac(`${a}`, "a")}`;
        } else if (diff === 3) {
            answer = `b/a`;
            problem = `${fmtFrac("a", "b")} ÷ ${fmtFrac("a²", "b²")}`;
        } else {
            const mode = rand(1, 3);
            if (mode === 1) {
                answer = `(a+b)/(ab)`;
                problem = `${fmtFrac("1", "a")} + ${fmtFrac("1", "b")}`;
            } else if (mode === 2) {
                answer = `x+1`;
                problem = `${fmtFrac("x²-1", "x-1")}`;
            } else {
                answer = `b²/a²`;
                problem = `${fmtFrac("a", "b")} ÷ ${fmtFrac("a³", "b³")}`;
            }
        }
    }

    // FALLBACK
    else {
        a = rand(10, 100);
        b = rand(10, 100);
        answer = a + b;
        problem = `${a} + ${b}`;
    }

    // Default return
    return {
        problem,
        answer,
        display: isFillBlank || isEquation || isAlgebraic ? problem : `${problem} = `,
        isFillBlank,
        hasRemainder,
        isFraction,
        isEquation,
        isAlgebraic
    }
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
