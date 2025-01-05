import express from 'express';
import cors from 'cors';
import configRouter from './routes/config';

const app = express();

app.use(cors());
app.use(express.json());

// Mount the config routes
app.use('/api', configRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});