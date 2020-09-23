import { Container } from 'typedi';

/**
 * Attach user to req.currentUser
 * @param {*} req Express req Object
 * @param {*} res  Express res Object
 * @param {*} next  Express next Function
 */
const attachCurrentUser = async (req, res, next) => {
  const logger = Container.get('logger');
  try {
    const userModel = Container.get('userModel');
    const userRecord = await userModel.findById(req.token._id);
    if (!userRecord) {
      return res.sendStatus(401);
    }
    const currentUser = userRecord.toObject();
    Reflect.deleteProperty(currentUser, 'password');
    req.currentUser = currentUser;
    return next();
  } catch (e) {
    logger.error('Error attaching user to req: %o', e);
    return next(e);
  }
};

export default attachCurrentUser;
