import express from 'express'
import { calculateBmi } from './bmiCalculator';
import { calculateExercises } from './exerciseCalculator';

const app = express();

app.use(express.json())

app.get('/hello', (_req, res) => {
  res.send('Hello Full Stack!');
});

app.get('/bmi', (_req, res) => {
  const height = Number(_req.query.height);
  const weight = Number(_req.query.weight);

  if (!_req.query.height || !_req.query.weight || isNaN(height) || isNaN(weight)) {
    res.status(400).json({ error: 'malformatted parameters' });
    return;
  }

  res.json({
    weight,
    height,
    bmi: calculateBmi(height, weight),
  });
})

app.post('/exercises', (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { daily_exercises, target } = req.body;

  if (!daily_exercises || target === undefined) {
    res.status(400).json({ error: 'parameters missing' });
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
  if (!Array.isArray(daily_exercises) || daily_exercises.some((d: any) => isNaN(Number(d))) || isNaN(Number(target))) {
    res.status(400).json({ error: 'malformatted parameters' });
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const result = calculateExercises(daily_exercises.map((d: any) => Number(d)), Number(target));
  res.json(result);
})

const PORT = 3003;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
