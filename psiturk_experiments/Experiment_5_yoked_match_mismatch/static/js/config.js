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
    // Condition marks to which participant the participant will be yoked
    this.condition = condition;
    // Block order is already counterbalanced in the to-be-yoked-to data,
    // Counterbalance now balances which clips are mismatched to the question
    this.counterbalance = counterbalance;

    // Whether debug information should be printed out
    this.debug = true;
    // The amount of time to fade HTML elements in/out
    this.fade = 200;
    // List of trial information object for each experiment phase
    this.trials = new Object();

   //List the worker IDs for the to-be-yoked-to participants' data (in chronological order from the database)
    this.yokers = ["AR1IWBDA7MC86","ABL3H3O3BI8ZD","A32QJF67JMJFKX","A3OW5EFQ5QFD19","A15V8K8M4TXT9Y",
    "A2OWVYIPSQB0QP","A2WX9BYW5TI8OA","AOTF48KUV9KWM","A16SJ5D3DKUEXJ","A14ADQ7RUN6TDY",
    "A0017268R9SKD8U2Y3F","A2VRDE2FHCBMF8","ALEE1QD4TW9G4","A2GB0RI43KU4Z","A1N4AZ1QXPOPXH",
    "A21H2UDDHN8ZF","A1GXFMAC759VRM","A1VNYP58BTF4HX","A1727A5VJOZAMR","A1MQ9B05ZMM4YI",
    "A6JKKANO7F4KD","A2USG1JP96FTV","A2YCMT5BPA0AG9","A94DL4GI8ZBUO","A1VOWQJOBWOVKG",
    "A2DWPP1KKAY0HG","A1H72Y9Z5NJXDS","A18T7E73TNGOKP","A1G187YBG0DVMQ","A34F2ESTZYTWRM",
    "A115UFR6VA6OM1","A3EWTW55UCNAHG","A3RHGIM99R25Q9","A2YE2I9DYV9OKW","A3L0DCUXI7X3A9",
    "A1H053T5EXI6EP","A1CSDIX05PK9V","A1X1GFV9H8AGSL","A19C6T7B0H4PAQ","A1U8QI4H4ND1FP"];

    //ORIGINAL RUN OF 24 EXCLUDING FORCE FIRSTERS
    //["AR1IWBDA7MC86","ABL3H3O3BI8ZD","A32QJF67JMJFKX","A3OW5EFQ5QFD19",
    //"A15V8K8M4TXT9Y","A2OWVYIPSQB0QP","A2WX9BYW5TI8OA","AOTF48KUV9KWM",
    //"A16SJ5D3DKUEXJ","A14ADQ7RUN6TDY","A0017268R9SKD8U2Y3F","A2VRDE2FHCBMF8",
    //"ALEE1QD4TW9G4","A2GB0RI43KU4Z","A1N4AZ1QXPOPXH","A21H2UDDHN8ZF",
    //"A1GXFMAC759VRM","A1VNYP58BTF4HX","A1727A5VJOZAMR","A1MQ9B05ZMM4YI",
    //"A3ITZNJQUTIZ4C","AW0MG225VXWCN","A3N8JP3QR3VPE8","A5NHP0N1XC09K"];

	this.yoker = this.yokers[condition];

    // The list of all the HTML pages that need to be loaded
    this.pages = [
        "trial.html",
        "submit.html",
        "replay_world.html"
    ];

    console.log('this config', this);
    
    // Parse the JSON object that we've requested and load it into the
    // configuration
    this.parse_config = function(data) {
	    //Load the details of the clips we will be playing
		this.trials = data.details[this.yoker];
		
		console.log('this.trials.length', this.trials.length);

		for (var i=0; i<this.trials.length; i++)
		{

			if (counterbalance==='0')
			{
				//Matched
				this.trials[i].question = this.trials[i].questionOrig;

				//console.log('hi', i, 'match', this.trials[i].question);

			} else if (counterbalance==='1')
			{
				//Mismatch condition
				if(this.trials[i].questionOrig==='mass')
				{
					this.trials[i].question = 'force';

				} else if (this.trials[i].questionOrig==='force')
				{	
					this.trials[i].question = 'mass';
				}
				//console.log('hi', i, 'mismatch', this.trials[i].question);
			}
		}
	    console.log('condition', condition, 'counterbalance', counterbalance, 
	                'attached trials', this.trials);

	    this.promptForce = data.promptForce;
	    this.promptMass = data.promptMass;
	    this.setupNames = data.setupNames;
	    this.timelineNames = data.timelineNames;
	    this.eventNames = data.eventNames;
	    this.questions = data.questions;
	    this.sliders = data.sliders;
	    this.promptCondition = data.promptCondition;

    };

	this.parse_replays = function (repData)
    {
    	// if (counterbalance==0) {
    	//	this.replays = repData;[1,2,3,4,5,]
    	// } else {
    	// 	this.replays = repData[]
    	// }
        this.replays = repData;

        console.log('replay data check',
            this.replays[0]["o1.x"][0],
            this.replays[0]["o2.x"][0],
            this.replays[0]["world"][0],
            this.replays[0]["question"][0]);
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

        jsonpath = "/static/json/ppt_" + (Number(this.condition)+1) + "_uid_" + this.yoker + ".json";
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