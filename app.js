const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const router = require('./application/routes/router');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json({ limit: "50mb" })); 
app.use(express.urlencoded({ limit: "50mb", extended: true })); 
app.use(cookieParser());

app.use('/', router);  

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
