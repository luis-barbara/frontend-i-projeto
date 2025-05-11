# frontend-i-projeto
Projeto final


### **Titulo do website:** TODO app

<br>

### **Descrição do website:** Task Manager with priority settings

<br>

# Requisitos

1. Create, Read, Update and Remove operations (Create todo item, read all todo items, update single todo item, remove single todo item). [todolist_api.js]
2. Use mock api. [todolist_api.js]
3. Use at least one native javascript API (Geolocation, DateTime, etc). [script.js] Intl.DateTimeFormat
4. Form to create and edit todo items, with validation. [script.js] Modal
5. Use at least one external library (An ui component library for example): Font awesome
6. Responsive [script.js]
7. Generate lighthouse report with all 4 metrics on the green. [lighthouse_report_10-05-2025.pdf]
8. Online on github pages. [https://luis-barbara.github.io/frontend-i-projeto/]

## Bonus

- Implement 1 web component. [theme_toggle.js]
- Also use local storage: Dark theme
- Configure PWA: [manifest.json], [sw.js], 
- Use canvas in some way: 3 blas junto ao footer [script.js]
- Apresentar projeto no portfolio desenvolvido em Web Pages [https://luis-barbara.github.io/webpages-portfolio/projetos.html]




# 📋 TODO App - Task Manager with priority settings

## 🌟 Features
- **Visual Priority System**  
  🔴 High | 🟡 Medium | 🔵 Low indicators
- **Full CRUD Operations**  
  Create, Read, Update, Delete tasks with form validation
- **Dual Data Persistence**  
  LocalStorage + MockAPI synchronization
- **Progressive Web App**  
  Installable (manifest.json) with offline support (Service Worker)
- **Responsive UI**  
  Mobile-friendly with dark/light mode (Custom Web Component)
- **Advanced Filtering**  
  All/Active/Completed tasks with ARIA accessibility

## 🛠️ Tech Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **APIs**: Canvas API, Web Components
- **Storage**: LocalStorage + [MockAPI](https://mockapi.io/) backend
- **PWA**: Service Worker, Web App Manifest
- **Libraries**: SweetAlert2 (modals)

## 🚀 Project Structure

todo-app/
├── index.html # Main application
├── style.css # Responsive styles (mobile-first)
├── script.js # Core logic (CRUD, filters)
├── sw.js # Service Worker (PWA)
├── manifest.json # PWA configuration
├── theme_toggle.js # Custom Web Component
└── todolist_api.js # Mockapi with CRUD operations


## 🔧 Installation
```bash
git clone https://github.com/luis-barbara/frontend-i-projeto.git
cd frontend-i-projeto
# Open index.html in browser