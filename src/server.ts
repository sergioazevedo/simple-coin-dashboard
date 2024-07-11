import express from "express";
import path from "path";
import { create } from "express-handlebars";
import { ConinPriceList } from "./coinPriceInterface";
import { fetchPrices } from "./coinPriceService"

const API_KEY : string = process.env.COIN_GECKO_API_KEY as string;
const REFRESH_TIME : number = parseInt((process.env.REFRESH_RATE_IN_MILIS || "30000") as string);
const app : express.Express = express();
const port : Number = 3000;
const handlebars = create({
  partialsDir: [
    path.join(__dirname, '../src/views/partials')
  ]
});

app.set('view engine', 'handlebars' );
app.engine('handlebars', handlebars.engine);
app.set('views', path.join(__dirname, '../src/views'));

app.use(express.static('public'));

app.get('/', async (req: express.Request, res: express.Response) => {
  const newPrices : ConinPriceList = await fetchPrices(API_KEY);

  res.render('index', { coindata: newPrices});
});

app.get('/price-stream', (req: express.Request, res: express.Response) => {
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  setInterval(() => pushNewPrices(res), REFRESH_TIME);
})

app.listen(port, () => {
  console.log(`[SERVER] running at http://localhost:${port}`);
});

const pushNewPrices = async (res : express.Response) : Promise<void> => {
  const newPrices : ConinPriceList = await fetchPrices(API_KEY);

  const partialPath = path.join(__dirname, '../src/views/partials/_priceCard.handlebars');
  const html = await handlebars.render(partialPath, {coindata: newPrices});

  res.write(`data: ${html.replace(/\n/g,'')} \n\n`);
};
