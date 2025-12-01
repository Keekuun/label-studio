# Label Studio Frontend

Label Studio Frontend (LSF) is a crucial module of the Label Studio ecosystem, pivotal in driving the entire annotation flow. It's a front-end-only module, combining a user interface for annotation creation with a data layer that standardizes the annotation format. Every manual annotation in Label Studio has been crafted using LSF, making it integral to the system.

### Usage Instructions

LSF provides specific scripts for operation and testing:

_Important Note: These scripts must be executed within the web folder or its subfolders. This is crucial for the scripts to function correctly, as they are designed to work within the context of the web directory's structure and dependencies._

- **`yarn lsf:watch`: Build LSF continuously**
  - Crucial for development, this script continuously builds Label Studio Frontend (LSF), allowing developers to observe their changes in real-time within the Label Studio environment.
- **`yarn lsf:serve`: Run LSF standalone**
  - To run Label Studio Frontend in standalone mode. Visit http://localhost:3000 to use the application in standalone mode.
- **`yarn lsf:e2e`: Execute end-to-end (e2e) tests on LSF**
  - To run comprehensive e2e tests, ensuring the frontend works as expected from start to finish. The Label Studio environment must be running, typically at `http://localhost:8080`.
- **`yarn lsf:integration`: Run integration tests**
  - To conduct integration tests using Cypress, verifying that different parts of LSF work together correctly. The LSF in standalone mode (`yarn lsf:serve`) must be running.
- **`yarn lsf:integration:ui`: Run integration tests in UI mode**
  - Facilitates debugging during integration tests by running them in a UI mode, allowing you to visually track what is being tested. The LSF in standalone mode (`yarn lsf:serve`) must be running.
- **`yarn lsf:unit`: Run unit tests on LSF**
  - Essential for maintaining code quality and reliability, especially in collaborative development.

### Documentation

The editor comes with comprehensive documentation to help you understand and extend its functionality:

- [Custom Component Development Guide](docs/DEVELOPING_COMPONENTS.md) - Learn how to create custom components for extending functionality
- [Internationalization Implementation Guide](docs/I18N_IMPLEMENTATION_GUIDE.md) - Complete guide to the i18n system implementation
- [i18n Quick Reference](docs/I18N_QUICK_REFERENCE.md) - Quick reference for working with internationalization
- [Image Component and Controllers](docs/IMAGE_COMPONENT.md) - Detailed explanation of how Image components and controllers work
- [Tool Shortcut Implementation](docs/TOOL_SHORTCUT_IMPLEMENTATION.md) - Analysis of how keyboard shortcuts are implemented in Tool components
- [XML to React Rendering](docs/XML_TO_REACT_RENDERING.md) - Explanation of how XML configuration gets converted to React components

### Language

- [中文版本](README_zh-CN.md) - 简体中文版本的文档

<img src="https://github.com/HumanSignal/label-studio/blob/develop/images/opossum_looking.png?raw=true" title="Hey everyone!" height="140" width="140" />