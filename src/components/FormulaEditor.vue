<template>
  <div>
    <!-- <math-field ref="mathfield" :options="options" :value="value" @input="onInput" /> -->
    <!-- 这个div将作为MathLive MathfieldElement的容器 -->
    <div ref="mathfield" class="formula-editor-field"></div>
  </div>
</template>

<script>
// 从MathLive库导入MathfieldElement
import { MathfieldElement } from "mathlive"
import _ from "lodash"

export default {
  name: "FormulaEditor",
  // 定义Vue 2中v-model兼容的模型配置
  // 这告诉Vue使用'value'属性和'input'事件来实现v-model
  model: {
    prop: "value",
    event: "input",
  },
  props: {
    // 'value'属性将被v-model用来传递LaTeX字符串
    value: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      // mathfield将保存MathfieldElement的实例
      mathfield: null,
      // internalValue用于防止与watcher的更新循环
      internalValue: this.value,
    }
  },
  mounted() {
    // 创建MathfieldElement的新实例
    // 如果可能，直接将初始选项传递给构造函数，或者之后立即设置
    const mfe = new MathfieldElement({
      virtualKeyboardMode: "manual",
      menuItems: ["undo", "redo", "cut", "copy", "paste", "selectAll"],
      menuItemState: {
        undo: "enabled",
        redo: "enabled",
        cut: "enabled",
        copy: "enabled",
        paste: "enabled",
        selectAll: "enabled",
      },
      virtualKeyboardToggleGlyph: "",
      virtualKeyboardToolbar: ""
      ,

      // macros: {}, // 防止宏定义错误
      onError: (error) => {
        console.error("MathLive Error:", error)
        this.$emit("error", error) // 触发错误事件
      },
    })

    // 从'value'属性设置mathfield的初始值
    mfe.value = this.value

    // 将MathfieldElement实例附加到"mathfield"引用的DOM元素
    this.$refs.mathfield.appendChild(mfe)

    // 存储MathfieldElement实例
    this.mathfield = mfe

    // 监听mathfield元素本身的"input"事件
    // 添加菜单事件监听
    this.mathfield.addEventListener("menu-item-click", (event) => {
      console.log("Menu item clicked:", event.detail.menuItem)
    })

    // 使用防抖优化输入事件处理
    const debounceEmit = _.debounce((latex, mathjson, expression) => {
      this.$emit("formula-updated", { latex, mathjson, expression })
    }, 300)

    this.mathfield.addEventListener("input", (event) => {
      const mathfieldElement = event.target
      const newLatexValue = mathfieldElement.value
      this.internalValue = newLatexValue

      // 立即触发input事件实现v-model
      this.$emit("input", newLatexValue)

      // 防抖处理formula-updated事件
      debounceEmit(newLatexValue, mathfieldElement.getValue("math-json"), mathfieldElement.expression)
    })
  },
  beforeDestroy() {
    // 清理防抖函数
    if (this.debounceEmit && this.debounceEmit.cancel) {
      this.debounceEmit.cancel()
    }

    // 移除事件监听器
    if (this.mathfield) {
      this.mathfield.removeEventListener("input", this.handleMathInput)
      this.mathfield.removeEventListener("menu-item-click", this.handleMenuItemClick)
    }
  },
  watch: {
    // 监听'value'属性的外部变化(例如父组件更新它)
    value(newValue) {
      if (this.mathfield && newValue !== this.internalValue) {
        this.mathfield.value = newValue
        this.internalValue = newValue // Sync internalValue as well
      }
    },
    // 监听options属性的变化以更新MathLive实例
    options: {
      handler(newOptions) {
        if (this.mathfield && newOptions) {
          // 使用setOptions更新MathLive实例的选项
          // 这通常比直接修改this.mathfield.options对象更安全
          this.mathfield.setOptions(newOptions)
        }
      },
      deep: true,
    },
  },
}
</script>

<style scoped>
.formula-editor-field {
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 4px;
  min-height: 100px;
  background-color: #fff;
}

:deep(math-field) {
  width: 100%;
  font-size: 1.2em;
}
</style>
