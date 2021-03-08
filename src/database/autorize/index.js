const autorize = function(knex, logger){

  this.log = function(login){
    let date = new Date();
    logger.debug('вызван update', date, login);
    knex('users')
      .where(
        'login', '=', login
      )
      .update({
        'date_visit': date
      })
      .catch(function(e) {
        logger.error(e);
      });
  };
  this.update_password = function(login, password){
    let date = new Date();
    logger.debug('Вызван update password', date, login, password);
    knex('users')
      .where(
        'login', '=', login
      )
      .update({
        'password':password,
        'date_visit': date
      })
      .catch(function(e) {
        logger.error(e);
      });

  };

};
module.exports.autorize = autorize;
