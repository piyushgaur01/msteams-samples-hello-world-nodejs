'use strict';

module.exports.setup = function () {
    var builder = require('botbuilder');
    var teamsBuilder = require('botbuilder-teams');
    var bot = require('./bot');

    bot.connector.onQuery('joinMeeting', function(event, query, callback) {
        //var faker = require('faker');

        // If the user supplied a title via the cardTitle parameter then use it or use a fake title
        var title = query.parameters && query.parameters[0].name === 'meetingId'
            ? query.parameters[0].value
            : parseInt(Math.random()*10000);

        // let randomImageUrl = "https://loremflickr.com/200/200"; // Faker's random images uses lorempixel.com, which has been down a lot

        // Build the data to send
        var attachments = [];

        // Generate 5 results to send with fake text and fake images
        //for (var i = 0; i < 5; i++) {
            attachments.push(
                new builder.ThumbnailCard()
                    .title('Click to join meeting')
                    .buttons([
                        {
                            type: "openUrl",
                            title: "Join Meeting",
                            value: `h323://${title}`
                        }
                    ])
                    //.text(faker.lorem.paragraph())
                    //.images([new builder.CardImage().url(`${randomImageUrl}?random=${i}`)])
                    .toAttachment());
        //}

        // Build the response to be sent
        var response = teamsBuilder.ComposeExtensionResponse
            .result('list')
            .attachments(attachments)
            .toResponse();

        // Send the response to teams
        callback(null, response, 200);
    });


    // bot.connector.onQuery('joinMeeting', function (event, query, callback) {


    //     // If the user supplied a title via the cardTitle parameter then use it or use a fake title
    //     var title = query.parameters && query.parameters[0].name === 'meetingId'
    //         ? query.parameters[0].value
    //         : '12345';

    //     // Build the data to send
    //     var attachments = [];

    //     const caList = [];
        
    //     caList.push(new builder.CardAction()
    //         .title('Join').type('openUrl').value(`h323://${title}`)
    //     );

    //     attachments.push(
    //         new builder.ThumbnailCard()
    //             .title(title)
    //             .buttons(caList)
    //             .toAttachment()
    //     );

    //     // Build the response to be sent
    //     var response = teamsBuilder.ComposeExtensionResponse()
    //         .result('list')
    //         .attachments(attachments)
    //         .toResponse();

    //     // Send the response to teams
    //     callback(null, response, 200);
    // });
};
