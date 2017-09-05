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

    // There should only be one condition in this experiment
    this.condition = condition;
    //this.condition =  0;

    // counterbalance (switches which training problem is asked first)
    this.counterbalance = counterbalance;
    // this.counterbalance = 1;
    // this.counterbalance = 0;

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
        
		//Create two independent copies of the data array since we are doubling
		//the trials and they need to be separate objects with different .question property
        var force_trials = JSON.parse(JSON.stringify(data["stim"]));
        var mass_trials =  JSON.parse(JSON.stringify(data["stim"]));
        var all_trials = [];//tmp1.concat(tmp2);

        for (var i=0; i<force_trials.length; ++i)
        {
            force_trials[i].question='force';
            mass_trials[i].question='mass';
            force_trials[i].labels = ['A','B'];
            mass_trials[i].labels = ['A','B'];

			//share non-target forces between repeats of problems
            var these_r_forces = [[-3,0,3][Math.floor(Math.random()*3)],
                [-3,0,3][Math.floor(Math.random()*3)],
                [-3,0,3][Math.floor(Math.random()*3)],
                [-3,0,3][Math.floor(Math.random()*3)],
                [-3,0,3][Math.floor(Math.random()*3)]];
			
            //Share starting vectors between repeats of problems
	        force_trials[i].r_forces = these_r_forces;
	        mass_trials[i].r_forces = these_r_forces;

	        //share forces between repeats of problems
	        these_start_vecs = [[(Math.random() * 20 - 10),(Math.random() * 20 - 10)],
	        					[(Math.random() * 20 - 10),(Math.random() * 20 - 10)],
	        					[(Math.random() * 20 - 10),(Math.random() * 20 - 10)],
	        					[(Math.random() * 20 - 10),(Math.random() * 20 - 10)]]
	        force_trials[i].start_vecs = these_start_vecs;
	        mass_trials[i].start_vecs = these_start_vecs;
			
			//This function (in utils.js) takes dimensions of world,
			//size of ball and outputs non-overlapping
			//but otherwise random locations
	        these_start_locs = PrespecifiedRandomLocations(4, 6, 4, 0.25);

	        force_trials[i].start_locs = these_start_locs;
	        mass_trials[i].start_locs = these_start_locs;
        }

        //Clone then shuffle the trials
        var force_trials_shuffled = JSON.parse(JSON.stringify(force_trials));
        force_trials_shuffled = shuffle(force_trials_shuffled);
        var mass_trials_shuffled = JSON.parse(JSON.stringify(mass_trials));
        mass_trials_shuffled = shuffle(mass_trials_shuffled);

        //Add two practice trials
        /////////////////////////
    	
    	//Force question world 1 (attracts)
        force_trials_shuffled.unshift(force_trials[0]);//data["stim"][4]);
        //Mass question, world 1 (first object heavier)
        mass_trials_shuffled.unshift(mass_trials[4]);//data["stim"][0]);

        //Counterbalance balances the order of the two blocks
        
        //counterbalance = 1;//ARRRRRRRRGH, THIS WASN'T COMMENTED OUT
        counterbalance = 0; //Now force 20 participants with relationship question first

        if (counterbalance==0)
        {
	        for (i=0; i<force_trials_shuffled.length; ++i)
    	    {
        		all_trials.push(force_trials_shuffled[i]);
        	}
	        for (i=0; i<mass_trials_shuffled.length; ++i)
    	    {
        		all_trials.push(mass_trials_shuffled[i]);
        	}
    
        } else if (counterbalance == 1) {

	        for (i=0; i<mass_trials_shuffled.length; ++i)
    	    {
        		all_trials.push(mass_trials_shuffled[i]);
        	}
	        for (i=0; i<force_trials_shuffled.length; ++i)
    	    {
        		all_trials.push(force_trials_shuffled[i]);
        	}
        }

        this.trials = JSON.parse(JSON.stringify(all_trials));//Cloning to be safe

        console.log('condition', condition, 'counterbalance', counterbalance, 'all_trials', all_trials,
                    'attached trials', this.trials);

        //Generate random but distractor forces (shared across repeat of problem)
        //TODO Consider doing same with starting velocities
        //TODO consider keeping them the same for all participants
        
        //Generate labels with random counterbalancing and enforced reversal for revisiting same problem.
        // if (Math.random()>0.5)
        // {
        //     tmp1[i].labels = ['A','B'];
        //     tmp2[i].labels = ['B','A'];
        // } else {
        //     tmp1[i].labels = ['B','A'];
        //     tmp2[i].labels = ['A','B']; 
        // }
        
        //only choose a subset of trials 
        //this.trials = this.trials.slice(0,10); //ten trials 
        //this.trials = this.trials.slice(0,2); //two trials 
        
        this.promptForce = data["promptForce"];
        this.promptMass = data["promptMass"];
        this.setupNames = data["setupNames"];
        this.timelineNames = data["timelineNames"];
        this.eventNames = data["eventNames"];
        this.questions = data["questions"];
        this.sliders = data["sliders"];
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