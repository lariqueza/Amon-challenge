const Koa = require('koa');
const MainMiddleware = require('./middlewares');
const logger = require('../../modules/logger');
const CONFIG = require('../../../config');
const db = require('/amon-node-js-public/src/modules/db');
const llo = logger.logMeta.bind(null, { service: 'api' });

const API = () =>
  new Promise((resolve, reject) => {
    const app = new Koa();

    app.proxy = CONFIG.REMOTE_EXECUTION;

    app.on('error', (error) => {
      logger.error('Unexpected API error', { error });
    });

    require('koa-ctx-cache-control')(app);

    app.use((ctx, next) => {
      ctx.cacheControl(false);
      return next();
    });

    app.use(MainMiddleware());

    const server = app.listen(CONFIG.SERVICES.API.PORT, (err) => {
      if (err) {
        return reject(err);
      }

      logger.info('Listening', llo({ port: CONFIG.SERVICES.API.PORT }));
      resolve(app);
    });

    server.setTimeout(CONFIG.SERVICES.API.TIMEOUT * 1000);
  });


//fetch API data
  const Data = {
    baseUrl : 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin%2C%20ethereum&vs_currencies=usd&include_market_cap=false&include_24hr_vol=false&include_24hr_change=false&include_last_updated_at=false',
    proxyUrl : 'https://cors-anywhere.herokuapp.com/'
  };
  
  fetch(`${Data}`,{
    method: "GET",
    Headers: {
      'Content-Type' : 'application/json',
      'Access-Control-Allow-Origin' : '*'
    }

  }).then((response) => {
    if(response.ok) {
      response.json().then((json) => {
        console.log(json.name.code.price)
      }).catch((error) => {
        console.log(error)
      })
    }

    //update coin and save to database route

    app.put('/coin/createCoin', (req, res) => {
      const name = req.body.name;
      const code = req.body.code;
      const price = req.body.price;
  
      var sql = `INSERT INTO coin(name, code, price, created_at, updated_at) VALUES ("${name}", "${code}", "${price}", NOW())`;
      db.query(sql, (err, result) => {
      if(err) {
        console.log("coin already exists");
      } else {
        res.end(JSON.stringify(result));
      };
  
      });

      //get coin route
      
      app.get('/coin/:coinCode', (req, res) => {
        res.send(`${Data}`)
      });

    });

    return false
  });





module.exports = API;
