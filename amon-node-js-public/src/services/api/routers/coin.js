const Joi = require('joi');
const Router = require('@koa/router');
const CoinController = require('../controllers/coin');
const { validateParams } = require('../../../helpers/validation');

const CoinRouter = {
  schemaGetByCoinCode: Joi.object({
    coinCode: Joi.string().min(3).uppercase().max(5),
  }),

  async getCoinByCode(ctx) {
    const params = {
      coinCode: ctx.params.coinCode,
    };

    const formattedParams = await validateParams(CoinRouter.schemaGetByCoinCode, params);

    ctx.body = await CoinController.getCoinByCode(formattedParams.coinCode);
  },

  router() {
    const router = Router();

    /**
     * @api {get} / Get coinCode
     * @apiName coinCode
     * @apiGroup Status
     * @apiDescription Get coinCode
     *
     * @apiSampleRequest /
     *
     */
    router.get('/:coinCode', CoinRouter.getCoinByCode);

    return router;
  },
};

module.exports = CoinRouter;
