import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import defaultRouter from './routes/defaultRouter.js';
import artRouter from './routes/artRouter.js';

dotenv.config({ path: '../.env' });

const app = express();
const port = process.env.BACKEND_PORT || 3003;
const host = process.env.BACKEND_HOST || 'localhost';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  morgan(
    '[:date[clf]] ":method :url HTTP/:http-version" :status (:response-time ms) (:res[content-length] bytes) ":user-agent"',
  ),
);

app.use('/gallery', express.static('./public'));
app.use('/', defaultRouter);
app.use('/art', artRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  res.status(500);
  res.render('error', { error: err });
});

app.listen(port, host, () => {
  console.log(`Server ready. Listening on ${host}:${port}`);
});
