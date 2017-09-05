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
    //this.condition = 3; //Condition will be the active participant that the current participant is yoked to
    // this.condition = 1;
    // this.condition =  0;

    // counterbalance (switches which question was asked first)
    this.counterbalance = counterbalance;
    // this.counterbalance = 1;
    // this.counterbalance = 0;

    console.log("counterbalance1",this.counterbalance)

    // Whether debug information should be printed out
    this.debug = true;
    // The amount of time to fade HTML elements in/out
    this.fade = 200;
    // List of trial information object for each experiment phase
    this.trials = new Object();

    
   //List the worker IDs you want to include in the exp here
    this.yokers = ["A2MWAXV1YRK5GH", "A1P0NNR8HOQ95R", "A3VMKLJTSGYKHN",
                    "A33QUS4NRVVMTN", "A25MM8IKSW3G19", "A2N0FUQBDQRBN5",
                    "A2Z96TK65BB7LC", "A3W6T1WDYXMR3",  "AVC1PLLFS210S", 
                    "A28HYRF3QXFAXL", "A4J4GGMKJ68L0",  "A27W025UEXS1G0",
                     "A2EI075XZT9Y2S", "ANV4TUKMWLA8E",  "ASTDBTVY3WP1K",
                    "AHB3QFZSFN9DL",  "ANZKTE853UXSD",  "A38HFMRXB5Q13M",
                    "A3527QDVIOHI8E", "AV22FQTJNBUZT",  "A7RAVFS10BUZ1"];
 
    this.yoker = this.yokers[condition];
    
    // The list of all the HTML pages that need to be loaded
    this.pages = [
        "trial.html",
        "submit.html",
        "replay_world.html"
    ];

    // Parse the JSON object that we've requested and load it into the
    // configuration
    this.parse_config = function(data) {
        

        this.trials = data["details"][this.yoker];//JSON.parse(JSON.stringify(data["stim"])); //Clones the array rather than shallow copying it;

        //take counterbalance variable from original participant 
        this.counterbalance = data["details"][this.yoker][0]["origCounterbalance"];
        
        // console.log('condition', condition, this.condition,
        //     '\ncounterbalance', counterbalance, '\ntrials', this.trials,
        //     '\nyoker', this.yoker, data["yokers"][condition]);

        
        //only choose a subset of trials 
        //this.trials = this.trials.slice(0,10); //ten trials 
        //this.trials = this.trials.slice(0,1); //two trials 
        
        this.prompt = data["prompt"];
        this.setupNames = data["setupNames"];
        this.timelineNames = data["timelineNames"];
        this.eventNames = data["eventNames"];
        this.questions = data["questions"];
        this.sliders = data["sliders"];
        //this.promptCondition = data["promptCondition"];
    };

    this.parse_replays = function (repData)
    {
        this.replays = repData;
        console.log('replay data check',
            this.replays[0]["object1.x"][0],
            this.replays[0]["object2.x"][0],
            this.replays[0]["object3.x"][0],
            this.replays[0]["object4.x"][0]);
    }

    // Load the experiment configuration from the server
    this.load_config = function() {
        
        
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

        jsonpath = "/static/json/ppt_" + this.yoker + ".json";
        $.ajax({
            dataType: "json",
            url: jsonpath,
            async: false,
            success: function(repData) {
                if (that.debug) {
                    console.log("Got replay data");
                }
                that.parse_replays(repData);
            }
        });
    };

    // Request from the server configuration information for this run
    // of the experiment
    this.load_config();
};