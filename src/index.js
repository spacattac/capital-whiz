'use strict';
var Alexa = require('alexa-sdk');

//Replace with your app ID (OPTIONAL).  You can find this value at the top of your skill's page on http://developer.amazon.com.  
//Make sure to enclose your value in quotes, like this: var APP_ID = "amzn1.ask.skill.bb4045e6-b3e8-4133-b650-72923c5980f1";
var APP_ID = undefined;

var SKILL_NAME = "Capital Whiz";
var GET_FACT_MESSAGE = "The state capital of ";
var WELCOME_MESSAGE = "Welcome to Capital Whiz.  I can recite all 50 state capitals, give the capital for a state of your choice, or give you a quiz.";//  I can give the capital if you give me the state.  And, I can quiz your capital knowledge.  What would you like to do?";
var HELP_MESSAGE = "As an example, you can say what is the capital of Hawaii.";
var HELP_REPROMPT = "I'll wait for your command.";
var CANCEL_MESSAGE = "Sure.  You're in control."
var STOP_MESSAGE = "Goodbye!";

var stateFilter = undefined;
var capitalFilter = undefined;
var recitals = [];
var cardText = [];

var states = [
    { 
        "name": "Alabama",
        "capital": "Montgomery"
    },
       { 
        "name": "Alaska",
        "capital": "Juneau"
    }, 
    { 
        "name": "Arizona",
        "capital": "Phoenix"
    },    
    { 
        "name": "Arkansas",
        "capital": "Little Rock"
    },    
    { 
        "name": "California",
        "capital": "Sacramento"
    },
    { 
        "name": "Colorado",
        "capital": "Denver"
    }, 
    { 
        "name": "Connecticut",
        "capital": "Hartford"
    },    
    { 
        "name": "Delaware",
        "capital": "Dover"
    },  
    { 
        "name": "Florida",
        "capital": "Tallahassee"
    },
    { 
        "name": "Georgia",
        "capital": "Atlanta"
    }, 
    { 
        "name": "Hawaii",
        "capital": "Honolulu"
    },    
    { 
        "name": "Idaho",
        "capital": "Boise"
    },      
    { 
        "name": "Illinois",
        "capital": "Springfield"
    },
    { 
        "name": "Indiana",
        "capital": "Indianapolis"
    }, 
    { 
        "name": "Iowa",
        "capital": "Des Moines"
    },    
    { 
        "name": "Kansas",
        "capital": "Topeka"
    },   
    { 
        "name": "Kentucky",
        "capital": "Frankfort"
    },
    { 
        "name": "Louisiana",
        "capital": "Baton Rouge"
    }, 
    { 
        "name": "Maine",
        "capital": "Augusta"
    },    
    { 
        "name": "Maryland",
        "capital": "Annapolis"
    },      
    { 
        "name": "Massachusetts",
        "capital": "Boston"
    },
    { 
        "name": "Michigan",
        "capital": "Lansing"
    }, 
    { 
        "name": "Minnesota",
        "capital": "Saint Paul"
    },    
    { 
        "name": "Mississippi",
        "capital": "Jackson"
    },  
    { 
        "name": "Missouri",
        "capital": "Jefferson City"
    },
    { 
        "name": "Montana",
        "capital": "Helena"
    }, 
    { 
        "name": "Nebraska",
        "capital": "Lincoln"
    },    
    { 
        "name": "Nevada",
        "capital": "Carson City"
    },  
    { 
        "name": "New Hampshire",
        "capital": "Concord"
    },
    { 
        "name": "New Jersey",
        "capital": "Trenton"
    }, 
    { 
        "name": "New Mexico",
        "capital": "Santa Fe"
    },    
    { 
        "name": "New York",
        "capital": "Albany"
    },      
    { 
        "name": "North Carolina",
        "capital": "Raleigh"
    },
    { 
        "name": "North Dakota",
        "capital": "Bismarck"
    }, 
    { 
        "name": "Ohio",
        "capital": "Columbus"
    },    
    { 
        "name": "Oklahoma",
        "capital": "Oklahoma City"
    },
    { 
        "name": "Oregon",
        "capital": "Salem"
    },
    { 
        "name": "Pennsylvania",
        "capital": "Harrisburg"
    }, 
    { 
        "name": "Rhode Island",
        "capital": "Providence"
    },    
    { 
        "name": "South Carolina",
        "capital": "Columbia"
    },
    { 
        "name": "South Dakota",
        "capital": "Pierre"
    },
    { 
        "name": "Tennessee",
        "capital": "Nashville"
    }, 
    { 
        "name": "Texas",
        "capital": "Austin"
    },    
    { 
        "name": "Utah",
        "capital": "Salt Lake City"
    },      
    { 
        "name": "Vermont",
        "capital": "Montpelier"
    },
    { 
        "name": "Virginia",
        "capital": "Richmond"
    }, 
    { 
        "name": "Washington",
        "capital": "Olympia"
    },    
    { 
        "name": "West Virginia",
        "capital": "Charleston"
    },      
    { 
        "name": "Wisconsin",
        "capital": "Madison"
    },
    { 
        "name": "Wyoming",
        "capital": "Cheyenne"
    }     
];

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LaunchRequest': function () {
        this.emit(':ask', WELCOME_MESSAGE, HELP_REPROMPT);
    },
    'ReciteCapitalsIntent': function () {
        recitals = [];
        cardText = [];

        states.forEach(reciteState);
        var speechOutput = recitals.join(". ");

        states.forEach(cardDisplayState);
        var cardOutput = cardText.join("\r\n");

        this.emit(':askWithCard', speechOutput, HELP_REPROMPT, SKILL_NAME, cardOutput);
    },
    'GiveCapitalIntent': function () {
        stateFilter = this.event.request.intent.slots.State.value;
        var capital = states.find(findState).capital;
        this.emit(':ask', capital + ', ' + stateFilter, HELP_REPROMPT);
    },
    'QuizIntent': function () {
        var state = nextState().name;
        this.attributes['lastState'] = state;
        var question = 'what is the capital of ' + state;
        this.emit(':ask', question, question);
    },
    'QuizAnswerIntent': function () {

        var cardText = [];

        // get and compare answer
        var expectedState = this.attributes['lastState'];
        console.log('alexa asked for capital of: ' + expectedState);
        cardText.push('I asked you for the capital of ' + expectedState);

        capitalFilter = this.event.request.intent.slots.Capital.value;
        console.log('user answered: ' + capitalFilter);
        cardText.push('You answered ' + capitalFilter);

        var result = 'wrong';
        var state = states.find(findStateByCapital);        
        if(state === undefined) {
            console.log('state lookup: ' + state);
            cardText.push('Your capital answer equates to ' + state + ' state')
        }        
        else if(state.name.toLowerCase() !== expectedState.toLowerCase()) {
            console.log('state lookup: ' + state.name);
            cardText.push('Your capital answer equates to ' + state.name + ' state')
        }
        else {
            result = 'correct';
        }

        console.log('answer is: ' + result);
        cardText.push('You answer is ' + result + '.');

        // pick next state and ask next question    
        state = nextState().name;
        this.attributes['lastState'] = state;
        var question = 'what is the capital of ' + state;

        var cardOutput = cardText.join('.\r\n');
        this.emit(':askWithCard', result, question, SKILL_NAME, cardOutput);
    },
    'AMAZON.HelpIntent': function () {
        var speechOutput = HELP_MESSAGE;
        var reprompt = HELP_REPROMPT;
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', CANCEL_MESSAGE);
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', STOP_MESSAGE);
    }
};

function findState(state) { 
    return state.name === stateFilter;
}

function findStateByCapital(state) { 
    return state.capital.toLowerCase() === capitalFilter.toLowerCase();
}

function reciteState(state) {
    recitals.push(GET_FACT_MESSAGE + state.name + ' is ' + state.capital);
}

function cardDisplayState(state) {
    cardText.push(state.capital + ', ' + state.name);
}

function nextState() {
    return states[Math.floor(Math.random() * states.length)];
}