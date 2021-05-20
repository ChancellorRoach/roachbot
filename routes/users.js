var express         = require('express');
var passport        = require('passport');
var OAuth2Strategy  = require('passport-oauth').OAuth2Strategy;
var router          = express.Router();
var constants       = require('../util/constants');

const Discord       = require('discord.js');
intents             = Discord.Intents.ALL
const client        = new Discord.Client(intents);

client.login(constants.CLIENT_TOKEN);

client.on('ready', () => {
    console.log("ready")

});

client.on('message', msg => {
    if (msg.content.includes('hello')) {
        msg.reply('it\'s a trap');
    }
});

// Override passport profile function to get user profile from Twitch API
OAuth2Strategy.prototype.userProfile = function(accessToken, done) {
    var options = {
        url: 'https://api.twitch.tv/helix/users',
        method: 'GET',
        headers: {
            'Client-ID': constants.TWITCH_CLIENT_ID,
            'Accept': 'application/vnd.twitchtv.v5+json',
            'Authorization': 'Bearer ' + accessToken
        }
    };

    request(options, function (error, response, body) {
        if (response && response.statusCode == 200) {
            done(null, JSON.parse(body));
        } else {
            done(JSON.parse(body));
        }
    });
}

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

passport.use('twitch', new OAuth2Strategy({
        authorizationURL: 'https://id.twitch.tv/oauth2/authorize',
        tokenURL: 'https://id.twitch.tv/oauth2/token',
        clientID: constants.TWITCH_CLIENT_ID,
        clientSecret: constants.TWITCH_SECRET,
        state: true
    },
    function(accessToken, refreshToken, profile, done) {
        profile.accessToken = accessToken;
        profile.refreshToken = refreshToken;

        // Securely store user profile in your DB
        //User.findOrCreate(..., function(err, user) {
        //  done(err, user);
        //});

        done(null, profile);
    }
));

// Set route to start OAuth link, this is where you define scopes to request
router.get('/auth', passport.authenticate('twitch', { scope: 'user_read' }));


/* GET users listing. */
router.get('/', function(req, res, next) {

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

            let action = activities[index].state
            if(activities[index].details != null){
                action = action + " - " + activities[index].details
            }

            let status = {
                type: activities[index].type,
                name: activities[index].name,
                action: action
            }

            statusArray.push(status)
        }


        res.json({status : statusArray});
    });



});





module.exports = router;
