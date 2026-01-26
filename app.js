/* ========================================
   Math Problem Generator - Core Application
   ======================================== */

// === 1. Curriculum Definition ===
const curriculum = {
    "1": [
        { id: "add_sub_20", name: "20以内加减法" },
        { id: "add_sub_100_simple", name: "100以内整十数加减" },
        { id: "add_sub_100_reg", name: "100以内不进位/不退位" },
        { id: "fill_blank_20", name: "填空题(20以内)" }
    ],
    "2": [
        { id: "mul_table", name: "表内乘法 (九九表)" },
        { id: "div_table", name: "表内除法" },
        { id: "add_sub_100_hard", name: "100以内进位/退位竖式" },
        { id: "mixed_novice", name: "加减乘除混合(无括号)" },
        { id: "fill_blank_mul", name: "填空题(乘法)" }
    ],
    "3": [
        { id: "mul_2d_1d", name: "两位数/三位数乘一位数" },
        { id: "div_2d_1d", name: "两位数除以一位数" },
        { id: "add_sub_large", name: "万以内加减法" },
        { id: "frac_simple_add", name: "同分母分数加减" }
    ],
    "4": [
        { id: "mul_big", name: "三位数乘两位数" },
        { id: "mixed_bracket", name: "四则混合运算(含括号)" },
        { id: "calc_law", name: "简便运算(运算律)" },
        { id: "decimal_add_sub", name: "小数加减法" }
    ],
    "5": [
        { id: "decimal_mul_div", name: "小数乘除法" },
        { id: "equation_simple", name: "解简易方程" },
        { id: "frac_diff_add", name: "异分母分数加减" }
    ],
    "6": [
        { id: "frac_mul_div", name: "分数乘除法" },
        { id: "percent_calc", name: "百分数/折扣计算" },
        { id: "ratio_solve", name: "解比例" }
    ],
    "7": [
        { id: "neg_add_sub", name: "有理数加减 (含负数)" },
        { id: "neg_mixed", name: "有理数四则混合运算" },
        { id: "poly_add_sub", name: "整式加减 (合并同类项)" },
        { id: "eq_linear", name: "一元一次方程" }
    ],
    "8": [
        { id: "sqrt_calc", name: "二次根式计算" },
        { id: "poly_mul", name: "整式乘法与乘法公式" },
        { id: "frac_algebra", name: "分式化简与计算" }
    ]
};

// === 2. Application State ===
const state = {
    currentProblems: [],
    answers: {},
    score: { correct: 0, incorrect: 0, total: 0 },
    timerInterval: null,
    timerSeconds: 0,
    isInteractiveMode: false,
    showAnswers: false,
    generatedSet: new Set(), // For uniqueness check
    worksheetStartTime: null // Track when worksheet was started
};

// === 2b. Profile State & Management ===
const STORAGE_KEYS = {
    PROFILES: 'mathgen_profiles',
    CURRENT_PROFILE: 'mathgen_current_profile'
};

const profileState = {
    profiles: [],
    currentProfileId: null
};

// Generate unique ID
function generateId() {
    return 'profile_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Load profiles from localStorage
function loadProfiles() {
    try {
        const profilesJson = localStorage.getItem(STORAGE_KEYS.PROFILES);
        const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_PROFILE);

        profileState.profiles = profilesJson ? JSON.parse(profilesJson) : [];
        profileState.currentProfileId = currentId || null;

        // Validate current profile exists
        if (profileState.currentProfileId) {
            const exists = profileState.profiles.some(p => p.id === profileState.currentProfileId);
            if (!exists) {
                profileState.currentProfileId = null;
                localStorage.removeItem(STORAGE_KEYS.CURRENT_PROFILE);
            }
        }
    } catch (e) {
        console.error('Error loading profiles:', e);
        profileState.profiles = [];
        profileState.currentProfileId = null;
    }
}

// Save profiles to localStorage
function saveProfiles() {
    try {
        localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profileState.profiles));
        if (profileState.currentProfileId) {
            localStorage.setItem(STORAGE_KEYS.CURRENT_PROFILE, profileState.currentProfileId);
        } else {
            localStorage.removeItem(STORAGE_KEYS.CURRENT_PROFILE);
        }
    } catch (e) {
        console.error('Error saving profiles:', e);
        alert('无法保存用户数据，请检查浏览器存储设置。');
    }
}

// Get current profile object
function getCurrentProfile() {
    if (!profileState.currentProfileId) return null;
    return profileState.profiles.find(p => p.id === profileState.currentProfileId) || null;
}

// Add new profile
function addProfile(name, email) {
    if (!name || name.trim() === '') {
        alert('请输入用户名称');
        return false;
    }

    const newProfile = {
        id: generateId(),
        name: name.trim(),
        email: (email || '').trim(),
        createdAt: new Date().toISOString(),
        history: []
    };

    profileState.profiles.push(newProfile);
    profileState.currentProfileId = newProfile.id;
    saveProfiles();
    renderProfileSelector();
    closeProfileModal();
    updateProfileDisplay();
    return true;
}

// Delete profile
function deleteProfile(profileId) {
    const profile = profileState.profiles.find(p => p.id === profileId);
    if (!profile) return false;

    if (!confirm(`确定要删除用户 "${profile.name}" 吗？所有练习记录将被删除。`)) {
        return false;
    }

    profileState.profiles = profileState.profiles.filter(p => p.id !== profileId);

    if (profileState.currentProfileId === profileId) {
        profileState.currentProfileId = profileState.profiles.length > 0 ? profileState.profiles[0].id : null;
    }

    saveProfiles();
    renderProfileSelector();
    renderProfileList();
    updateProfileDisplay();
    return true;
}

// Select profile
function selectProfile(profileId) {
    if (profileId === '') {
        profileState.currentProfileId = null;
    } else {
        const exists = profileState.profiles.some(p => p.id === profileId);
        if (exists) {
            profileState.currentProfileId = profileId;
        }
    }
    saveProfiles();
    updateProfileDisplay();
}

// Record work history for current profile
function recordWorkHistory() {
    const profile = getCurrentProfile();
    if (!profile) return;

    const grade = document.getElementById('gradeSelect').value;
    const typeId = document.getElementById('typeSelect').value;
    const diff = parseInt(document.getElementById('diffSelect').value);
    const diffLabels = { 1: '入门', 2: '基础', 3: '进阶', 4: '挑战' };

    // Find curriculum title
    let curriculumTitle = typeId;
    for (const g in curriculum) {
        const found = curriculum[g].find(t => t.id === typeId);
        if (found) {
            curriculumTitle = found.name;
            break;
        }
    }

    // Calculate time used
    let timeUsedSeconds = 0;
    if (state.worksheetStartTime) {
        timeUsedSeconds = Math.floor((Date.now() - state.worksheetStartTime) / 1000);
    }

    const historyEntry = {
        datetime: new Date().toISOString(),
        curriculumId: typeId,
        curriculumTitle: curriculumTitle,
        grade: grade,
        difficulty: diff,
        difficultyLabel: diffLabels[diff] || '基础',
        timeUsedSeconds: timeUsedSeconds,
        correct: state.score.correct,
        total: state.currentProblems.length
    };

    profile.history.push(historyEntry);
    saveProfiles();
}

// Get work history for current profile
function getWorkHistory() {
    const profile = getCurrentProfile();
    if (!profile) return [];
    return profile.history || [];
}

// Clear history for current profile
function clearHistory() {
    const profile = getCurrentProfile();
    if (!profile) {
        alert('请先选择用户');
        return;
    }

    if (!confirm('确定要清空所有练习记录吗？此操作不可恢复。')) {
        return;
    }

    profile.history = [];
    saveProfiles();
    renderHistoryTable();
}

// Update profile display in header
function updateProfileDisplay() {
    const profile = getCurrentProfile();
    const displayEl = document.getElementById('currentProfileName');
    if (displayEl) {
        displayEl.textContent = profile ? profile.name : '未选择用户';
    }
}

// === 3. Utility Functions ===
function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function fmtFrac(n, d) {
    return `<span class="fraction"><span class="frac-top">${n}</span><span class="frac-bottom">${d}</span></span>`;
}

// Parenthesize negative numbers
function p(num) {
    return num < 0 ? `(${num})` : String(num);
}

// Greatest common divisor
function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
        [a, b] = [b, a % b];
    }
    return a;
}

// Least common multiple
function lcm(a, b) {
    return Math.abs(a * b) / gcd(a, b);
}

// Simplify fraction
function simplifyFrac(n, d) {
    const g = gcd(n, d);
    return [n / g, d / g];
}

// Round to decimal places
function roundTo(num, places) {
    const factor = Math.pow(10, places);
    return Math.round(num * factor) / factor;
}

// === 4. Difficulty Configuration ===
// Each level has dramatically different parameters
const DIFF_CONFIG = {
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
};

