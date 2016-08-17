/*jshint esversion: 6 */
/*globals module */

const administration = function(knex,logger){
    const ban_user = (username_banned, username_banning, reason, duration) =>{
        const time_expired = Date.now() + duration;
        console.log(time_expired);
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

    const list_ban_users = () =>{
        
    };
    
    this.ban_user = ban_user;
    this.unban_user = unban_user;
};

module.exports.administration = administration;
