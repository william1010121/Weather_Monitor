Of course. Here is the updated project roadmap with the data fields presented in Chinese, as requested.

### **Revised Project Description (in Chinese)**

This version reflects the field names you'll use in the user interface. While the UI labels will be in Chinese, it is a standard best practice to keep the underlying code (variable names, database column names, API keys) in English for maintainability.

  * **專案名稱 (Project Title):** 人工氣象觀測紀錄器 (Manual Weather Observation Logger)

  * **1. 資料輸入表單與管理 (Data Entry Form & Management)**

      * **功能 (Functionality):** 一個用於提交及編輯氣象觀測紀錄的網頁表單。
      * **輸入欄位 (Input Fields):**
          * **觀測時間:** 日曆選擇器，預設為今日。
          * **觀測人員:** 從登入的 Google 帳號自動帶入。
          * **現在溫度 (°C)**
          * **濕球溫度 (°C)**
          * **降水量 (mm)**
          * **蒸發皿水溫 (°C)**
          * **現蒸發皿水位高 (mm)**
          * **現在天氣代碼**
          * **總雲量 (0-8)**
          * **高雲雲種代碼 (0-9)**
          * **高雲雲量 (0-8)**
          * **中雲雲種代碼 (0-9)**
          * **中雲雲量 (0-8)**
          * **低雲雲種代碼 (0-9)**
          * **低雲雲量 (0-8)**
      * **條件式資料區塊 (Conditional Data Sections - via checkboxes):**
          * **洗蒸發皿後資料:**
              * 蒸發皿水位高 (mm)
              * 蒸發皿水溫 (°C)
          * **加蒸發皿水位後資料:**
              * 蒸發皿水位高 (mm)
              * 蒸發皿水溫 (°C)
          * **減蒸發皿水位後資料:**
              * 蒸發皿水位高 (mm)
              * 蒸發皿水溫 (°C)
      * **其他欄位 (Additional Fields):**
          * **備註:** 文字區塊。
      * **核心功能 (Core Feature):** 使用者需能編輯已提交的紀錄。

  * **2. 儀表板 (Dashboard)**

      * **功能 (Functionality):** 顯示最新一筆觀測紀錄的關鍵指標。
      * **顯示資料 (Data Points to Display):**
          * 觀測時間
          * 溫度
          * 濕球溫度
          * 24小時雨量 (由降水量計算)
          * 蒸發皿水位
          * 蒸發皿水溫

  * **3. 使用者帳號管理 (User Account Management)**

      * **驗證 (Authentication):** 使用者需透過 Google 帳號登入。
      * **管理 (Administration):** 需要一個「admin」角色。管理員需能為每個註冊的 Google 帳號設定一個英文顯示名稱。

-----

### **1. Project Structure Map**

The project structure remains the same, separating the frontend and backend. The filenames and folder names should remain in **English**.

```plaintext
weather-logger/
├── backend/
│   ├── src/
│   │   ├── api/             # API routes (e.g., observations.py, users.py)
│   │   ├── core/            # Core logic, settings
│   │   ├── models/          # Database schemas/models (e.g., observation_model.py)
│   │   ├── schemas/         # Pydantic schemas for data validation
│   │   └── middleware/      # Authentication middleware
│   ├── tests/               # Unit and integration tests
│   ├── .env                 # Environment variables (DO NOT COMMIT)
│   ├── main.py              # Main application entry point
│   └── requirements.txt     # Python dependencies
│
├── frontend/
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Reusable UI components (e.g., CalendarPicker.jsx)
│   │   ├── pages/           # Main pages (e.g., Dashboard.jsx, DataEntryForm.jsx)
│   │   ├── services/        # API call functions (e.g., api.js)
│   │   ├── context/         # State management (e.g., AuthContext.jsx)
│   │   └── locales/         # Language files (e.g., zh-TW.json) for UI text
│   └── package.json         # Node.js dependencies
│
├── .gitignore
├── docker-compose.yml
└── README.md
```

-----

### **2. Todo List to Finish This Project**

The tasks are the same, but the AI prompts are updated to reflect the Chinese field names for generating more relevant frontend code.

