const rooms = function(list_rooms, knex, logger){
  const find_room=(room)=>{
    return list_rooms.filter(
      function(r){
        return r === room;
      });
  };

  const rooms_list =(callback)=>{
    knex('chat_rooms')
      .select(
        'name',
        'topic',
        'about')
      .then(function(rows) {
        if (rows.length === 0) {
          logger.info('никого не найдено');
          callback([]);
        } else {
          rows.forEach(function(item){
            item.name = item.name.toString();
          });
          callback(rows);
        }
      })
      .catch(function(e){
        logger.info('error in find rooms',e);
      });
  };

  const room_add =(room)=>{
    knex('chat_rooms')
      .insert({
        name: room
      })
      .catch(function(e) {
        logger.error(e);
      });
  };

  //вероятно лучше отдель сначала получать id крмнаты, а потом уж все удалять
  const room_remove=(room)=>{
    knex('chat_message_all')
      .where(
        knex.raw(
          '`room_id`=(select `chat_rooms`.`id` from `chat_rooms` where `chat_rooms`.`name`=:room_name)',
          { room_name:room})
      )
      .del()
      .then(
        knex('chat_rooms')
          .where({
            'name' : room
          })
          .del()
          .catch(function(e) {
            logger.error(e);
          })
      )
      .catch(function(e){
        logger.error(e);
      });


    return true;
  };

  this.list=(cb)=>{
    rooms_list(function(rooms){
      cb(rooms);
    });
  };

  this.add_room=(room)=>{
    if(find_room(room).length === 0){
      room_add(room);
      return true;
    } else {
      return false;
    }};

  this.remove_room=(room)=>{
    room_remove(room);
  };
};

module.exports.rooms = rooms;
