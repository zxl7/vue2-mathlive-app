<template>
  <div>
    <!-- 这个div将作为MathLive MathfieldElement的容器 -->
    <div ref="mathfield" class="formula-editor-field"></div>
  </div>
</template>

<script>
// 从MathLive库导入MathfieldElement
import { MathfieldElement } from "mathlive"

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
    // MathLive实例的选项，允许从父组件进行自定义
    options: {
      type: Object,
      default: () => ({ virtualKeyboardMode: "manual" }),
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
      ...(this.options || { virtualKeyboardMode: "manual" }), // Spread default and passed options
      menuItems: this.options.menuItems || ["undo", "redo", "cut", "copy", "paste", "selectAll"], // 优先使用options中的menuItems配置
      macros: {}, // 防止宏定义错误
      onError: (error) => {
        console.error('MathLive Error:', error);
        this.$emit('error', error); // 触发错误事件
      }
    })

    // 从'value'属性设置mathfield的初始值
    mfe.value = this.value

    // 将MathfieldElement实例附加到"mathfield"引用的DOM元素
    this.$refs.mathfield.appendChild(mfe)

    // 存储MathfieldElement实例
    this.mathfield = mfe

    // 监听mathfield元素本身的"input"事件
    // 添加菜单事件监听
    this.mathfield.addEventListener('menu-item-click', (event) => {
      console.log('Menu item clicked:', event.detail.menuItem);
    });
    
    this.mathfield.addEventListener("input", (event) => {
      const mathfieldElement = event.target
      const newLatexValue = mathfieldElement.value
      this.internalValue = newLatexValue // Update internal state first

      // 触发'input'事件以实现v-model兼容性，传递新的LaTeX值
      this.$emit("input", newLatexValue)

      // 触发更详细的"formula-updated"事件供其他消费者使用(如MainPage进行计算)
      console.log("%c Line:79 🥖 newLatexValue", "color:#ed9ec7", newLatexValue);
      this.$emit("formula-updated", {
        latex: newLatexValue,
        mathjson: mathfieldElement.getValue("math-json"),
        expression: mathfieldElement.expression,
      })
    })
  },
  beforeDestroy() {
    // 必要时进行清理
    // 如果输入事件监听器绑定了特定处理程序，则应移除
    // e.g., this.mathfield.removeEventListener("input", this.handleMathInput);
    // 但是，MathLive元素在从DOM移除时可能会清理自己的监听器
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
