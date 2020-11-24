var express = require('express');
var router = express.Router();
var constants = require('../util/constants');
const Discord = require('discord.js');
intents = Discord.Intents.ALL
const client = new Discord.Client(intents);

/* GET users listing. */
router.get('/', function(req, res, next) {

    client.on('ready', () => {
        console.log("ready")

    });

    client.on('message', msg => {
        if (msg.content.includes('hello')) {
            msg.reply('it\'s a trap');
        }
    });

    client.login(constants.CLIENT_TOKEN);

    const statusArray = [];

    client.guilds.cache.array().forEach(g => {
        let user = g.members.cache.find(member => {
            if (member.id === constants.MEMBER_ID) {
                return member
            }
        });

        const activities = user.presence.activities;

        for (let index = 0; index < activities.length; index++){
            console.log("activity: %j", activities[index])
            let details = ""
            if(activities[index].details != null){
                details = " - " + activities[index].details
            }

            let status = {
                type: activities[index].type,
                name: activities[index].name,
                action: activities[index].state + details
            }

            statusArray.push(status)
        }


        res.json({status : statusArray});
    });



});





module.exports = router;
