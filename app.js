const express = require('express');

const app = express();
const http = require('http').Server(app);

const userRoute = require('./routes/userRoute');
app.use("/",userRoute);

// Serve all files in the "public" folder

http.listen(3500, () => {
  console.log('Server connected at port 3500');
});
