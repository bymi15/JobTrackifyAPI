import { NextFunction, Request, Response, Router } from 'express';
import { Logger } from 'winston';
import { Container } from 'typedi';
import { isAuth } from '../middlewares';
import { celebrate, Joi } from 'celebrate';
import NodeGeocoder, { GoogleOptions } from 'node-geocoder';
import config from '../../config';
import { ICompanyLocationDTO } from '../../types';
import { ErrorHandler } from '../../helpers/ErrorHandler';

const route = Router();

const options: GoogleOptions = {
  provider: 'google',
  apiKey: config.googleApiKey,
};

const geocoder = NodeGeocoder(options);

route.get(
  '/:location',
  isAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling GET to /geocode endpoint with body %o', req.body);
    try {
      const data = await geocoder.geocode(req.params.location);
      return res.json(data).status(200);
    } catch (e) {
      return next(e);
    }
  }
);

route.post(
  '/',
  isAuth,
  celebrate({
    body: Joi.object({
      companyLocations: Joi.array()
        .items(
          Joi.object({
            id: Joi.string().required(),
            companyName: Joi.string().required(),
            location: Joi.string().required(),
          })
        )
        .required(),
    }),
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling POST to /geocode endpoint with body %o', req.body);
    try {
      const companyLocations = req.body
        .companyLocations as ICompanyLocationDTO[];
      logger.debug('%o', companyLocations);
      const data = [];
      for (let i = 0; i < companyLocations.length; i++) {
        const geocodeData = await geocoder.geocode(
          companyLocations[i].location
        );
        if (!geocodeData || geocodeData.length === 0) {
          return next(
            new ErrorHandler(500, 'Geocode API returned invalid response')
          );
        }
        data.push({
          id: companyLocations[i].id,
          companyName: companyLocations[i].companyName,
          address: companyLocations[i].location,
          lat: geocodeData[0].latitude,
          lng: geocodeData[0].longitude,
        });
      }
      return res.json(data).status(200);
    } catch (e) {
      return next(e);
    }
  }
);

export default route;
