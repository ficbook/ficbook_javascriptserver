const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
const webauth= function(login, password, logger ,cb){
  const xhr = new XMLHttpRequest();
  const body = 'login=' + encodeURIComponent(login) +'&password=' + encodeURIComponent(password);
  xhr.open('POST', 'https://ficbook.net/login_check', true);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.onreadystatechange = function(){
    if(xhr.readyState === 4){
      let pars;
      try{
        pars = JSON.parse(xhr.responseText);
        cb(pars);
      } catch (err){
        logger.error(err);
        logger.info('Response text:',xhr.responseText);
        cb([false, 'Какие-то проблемы с авторизацией на фикбуке. Эту ошибку мы в ближайшее время исправим (когда узнаем о ней)']);
      }
    }
  };
  xhr.send(body);
};

const authorization = function(confPower, nddb, logger){
  const authorization =(ws, event, ccb)=>{
    const elogin = event.login;
    const epassword = event.password;
    let registered;
    logger.info('elogin:', elogin,'password', epassword);
    nddb.user.login(elogin , epassword, function(success){
      const registered = success;
      logger.info('registered', registered);
      if(registered){
        nddb.autorize.log(elogin);
        logger.info('login:', elogin,'password:', epassword);
        ccb(registered);
      }else{
        webauth(elogin,epassword,logger,function(result){
          console.log('Fullresult: ', result);
          if(result['result']===true){
            console.log(result[0]);
            nddb.user.add(elogin,epassword);
            nddb.autorize.update_password(elogin,epassword);
            ccb(result[0]);
          } else {
            try{
              ws.send(
                JSON.stringify({
                  'type':'status',
                  'action':'authorization',
                  'status':'errors',
                  'message':result['error']
                }));
            }catch(err){
              logger.info('Ошибка ошибочного статуса авторизации для ',elogin);
            }}});


        //                logger.info("Ошибка авторизации", elogin);
        //        ws.close(4001,'Неправильный логин или пароль');
        // TODO довести до ума процедуру авторизации
        //                ws.send(
        //                    JSON.stringify({
        //            "type":"autorize",
        //            "action":"fail",
        //            "subject":"Пошел нах"

        //                        'type':'status',
        //                        'action':'authorization',
        //                        'status':'error',

        //                        'message':'научимся работать с апи - будет статус'
        // тут сообщение фикбука
        /*
                                'cause':'error in data',
                                'object':'autorize data',
                                'subject':'need be correct '
                */

        //                    })
        //                );





      }});
  };
  this.authorization = authorization;
};



module.exports.authorization = authorization;
