# 🐛 BugTracker Pro

> A full-stack, real-time Bug Tracker / Issue Tracker web app inspired by Jira and Linear. Designed for modern teams to manage projects, report bugs, and track issues visually using a Kanban board.

---

## 🚀 Features

- 🔐 **User Authentication** (JWT + bcrypt)
- 🧑‍💼 **Project Management** (Create, invite, manage team)
- 🐞 **Bug & Feature Reporting**
- 👥 **Assign Tickets** to project members
- 🗂 **Kanban Drag-and-Drop** interface (To Do, In Progress, Done)
- 💬 **Threaded Comments** (Collaboration under each ticket)
- 🔎 **Filter, Search, Sort** tickets
- 📎 **File Uploads** (Screenshot support)
- 👮 **Role-Based Access** (Admin, Manager, Developer)
- 📱 **Responsive Design**

---

## 🧰 Tech Stack

### 🔹 Frontend
- [React.js](https://reactjs.org/) – Component-based UI
- [Tailwind CSS](https://tailwindcss.com/) – Utility-first CSS
- [React DnD / react-beautiful-dnd](https://github.com/atlassian/react-beautiful-dnd) – Kanban drag-and-drop
- [Axios](https://axios-http.com/) – API calls
- [React Router](https://reactrouter.com/) – Navigation

### 🔸 Backend
- [Node.js](https://nodejs.org/) + [Express.js](https://expressjs.com/) – REST API
- [Supabase](https://supabase.com/) – PostgreSQL DB, Auth, and Realtime
- [JWT](https://jwt.io/) + bcrypt – User authentication

### 🛠️ Extras
- Context API / Redux – Global state management
- [Socket.io](https://socket.io/) *(optional)* – Real-time updates
- [Multer](https://github.com/expressjs/multer) *(optional)* – File uploads
- [Helmet](https://helmetjs.github.io/), CORS, dotenv – Security

---

## 🗂️ Use Cases

| #   | Use Case              | Description                                           |
|-----|------------------------|-------------------------------------------------------|
| 1   | User Authentication    | Register/login with JWT-protected routes             |
| 2   | Project Management     | Create/manage projects, invite team members          |
| 3   | Create Issue           | Create tickets for bugs or feature requests          |
| 4   | Assign Users           | Assign tasks to project members                      |
| 5   | Kanban Board           | Move tasks between status columns                    |
| 6   | Comments on Tickets    | Collaborate via threaded conversations               |
| 7   | Filter & Search        | Filter by status, priority, assignee, or keyword     |
| 8   | Edit/Delete Tickets    | Update or delete tickets with permission checks      |
| 9   | Role-Based Access      | Admin/Manager/Dev/Viewer permissions *(optional)*    |
| 10  | Upload Screenshot      | Support for file attachments *(optional)*            |

---

## 📅 2-Week Development Plan

### 🗓️ Week 1 – Backend & Core Features

- **Day 1**: Setup MERN structure, Tailwind config, Supabase integration
- **Day 2**: Auth system – JWT, bcrypt, login/register pages
- **Day 3**: Projects – CRUD, team invites
- **Day 4**: Tickets – Supabase schema + APIs (CRUD)
- **Day 5**: Ticket UI – Form + List + Metadata
- **Day 6**: Dashboard – Sidebar, responsive layout
- **Day 7**: Testing APIs, buffer time, GitHub push

### 🗓️ Week 2 – Kanban, Filtering, Final Polish

- **Day 8**: Kanban drag & drop (DnD libs + API sync)
- **Day 9**: Comments (threaded, real-time optional)
- **Day 10**: Filters/Search (dropdowns, search bar)
- **Day 11**: Edit/Delete tickets (modals + access control)
- **Day 12**: Deployment (Render/Netlify/Vercel + Supabase)
- **Day 13**: UI polish, loading states, clean README
- **Day 14**: Final testing, record video demo, launch 🚀

---

## 🖥️ Screenshots

*(Add screenshots or GIFs of your Kanban board, ticket form, project dashboard, etc. here)*

---

## 🌐 Live Demo

🔗 [Live Site](https://your-deployed-url.com)

📽️ [Demo Video](https://link-to-demo-video.com)

---

## ⚙️ Installation & Setup

```bash
# Clone the repo
git clone https://github.com/your-username/bugtracker-pro.git
cd bugtracker-pro

# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install

# Set up environment variables
touch .env
# Add JWT_SECRET, SUPABASE_URL, SUPABASE_ANON_KEY etc.

# Run both servers (use concurrently or separate terminals)
npm run dev
