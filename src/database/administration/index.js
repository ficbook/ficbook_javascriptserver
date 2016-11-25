const administration = function(knex,logger){
    const ban_user = (username_banned, username_banning, reason, duration) =>{
        const time_expired = Date.now() + duration;
        logger.ingo(time_expired);
        knex('bans_list')
            .insert({
                'login_banned':username_banned,
                'login_banning': username_banning,
                'reason': reason,
                'time_expired':new Date(time_expired)
            })
            .catch(function(e) {
                logger.error(e);
            });
    };

    const unban_user = (username_unbanned) =>{

    };

    const list_ban_users = (cb) =>{

        knex('bans_list')
            .select(
                'login_banned',
                'login_banning',
                'reason',
                'time_expired'
            ).where(
                'time_expired','>', Date.now()
            )
            .orderBy('time_expired','desc')
            .then(
                function(rows) {
                    if (rows.length === 0) {
                        cb([]);
                    } else {
                        rows.forEach(function(item,i,arr){
                            item.time_expired = Date.parse(item.time_expired);
                            item.login_banned = item.login_banned.toString();
                            item.login_banning = item.login_banning.toString();
                            item.reason = item.reason.toString();
                        });
                        cb(rows);
                    }}
            )
            .catch(function(e){
                logger.error(e);
            });
    };

    this.ban_user = ban_user;
    this.unban_user = unban_user;
    this.list_ban_users = list_ban_users;
};

module.exports.administration = administration;