// === 5. Problem Generators ===
function createProblem(type, diff) {
    let a, b, c, d, e, op, problem, answer;

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
        return { problem, answer, display: `${problem} = ` };
    }

    if (type === "add_sub_100_simple") {
        if (diff === 1) {
            // 入门: Small multiples of 10, single operation
            op = Math.random() > 0.5 ? "+" : "-";
            a = rand(1, 5) * 10;
            b = rand(1, 5) * 10;
            if (op === "-" && a < b) [a, b] = [b, a];
            answer = op === "+" ? a + b : a - b;
            problem = `${a} ${op} ${b}`;
        } else if (diff === 2) {
            // 基础: Full range, single operation
            op = Math.random() > 0.5 ? "+" : "-";
            a = rand(1, 9) * 10;
            b = rand(1, 9) * 10;
            if (op === "-" && a < b) [a, b] = [b, a];
            answer = op === "+" ? a + b : a - b;
            problem = `${a} ${op} ${b}`;
        } else if (diff === 3) {
            // 进阶: Three-term chain
            a = rand(2, 5) * 10;
            b = rand(2, 5) * 10;
            c = rand(1, 4) * 10;
            if (a + b - c < 0) c = rand(1, Math.floor((a + b) / 10)) * 10;
            answer = a + b - c;
            problem = `${a} + ${b} - ${c}`;
        } else {
            // 挑战: Four-term chain, larger multiples
            a = rand(3, 9) * 10;
            b = rand(2, 7) * 10;
            c = rand(1, 5) * 10;
            d = rand(1, 4) * 10;
            answer = a + b - c + d;
            problem = `${a} + ${b} - ${c} + ${d}`;
        }
        return { problem, answer, display: `${problem} = ` };
    }

    if (type === "add_sub_100_reg") {
        if (diff === 1) {
            // 入门: Small numbers, addition only
            let a1 = rand(1, 4), a2 = rand(1, 4);
            let b1 = rand(1, 5 - a1), b2 = rand(1, 5 - a2);
            a = a1 * 10 + a2;
            b = b1 * 10 + b2;
            answer = a + b;
            problem = `${a} + ${b}`;
        } else if (diff === 2) {
            // 基础: Full range, addition only
            let a1 = rand(1, 8), a2 = rand(1, 8);
            let b1 = rand(1, 9 - a1), b2 = rand(1, 9 - a2);
            a = a1 * 10 + a2;
            b = b1 * 10 + b2;
            answer = a + b;
            problem = `${a} + ${b}`;
        } else if (diff === 3) {
            // 进阶: Include subtraction (no borrowing)
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
            // 挑战: Three-term chain with mixed operations
            let a1 = rand(2, 5), a2 = rand(2, 5);
            let b1 = rand(1, 4), b2 = rand(1, 4);
            let c1 = rand(1, 3), c2 = rand(1, 3);
            a = a1 * 10 + a2;
            b = b1 * 10 + b2;
            c = c1 * 10 + c2;
            answer = a + b - c;
            problem = `${a} + ${b} - ${c}`;
        }
        return { problem, answer, display: `${problem} = ` };
    }

    if (type === "fill_blank_20") {
        if (diff === 1) {
            // 入门: Small numbers (≤10), simple blank
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
            // 基础: Full range (≤20)
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
            // 进阶: Three-number chain with one blank
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
            // 挑战: Equation with blank on both sides or complex
            const mode = rand(1, 2);
            if (mode === 1) {
                // __ + a = b + c
                a = rand(3, 8);
                b = rand(2, 6);
                c = rand(2, 6);
                answer = b + c - a;
                problem = `__ + ${a} = ${b} + ${c}`;
            } else {
                // a - __ = __ (same blank value)
                a = rand(10, 18);
                b = rand(2, Math.floor(a / 2));
                answer = b;
                problem = `${a} - __ - __ = ${a - 2 * b}（两个空填相同的数）`;
            }
        }
        return { problem, answer, display: problem, isFillBlank: true };
    }

    // --- Grade 2 ---
    if (type === "mul_table") {
        const cfg = DIFF_CONFIG.mul_table[diff];
        a = rand(2, cfg.maxA);
        b = rand(2, cfg.maxB);
        if (diff >= 3) {
            // Add second operation for harder levels
            c = rand(1, 20);
            answer = a * b + c;
            problem = `${a} × ${b} + ${c}`;
        } else {
            answer = a * b;
            problem = `${a} × ${b}`;
        }
        return { problem, answer, display: `${problem} = ` };
    }

    if (type === "div_table") {
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
        return { problem, answer, display: `${problem} = ` };
    }

    if (type === "add_sub_100_hard") {
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
            // Chain operations for 挑战
            a = rand(100, 500);
            b = rand(100, 400);
            c = rand(50, 200);
            answer = a + b - c;
            problem = `${a} + ${b} - ${c}`;
        }
        return { problem, answer, display: `${problem} = ` };
    }

    if (type === "mixed_novice") {
        if (diff === 1) {
            // Simple: just addition with small mult
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
            // Two multiplications
            a = rand(2, 6);
            b = rand(2, 6);
            c = rand(2, 6);
            d = rand(2, 6);
            answer = a * b + c * d;
            problem = `${a} × ${b} + ${c} × ${d}`;
        } else {
            // Three operations with division
            a = rand(20, 60);
            b = rand(3, 8);
            c = rand(2, 5);
            const div = rand(2, 4);
            d = div * rand(3, 8);
            answer = a + b * c - d / div;
            problem = `${a} + ${b} × ${c} - ${d} ÷ ${div}`;
        }
        return { problem, answer, display: `${problem} = ` };
    }

    if (type === "fill_blank_mul") {
        if (diff === 1) {
            // 入门: Small factors (2-5)
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
            // 基础: Full multiplication table
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
            // 进阶: Include division blanks
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
            // 挑战: Two-step equations with multiplication
            const mode = rand(1, 3);
            if (mode === 1) {
                // __ × a + b = c
                a = rand(2, 6);
                b = rand(5, 15);
                const x = rand(2, 8);
                c = x * a + b;
                answer = x;
                problem = `__ × ${a} + ${b} = ${c}`;
            } else if (mode === 2) {
                // a × __ - b = c
                a = rand(2, 6);
                const x = rand(3, 9);
                b = rand(1, a * x - 1);
                c = a * x - b;
                answer = x;
                problem = `${a} × __ - ${b} = ${c}`;
            } else {
                // (a + __) × b = c
                b = rand(2, 5);
                a = rand(2, 6);
                const x = rand(2, 6);
                c = (a + x) * b;
                answer = x;
                problem = `(${a} + __) × ${b} = ${c}`;
            }
        }
        return { problem, answer, display: problem, isFillBlank: true };
    }

    // --- Grade 3 ---
    if (type === "mul_2d_1d") {
        if (diff === 1) {
            // 入门: Small 2-digit × 1-digit
            a = rand(11, 50);
            b = rand(2, 5);
        } else if (diff === 2) {
            // 基础: Full 2-digit × 1-digit
            a = rand(11, 99);
            b = rand(2, 9);
        } else if (diff === 3) {
            // 进阶: 3-digit × 1-digit
            a = rand(100, 999);
            b = rand(2, 9);
        } else {
            // 挑战: 4-digit × 1-digit or 3-digit × larger
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
        return { problem, answer, display: `${problem} = ` };
    }

    if (type === "div_2d_1d") {
        if (diff === 1) {
            // 入门: No remainder, small quotient
            b = rand(2, 5);
            const quotient = rand(11, 20);
            a = quotient * b;
            answer = quotient;
            problem = `${a} ÷ ${b}`;
            return { problem, answer, display: `${problem} = `, hasRemainder: false };
        } else if (diff === 2) {
            // 基础: Sometimes remainder
            b = rand(2, 9);
            const quotient = rand(11, 50);
            const remainder = Math.random() > 0.5 ? rand(1, b - 1) : 0;
            a = quotient * b + remainder;
            answer = remainder === 0 ? quotient : `${quotient}...${remainder}`;
            problem = `${a} ÷ ${b}`;
            return { problem, answer, display: `${problem} = `, hasRemainder: remainder > 0 };
        } else if (diff === 3) {
            // 进阶: Always remainder, larger quotient
            b = rand(3, 9);
            const quotient = rand(50, 99);
            const remainder = rand(1, b - 1);
            a = quotient * b + remainder;
            answer = `${quotient}...${remainder}`;
            problem = `${a} ÷ ${b}`;
            return { problem, answer, display: `${problem} = `, hasRemainder: true };
        } else {
            // 挑战: 3-digit ÷ 2-digit
            b = rand(11, 30);
            const quotient = rand(10, 50);
            const remainder = Math.random() > 0.3 ? rand(1, b - 1) : 0;
            a = quotient * b + remainder;
            answer = remainder === 0 ? quotient : `${quotient}...${remainder}`;
            problem = `${a} ÷ ${b}`;
            return { problem, answer, display: `${problem} = `, hasRemainder: remainder > 0 };
        }
    }

    if (type === "add_sub_large") {
        if (diff === 1) {
            // 入门: 3-digit, addition only
            a = rand(100, 500);
            b = rand(100, 400);
            answer = a + b;
            problem = `${a} + ${b}`;
        } else if (diff === 2) {
            // 基础: 3-4 digit, include subtraction
            op = Math.random() > 0.5 ? "+" : "-";
            a = rand(100, 2000);
            b = rand(100, 1500);
            if (op === "-" && a < b) [a, b] = [b, a];
            answer = op === "+" ? a + b : a - b;
            problem = `${a} ${op} ${b}`;
        } else if (diff === 3) {
            // 进阶: 4-digit, three terms
            a = rand(1000, 5000);
            b = rand(500, 3000);
            c = rand(200, 1500);
            if (a + b - c < 0) c = rand(100, Math.floor((a + b) / 2));
            answer = a + b - c;
            problem = `${a} + ${b} - ${c}`;
        } else {
            // 挑战: 4-5 digit, four terms
            a = rand(1000, 9999);
            b = rand(500, 5000);
            c = rand(200, 2000);
            d = rand(100, 1000);
            answer = a + b - c + d;
            problem = `${a} + ${b} - ${c} + ${d}`;
        }
        return { problem, answer, display: `${problem} = ` };
    }

    if (type === "frac_simple_add") {
        if (diff === 1) {
            // 入门: Small denominators (2-4), addition only
            const den = rand(2, 4);
            const n1 = rand(1, den - 1);
            const n2 = rand(1, den - n1);
            const [simpN, simpD] = simplifyFrac(n1 + n2, den);
            answer = simpD === 1 ? `${simpN}` : `${simpN}/${simpD}`;
            problem = `${fmtFrac(n1, den)} + ${fmtFrac(n2, den)}`;
        } else if (diff === 2) {
            // 基础: Larger denominators (2-8), addition only
            const den = rand(3, 8);
            const n1 = rand(1, den - 1);
            const n2 = rand(1, den - n1);
            const [simpN, simpD] = simplifyFrac(n1 + n2, den);
            answer = simpD === 1 ? `${simpN}` : `${simpN}/${simpD}`;
            problem = `${fmtFrac(n1, den)} + ${fmtFrac(n2, den)}`;
        } else if (diff === 3) {
            // 进阶: Include subtraction
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
            // 挑战: Three fractions, mixed operations
            const den = rand(4, 12);
            const n1 = rand(2, Math.floor(den / 2));
            const n2 = rand(1, Math.floor(den / 3));
            const n3 = rand(1, Math.floor(den / 4));
            const result = n1 + n2 - n3;
            const [simpN, simpD] = simplifyFrac(Math.abs(result), den);
            answer = result < 0 ? `-${simpN}/${simpD}` : (simpD === 1 ? `${simpN}` : `${simpN}/${simpD}`);
            problem = `${fmtFrac(n1, den)} + ${fmtFrac(n2, den)} - ${fmtFrac(n3, den)}`;
        }
        return { problem, answer, display: `${problem} = `, isFraction: true };
    }

    // --- Grade 4 ---
    if (type === "mul_big") {
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
        return { problem, answer, display: `${problem} = ` };
    }

    if (type === "mixed_bracket") {
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
            // Nested brackets
            a = rand(10, 30);
            b = rand(10, 30);
            c = rand(5, 20);
            d = rand(2, 5);
            answer = (a + b) * (c - d);
            problem = `(${a} + ${b}) × (${c} - ${d})`;
        }
        return { problem, answer, display: `${problem} = ` };
    }

    if (type === "calc_law") {
        if (diff === 1) {
            // Simple: 25 × 4
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
            // Complex: multiple strategies
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
        return { problem, answer, display: `${problem} = ` };
    }

    if (type === "decimal_add_sub") {
        const cfg = DIFF_CONFIG.decimal[diff];
        op = Math.random() > 0.5 ? "+" : "-";
        const factor = Math.pow(10, cfg.places);
        a = roundTo(rand(10, cfg.max) / factor, cfg.places);
        b = roundTo(rand(10, cfg.max) / factor, cfg.places);
        if (op === "-" && a < b) [a, b] = [b, a];
        answer = roundTo(op === "+" ? a + b : a - b, cfg.places);
        problem = `${a.toFixed(cfg.places)} ${op} ${b.toFixed(cfg.places)}`;
        return { problem, answer, display: `${problem} = ` };
    }

    // --- Grade 5 ---
    if (type === "decimal_mul_div") {
        const cfg = DIFF_CONFIG.decimal[diff];

        if (diff === 1) {
            // 入门: Decimal × whole number OR simple division, 1 decimal place
            const mode = rand(1, 3);
            if (mode === 1) {
                // Decimal × whole number
                a = roundTo(rand(11, 99) / 10, 1);
                b = rand(2, 9);
                answer = roundTo(a * b, 1);
                problem = `${a.toFixed(1)} × ${b}`;
            } else if (mode === 2) {
                // Whole number × decimal
                a = rand(2, 9);
                b = roundTo(rand(11, 99) / 10, 1);
                answer = roundTo(a * b, 1);
                problem = `${a} × ${b.toFixed(1)}`;
            } else {
                // Simple division: result is whole number
                b = rand(2, 9);
                c = rand(2, 9);
                a = roundTo(b * c / 10, 1);
                answer = c;
                problem = `${(a * 10).toFixed(0)} ÷ ${b}`;
            }
        } else if (diff === 2) {
            // 基础: Decimal × decimal, decimal ÷ whole, whole ÷ decimal
            const mode = rand(1, 4);
            if (mode === 1) {
                // Decimal × decimal (1 place each)
                a = roundTo(rand(11, 99) / 10, 1);
                b = roundTo(rand(11, 99) / 10, 1);
                answer = roundTo(a * b, 2);
                problem = `${a.toFixed(1)} × ${b.toFixed(1)}`;
            } else if (mode === 2) {
                // Decimal ÷ whole number
                b = rand(2, 9);
                c = roundTo(rand(11, 99) / 10, 1);
                a = roundTo(c * b, 1);
                answer = c;
                problem = `${a.toFixed(1)} ÷ ${b}`;
            } else if (mode === 3) {
                // Whole ÷ decimal (result is whole)
                a = rand(10, 50);
                b = roundTo(rand(2, 9) / 10 + rand(1, 9), 1);
                c = Math.floor(a / b);
                a = roundTo(c * b, 1);
                answer = c;
                problem = `${a.toFixed(1)} ÷ ${b.toFixed(1)}`;
            } else {
                // Multiply by 0.1, 0.01
                a = rand(10, 99);
                b = Math.random() > 0.5 ? 0.1 : 0.01;
                answer = roundTo(a * b, b === 0.1 ? 1 : 2);
                problem = `${a} × ${b}`;
            }
        } else if (diff === 3) {
            // 进阶: 2 decimal places, larger numbers, mixed operations
            const mode = rand(1, 5);
            if (mode === 1) {
                // Two decimals with 2 places each
                a = roundTo(rand(101, 999) / 100, 2);
                b = roundTo(rand(101, 999) / 100, 2);
                answer = roundTo(a * b, 4);
                problem = `${a.toFixed(2)} × ${b.toFixed(2)}`;
            } else if (mode === 2) {
                // Larger decimal ÷ smaller decimal
                b = roundTo(rand(11, 50) / 10, 1);
                c = roundTo(rand(11, 99) / 10, 1);
                a = roundTo(b * c, 2);
                answer = c;
                problem = `${a.toFixed(2)} ÷ ${b.toFixed(1)}`;
            } else if (mode === 3) {
                // Decimal × whole + decimal
                a = roundTo(rand(11, 50) / 10, 1);
                b = rand(3, 9);
                c = roundTo(rand(11, 50) / 10, 1);
                answer = roundTo(a * b + c, 2);
                problem = `${a.toFixed(1)} × ${b} + ${c.toFixed(1)}`;
            } else if (mode === 4) {
                // Division with carry: e.g., 7.2 ÷ 0.8
                b = roundTo(rand(2, 9) / 10, 1);
                c = rand(5, 15);
                a = roundTo(b * c, 1);
                answer = c;
                problem = `${a.toFixed(1)} ÷ ${b.toFixed(1)}`;
            } else {
                // Mixed: a × b ÷ c where result is clean
                a = roundTo(rand(11, 50) / 10, 1);
                b = rand(2, 6);
                c = rand(2, 5);
                const product = roundTo(a * b, 1);
                answer = roundTo(product / c, 2);
                problem = `${a.toFixed(1)} × ${b} ÷ ${c}`;
            }
        } else {
            // 挑战: 3 decimal places, chain operations, complex expressions
            const mode = rand(1, 6);
            if (mode === 1) {
                // Three decimal places multiplication
                a = roundTo(rand(1001, 9999) / 1000, 3);
                b = roundTo(rand(101, 999) / 100, 2);
                answer = roundTo(a * b, 5);
                problem = `${a.toFixed(3)} × ${b.toFixed(2)}`;
            } else if (mode === 2) {
                // Chain: a × b × c
                a = roundTo(rand(11, 50) / 10, 1);
                b = roundTo(rand(11, 30) / 10, 1);
                c = roundTo(rand(11, 20) / 10, 1);
                answer = roundTo(a * b * c, 3);
                problem = `${a.toFixed(1)} × ${b.toFixed(1)} × ${c.toFixed(1)}`;
            } else if (mode === 3) {
                // Mixed chain: a × b ÷ c × d
                a = roundTo(rand(11, 30) / 10, 1);
                b = rand(2, 6);
                c = rand(2, 4);
                d = roundTo(rand(11, 20) / 10, 1);
                answer = roundTo((a * b / c) * d, 3);
                problem = `${a.toFixed(1)} × ${b} ÷ ${c} × ${d.toFixed(1)}`;
            } else if (mode === 4) {
                // Brackets: (a + b) × c
                a = roundTo(rand(11, 50) / 10, 1);
                b = roundTo(rand(11, 50) / 10, 1);
                c = roundTo(rand(11, 30) / 10, 1);
                answer = roundTo((a + b) * c, 2);
                problem = `(${a.toFixed(1)} + ${b.toFixed(1)}) × ${c.toFixed(1)}`;
            } else if (mode === 5) {
                // Complex: a × b - c ÷ d
                a = roundTo(rand(11, 50) / 10, 1);
                b = roundTo(rand(11, 30) / 10, 1);
                const divisor = rand(2, 5);
                c = roundTo(divisor * rand(11, 30) / 10, 1);
                d = divisor;
                answer = roundTo(a * b - c / d, 2);
                problem = `${a.toFixed(1)} × ${b.toFixed(1)} - ${c.toFixed(1)} ÷ ${d}`;
            } else {
                // Powers of 10: a ÷ 0.001 or a × 0.001
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
        return { problem, answer, display: `${problem} = ` };
    }

    if (type === "equation_simple") {
        const cfg = DIFF_CONFIG.equation[diff];

        if (diff === 1) {
            // 入门: Simple ax = b (no constant term)
            const coef = rand(2, cfg.maxCoef);
            const x = rand(2, 10);
            const result = coef * x;
            answer = x;
            problem = `${coef}x = ${result}`;
        } else if (diff === 2) {
            // 基础: ax + b = c or ax - b = c
            const coef = rand(2, cfg.maxCoef);
            const x = rand(2, 12);
            const constant = rand(1, cfg.maxConst);
            op = Math.random() > 0.5 ? "+" : "-";
            const result = op === "+" ? coef * x + constant : coef * x - constant;
            answer = x;
            problem = `${coef}x ${op} ${constant} = ${result}`;
        } else if (diff === 3) {
            // 进阶: Larger numbers, may include negative solution
            const mode = rand(1, 3);
            if (mode === 1) {
                // ax + b = c with larger numbers
                const coef = rand(3, cfg.maxCoef);
                const x = rand(5, 20);
                const constant = rand(10, cfg.maxConst);
                const result = coef * x + constant;
                answer = x;
                problem = `${coef}x + ${constant} = ${result}`;
            } else if (mode === 2) {
                // a(x + b) = c
                const coef = rand(2, 6);
                const add = rand(2, 8);
                const x = rand(3, 15);
                const result = coef * (x + add);
                answer = x;
                problem = `${coef}(x + ${add}) = ${result}`;
            } else {
                // ax = b - c
                const coef = rand(2, cfg.maxCoef);
                const x = rand(3, 12);
                const b = coef * x + rand(10, 30);
                const c = b - coef * x;
                answer = x;
                problem = `${coef}x = ${b} - ${c}`;
            }
        } else {
            // 挑战: Complex equations, fractions, negative results possible
            const mode = rand(1, 4);
            if (mode === 1) {
                // Fractional coefficient: x/a = b
                const a = rand(2, 8);
                const b = rand(3, 12);
                answer = a * b;
                problem = `x ÷ ${a} = ${b}`;
            } else if (mode === 2) {
                // ax + bx = c (combine like terms)
                const coef1 = rand(2, 8);
                const coef2 = rand(2, 6);
                const x = rand(3, 10);
                const result = (coef1 + coef2) * x;
                answer = x;
                problem = `${coef1}x + ${coef2}x = ${result}`;
            } else if (mode === 3) {
                // 2(x - a) + b = c
                const coef = rand(2, 5);
                const sub = rand(2, 6);
                const add = rand(3, 10);
                const x = rand(sub + 2, 15);
                const result = coef * (x - sub) + add;
                answer = x;
                problem = `${coef}(x - ${sub}) + ${add} = ${result}`;
            } else {
                // x/a + b = c
                const a = rand(2, 5);
                const b = rand(2, 10);
                const x = rand(2, 8) * a;
                const result = x / a + b;
                answer = x;
                problem = `x ÷ ${a} + ${b} = ${result}`;
            }
        }
        return { problem, answer, display: problem, isEquation: true };
    }

    if (type === "frac_diff_add") {
        const cfg = DIFF_CONFIG.fraction[diff];

        if (diff === 1) {
            // 入门: Unit fractions with small denominators
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
            // 基础: Varied numerators, larger denominators
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
            // 进阶: Include subtraction
            let d1 = rand(3, cfg.maxDen);
            let d2 = rand(2, cfg.maxDen);
            while (d1 === d2) d2 = rand(2, cfg.maxDen);
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
            // 挑战: Three fractions with different denominators
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
        return { problem, answer, display: `${problem} = `, isFraction: true };
    }

    // --- Grade 6 ---
    if (type === "frac_mul_div") {
        const cfg = DIFF_CONFIG.fraction[diff];

        if (diff === 1) {
            // 入门: Simple multiplication with small fractions
            const n1 = rand(1, 3), d1 = rand(4, 6);
            const n2 = rand(1, 3), d2 = rand(4, 6);
            const resN = n1 * n2;
            const resD = d1 * d2;
            const [simpN, simpD] = simplifyFrac(resN, resD);
            answer = simpD === 1 ? `${simpN}` : `${simpN}/${simpD}`;
            problem = `${fmtFrac(n1, d1)} × ${fmtFrac(n2, d2)}`;
        } else if (diff === 2) {
            // 基础: Both multiplication and division
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
            // 进阶: Mixed numbers or fraction × whole number
            const mode = rand(1, 2);
            if (mode === 1) {
                // Fraction × whole number
                const n1 = rand(1, 5), d1 = rand(6, cfg.maxDen);
                const whole = rand(2, 6);
                const resN = n1 * whole;
                const [simpN, simpD] = simplifyFrac(resN, d1);
                answer = simpD === 1 ? `${simpN}` : `${simpN}/${simpD}`;
                problem = `${fmtFrac(n1, d1)} × ${whole}`;
            } else {
                // Whole number ÷ fraction
                const whole = rand(2, 6);
                const n2 = rand(1, 4), d2 = rand(5, 8);
                const resN = whole * d2;
                const resD = n2;
                const [simpN, simpD] = simplifyFrac(resN, resD);
                answer = simpD === 1 ? `${simpN}` : `${simpN}/${simpD}`;
                problem = `${whole} ÷ ${fmtFrac(n2, d2)}`;
            }
        } else {
            // 挑战: Chain operations or complex expressions
            const mode = rand(1, 3);
            if (mode === 1) {
                // Chain: a/b × c/d ÷ e/f
                const n1 = rand(1, 4), d1 = rand(5, 8);
                const n2 = rand(1, 3), d2 = rand(4, 6);
                const n3 = rand(1, 3), d3 = rand(4, 6);
                const resN = n1 * n2 * d3;
                const resD = d1 * d2 * n3;
                const [simpN, simpD] = simplifyFrac(resN, resD);
                answer = simpD === 1 ? `${simpN}` : `${simpN}/${simpD}`;
                problem = `${fmtFrac(n1, d1)} × ${fmtFrac(n2, d2)} ÷ ${fmtFrac(n3, d3)}`;
            } else if (mode === 2) {
                // (a/b + c/d) × e
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
                // a/b × c + d/e
                const n1 = rand(1, 4), d1 = rand(5, 8);
                const mult = rand(2, 4) * d1; // Ensure clean result
                const n2 = rand(1, 3), d2 = d1;
                const result1 = n1 * mult / d1;
                const [simpN, simpD] = simplifyFrac(result1 * d2 + n2, d2);
                answer = simpD === 1 ? `${simpN}` : `${simpN}/${simpD}`;
                problem = `${fmtFrac(n1, d1)} × ${mult} + ${fmtFrac(n2, d2)}`;
            }
        }
        return { problem, answer, display: `${problem} = `, isFraction: true };
    }

    if (type === "percent_calc") {
        if (diff === 1) {
            // 入门: Simple multiplication with round percentages
            a = rand(10, 100);
            const pct = rand(1, 9) * 10;
            answer = a * pct / 100;
            problem = `${a} × ${pct}%`;
        } else if (diff === 2) {
            // 基础: Find percentage of a number (various percentages)
            const mode = rand(1, 2);
            if (mode === 1) {
                a = rand(20, 200);
                const pct = rand(1, 19) * 5; // 5%, 10%, 15%, etc.
                answer = roundTo(a * pct / 100, 2);
                problem = `${a} × ${pct}%`;
            } else {
                // What is a% of b?
                a = rand(10, 50);
                b = rand(50, 200);
                answer = roundTo(a * b / 100, 2);
                problem = `${b}的${a}%是多少`;
            }
        } else if (diff === 3) {
            // 进阶: Discount calculations
            const mode = rand(1, 3);
            if (mode === 1) {
                // Original price after discount
                const original = rand(50, 200);
                const discount = rand(1, 4) * 10; // 10-40% off
                answer = original * (100 - discount) / 100;
                problem = `原价${original}元，打${(100 - discount) / 10}折后的价格`;
            } else if (mode === 2) {
                // Increase by percentage
                a = rand(50, 150);
                const increase = rand(1, 5) * 10;
                answer = a * (100 + increase) / 100;
                problem = `${a}增加${increase}%后是多少`;
            } else {
                // Find discount rate
                const original = rand(100, 200);
                const discount = rand(1, 4) * 10;
                const sale = original * (100 - discount) / 100;
                answer = discount;
                problem = `原价${original}元，现价${sale}元，打了几折`;
            }
        } else {
            // 挑战: Multi-step percentage problems
            const mode = rand(1, 3);
            if (mode === 1) {
                // Compound discount
                const original = rand(100, 300);
                const disc1 = rand(1, 3) * 10;
                const disc2 = rand(1, 2) * 10;
                answer = roundTo(original * (100 - disc1) / 100 * (100 - disc2) / 100, 2);
                problem = `${original}元先打${(100 - disc1) / 10}折，再打${(100 - disc2) / 10}折`;
            } else if (mode === 2) {
                // Find original from final
                const original = rand(50, 150);
                const pct = rand(2, 8) * 10;
                const final = original * pct / 100;
                answer = original;
                problem = `某数的${pct}%是${final}，求这个数`;
            } else {
                // Percentage change
                const before = rand(80, 150);
                const after = rand(100, 200);
                const change = roundTo((after - before) / before * 100, 1);
                answer = change;
                problem = `从${before}变到${after}，增加了百分之几`;
            }
        }
        return { problem, answer, display: `${problem} = ` };
    }

    if (type === "ratio_solve") {
        if (diff === 1) {
            // 入门: Simple x : a = b : c with whole number result
            c = rand(2, 6);
            b = rand(2, 6);
            a = c * rand(1, 5);
            answer = a * b / c;
            problem = `x : ${a} = ${b} : ${c}，求 x`;
        } else if (diff === 2) {
            // 基础: Various positions for unknown
            const mode = rand(1, 2);
            if (mode === 1) {
                // a : x = b : c
                c = rand(2, 6);
                b = rand(2, 8);
                a = rand(2, 10);
                answer = roundTo(a * c / b, 2);
                problem = `${a} : x = ${b} : ${c}，求 x`;
            } else {
                // x : a = b : c
                c = rand(2, 8);
                b = rand(2, 8);
                a = rand(2, 10);
                answer = roundTo(a * b / c, 2);
                problem = `x : ${a} = ${b} : ${c}，求 x`;
            }
        } else if (diff === 3) {
            // 进阶: Three-part ratios
            const mode = rand(1, 2);
            if (mode === 1) {
                // Split in ratio a:b, total is c
                a = rand(1, 4);
                b = rand(1, 4);
                const total = (a + b) * rand(5, 15);
                answer = `${total * a / (a + b)}和${total * b / (a + b)}`;
                problem = `把${total}按${a}:${b}分配`;
            } else {
                // If a:b = c:d, find missing
                a = rand(2, 6);
                b = rand(2, 6);
                c = a * rand(2, 5);
                answer = b * c / a;
                problem = `${a} : ${b} = ${c} : x，求 x`;
            }
        } else {
            // 挑战: Word problems and complex ratios
            const mode = rand(1, 3);
            if (mode === 1) {
                // Three-way ratio split
                a = rand(1, 3);
                b = rand(1, 3);
                c = rand(1, 3);
                const total = (a + b + c) * rand(6, 12);
                answer = `${total * a / (a + b + c)}, ${total * b / (a + b + c)}, ${total * c / (a + b + c)}`;
                problem = `把${total}按${a}:${b}:${c}分配`;
            } else if (mode === 2) {
                // Ratio with scaling
                a = rand(2, 5);
                b = rand(2, 5);
                const scale = rand(3, 8);
                answer = `${a * scale}:${b * scale}`;
                problem = `${a}:${b}放大${scale}倍后的比`;
            } else {
                // Find ratio from values
                const g = rand(2, 6);
                a = g * rand(2, 5);
                b = g * rand(2, 5);
                const [simpA, simpB] = [a / gcd(a, b), b / gcd(a, b)];
                answer = `${simpA}:${simpB}`;
                problem = `把${a}:${b}化成最简比`;
            }
        }
        return { problem, answer, display: problem, isEquation: true };
    }

    // --- Grade 7 ---
    if (type === "neg_add_sub") {
        const cfg = DIFF_CONFIG.negative[diff];

        if (diff === 1) {
            // 入门: Simple two-operand addition/subtraction, small range
            a = rand(1, cfg.range) * (Math.random() > 0.5 ? 1 : -1);
            b = rand(1, cfg.range) * (Math.random() > 0.5 ? 1 : -1);
            op = Math.random() > 0.5 ? "+" : "-";
            answer = op === "+" ? a + b : a - b;
            problem = `${p(a)} ${op} ${p(b)}`;
        } else if (diff === 2) {
            // 基础: Include absolute values, slightly larger range
            const mode = rand(1, 3);
            if (mode === 1) {
                // Regular addition/subtraction
                a = rand(1, cfg.range) * (Math.random() > 0.5 ? 1 : -1);
                b = rand(1, cfg.range) * (Math.random() > 0.5 ? 1 : -1);
                op = Math.random() > 0.5 ? "+" : "-";
                answer = op === "+" ? a + b : a - b;
                problem = `${p(a)} ${op} ${p(b)}`;
            } else if (mode === 2) {
                // With absolute value: |a| + b or |a| - b
                a = -rand(3, cfg.range);
                b = rand(1, cfg.range) * (Math.random() > 0.5 ? 1 : -1);
                op = Math.random() > 0.5 ? "+" : "-";
                answer = op === "+" ? Math.abs(a) + b : Math.abs(a) - b;
                problem = `|${a}| ${op} ${p(b)}`;
            } else {
                // Three operands: a + b + c
                a = rand(1, Math.floor(cfg.range / 2)) * (Math.random() > 0.5 ? 1 : -1);
                b = rand(1, Math.floor(cfg.range / 2)) * (Math.random() > 0.5 ? 1 : -1);
                c = rand(1, Math.floor(cfg.range / 2)) * (Math.random() > 0.5 ? 1 : -1);
                answer = a + b + c;
                problem = `${p(a)} + ${p(b)} + ${p(c)}`;
            }
        } else if (diff === 3) {
            // 进阶: Multi-operation chains (3+ terms), larger range
            const mode = rand(1, 4);
            if (mode === 1) {
                // Three-term chain: a + b - c
                a = rand(10, cfg.range) * (Math.random() > 0.5 ? 1 : -1);
                b = rand(5, cfg.range) * (Math.random() > 0.5 ? 1 : -1);
                c = rand(5, cfg.range) * (Math.random() > 0.5 ? 1 : -1);
                const op1 = Math.random() > 0.5 ? "+" : "-";
                const op2 = Math.random() > 0.5 ? "+" : "-";
                const val1 = op1 === "+" ? a + b : a - b;
                answer = op2 === "+" ? val1 + c : val1 - c;
                problem = `${p(a)} ${op1} ${p(b)} ${op2} ${p(c)}`;
            } else if (mode === 2) {
                // With multiple absolute values
                a = -rand(5, cfg.range);
                b = -rand(3, Math.floor(cfg.range / 2));
                c = rand(1, Math.floor(cfg.range / 2)) * (Math.random() > 0.5 ? 1 : -1);
                op = Math.random() > 0.5 ? "+" : "-";
                answer = op === "+" ? Math.abs(a) + Math.abs(b) + c : Math.abs(a) - Math.abs(b) + c;
                problem = op === "+" ? `|${a}| + |${b}| + ${p(c)}` : `|${a}| - |${b}| + ${p(c)}`;
            } else if (mode === 3) {
                // Four-term chain
                a = rand(5, Math.floor(cfg.range / 2)) * (Math.random() > 0.5 ? 1 : -1);
                b = rand(5, Math.floor(cfg.range / 2)) * (Math.random() > 0.5 ? 1 : -1);
                c = rand(3, Math.floor(cfg.range / 3)) * (Math.random() > 0.5 ? 1 : -1);
                d = rand(3, Math.floor(cfg.range / 3)) * (Math.random() > 0.5 ? 1 : -1);
                answer = a + b - c + d;
                problem = `${p(a)} + ${p(b)} - ${p(c)} + ${p(d)}`;
            } else {
                // Opposite number: a + (-a) + b
                a = rand(10, cfg.range) * (Math.random() > 0.5 ? 1 : -1);
                b = rand(5, Math.floor(cfg.range / 2)) * (Math.random() > 0.5 ? 1 : -1);
                answer = b; // a + (-a) = 0
                problem = `${p(a)} + ${p(-a)} + ${p(b)}`;
            }
        } else {
            // 挑战: Complex expressions with nested abs, fractions, 5+ terms
            const mode = rand(1, 5);
            if (mode === 1) {
                // Nested absolute value: ||a| - |b|| + c
                a = -rand(10, cfg.range);
                b = -rand(5, Math.floor(cfg.range / 2));
                c = rand(5, Math.floor(cfg.range / 2)) * (Math.random() > 0.5 ? 1 : -1);
                answer = Math.abs(Math.abs(a) - Math.abs(b)) + c;
                problem = `||${a}| - |${b}|| + ${p(c)}`;
            } else if (mode === 2) {
                // Five-term chain
                a = rand(10, Math.floor(cfg.range / 2)) * (Math.random() > 0.5 ? 1 : -1);
                b = rand(10, Math.floor(cfg.range / 2)) * (Math.random() > 0.5 ? 1 : -1);
                c = rand(5, Math.floor(cfg.range / 3)) * (Math.random() > 0.5 ? 1 : -1);
                d = rand(5, Math.floor(cfg.range / 3)) * (Math.random() > 0.5 ? 1 : -1);
                e = rand(5, Math.floor(cfg.range / 4)) * (Math.random() > 0.5 ? 1 : -1);
                answer = a - b + c - d + e;
                problem = `${p(a)} - ${p(b)} + ${p(c)} - ${p(d)} + ${p(e)}`;
            } else if (mode === 3) {
                // Mixed with absolute values in chain
                a = rand(20, cfg.range) * (Math.random() > 0.5 ? 1 : -1);
                b = -rand(10, Math.floor(cfg.range / 2));
                c = rand(10, Math.floor(cfg.range / 2)) * (Math.random() > 0.5 ? 1 : -1);
                d = -rand(5, Math.floor(cfg.range / 3));
                answer = a + Math.abs(b) - c + Math.abs(d);
                problem = `${p(a)} + |${b}| - ${p(c)} + |${d}|`;
            } else if (mode === 4) {
                // Negative fractions
                const n1 = rand(1, 5) * (Math.random() > 0.5 ? 1 : -1);
                const d1 = rand(2, 6);
                const n2 = rand(1, 5) * (Math.random() > 0.5 ? 1 : -1);
                const d2 = d1; // Same denominator for easier calculation
                const answerNum = n1 + n2;
                answer = answerNum % d1 === 0 ? `${answerNum / d1}` : `${answerNum}/${d1}`;
                const frac1 = n1 < 0 ? `(-${fmtFrac(Math.abs(n1), d1)})` : fmtFrac(n1, d1);
                const frac2 = n2 < 0 ? `(-${fmtFrac(Math.abs(n2), d2)})` : fmtFrac(n2, d2);
                problem = `${frac1} + ${frac2}`;
                return { problem, answer, display: `${problem} = `, isFraction: true };
            } else {
                // Complex: -(-a) + |b| - c
                a = rand(10, cfg.range);
                b = -rand(10, Math.floor(cfg.range / 2));
                c = rand(5, Math.floor(cfg.range / 2)) * (Math.random() > 0.5 ? 1 : -1);
                d = rand(5, Math.floor(cfg.range / 3)) * (Math.random() > 0.5 ? 1 : -1);
                answer = a + Math.abs(b) - c + d; // -(-a) = a
                problem = `-${p(-a)} + |${b}| - ${p(c)} + ${p(d)}`;
            }
        }
        return { problem, answer, display: `${problem} = ` };
    }

    if (type === "neg_mixed") {
        const cfg = DIFF_CONFIG.negative[diff];

        if (diff === 1) {
            // 入门: Simple multiplication or division with negatives
            const mode = rand(1, 2);
            if (mode === 1) {
                // (-a) × b
                a = -rand(2, 6);
                b = rand(2, 6);
                answer = a * b;
                problem = `${p(a)} × ${b}`;
            } else {
                // a ÷ (-b)
                b = rand(2, 6);
                a = b * rand(2, 6);
                answer = -a / b;
                problem = `${a} ÷ ${p(-b)}`;
            }
        } else if (diff === 2) {
            // 基础: Two operations, include powers of 2^2, 3^2
            const mode = rand(1, 3);
            if (mode === 1) {
                // (-a) × b + c
                a = -rand(2, 5);
                b = rand(2, 6);
                c = rand(1, 10);
                answer = a * b + c;
                problem = `${p(a)} × ${b} + ${c}`;
            } else if (mode === 2) {
                // a - (-b) × c
                a = rand(10, 30);
                b = -rand(2, 5);
                c = rand(2, 5);
                answer = a - b * c;
                problem = `${a} - ${p(b)} × ${c}`;
            } else {
                // (-2)² + a
                a = rand(5, 15);
                answer = 4 + a;
                problem = `(-2)² + ${a}`;
            }
        } else if (diff === 3) {
            // 进阶: Include powers, absolute values, three operations
            const mode = rand(1, 4);
            if (mode === 1) {
                // (-a) × b - c ÷ d
                a = -rand(2, 5);
                b = rand(2, 6);
                d = rand(2, 4);
                c = d * rand(2, 6);
                answer = a * b - c / d;
                problem = `${p(a)} × ${b} - ${c} ÷ ${d}`;
            } else if (mode === 2) {
                // -2³ + (-a) × (-b)
                a = rand(2, 5);
                b = rand(2, 5);
                answer = -8 + a * b;
                problem = `-2³ + ${p(-a)} × ${p(-b)}`;
            } else if (mode === 3) {
                // |a| - (-b) × c
                a = -rand(5, 15);
                b = -rand(2, 4);
                c = rand(2, 5);
                answer = Math.abs(a) - b * c;
                problem = `|${a}| - ${p(b)} × ${c}`;
            } else {
                // (a + b) × (-c)
                a = rand(3, 8);
                b = rand(2, 6);
                c = -rand(2, 5);
                answer = (a + b) * c;
                problem = `(${a} + ${b}) × ${p(c)}`;
            }
        } else {
            // 挑战: Complex with brackets, powers, multiple operations
            const mode = rand(1, 5);
            if (mode === 1) {
                // (-1)³ × a - (-b)² ÷ c
                a = rand(3, 10);
                b = rand(2, 4);
                c = rand(1, 2);
                const bSquared = b * b;
                answer = -1 * a - bSquared / c;
                problem = `(-1)³ × ${a} - ${p(-b)}² ÷ ${c * c === bSquared ? c : 1}`;
            } else if (mode === 2) {
                // [a - (-b)] × (-c) + d
                a = rand(5, 15);
                b = -rand(3, 8);
                c = -rand(2, 4);
                d = rand(10, 30);
                answer = (a - b) * c + d;
                problem = `[${a} - ${p(b)}] × ${p(c)} + ${d}`;
            } else if (mode === 3) {
                // |-a| × |b| - (-c)^2
                a = -rand(3, 8);
                b = -rand(2, 6);
                c = rand(2, 4);
                answer = Math.abs(a) * Math.abs(b) - c * c;
                problem = `|${a}| × |${b}| - ${p(-c)}²`;
            } else if (mode === 4) {
                // a ÷ (-b) + c × (-d) - e
                b = rand(2, 5);
                a = b * rand(3, 8);
                c = rand(2, 5);
                d = rand(2, 4);
                e = rand(5, 15);
                answer = a / (-b) + c * (-d) - e;
                problem = `${a} ÷ ${p(-b)} + ${c} × ${p(-d)} - ${e}`;
            } else {
                // (-a) × [b + (-c) × d]
                a = rand(2, 4);
                b = rand(10, 20);
                c = rand(2, 4);
                d = rand(2, 3);
                answer = (-a) * (b + (-c) * d);
                problem = `${p(-a)} × [${b} + ${p(-c)} × ${d}]`;
            }
        }
        return { problem, answer, display: `${problem} = ` };
    }

    if (type === "poly_add_sub") {
        if (diff === 1) {
            // 入门: Simple 2-term combination
            const c1 = rand(2, 6), c2 = rand(1, 4);
            const c3 = rand(1, c1);
            answer = `${c1 + c2}a`;
            problem = `${c1}a + ${c2}a`;
        } else if (diff === 2) {
            // 基础: 3-term with subtraction
            const c1 = rand(3, 9), c2 = rand(2, 8), c3 = rand(1, c1);
            answer = `${c1 - c3}a + ${c2}b`;
            problem = `${c1}a - ${c3}a + ${c2}b`;
        } else if (diff === 3) {
            // 进阶: 4-term with two variables
            const c1 = rand(3, 9), c2 = rand(2, 9), c3 = rand(1, c1), c4 = rand(1, c2);
            const aCoef = c1 - c3;
            const bCoef = c2 - c4;
            answer = aCoef === 0 ? `${bCoef}b` : (bCoef === 0 ? `${aCoef}a` : `${aCoef}a + ${bCoef}b`);
            problem = `${c1}a + ${c2}b - ${c3}a - ${c4}b`;
        } else {
            // 挑战: Multi-variable with coefficients, include x² terms
            const mode = rand(1, 2);
            if (mode === 1) {
                const c1 = rand(2, 8), c2 = rand(2, 8), c3 = rand(1, 6), c4 = rand(1, 6);
                const aCoef = c1 - c3;
                const bCoef = c2 - c4;
                answer = `${aCoef}x + ${bCoef}y`;
                problem = `${c1}x + ${c2}y - ${c3}x - ${c4}y`;
            } else {
                // With squared terms
                const c1 = rand(2, 6), c2 = rand(1, 5), c3 = rand(1, c1);
                const x2Coef = c1 - c3;
                answer = `${x2Coef}x² + ${c2}x`;
                problem = `${c1}x² + ${c2}x - ${c3}x²`;
            }
        }
        return { problem, answer, display: `${problem} = `, isAlgebraic: true };
    }

    if (type === "eq_linear") {
        const cfg = DIFF_CONFIG.equation[diff];

        if (diff === 1) {
            // 入门: Simple ax = b or x + a = b
            const mode = rand(1, 2);
            if (mode === 1) {
                const coef = rand(2, 5);
                const x = rand(2, 10);
                answer = x;
                problem = `${coef}x = ${coef * x}`;
            } else {
                const a = rand(3, 15);
                const x = rand(2, 12);
                answer = x;
                problem = `x + ${a} = ${x + a}`;
            }
        } else if (diff === 2) {
            // 基础: a(x + b) = c or ax - b = c
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
            // 进阶: ax + b = cx + d (x on both sides)
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
                // a(x - b) = c(x - d)
                const coef1 = rand(2, 5);
                const coef2 = rand(2, 4);
                const x = rand(5, 12);
                const sub1 = rand(1, 4);
                const result = coef1 * (x - sub1);
                answer = x;
                problem = `${coef1}(x - ${sub1}) = ${result}`;
            }
        } else {
            // 挑战: Complex with fractions or decimals
            const mode = rand(1, 3);
            if (mode === 1) {
                // x/a + x/b = c
                const a = rand(2, 4);
                const b = rand(2, 4);
                const x = a * b * rand(1, 3);
                const result = x / a + x / b;
                answer = x;
                problem = `x/${a} + x/${b} = ${result}`;
            } else if (mode === 2) {
                // (x - a)/b = c
                const b = rand(2, 5);
                const c = rand(2, 8);
                const a = rand(1, 10);
                const x = b * c + a;
                answer = x;
                problem = `(x - ${a}) ÷ ${b} = ${c}`;
            } else {
                // ax + b = cx - d
                const coef1 = rand(4, 10);
                const coef2 = rand(2, coef1 - 1);
                const x = rand(3, 10);
                const const1 = rand(5, 20);
                const const2 = (coef1 - coef2) * x + const1;
                answer = x;
                problem = `${coef1}x + ${const1} = ${coef2}x + ${const2}`;
            }
        }
        return { problem, answer, display: problem, isEquation: true };
    }

    if (type === "sqrt_calc") {
        const bases = [2, 3, 5, 6, 7];

        if (diff === 1) {
            // 入门: Simplify single radical
            const base = randChoice([2, 3, 5]);
            const mult = randChoice([4, 9, 16]);
            const coef = Math.sqrt(mult);
            answer = `${coef}√${base}`;
            problem = `√${base * mult}`;
        } else if (diff === 2) {
            // 基础: Add/subtract like radicals
            const base = randChoice(bases);
            const c1 = rand(2, 5);
            const c2 = rand(1, 4);
            answer = `${c1 + c2}√${base}`;
            problem = `${c1}√${base} + ${c2}√${base}`;
        } else if (diff === 3) {
            // 进阶: Simplify then combine
            const base = randChoice([2, 3, 5]);
            // √(4n) + √(9n) - √n = 2√n + 3√n - √n = 4√n
            answer = `4√${base}`;
            problem = `√${base * 4} + √${base * 9} - √${base}`;
        } else {
            // 挑战: Complex radical expressions
            const mode = rand(1, 3);
            if (mode === 1) {
                // √12 + √27 - √3 = 2√3 + 3√3 - √3 = 4√3
                answer = `4√3`;
                problem = `√12 + √27 - √3`;
            } else if (mode === 2) {
                // √8 × √2
                answer = `4`;
                problem = `√8 × √2`;
            } else {
                // 2√18 - 3√8 + √50
                // = 6√2 - 6√2 + 5√2 = 5√2
                answer = `5√2`;
                problem = `2√18 - 3√8 + √50`;
            }
        }
        return { problem, answer, display: `${problem} = `, isAlgebraic: true };
    }

    if (type === "poly_mul") {
        if (diff === 1) {
            // 入门: (x + a)(x + b) with small positive numbers
            a = rand(1, 4);
            b = rand(1, 4);
            answer = `x² + ${a + b}x + ${a * b}`;
            problem = `(x + ${a})(x + ${b})`;
        } else if (diff === 2) {
            // 基础: Include negative numbers
            a = rand(1, 5);
            b = rand(1, 5);
            const mode = rand(1, 2);
            if (mode === 1) {
                // (x + a)(x - b)
                answer = a === b ? `x² - ${a * b}` : `x² + ${a - b}x - ${a * b}`;
                problem = `(x + ${a})(x - ${b})`;
            } else {
                // (x - a)(x - b)
                answer = `x² - ${a + b}x + ${a * b}`;
                problem = `(x - ${a})(x - ${b})`;
            }
        } else if (diff === 3) {
            // 进阶: Perfect square or difference of squares
            const mode = rand(1, 3);
            if (mode === 1) {
                // (a + b)²
                a = rand(1, 5);
                answer = `a² + ${2 * a}a + ${a * a}`;
                problem = `(a + ${a})²`;
            } else if (mode === 2) {
                // (a - b)(a + b) = a² - b²
                a = rand(1, 5);
                answer = `a² - ${a * a}`;
                problem = `(a - ${a})(a + ${a})`;
            } else {
                // (2x + a)(x + b)
                a = rand(1, 4);
                b = rand(1, 4);
                answer = `2x² + ${2 * b + a}x + ${a * b}`;
                problem = `(2x + ${a})(x + ${b})`;
            }
        } else {
            // 挑战: Complex polynomial multiplication
            const mode = rand(1, 3);
            if (mode === 1) {
                // (ax + b)(cx + d)
                a = rand(2, 3);
                b = rand(1, 4);
                c = rand(2, 3);
                d = rand(1, 4);
                answer = `${a * c}x² + ${a * d + b * c}x + ${b * d}`;
                problem = `(${a}x + ${b})(${c}x + ${d})`;
            } else if (mode === 2) {
                // (a + b)³ type expansion (first two terms)
                a = rand(1, 3);
                answer = `x³ + ${3 * a}x² + ${3 * a * a}x + ${a * a * a}`;
                problem = `(x + ${a})³`;
            } else {
                // (2a - 3b)(2a + 3b)
                a = rand(1, 3);
                b = rand(1, 3);
                answer = `4a² - ${9 * b * b}b²`;
                problem = `(2a - ${3 * b}b)(2a + ${3 * b}b)`;
            }
        }
        return { problem, answer, display: `${problem} = `, isAlgebraic: true };
    }

    if (type === "frac_algebra") {
        if (diff === 1) {
            // 入门: Simple fraction simplification
            a = rand(2, 5);
            answer = `${a}x`;
            problem = `${fmtFrac(`${a}x²`, "x")}`;
        } else if (diff === 2) {
            // 基础: Fraction multiplication
            a = rand(2, 4);
            b = rand(2, 4);
            answer = `${a}/${b}`;
            problem = `${fmtFrac("a", `${b}`)} × ${fmtFrac(`${a}`, "a")}`;
        } else if (diff === 3) {
            // 进阶: Fraction division
            answer = `b/a`;
            problem = `${fmtFrac("a", "b")} ÷ ${fmtFrac("a²", "b²")}`;
        } else {
            // 挑战: Complex algebraic fraction expressions
            const mode = rand(1, 3);
            if (mode === 1) {
                // (a/b + c/d) simplification
                answer = `(a+b)/(ab)`;
                problem = `${fmtFrac("1", "a")} + ${fmtFrac("1", "b")}`;
            } else if (mode === 2) {
                // Factoring and canceling
                answer = `x+1`;
                problem = `${fmtFrac("x²-1", "x-1")}`;
            } else {
                // Complex division
                answer = `b²/a²`;
                problem = `${fmtFrac("a", "b")} ÷ ${fmtFrac("a³", "b³")}`;
            }
        }
        return { problem, answer, display: `${problem} = `, isAlgebraic: true };
    }

    // Fallback
    a = rand(10, 100);
    b = rand(10, 100);
    answer = a + b;
    problem = `${a} + ${b}`;
    return { problem, answer, display: `${problem} = ` };
}

// === 5. UI Functions ===
function updateTypes() {
    const grade = document.getElementById('gradeSelect').value;
    const typeSelect = document.getElementById('typeSelect');
    typeSelect.innerHTML = "";

    curriculum[grade].forEach(type => {
        const option = document.createElement("option");
        option.value = type.id;
        option.text = type.name;
        typeSelect.add(option);
    });
}

function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);

    const btn = document.getElementById('themeToggle');
    btn.textContent = next === 'dark' ? '☀️' : '🌙';
}

