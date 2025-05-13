# Vue2 MathLive Project

This project is a Vue 2 application that integrates MathLive for formula editing and uses Compute Engine for dynamic calculations based on user-defined variables.

## Project Setup

### Prerequisites

- Node.js (version 16.x or higher recommended)
- Yarn (or npm)

### Installation

1. Clone the repository (if applicable) or extract the source code archive.
2. Navigate to the project directory:
   ```sh
   cd vue2-mathlive-app
   ```
3. Install dependencies:
   ```sh
   yarn install
   # or
   npm install
   ```

## Development Server

To start the development server, run:

```sh
yarn serve
# or
npm run serve
```

This will typically start the server at `http://localhost:8080/`.

## Build for Production

To build the application for production, run:

```sh
yarn build
# or
npm run build
```

This will create a `dist` directory with the production-ready files.

## Project Structure

- `public/`: Contains static assets like `index.html` and `favicon.ico`.
- `src/`: Contains the main application source code.
  - `assets/`: (Optional) For static assets imported by components.
  - `components/`: Contains Vue components.
    - `CalculationDisplay.vue`: Displays the calculation result or error.
    - `FormulaEditor.vue`: Integrates MathLive for formula input.
    - `MainPage.vue`: The main page orchestrating the components and logic.
    - `VariableManager.vue`: Allows users to define and manage variables.
  - `App.vue`: The root Vue component.
  - `main.js`: The main entry point for the Vue application.
- `babel.config.js`: Babel configuration.
- `package.json`: Project dependencies and scripts.
- `vue.config.js`: Vue CLI configuration (e.g., dev server settings).
- `.gitignore`: Specifies intentionally untracked files that Git should ignore.
- `README.md`: This file.

## Key Features

- **Formula Editing**: Uses MathLive for a rich formula editing experience.
- **Variable Definition**: Allows users to define variables (e.g., `x = 10`, `y = 5`).
- **Dynamic Calculation**: Uses Compute Engine to parse LaTeX/MathJSON formulas and evaluate them with the defined variables.
- **Real-time Updates**: Changes in formulas or variables trigger recalculations or update displays.

## How it Works

1.  The `FormulaEditor.vue` component uses MathLive to capture formula input in both LaTeX and MathJSON formats.
2.  The `VariableManager.vue` component allows users to add, remove, and modify variables (name-value pairs).
3.  The `MainPage.vue` component receives updates from both the formula editor and variable manager.
4.  When the user triggers a calculation:
    *   It prepares a `scope` object from the defined variables.
    *   It uses `ComputeEngine.box()` (for MathJSON) or `ComputeEngine.parse()` (for LaTeX) to create an expression object.
    *   It calls `expr.subs(scope).evaluate()` to substitute variables and compute the result.
5.  The `CalculationDisplay.vue` component shows the final result or any errors encountered during the process.

# vue2-mathlive-app
