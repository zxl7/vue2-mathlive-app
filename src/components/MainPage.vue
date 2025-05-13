<template>
  <div class="main-page">
    <h1>Vue2 MathLive 动态公式计算器</h1>
    <div class="content-wrapper">
      <!-- 编辑器区域：包含公式编辑器和LaTeX/MathJSON显示 -->
      <div class="editor-section">
        <h2>公式编辑区</h2>
        <!-- FormulaEditor组件用于数学公式输入，使用v-model实现LaTeX的双向绑定 -->
        <FormulaEditor v-model="currentLatexFormula" @formula-updated="handleFormulaDetailsUpdate" />
        <button @click="setInitialFormula">设置初始公式 (测试响应式)</button>
        <!-- 当前LaTeX公式显示区域(通过v-model绑定) -->
        <div class="output-display">
          <strong>LaTeX (v-model):</strong>
          {{ currentLatexFormula }}
        </div>
        <!-- 当前公式的MathJSON表示显示区域 -->
        <div class="output-display">
          <strong>MathJSON:</strong>
          <!-- 使用计算属性格式化显示MathJSON对象 -->
          {{ currentMathJsonFormulaDisplay }}
        </div>
      </div>
      <!-- 控制区域：管理变量、触发计算并显示结果 -->
      <div class="controls-section">
        <!-- VariableManager组件用于定义和更新变量，会触发'variables-updated'事件 -->
        <VariableManager @variables-updated="handleVariablesUpdate" />
        <!-- 触发公式计算的按钮 -->
        <button @click="performCalculation">执行计算</button>
        <!-- CalculationDisplay组件用于显示计算结果或错误信息 -->
        <CalculationDisplay :result="calculationResult" :error="calculationError" />
      </div>
    </div>
  </div>
</template>

<script>
// 导入必要的子组件和ComputeEngine库
import FormulaEditor from "./FormulaEditor.vue"
import VariableManager from "./VariableManager.vue"
import CalculationDisplay from "./CalculationDisplay.vue"
import { ComputeEngine } from "@cortex-js/compute-engine"

