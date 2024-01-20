const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('Uncaught Exception!💥 Shutting Down');
  process.exit(1);
});

dotenv.config({ path: './.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB connection successful');
  });

// start a server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`APP running on port ${port}`);
});

// listen unhandledRejection event, which then allows us to handle all the errors that occur in asynchronous code which were not previously handled.
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('Unhandler Rejection!💥 Shutting Down');
  server.close(() => {
    process.exit(1); // 1 stands for uncaught exception
  });
});
