require('dotenv').config();

const express           = require('express');
const cors              = require('cors');
const usersRouter       = require('./routes/users');
const departmentsRouter = require('./routes/departments');
const errorHandler      = require('./middleware/errorHandler');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Frontend Test API is running 🚀', version: '2.0.0' });
});

app.use('/users',       usersRouter);
app.use('/departments', departmentsRouter);

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✅  Server running at http://localhost:${PORT}`);
  console.log(`📋  Endpoints:`);
  console.log(`    GET    /users`);
  console.log(`    GET    /users/:id`);
  console.log(`    POST   /users`);
  console.log(`    PUT    /users/:id`);
  console.log(`    DELETE /users/:id`);
  console.log(`    GET    /departments`);
  console.log(`    GET    /departments/:id`);
});
