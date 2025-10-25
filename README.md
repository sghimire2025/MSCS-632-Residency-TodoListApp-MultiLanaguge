
# TodoListApp–MultiLanguage 
This is project for the course `MSCS-632 Advanced Programming Language` residency project on `Cross Language Application Development`. 
A simple multi-repo style workspace that hosts two independent apps that can share the same PostgreSQL database:

- **`TodoListApp-Java`** – Spring Boot REST API (Gradle project)
- **`todolistapp-js`** – Placeholder for a JavaScript client (to be added later)

Both projects are designed to run independently. The Java API exposes CRUD endpoints for Users and Tasks; the JS app will later consume these APIs.

---

## Team Members
- Suresh Ghimire
- Shyam Nath

## Project Structure

```
TodoListApp-MultiLanguage/
├─ TodoListApp-Java/                # Spring Boot + Gradle backend
│  ├─ .gradle/
│  ├─ build/                        
│  ├─ gradle/                       
│  ├─ src/
│  │  ├─ main/
│  │  │  ├─ java/...              
│  │  │  └─ resources/
│  │  │     └─ application.yaml
│  │  └─ test/java/...             # tests
│  ├─ build.gradle
│  ├─ settings.gradle
│  ├─ gradlew / gradlew.bat         
│  └─ HELP.md
├─ todolistapp-js/                  #JS client app
│  └─ app/
├─ README.md                        
```

## 1) `TodoListApp-Java` – Spring Boot API

### Tech
- Java 21+
- Spring Boot 3.x (Web, Data JPA, Validation)
- PostgreSQL
- Gradle Wrapper

### Domain (implemented)
- **User**: `id (INT)`, `email (TEXT)`, `fullName (TEXT)`
- **Task**: `id (INT)`, `title (TEXT)`, `description (TEXT)`, `status (enum: PENDING|DONE)`, `userId (INT)`
- Simple validation, service layer, repository interfaces, and integration tests stubs.


### API Endpoints (sample)
```
GET    /api/catagory
POST   /api/catagory
PUT    /api/catagory/{id}
DELETE /api/catagory/{id}

GET    /api/tasks?userId={userId}
POST   /api/tasks
GET    /api/tasks/{id}
PUT    /api/tasks/{id}
DELETE /api/tasks/{id}
```
**Example request body (create task):**
```json
{
  "title": "Buy milk",
  "description": "2% milk, half gallon",
  "status": "PENDING",
  "userId": 1
}
```

### Prerequisites
- **JDK 17+** installed and on `PATH`
- **PostgreSQL** running locally or remotely (or use H2 for quick start)
- **No need to install Gradle**; use the included wrapper

### Configure Database
The project is using PostgresSQL database and the database properties are listed on `application.yaml`


### How to run the application
Use the following link to clone the application from github repository

```bash
git clone https://github.com/sghimire2025/MSCS-632-Residency-TodoListApp-MultiLanaguge.git
```
Change the directory
```bash
cd TodoListApp-Java
```

**Windows (PowerShell or GitBash)**
```bat
./gradlew clean install
./gradlew.bat bootRun
```

**macOS/Linux**
```bash
./gradlew clean build
./gradlew bootRun
```

Once started, the API will be available at: `http://localhost:8080`

### Build & Test
```bash
# macOS/Linux
./gradlew clean build

# Windows
gradlew.bat clean build
```

Artifacts are located under `TodoListApp-Java/build/`.

### Quick cURL checks
```bash
# Create a user
curl -X POST http://localhost:8080/api/users -H "Content-Type: application/json"   -d '{"email":"demo@example.com","fullName":"Demo User"}'

# List users
curl http://localhost:8080/api/users

# Create a task
curl -X POST http://localhost:8080/api/tasks -H "Content-Type: application/json"   -d '{"title":"Buy milk","description":"2% milk","status":"PENDING","userId":1}'

# List tasks for user 1
curl "http://localhost:8080/api/tasks?userId=1"
```

---

## 2) `TodoListApp-JS` – Client App (Placeholder)

This is a placeholder for the JavaScript UI that will consume the REST API above.

**Planned stack (suggested):**
- Vite + React + TypeScript + Tailwind (or your preferred framework)
- `.env` for API base URL (e.g., `VITE_API_URL=http://localhost:8080`)
- Fetch layer (axios or `fetch`) + simple query caching



---

## Common Tasks

### Import into IntelliJ IDEA
1. **Open** the root folder `TodoListApp-MultiLanguage` in IntelliJ.
2. IntelliJ detects the **Gradle** project automatically. If prompted, **Import as Gradle project**.
3. JDK: set to **17+** in *Project Structure → SDKs*.
4. Use the Gradle tool window to run **bootRun**, **test**, or **build**.

---

## Troubleshooting

- **Port already in use (8080):** Change `server.port` in `application.yaml` (e.g., `8081`).
- **Database connection refused:** Verify PostgreSQL is running, credentials are correct, and the DB exists.
- **Gradle fails to download deps:** Check network/proxy settings; try `./gradlew --refresh-dependencies`.