function toggleInteractiveMode() {
    state.isInteractiveMode = !state.isInteractiveMode;
    const toggle = document.getElementById('interactiveToggle');
    toggle.classList.toggle('active', state.isInteractiveMode);

    const statsPanel = document.getElementById('statsPanel');
    statsPanel.classList.toggle('visible', state.isInteractiveMode);

    if (state.currentProblems.length > 0) {
        renderProblems();
    }
}

function toggleAnswers() {
    state.showAnswers = !state.showAnswers;
    const toggle = document.getElementById('answerToggle');
    toggle.classList.toggle('active', state.showAnswers);

    document.querySelectorAll('.answer-display').forEach(el => {
        el.classList.toggle('visible', state.showAnswers);
        el.classList.toggle('hide-print', !state.showAnswers);
    });
}

function toggleTimer() {
    const container = document.getElementById('timerContainer');
    container.classList.toggle('visible');

    if (!container.classList.contains('visible')) {
        stopTimer();
    }
}

function startTimer() {
    if (state.timerInterval) return;

    const minutes = parseInt(document.getElementById('timerMinutes').value) || 10;
    state.timerSeconds = minutes * 60;
    updateTimerDisplay();

    state.timerInterval = setInterval(() => {
        state.timerSeconds--;
        updateTimerDisplay();

        if (state.timerSeconds <= 60) {
            document.getElementById('timerDisplay').classList.add('warning');
        }

        if (state.timerSeconds <= 0) {
            stopTimer();
            alert('时间到！');
        }
    }, 1000);
}