export default {
  name: "MainPage",
  components: {
    FormulaEditor,
    VariableManager,
    CalculationDisplay,
  },
  data() {
    // 组件的响应式数据属性
    return {
      currentLatexFormula: "", // 存储LaTeX字符串，现在与FormulaEditor双向绑定
      currentMathJsonFormula: null, // 存储来自编辑器的MathJSON对象
      currentExpression: null, // 直接存储来自MathLive的Compute Engine封装表达式
      definedVariables: [], // 存储用户定义变量的数组(例如：[{ name: 'x', value: 10 }])
      calculationResult: null, // 存储计算结果的字符串表示
      calculationError: null, // 存储计算过程中发生的任何错误信息
      computeEngine: null, // Compute Engine实例
    }
  },
  computed: {
    // 计算属性，用于以可读格式显示MathJSON
    currentMathJsonFormulaDisplay() {
      // 使用2个空格缩进格式化MathJSON对象以便美观显示
      return this.currentMathJsonFormula ? JSON.stringify(this.currentMathJsonFormula, null, 2) : ""
    },
  },
  created() {
    // 组件实例创建时调用的生命周期钩子
    // 初始化一个新的Compute Engine实例
    this.computeEngine = new ComputeEngine()
    // 定义可能在公式中使用的常用函数或常量
    // 这有助于防止常见数学函数出现'invalid-identifier'错误，特别是那些非内置或需要特定大小写的函数
    // this.computeEngine.defineSymbol("sin", { domain: "Functions", evaluate: (ops) => this.computeEngine.box(["Sin", ops[0]]) })
    this.computeEngine.defineSymbol("cos", { domain: "Functions", evaluate: (ops) => this.computeEngine.box(["Cos", ops[0]]) })
    this.computeEngine.defineSymbol("tan", { domain: "Functions", evaluate: (ops) => this.computeEngine.box(["Tan", ops[0]]) })
    this.computeEngine.defineSymbol("ln", { domain: "Functions", evaluate: (ops) => this.computeEngine.box(["Log", ops[0]]) }) // Natural log
    this.computeEngine.defineSymbol("log", { domain: "Functions", evaluate: (ops) => this.computeEngine.box(["Log", ops[0], this.computeEngine.box(10)]) }) // Base 10 log
    this.computeEngine.defineSymbol("pi", { domain: "RealNumbers", value: Math.PI })
    this.computeEngine.defineSymbol("e", { domain: "RealNumbers", value: Math.E })
  },
  methods: {
    // 处理来自FormulaEditor.vue的'formula-updated'事件
    // 该事件提供详细的MathJSON和表达式，与v-model的LaTeX更新分开。
    handleFormulaDetailsUpdate({ mathjson, expression }) {
      console.log("%c Line:87 🍢 mathjson", "color:#6ec1c2", mathjson)
      // 使用编辑器中的新公式详情更新组件数据
      this.currentMathJsonFormula = mathjson
      this.currentExpression = expression // 存储来自MathLive的直接封装表达式
      // 重置之前的计算结果和错误，因为公式已更改
      this.calculationResult = null
      this.calculationError = null
    },
    // 处理来自VariableManager.vue的'variables-updated'事件
    handleVariablesUpdate(variables) {
      // 使用新定义变量列表更新组件数据
      this.definedVariables = variables
      // 重置之前的计算结果和错误，因为变量已更改
      this.calculationResult = null
      this.calculationError = null
    },
    // 通过v-model测试公式的程序化更新方法
    setInitialFormula() {
      this.currentLatexFormula = "a+b + \\sin(\\pi/2)"
    },
    // 使用Compute Engine执行计算的方法
    performCalculation() {
      if (!this.currentLatexFormula) {
        this.calculationError = "请输入公式后再进行计算。"
        this.calculationResult = null
        return
      }
      if (!this.computeEngine) {
        this.calculationError = "计算引擎尚未初始化。"
        this.calculationResult = null
        return
      }

      try {
        const scope = {}
        this.definedVariables.forEach((variable) => {
          const varName = variable.name.trim()
          if (varName) {
            // Ensure variable names are valid identifiers for Compute Engine
            // Simple check: replace non-alphanumeric with underscore, ensure starts with letter or underscore
            // More robust sanitization might be needed depending on allowed variable names.
            // For now, we assume variable names from VariableManager are reasonably valid.
            const val = parseFloat(variable.value.toString().trim())
            if (!isNaN(val)) {
              scope[varName] = val
            } else {
              // If not a number, treat as a string symbol if CE is configured for it, or error out.
              // For now, we'll pass it as is, CE might interpret it or error.
              // Consider if string variables should be explicitly boxed or handled.
              scope[varName] = this.computeEngine.box(["Error", "'unknown-symbol'", varName])
            }
          }
        })

        let expr
        // 优先使用来自MathLive的直接表达式（可用且是最新的）
        if (this.currentExpression && this.currentExpression.latex === this.currentLatexFormula) {
          expr = this.currentExpression
        } else {
          // Otherwise, parse the LaTeX from v-model
          // This ensures that programmatic changes to currentLatexFormula are also handled correctly.
          expr = this.computeEngine.parse(this.currentLatexFormula)
        }

        if (!expr || typeof expr.evaluate !== "function") {
          this.calculationError = `无法将公式解析为有效的数学表达式: ${this.currentLatexFormula}`
          this.calculationResult = null
          return
        }

        // Substitute variables and evaluate
        const result = expr.subs(scope).evaluate()

        if (result !== null && result !== undefined) {
          if (result.isError) {
            this.calculationError = `计算错误: ${result.errorName || result.toString()}`
            this.calculationResult = null
          } else if (result.N !== undefined && typeof result.N === "function") {
            this.calculationResult = result.N().toString()
            this.calculationError = null
          } else if (typeof result.json === "number") {
            this.calculationResult = result.json.toString()
            this.calculationError = null
          } else if (result.string !== undefined) {
            this.calculationResult = result.string
            this.calculationError = null
          } else {
            this.calculationResult = result.toString() // Fallback
            this.calculationError = null
          }
        } else {
          this.calculationResult = "无法计算结果 (结果为 undefined 或 null)"
          this.calculationError = null
        }
      } catch (error) {
        console.error("Calculation Error Details:", error)
        this.calculationError = error.message || "计算过程中发生未知错误。"
        if (error.details) {
          this.calculationError += ` (${JSON.stringify(error.details)})`
        }
        this.calculationResult = null
      }
    },
  },
  watch: {
    currentLatexFormula(newLatex, oldLatex) {
      if (newLatex !== oldLatex) {
        console.log("%c Line:195 🍰 newLatex", "color:#42b983", newLatex)
      }
    },
  },
}
</script>

<style scoped>
/* Scoped styles for the MainPage component */
.main-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  font-family: sans-serif;
}
.content-wrapper {
  display: flex;
  flex-direction: column; /* Stack sections vertically on small screens */
  gap: 20px; /* Space between sections */
  width: 100%;
  max-width: 1200px; /* Max width for larger screens */
}

/* Responsive layout for wider screens */
@media (min-width: 768px) {
  .content-wrapper {
    flex-direction: row; /* Place sections side-by-side */
    justify-content: space-around; /* Distribute space around sections */
  }
  .editor-section,
  .controls-section {
    width: 48%; /* Assign roughly half width to each section */
  }
}

.editor-section,
.controls-section {
  padding: 15px;
  border: 1px solid #ddd; /* Light grey border */
  border-radius: 8px; /* Rounded corners */
  background-color: #f9f9f9; /* Light background for sections */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
}

.output-display {
  margin-top: 15px;
  padding: 10px;
  background-color: #e9e9e9; /* Slightly darker background for output displays */
  border-radius: 4px;
  word-break: break-all; /* Prevent long strings from breaking layout */
  font-size: 0.9em;
  font-family: monospace; /* Monospace font for code-like output */
}

.output-display strong {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

button {
  margin-top: 20px;
  padding: 10px 18px; /* Adjusted padding */
  background-color: #5cb85c; /* A pleasant green */
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.2s ease-in-out;
}

button:hover {
  background-color: #4cae4c; /* Darker green on hover */
}

h1 {
  margin-bottom: 25px; /* Adjusted margin */
  color: #333;
}

h2 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #444;
}
</style>