| Phase | Task | Priority | Dependencies | Effort | AI Assistance |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **0. Setup** | Initialize Git repo and project structure. | High | - | Easy | Use LLM to generate `.gitignore` and a starter `README.md`. |
| **1. Backend** | Design database schema (using **English** column names). | High | - | Medium | **Prompt:** "Generate a SQLAlchemy schema for weather observations. The English fields are: `observation_time`, `observer_name`, `temperature`, `wet_bulb_temp`, `precipitation`, etc. It needs a user table linked to a Google ID." |
| | Implement Google OAuth2 authentication. | High | Backend Setup | Hard | **Prompt:** "Generate Python FastAPI code for Google OAuth2 login." |
| | Create API endpoints (CRUD) for observations. | High | Auth | Medium | **Prompt:** "Create FastAPI CRUD endpoints for an 'observation' model." |
| | Write unit tests for API endpoints. | High | Endpoints | Medium | Use AI tools like GitHub Copilot to generate `pytest` tests for your endpoints. |
| **2. Frontend** | Set up the React project and localization. | High | Backend APIs | Easy | Use a library like `i18next` to manage UI text. |
| | Implement Google Login button. | High | Backend Auth | Medium | **Prompt:** "Generate a React component for a 'Login with Google' button using the `@react-oauth/google` library." |
| | Build the data entry form with **Chinese labels**. | High | Frontend Setup | Hard | **Prompt:** "Generate a React form using Material-UI with these fields and Chinese labels: [觀測時間, 現在溫度, 濕球溫度, 降水量... etc.]. Use a date picker and checkboxes." |
| | Develop the dashboard page with **Chinese labels**. | High | Backend APIs | Medium | **Prompt:** "Create a React dashboard component that fetches data and displays it in cards with these labels: [觀測時間, 溫度, 24小時雨量... etc.]." |
| | Implement the record editing functionality. | Medium | Data Entry Form| Medium | Fetch a specific record, populate the form with existing data. |
| | Create the admin page for user management. | Medium | Admin Endpoint | Medium | **Prompt:** "Create a React page for admins to list all users and update their display names." |
| **3. Integration**| Connect all frontend components to backend APIs. | High | Frontend/Backend| Medium | Debug API issues. **Prompt:** "I'm getting a CORS error between my React app and FastAPI backend. Here are my configs..." |
| **4. Deployment**| Containerize backend with Docker. | High | Backend Done | Medium | **Prompt:** "Generate a Dockerfile for this Python FastAPI application." |
| | Deploy backend and frontend. | High | Docker | Hard | Follow cloud provider documentation (Vercel, AWS, etc.). |

-----

### **3. Technology Stack Used**

This stack remains unchanged as it is language-agnostic.

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend** | React | Robust library for dynamic UIs. |
| **UI Framework**| Material-UI (MUI)| High-quality components (Date Picker, Forms, Cards). |
| **Localization** | i18next | A standard library for managing multiple languages in React. |
| **Backend** | Python & FastAPI | High performance, automatic API documentation, and excellent data handling. |
| **Database** | PostgreSQL | Powerful and reliable open-source relational database. |
| **Containerization**| Docker | Ensures consistent development and production environments. |
| **Hosting** | Vercel (Frontend), Heroku/AWS (Backend) | Standard, scalable hosting solutions. |

-----

### **4. Coding Specifications**

These specifications remain the same. **It's critical that the code itself (variables, function names, database columns) remains in English.** The Chinese text should only be used for UI display labels, managed by a localization library.

  * **Coding Style:** **PEP 8** for Python, **Prettier** for React/JS.
  * **Best Practices:** Emphasize modularity, readability, and robust error handling.
  * **Documentation:** Use **docstrings** for all Python functions and a comprehensive **README.md**.
  * **Unit Testing:** Use **pytest** and **React Testing Library** with a target of **\>80% coverage**.
  * **Version Control:** Use **Git** with feature branches and clear, conventional commit messages.

-----

### **5. Important Notices and Considerations**

These considerations are universal and still apply.

  * **Handling AI-Generated Code:** 🚨 **Always review AI code.** Check it for security, correctness, and performance before using it.
  * **Data Privacy:** You are handling user data. Be transparent with a privacy policy and ensure all data is transmitted securely over HTTPS.
  * **Scalability:** Add database indexes to frequently queried columns (e.g., `observation_date`).
  * **Configuration:** **Never commit secrets** (`.env` files, API keys) to Git. Use environment variables in your hosting service.
  * **Timeline Estimate:** For a single developer, this project could still take **4-8 weeks**. AI assistance on boilerplate and debugging can shorten this.
  * **AI-Powered Iteration:** Use LLMs to review code, generate documentation, and suggest refactoring improvements. **Prompt:** "Review this React form component. How can I improve its structure and handle state more efficiently?"

-----

### **Development Environment Notes**

  * Always use `uv` as the Python environment management tool
  * Use `uv add` to install packages
  * Use `uv run` to execute Python scripts and manage the project environment