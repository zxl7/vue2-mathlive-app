<template>
  <div>
    <div ref="mathfield" class="formula-editor-field"></div>
  </div>
</template>

<script>
import { MathfieldElement } from "mathlive";

export default {
  name: "FormulaEditor",
  props: {
    initialValue: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      mathfield: null,
    };
  },
  mounted() {
    const mfe = new MathfieldElement();
    mfe.value = this.initialValue;
    mfe.options = {
      virtualKeyboardMode: "manual", // 可选值: "onfocus", "off"
      // 在此添加其他MathLive选项
    };
    this.$refs.mathfield.appendChild(mfe);
    this.mathfield = mfe;

    // 监听数学编辑器的变化
    this.mathfield.addEventListener("input", (event) => {
      this.$emit("formula-updated", {
        latex: event.target.value,
        mathjson: event.target.getValue("math-json"),
      });
    });
  },
  beforeDestroy() {
    if (this.mathfield) {
      // 清理事件监听器和其他资源
      this.mathfield.removeEventListener("input", () => {});
    }
  },
  watch: {
    initialValue(newValue) {
      if (this.mathfield && this.mathfield.value !== newValue) {
        this.mathfield.value = newValue;
      }
    },
  },
};
</script>

<style scoped>
.formula-editor-field {
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 4px;
  min-height: 100px; /* Adjust as needed */
  background-color: #fff;
}

/* Ensure MathLive elements display correctly */
:deep(math-field) {
  width: 100%;
  font-size: 1.2em; /* Adjust font size as needed */
}
</style>

