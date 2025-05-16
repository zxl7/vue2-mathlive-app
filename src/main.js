import Vue from "vue"
import App from "./App.vue"
import "./mathlive/mathlive.min.js"
import "./mathlive/math-json.min.cjs"

const ComputeEngine = require("./mathlive/compute-engine.min.cjs")

Vue.prototype.$computeEngine = ComputeEngine
Vue.config.productionTip = false

new Vue({
  render: (h) => h(App),
}).$mount("#app")
