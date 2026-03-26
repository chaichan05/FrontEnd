# Frontend Test — Backend API

Backend API สำหรับโจทย์ **Frontend Developer Assessment**  
พัฒนาด้วย Node.js + Express.js + MySQL รันด้วย Docker Compose

---

## Tech Stack

| Layer    | Technology              |
|----------|-------------------------|
| Runtime  | Node.js 20              |
| Framework| Express.js 4            |
| Database | MySQL 8.0               |
| ORM      | mysql2 (raw queries)    |
| DevOps   | Docker Compose          |
| GUI      | phpMyAdmin (port 4001)     |

---

## เริ่มต้นใช้งาน

### 1. Clone & ตั้งค่า Environment

```bash
git clone <repo-url>
cd frontend-test-backend

cp .env.example .env
# แก้ไข .env ถ้าต้องการเปลี่ยน password
```

### 2. รันด้วย Docker Compose (แนะนำ)

```bash
docker compose up --build
```

รอจนเห็นข้อความ:
```
✅  Server running at http://localhost:4000
```

> Database จะถูก seed ข้อมูลตัวอย่าง 20 รายการอัตโนมัติ

### 3. รันแบบ Local (ไม่ใช้ Docker)

ต้องมี MySQL รันอยู่ในเครื่องก่อน จากนั้น:

```bash
npm install

# สร้าง database และ import schema
mysql -u root -p < db/init.sql

# แก้ .env ให้ DB_HOST=localhost
npm run dev
```

---

## API Endpoints

Base URL: `http://localhost:4000`

| Method | Endpoint     | คำอธิบาย                          |
|--------|--------------|-----------------------------------|
| GET    | /users       | ดึงรายการผู้ใช้ทั้งหมด (pagination) |
| GET    | /users/:id   | ดึงข้อมูลผู้ใช้รายบุคคล           |
| POST   | /users       | สร้างผู้ใช้ใหม่                    |
| PUT    | /users/:id   | แก้ไขข้อมูลผู้ใช้                 |
| DELETE | /users/:id   | ลบผู้ใช้                          |

### Query Parameters — GET /users

| Parameter | Type   | Default    | คำอธิบาย                              |
|-----------|--------|------------|---------------------------------------|
| page      | number | 1          | หน้าที่ต้องการ                        |
| limit     | number | 10         | จำนวนต่อหน้า (max 100)                |
| search    | string | -          | ค้นหาจาก first_name, last_name, email |
| gender    | string | -          | male / female / unspecified           |
| sort      | string | created_at | first_name / last_name / age          |
| order     | string | desc       | asc / desc                            |

### ตัวอย่าง Request & Response

**GET /users?page=1&limit=3&gender=male**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "first_name": "สมชาย",
        "last_name": "ใจดี",
        "age": 28,
        "gender": "male",
        "email": "somchai.j@example.com",
        "phone": "081-234-5678",
        "created_at": "2025-01-01T10:00:00.000Z",
        "updated_at": "2025-01-01T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 4,
      "totalItems": 11,
      "itemsPerPage": 3
    }
  }
}
```

**POST /users** — Body (JSON)
```json
{
  "first_name": "ทดสอบ",
  "last_name":  "ระบบ",
  "age":        22,
  "gender":     "male",
  "email":      "test@example.com",
  "phone":      "081-000-0000"
}
```

**Error Response**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "รูปแบบอีเมลไม่ถูกต้อง" }
  ]
}
```

---

## Database Schema

```sql
CREATE TABLE users (
  id         INT           AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100)  NOT NULL,
  last_name  VARCHAR(100)  NOT NULL,
  age        TINYINT       NOT NULL,
  gender     ENUM('male','female','unspecified') DEFAULT 'unspecified',
  email      VARCHAR(255)  UNIQUE NOT NULL,
  phone      VARCHAR(20)   DEFAULT NULL,
  created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## phpMyAdmin (Database GUI)

เข้าถึงได้ที่ `http://localhost:4001`

| Field    | Value          |
|----------|----------------|
| System   | MySQL          |
| Server   | db             |
| Username | appuser        |
| Password | apppassword    |
| Database | frontend_test  |

---

## โครงสร้าง Project

```
├── src/
│   ├── controllers/
│   │   └── userController.js   # Business logic + Validation
│   ├── middleware/
│   │   └── errorHandler.js     # Global error handler
│   ├── routes/
│   │   └── users.js            # Route definitions
│   ├── db.js                   # MySQL connection pool
│   └── index.js                # Entry point
├── db/
│   └── init.sql                # Schema + Seed data (20 rows)
├── .env.example
├── .gitignore
├── docker-compose.yml
├── Dockerfile
└── README.md
```