function stopTimer() {
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
    }
    document.getElementById('timerDisplay').classList.remove('warning');
}

function resetTimer() {
    stopTimer();
    const minutes = parseInt(document.getElementById('timerMinutes').value) || 10;
    state.timerSeconds = minutes * 60;
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const minutes = Math.floor(state.timerSeconds / 60);
    const seconds = state.timerSeconds % 60;
    document.getElementById('timerDisplay').textContent =
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function resetScore() {
    state.score = { correct: 0, incorrect: 0, total: 0 };
    updateScoreDisplay();
}

function updateScoreDisplay() {
    document.getElementById('correctCount').textContent = state.score.correct;
    document.getElementById('incorrectCount').textContent = state.score.incorrect;
    document.getElementById('totalCount').textContent = state.score.total;

    const accuracy = state.score.total > 0
        ? Math.round((state.score.correct / state.score.total) * 100)
        : 0;
    document.getElementById('accuracyRate').textContent = accuracy + '%';
}

function checkAnswer(index, input) {
    const problem = state.currentProblems[index];
    const userAnswer = input.value.trim();
    const feedback = input.nextElementSibling;

    if (!userAnswer) {
        input.className = 'answer-input';
        feedback.className = 'answer-feedback';
        return;
    }

    // Normalize answers for comparison
    const normalize = (str) => String(str).replace(/\s+/g, '').toLowerCase();
    const isCorrect = normalize(userAnswer) === normalize(problem.answer);

    if (!state.answers[index]) {
        state.answers[index] = true;
        state.score.total++;
        if (isCorrect) {
            state.score.correct++;
        } else {
            state.score.incorrect++;
        }
        updateScoreDisplay();
    }

    input.className = `answer-input ${isCorrect ? 'correct' : 'incorrect'}`;
    feedback.textContent = isCorrect ? '✓' : '✗';
    feedback.className = `answer-feedback visible ${isCorrect ? 'correct' : 'incorrect'}`;
}

// === 6. Problem Generation ===
function generateSheet() {
    const grade = document.getElementById('gradeSelect').value;
    const type = document.getElementById('typeSelect').value;
    const diff = parseInt(document.getElementById('diffSelect').value);
    const count = parseInt(document.getElementById('countSelect').value);

    // Reset state
    state.currentProblems = [];
    state.answers = {};
    state.generatedSet.clear();
    resetScore();

    // Generate unique problems
    const maxAttempts = count * 3;
    let attempts = 0;

    while (state.currentProblems.length < count && attempts < maxAttempts) {
        const problem = createProblem(type, diff);
        const key = problem.problem;

        if (!state.generatedSet.has(key)) {
            state.generatedSet.add(key);
            state.currentProblems.push(problem);
        }
        attempts++;
    }

    // Fill remaining if needed
    while (state.currentProblems.length < count) {
        state.currentProblems.push(createProblem(type, diff));
    }

    // Update title
    const typeText = document.getElementById('typeSelect').selectedOptions[0].text;
    const gradeNames = ["", "一", "二", "三", "四", "五", "六", "七", "八"];
    const level = parseInt(grade) >= 7 ? '初中' : '小学';
    document.getElementById('sheetTitle').textContent =
        `${level}${gradeNames[grade]}年级 - ${typeText}`;

    renderProblems();

    // Save configuration
    saveConfig();
}

function renderProblems() {
    const container = document.getElementById('qContainer');
    container.innerHTML = "";

    state.currentProblems.forEach((problem, index) => {
        const div = document.createElement("div");
        div.className = "question-item";
        div.style.animationDelay = `${index * 0.02}s`;

        let content = `<span class="q-num">${index + 1}.</span><span class="q-content">${problem.display}`;

        if (state.isInteractiveMode) {
            content += `<input type="text" class="answer-input" onchange="checkAnswer(${index}, this)" onkeyup="if(event.key==='Enter')checkAnswer(${index}, this)">`;
            content += `<span class="answer-feedback"></span>`;
        }

        content += `<span class="answer-display ${state.showAnswers ? 'visible' : ''} ${state.showAnswers ? '' : 'hide-print'}">${problem.answer}</span>`;
        content += `</span>`;

        div.innerHTML = content;
        container.appendChild(div);
    });
}

// === 7. Save/Load Functions ===
function saveConfig() {
    const config = {
        grade: document.getElementById('gradeSelect').value,
        type: document.getElementById('typeSelect').value,
        diff: document.getElementById('diffSelect').value,
        count: document.getElementById('countSelect').value,
        theme: document.documentElement.getAttribute('data-theme')
    };
    localStorage.setItem('mathGenConfig', JSON.stringify(config));
}

function loadConfig() {
    const saved = localStorage.getItem('mathGenConfig');
    if (saved) {
        const config = JSON.parse(saved);
        document.getElementById('gradeSelect').value = config.grade || '1';
        updateTypes();
        document.getElementById('typeSelect').value = config.type || curriculum[config.grade || '1'][0].id;
        document.getElementById('diffSelect').value = config.diff || '2';
        document.getElementById('countSelect').value = config.count || '20';
    }

    // Load theme
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    document.getElementById('themeToggle').textContent = theme === 'dark' ? '☀️' : '🌙';
}

function saveWorksheet() {
    const data = {
        problems: state.currentProblems,
        config: {
            grade: document.getElementById('gradeSelect').value,
            type: document.getElementById('typeSelect').value,
            diff: document.getElementById('diffSelect').value,
            count: document.getElementById('countSelect').value,
            title: document.getElementById('sheetTitle').textContent
        },
        timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `数学练习_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function loadWorksheet(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            state.currentProblems = data.problems;
            state.answers = {};
            resetScore();

            document.getElementById('gradeSelect').value = data.config.grade;
            updateTypes();
            document.getElementById('typeSelect').value = data.config.type;
            document.getElementById('diffSelect').value = data.config.diff;
            document.getElementById('countSelect').value = data.config.count;
            document.getElementById('sheetTitle').textContent = data.config.title;

            renderProblems();
        } catch (err) {
            alert('文件格式错误！');
        }
    };
    reader.readAsText(file);
}

// === 8. Profile UI Functions ===

// Render profile selector dropdown
function renderProfileSelector() {
    const selector = document.getElementById('profileSelector');
    if (!selector) return;

    selector.innerHTML = '<option value="">选择用户...</option>';
    profileState.profiles.forEach(profile => {
        const option = document.createElement('option');
        option.value = profile.id;
        option.textContent = profile.name;
        if (profile.id === profileState.currentProfileId) {
            option.selected = true;
        }
        selector.appendChild(option);
    });
}

// Render profile list in modal
function renderProfileList() {
    const container = document.getElementById('profileList');
    if (!container) return;

    if (profileState.profiles.length === 0) {
        container.innerHTML = '<div class="profile-empty">暂无用户，请添加新用户</div>';
        return;
    }

    container.innerHTML = profileState.profiles.map(profile => `
        <div class="profile-item ${profile.id === profileState.currentProfileId ? 'active' : ''}">
            <div class="profile-info">
                <div class="profile-name">${profile.name}</div>
                <div class="profile-email">${profile.email || '未设置邮箱'}</div>
                <div class="profile-stats">练习次数: ${profile.history ? profile.history.length : 0}</div>
            </div>
            <div class="profile-actions">
                <button class="btn-small btn-primary" onclick="selectProfile('${profile.id}'); closeProfileModal();">选择</button>
                <button class="btn-small btn-danger" onclick="deleteProfile('${profile.id}')">删除</button>
            </div>
        </div>
    `).join('');
}

// Show profile modal
function showProfileModal() {
    let modal = document.getElementById('profileModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'profileModal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-container">
                <div class="modal-header">
                    <h3>👤 用户管理</h3>
                    <button class="modal-close" onclick="closeProfileModal()">×</button>
                </div>
                <div class="modal-body">
                    <div class="profile-form">
                        <h4>添加新用户</h4>
                        <div class="form-group">
                            <label>名称 *</label>
                            <input type="text" id="newProfileName" placeholder="请输入用户名称">
                        </div>
                        <div class="form-group">
                            <label>邮箱</label>
                            <input type="email" id="newProfileEmail" placeholder="请输入邮箱（可选）">
                        </div>
                        <button class="btn-success" onclick="addProfileFromForm()">添加用户</button>
                    </div>
                    <div class="profile-list-section">
                        <h4>已有用户</h4>
                        <div id="profileList" class="profile-list"></div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    renderProfileList();
    modal.classList.add('visible');
}

// Close profile modal
function closeProfileModal() {
    const modal = document.getElementById('profileModal');
    if (modal) {
        modal.classList.remove('visible');
    }
}

// Add profile from form
function addProfileFromForm() {
    const nameInput = document.getElementById('newProfileName');
    const emailInput = document.getElementById('newProfileEmail');

    if (addProfile(nameInput.value, emailInput.value)) {
        nameInput.value = '';
        emailInput.value = '';
    }
}

// Show history modal
function showHistoryModal() {
    const profile = getCurrentProfile();
    if (!profile) {
        alert('请先选择用户才能查看练习记录');
        return;
    }

    let modal = document.getElementById('historyModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'historyModal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-container modal-large">
                <div class="modal-header">
                    <h3>📊 练习记录</h3>
                    <button class="modal-close" onclick="closeHistoryModal()">×</button>
                </div>
                <div class="modal-body">
                    <div class="history-info">
                        <span id="historyProfileName"></span>
                        <button class="btn-small btn-warning" onclick="clearHistory()">清空记录</button>
                    </div>
                    <div id="historyTableContainer" class="history-table-container"></div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    document.getElementById('historyProfileName').textContent = `用户: ${profile.name}`;
    renderHistoryTable();
    modal.classList.add('visible');
}

// Close history modal
function closeHistoryModal() {
    const modal = document.getElementById('historyModal');
    if (modal) {
        modal.classList.remove('visible');
    }
}

// Render history table
function renderHistoryTable() {
    const container = document.getElementById('historyTableContainer');
    if (!container) return;

    const history = getWorkHistory();

    if (history.length === 0) {
        container.innerHTML = '<div class="history-empty">暂无练习记录</div>';
        return;
    }

    // Sort by datetime descending (newest first)
    const sorted = [...history].sort((a, b) => new Date(b.datetime) - new Date(a.datetime));

    container.innerHTML = `
        <table class="history-table">
            <thead>
                <tr>
                    <th>日期时间</th>
                    <th>年级</th>
                    <th>题型</th>
                    <th>难度</th>
                    <th>用时</th>
                    <th>成绩</th>
                </tr>
            </thead>
            <tbody>
                ${sorted.map(entry => {
        const date = new Date(entry.datetime);
        const dateStr = date.toLocaleDateString('zh-CN');
        const timeStr = date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        const duration = formatDuration(entry.timeUsedSeconds);
        const accuracy = entry.total > 0 ? Math.round((entry.correct / entry.total) * 100) : 0;
        const gradeNames = { 1: '一年级', 2: '二年级', 3: '三年级', 4: '四年级', 5: '五年级', 6: '六年级', 7: '七年级', 8: '八年级' };

        return `
                        <tr>
                            <td>${dateStr} ${timeStr}</td>
                            <td>${gradeNames[entry.grade] || entry.grade}</td>
                            <td>${entry.curriculumTitle}</td>
                            <td>${entry.difficultyLabel}</td>
                            <td>${duration}</td>
                            <td class="${accuracy >= 80 ? 'good' : accuracy >= 60 ? 'ok' : 'poor'}">${entry.correct}/${entry.total} (${accuracy}%)</td>
                        </tr>
                    `;
    }).join('')}
            </tbody>
        </table>
    `;
}

// Format duration in seconds to mm:ss
function formatDuration(seconds) {
    if (!seconds || seconds === 0) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}分${secs.toString().padStart(2, '0')}秒`;
}

// Submit worksheet results and save to history
function submitWorksheet() {
    if (!state.isInteractiveMode) {
        alert('请先开启互动模式');
        return;
    }

    const profile = getCurrentProfile();
    if (!profile) {
        if (confirm('未选择用户，练习记录将不会保存。是否继续提交？')) {
            return;
        }
    }

    // Record work history
    recordWorkHistory();

    // Show completion message
    const accuracy = state.score.total > 0 ? Math.round((state.score.correct / state.score.total) * 100) : 0;
    let message = `练习完成！\n\n正确: ${state.score.correct}\n错误: ${state.score.incorrect}\n正确率: ${accuracy}%`;

    if (profile) {
        message += '\n\n练习记录已保存。';
    }

    alert(message);
}

// === 9. Initialization ===
window.onload = function () {
    loadConfig();
    loadProfiles();
    updateTypes();
    generateSheet();
    updateTimerDisplay();
    renderProfileSelector();
    updateProfileDisplay();

    // Track worksheet start time
    state.worksheetStartTime = Date.now();
};
