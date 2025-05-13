<!-- CalculationDisplay组件用于显示计算结果或错误信息 -->
<template>
  <div class="calculation-display">
    <h3>计算结果</h3>
    <div v-if="error" class="error-message">
      <strong>错误:</strong> {{ error }}
    </div>
    <div v-else-if="result !== null && result !== undefined" class="result-message">
      <strong>结果:</strong> <span class="result-value">{{ result }}</span>
    </div>
    <div v-else class="no-result-message">
      暂无计算结果。
    </div>
  </div>
</template>

<script>
export default {
  name: "CalculationDisplay",
  props: {
    result: {
      type: [String, Number, null],
      default: null,
    },
    error: {
      type: [String, null],
      default: null,
    },
  },
};
</script>

<style scoped>
.calculation-display {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 4px;
  background-color: #f9f9f9;
}

.error-message {
  color: #d9534f; /* Red for errors */
  padding: 10px;
  background-color: #f2dede;
  border: 1px solid #ebccd1;
  border-radius: 4px;
}

.result-message {
  color: #3c763d; /* Green for success/results */
  padding: 10px;
  background-color: #dff0d8;
  border: 1px solid #d6e9c6;
  border-radius: 4px;
}

.result-value {
  font-weight: bold;
  font-size: 1.1em;
}

.no-result-message {
  color: #777;
  font-style: italic;
}

h3 {
  margin-top: 0;
  margin-bottom: 10px;
}
</style>

