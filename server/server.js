// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(cors());

// Rutas
const rutasGithub = require('./controllers/githubAuth.js');
const rutasUser = require('./routes/rtUser.js');
const rutasHabit = require('./routes/rtHabit.js');

app.use('/api/github', rutasGithub);
app.use('/api/users', rutasUser);
app.use('/api/habit', rutasHabit);

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
