<template>
  <div class="variable-manager">
    <h3>变量管理器</h3>
    <div v-for="(variable, index) in localVariables" :key="index" class="variable-item">
      <input type="text" v-model="variable.name" placeholder="变量名 (例如: x)" @input="updateVariables" />
      <input type="text" v-model="variable.value" placeholder="变量值 (例如: 10)" @input="updateVariables" />
      <button @click="removeVariable(index)" class="remove-btn">移除</button>
    </div>
    <button @click="addVariable" class="add-btn">添加变量</button>
  </div>
</template>

<script>
export default {
  name: "VariableManager",
  data() {
    return {
      localVariables: [{ name: "", value: "" }],
    };
  },
  methods: {
    addVariable() {
      this.localVariables.push({ name: "", value: "" });
      this.updateVariables();
    },
    removeVariable(index) {
      this.localVariables.splice(index, 1);
      this.updateVariables();
    },
    updateVariables() {
      // Filter out empty name variables before emitting
      const validVariables = this.localVariables.filter(v => v.name.trim() !== "");
      this.$emit("variables-updated", JSON.parse(JSON.stringify(validVariables)));
    },
  },
  watch: {
    localVariables: {
      handler() {
        this.updateVariables();
      },
      deep: true,
    },
  },
};
</script>

<style scoped>
.variable-manager {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.variable-item {
  display: flex;
  gap: 10px;
  align-items: center;
}

.variable-item input[type="text"] {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  flex-grow: 1;
}

.add-btn, .remove-btn {
  padding: 8px 12px;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.add-btn {
  background-color: #5cb85c;
}

.add-btn:hover {
  background-color: #4cae4c;
}

.remove-btn {
  background-color: #d9534f;
  padding: 6px 10px; /* Smaller padding for remove button */
  font-size: 0.9em;
}

.remove-btn:hover {
  background-color: #c9302c;
}

h3 {
  margin-bottom: 10px;
}
</style>

