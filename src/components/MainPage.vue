<template>
  <div class="main-page">
    <h1>Vue2 MathLive 动态公式计算器</h1>
    <div class="content-wrapper">
      <div class="editor-section">
        <h2>公式编辑区</h2>
        <FormulaEditor @formula-updated="handleFormulaUpdate" />

        <div class="output-display">
          <strong>LaTeX:</strong>
          {{ currentLatexFormula }}
        </div>

        <div class="output-display">
          <strong>MathJSON:</strong>
          {{ currentMathJsonFormulaDisplay }}
        </div>
      </div>

      <div class="controls-section">
        <VariableManager @variables-updated="handleVariablesUpdate" />
        <button @click="performCalculation">执行计算</button>
        <CalculationDisplay :result="calculationResult" :error="calculationError" />
      </div>
    </div>
  </div>
</template>

<script>
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
    return {
      currentLatexFormula: "",
      currentMathJsonFormula: null,
      definedVariables: [],
      calculationResult: null,
      calculationError: null,
      computeEngine: null,
    }
  },
  computed: {
    currentMathJsonFormulaDisplay() {
      return this.currentMathJsonFormula ? JSON.stringify(this.currentMathJsonFormula) : ""
    },
  },
  created() {
    this.computeEngine = new ComputeEngine()
  },
  methods: {
    handleFormulaUpdate({ latex, mathjson }) {
      this.currentLatexFormula = latex
      this.currentMathJsonFormula = mathjson
      this.calculationResult = null
      this.calculationError = null
    },
    handleVariablesUpdate(variables) {
      this.definedVariables = variables
      this.calculationResult = null
      this.calculationError = null
    },
    performCalculation() {
      if (!this.currentMathJsonFormula && !this.currentLatexFormula) {
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
          if (variable.name && variable.name.trim() !== "") {
            const varName = variable.name.trim()
            const varValueStr = variable.value.toString().trim()
            const numValue = parseFloat(varValueStr)
            if (!isNaN(numValue)) {
              scope[varName] = numValue
            } else if (varValueStr !== "") {
              // 允许字符串变量（如果需要），尽管计算引擎可能不会直接在数学计算中使用它们
              scope[varName] = varValueStr
            }
          }
        })

        let expr
        // 优先使用MathJSON（如果可用），以获得更结构化的表示
        if (this.currentMathJsonFormula) {
          expr = this.computeEngine.box(this.currentMathJsonFormula)
        } else {
          // 如果MathJSON不可用，则回退到LaTeX
          expr = this.computeEngine.parse(this.currentLatexFormula)
        }

        // 使用.subs(scope)替换变量然后求值
        const result = expr.subs(scope).evaluate()

        if (result !== null && result !== undefined) {
          if (result.N !== undefined && typeof result.N === "function") {
            this.calculationResult = result.N().toString()
          } else if (typeof result.json === "number") {
            this.calculationResult = result.json.toString()
          } else if (result.string !== undefined) {
            this.calculationResult = result.string
          } else if (result.latex !== undefined) {
            this.calculationResult = result.latex
          } else if (result.json !== undefined) {
            this.calculationResult = JSON.stringify(result.json)
          } else {
            this.calculationResult = result.toString()
          }
        } else {
          this.calculationResult = "无法计算结果 (undefined or null)"
        }
        this.calculationError = null
      } catch (error) {
        console.error("Calculation Error:", error)
        this.calculationError = error.message || "计算过程中发生未知错误。"
        this.calculationResult = null
      }
    },
  },
}
</script>

<style scoped>
.main-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}
.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-width: 1200px;
}

@media (min-width: 768px) {
  .content-wrapper {
    flex-direction: row;
    justify-content: space-around;
  }
  .editor-section,
  .controls-section {
    width: 48%;
  }
}

.editor-section,
.controls-section {
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #fff;
}

.output-display {
  margin-top: 15px;
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 4px;
  word-break: break-all;
  font-size: 0.9em;
}

.output-display strong {
  display: block;
  margin-bottom: 5px;
}

button {
  margin-top: 20px;
  padding: 12px 20px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #369f71;
}

h1 {
  margin-bottom: 30px;
}

h2,
h3 {
  margin-top: 0;
  margin-bottom: 15px;
}
</style>
