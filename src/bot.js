'use strict';

module.exports.setup = function (app) {
    var builder = require('botbuilder');
    var teams = require('botbuilder-teams');
    var config = require('config');

    if (!config.has('bot.appId')) {
        // We are running locally; fix up the location of the config directory and re-intialize config
        process.env.NODE_CONFIG_DIR = '../config';
        delete require.cache[require.resolve('config')];
        config = require('config');
    }
    // Create a connector to handle the conversations
    var connector = new teams.TeamsChatConnector({
        // It is a bad idea to store secrets in config files. We try to read the settings from
        // the config file (/config/default.json) OR then environment variables.
        // See node config module (https://www.npmjs.com/package/config) on how to create config files for your Node.js environment.
        appId: config.get('bot.appId'),
        appPassword: config.get('bot.appPassword')
    });

    var inMemoryBotStorage = new builder.MemoryBotStorage();

    function createCard(cardType, input) {
        const cardTypes = {
            chat: {
                imageUrl: 'https://i.ibb.co/y581QQL/live-chat.png',
                textblock: 'Chat with a Poly representative',
                actionUrl: 'https://www.poly.com', // TODO: update url
            },
            support: {
                imageUrl: 'https://i.ibb.co/3RBmcwt/customer-service.png',
                //imageUrl: 'https://image.flaticon.com/icons/svg/1444/1444148.svg',
                textblock: input,
                actionUrl: encodeURI(`https://support.polycom.com/PolycomService/coveo/search.htm#q=${input}`),
            },
            dial: {
                imageUrl: 'https://i.ibb.co/DYD9NtT/call.png',
                textblock: `Dial ${input}`,
                actionUrl: `h323://${input}`
            }
        };

        return {
            'contentType': 'application/vnd.microsoft.card.adaptive',
            'content': {
                '$schema': 'http://adaptivecards.io/schemas/adaptive-card.json',
                'version': '1.0',
                'type': 'AdaptiveCard',
                'body': [
                    {
                        'type': 'Container',
                        'items': [
                            {
                                'type': 'ColumnSet',
                                'columns': [
                                    {
                                        'type': 'Column',
                                        'width': 'auto',
                                        'items': [
                                            {
                                                'type': 'Image',
                                                'url': cardTypes[cardType].imageUrl,
                                                'size': 'small',
                                                'style': 'person'
                                            }
                                        ]
                                    },
                                    {
                                        'type': 'Column',
                                        'width': 'stretch',
                                        'items': [
                                            {
                                                'type': 'TextBlock',
                                                'text': cardTypes[cardType].textblock,
                                                'weight': 'bolder',
                                                'wrap': true
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ],
                'actions': [
                    {
                        'type': 'Action.OpenUrl',
                        'title': 'Click here!',
                        'url': cardTypes[cardType].actionUrl
                    }
                ]
            }
        };
    }

    // Define a simple bot with the above connector that echoes what it received
    var bot = new builder.UniversalBot(connector, function (session) {
        let msg;
        // Message might contain @mentions which we would like to strip off in the response
        var text = teams.TeamsMessage.getTextWithoutMentions(session.message);
        var textArray = text.toLowerCase().split(' ');
        // const command = textArray[0].toLowerCase();
        const command = textArray.slice(0,1).join(' ');
        const input = textArray.slice(1).join(' ');
        switch (command) {
            case 'chat':
                msg = new builder.Message(session).addAttachment(createCard('chat', input));
                break;
            case 'dial':
                msg = new builder.Message(session).addAttachment(createCard('dial', input));
                break;
            case 'support':
                msg = new builder.Message(session).addAttachment(createCard('support', input));
                break;
            default:
                let card = {
                    'contentType': 'application/vnd.microsoft.card.adaptive',
                    'content': {
                        'type': 'AdaptiveCard',
                        'body': [
                            {
                                'type': 'TextBlock',
                                'text': 'Sorry! I do not understand that yet.'
                            }
                        ],
                        '$schema': 'http://adaptivecards.io/schemas/adaptive-card.json',
                        'version': '1.0'
                    }
                };
                msg = new builder.Message(session).addAttachment(card);
                break;
        }
        session.send(msg);
    }).set('storage', inMemoryBotStorage);

    // Setup an endpoint on the router for the bot to listen.
    // NOTE: This endpoint cannot be changed and must be api/messages
    app.post('/api/messages', connector.listen());

    // Export the connector for any downstream integration - e.g. registering a messaging extension
    module.exports.connector = connector;
};
