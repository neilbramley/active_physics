/* config.js
 * 
 * This file contains the code necessary to load the configuration
 * for the experiment.
 */

// Object to hold the experiment configuration. It takes as parameters
// the numeric codes representing the experimental condition and
// whether the trials are counterbalanced.
var Config = function(condition, counterbalance) {

    // These are the condition and counterbalancing ids
    var that = this;

    // condition is which one is first
    this.condition = condition;

    // this.condition = 0;
     // this.condition = 1;
    this.condition =  2;

    // counterbalance, we want to counterbalance global force and which colour is object 1
    this.counterbalance = counterbalance;

    // Whether debug information should be printed out
    this.debug = true;
    // The amount of time to fade HTML elements in/out
    this.fade = 200;
    // List of trial information object for each experiment phase
    this.trials = new Object();

    // Lists of pages and examples for each instruction page.  We know
    // the list of pages we want to display a priori.
        // this.instructions = {
        //     pages: ["instructions-training-1"]
        // };

    // The list of all the HTML pages that need to be loaded
    this.pages = [
        "trial.html",
        "submit.html",
        "physics_world.html"
    ];

    // Parse the JSON object that we've requested and load it into the
    // configuration
    this.parse_config = function(data) {
        
        if (counterbalance==0)
        {
            this.trials = JSON.parse(JSON.stringify(data["stim1"])); //Clones the array rather than shallow copying it;
        } else{
            this.trials = JSON.parse(JSON.stringify(data["stim2"])); //Clones the array rather than shallow copying it;
        }
        
        console.log('condition', condition, 'counterbalance', counterbalance);

        this.trials = shuffle(this.trials);//shuffle(data["stim"]); //shuffles the array

        //Add two practice trials
        if (counterbalance==0)
        {
            this.trials.unshift(data["stim1"][6]);
            this.trials.unshift(data["stim1"][11]);
        } else {
            this.trials.unshift(data["stim2"][6]);
            this.trials.unshift(data["stim2"][11]); 
        }

        console.log('trials shuffled', this.trials);

        //only choose a subset of trials 
        //this.trials = this.trials.slice(0,10); //ten trials 
        //this.trials = this.trials.slice(0,2); //two trials 
        this.prompt = data["prompt"];
        this.setupNames = data["setupNames"];
        this.timelineNames = data["timelineNames"];
        this.eventNames = data["eventNames"];
        this.questions = data["questions"];
        this.promptCondition = data["promptCondition"];
    };

    // Load the experiment configuration from the server
    this.load_config = function() {
        // var exp_condition = Number(that.condition)+1;
        var jsonpath = "/static/json/stim.json"
        $.ajax({
            dataType: "json",
            url: jsonpath,
            async: false,
            success: function(data) {
                if (that.debug) {
                    console.log("Got configuration data");
                }
                that.parse_config(data);
            }
        });

    };

    // Request from the server configuration information for this run
    // of the experiment
    this.load_config();
};