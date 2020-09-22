const express = require('express');
const mongoose = require('mongoose');
const { MONGODB_URI } = require('./config/config');

const app = express();

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 8000;
app.get('/', (req, res) => {
  res.send('hello world');
});

app.listen(PORT, () => console.log(`Server running at port ${PORT}`));
