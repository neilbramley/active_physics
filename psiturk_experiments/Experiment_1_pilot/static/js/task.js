/* task.js
 * 
 * This file holds the main experiment code.
 * 
 * Requires:
 *   config.js
 *   psiturk.js
 *   utils.js
 */


// Create and initialize the experiment configuration object
var $c = new Config(condition, counterbalance);

// Initalize psiturk object
var psiTurk = new PsiTurk(uniqueId, adServerLoc);

// Preload the HTML template pages that we need for the experiment
psiTurk.preloadPages($c.pages);

// Objects to keep track of the current phase and state
var CURRENTVIEW;
var STATE;

/*************************™
 * INSTRUCTIONS         
 *************************/

var Instructions = function() {

    $(".slide").hide();
    var slide = $("#instructions1");
    slide.fadeIn($c.fade);

    slide.find('.next').click(function () {
       CURRENTVIEW = new Instructions2(); 
    });
};

 var Instructions2 = function() {

    $(".slide").hide();
    var slide = $("#instructions2-"+$c.condition);
    slide.fadeIn($c.fade);

    slide.find('.next').click(function () {
        CURRENTVIEW = new TestPhase();
        // CURRENTVIEW = new Comprehension();
    });
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*************************
 * TRIAL
 *************************/

 var TestPhase = function(){

    // debugger
    var that = this;
    this.trialinfo;    

    // Initialize a new trial. This is called either at the beginning
    // of a new trial, or if the page is reloaded between trials.
    this.init_trial = function () {
        // If there are no more trials left, then we are at the end of
        // this phase
        if (STATE.index >= $c.trials.length) { //change here for debugging
            this.finish();
            return false;
        }

        // Load the new trialinfo
        this.trialinfo = $c.trials[STATE.index];

        // debugger
        // Update progress bar
        update_progress(STATE.index, $c.trials.length);

        return true;
    }; 

    physicsSetup = [];
    physicsEvents = [];
    physicsTimeline = [];

    clipFinished = false;

    // //get setup data 
    // GetSetupData = function(){
    //         var iframe = document.getElementById("game-frame");
    //         if (iframe) {
    //         var iframeContent = (iframe.contentWindow || iframe.contentDocument);
    //         physicsSetup = iframeContent.data.setup;
    //         debug("physicsSetup",physicsSetup)
    //         }
    //     }

    //get physics data
    GetPhysicsData = function(){

        // function Pause() {
        var iframe = document.getElementById("game-frame");
        if (iframe) {
        var iframeContent = (iframe.contentWindow || iframe.contentDocument);
        physicsSetup = iframeContent.data.constants;
        physicsEvents = iframeContent.data.events;
        physicsTimeline = iframeContent.data.timeline;
        }
        
        clipFinished = true;
        EnableContinue();
    }

    this.display_stim = function (that) {

        if (that.init_trial()) {
            $('#start.next').prop('disabled', false);
            // var view = {
            //     'outcome': that.trialinfo.outcome_text
            // };

            $('#prompt-text').html("<p>"+$c.prompt+" "+ $c.promptCondition[$c.condition]+"</p><br>");

            //Only embed world on first trial
            if (STATE.index == 0){
                //Embed the physics world
                html = '<iframe src="physics_world.html" width=600 height=400 id="game-frame"></iframe>'; 
                $('.physics_world').html(html);
            } else{
                //Otherwise just remove the curtain
                var iframe = document.getElementById("game-frame");
                if (iframe) {
                    var iframeContent = (iframe.contentWindow || iframe.contentDocument);
                    iframeContent.RemoveCurtain();
                }
            }
            
            $('#start.next').click(function () {

                //make button invisible 
                $('#start.next').prop('disabled', true);
                

                //Inner variables needed in cond
                //0 Learning condition
                //1 Global force strength (support:-Inf,Inf)
                //2 Global force direction (0:7 clockwise N to NW)
                //3 Yellow obj mass (0,Inf)
                //4 Yellow obj elasticity (0,1 none to perfecy)
                //5 Red obj mass (0,Inf)
                //6 Red obj elasticity (0,1)
                //7 Within yellow force (-Inf, Inf repel to attract, zero is neither)
                //8 Within red force (-Inf,Inf)
                //9 Between colour force (-Inf,Inf)
                //10 Friction patch (0 or 1, absent present)
                //11 Friction level (0,1, none to absolute)
                //12 Wall setup (0,1,2, non half, quartered)
                
                //Set up the new trial
                //Variables in world:
                //loc1, loc2, loc3, colour, direction, gf 1/0
                if (that.trialinfo.world[3]==0)
                {
                    cond=[$c.condition, that.trialinfo.world[5],
                        that.trialinfo.world[4],
                        1,.75,1,.75,
                        that.trialinfo.world[0],
                        that.trialinfo.world[1],
                        that.trialinfo.world[2],0,0,0]; 
                } else {
                    cond=[$c.condition, that.trialinfo.world[5],
                        that.trialinfo.world[4],
                        1,.75,1,.75,
                        that.trialinfo.world[1],
                        that.trialinfo.world[0],
                        that.trialinfo.world[2],0,0,0]; 
                }


                //debug(['Condition:', ['Passive','Child','Adult'][$c.condition], '$c', $c, 'STATE', STATE, 'CURRENTVIEW', CURRENTVIEW,
                //    'microworld (trial) details',  cond]);

                //chosen condition (global variable)
                //This will be for replaying clips
                // if ($c.condition == 0){
                    
                // }else{
                //     tl_data = JSON.parse(sample_text);
                //     object_names = Object.keys(tl_data);
                // }
                
                //Start the clip
                var iframe = document.getElementById("game-frame");
                if (iframe) {
                    var iframeContent = (iframe.contentWindow || iframe.contentDocument);
                    iframeContent.Start();
                }
            });
            
            $('#trial_next').prop('disabled', true);

            //response buttons
            var html = "" ; 
            for (var i=0; i<$c.questions.length; i++) {
                var q = $c.questions[i].q;
                html += q + '<br>'
                for (var j=0; j<$c.questions[i].l.length;j++){
                    html += '<input type = "radio" name = "' + $c.questions[i].type + '" value = "' + $c.questions[i].v[j] + '" class = "answer_buttons ' + $c.questions[i].type + '" >' + $c.questions[i].l[j] + '&nbsp;&nbsp;&nbsp;';    
                }
                html += '<br><br><br>'
            }
            $('#choices').html(html) ;
            
            //disable buttons 
             // $(".answer_buttons").prop('disabled',true)

            //check that all buttons were clicked 
            $(".answer_buttons").click(function()
            { 
                EnableContinue();
            });            

            //check whether all conditions for enabling the continue button are met
            EnableContinue = function(){
                $(".answer_buttons").prop('disabled',false) //enable buttons
                var sum = 0;
                for (var j=0; j<$c.questions.length; j++) {
                    if ($('.' + $c.questions[j].type).is(':checked')){
                        sum++;
                    }
                }

                if (sum == $c.questions.length & clipFinished==true) {
                // if (sum == $c.questions.length) {
                    $('#trial_next').prop('disabled', false) ;
                    clipFinished = false;
                } 
                console.log('clipFinished', clipFinished, 'sum', sum, '$c.questions.length', $c.questions.length)
            }
        }       
    };

    this.record_response = function() {      
         
        var response = [];
        for (var i=0; i<$c.questions.length; i++) {
            response.push($c.questions[i].type, $('.' + $c.questions[i].type  + ':checked').val()) 
        } 

        psiTurk.recordTrialData([
            "ID", this.trialinfo.ID, 
            "world", this.trialinfo.world, 
            "response", response,
            "setup", physicsSetup, 
            "timeline", physicsTimeline, 
            "events", physicsEvents]);
        
        //unbind start function to avoid multiple function calls 
        $('#start.next').unbind( "click" );

        STATE.set_index(STATE.index + 1);

        // Update the page with the current phase/trial
        this.display_stim(this);
    };

    this.finish = function() {
        CURRENTVIEW = new Demographics();
        // CURRENTVIEW = new Comprehension();
    };

    // Load the trial html page
    $(".slide").hide();

    // Show the slide
    var that = this; 
    $("#trial").fadeIn($c.fade);
    $('#trial_next.next').click(function () {
        that.record_response();
    });

    // Initialize the current trial
    if (this.init_trial()) {
        // Start the test
        this.display_stim(this) ;
    };
}


/*****************
 *  DEMOGRAPHICS*
 *****************/

 var Demographics = function(){

    var that = this; 

// Show the slide
$(".slide").hide();
$("#demographics").fadeIn($c.fade);

    //disable button initially
    $('#trial_finish').prop('disabled', true);

    //checks whether all questions were answered
    $('.demoQ').change(function () {
       if ($('input[name=sex]:checked').length > 0 &&
         $('input[name=age]').val() != "")
       {
        $('#trial_finish').prop('disabled', false)
    }else{
        $('#trial_finish').prop('disabled', true)
    }
});

// deletes additional values in the number fields 
$('.numberQ').change(function (e) {    
    if($(e.target).val() > 100){
        $(e.target).val(100)
    }
});

this.finish = function() {
    debug("Finish test phase");

        // Show a page saying that the HIT is resubmitting, and
        // show the error page again if it times out or error
        var resubmit = function() {
            $(".slide").hide();
            $("#resubmit_slide").fadeIn($c.fade);

            var reprompt = setTimeout(prompt_resubmit, 10000);
            psiTurk.saveData({
                success: function() {
                    clearInterval(reprompt); 
                    finish();
                }, 
                error: prompt_resubmit
            });
        };

        // Prompt them to resubmit the HIT, because it failed the first time
        var prompt_resubmit = function() {
            $("#resubmit_slide").click(resubmit);
            $(".slide").hide();
            $("#submit_error_slide").fadeIn($c.fade);
        };

        // Render a page saying it's submitting
        psiTurk.showPage("submit.html") ;
        psiTurk.saveData({
            success: psiTurk.completeHIT, 
            error: prompt_resubmit
        });
    }; //this.finish function end 

    $('#trial_finish').click(function () {           
       var feedback = $('textarea[name = feedback]').val();
       var sex = $('input[name=sex]:checked').val();
       var age = $('input[name=age]').val();

       psiTurk.recordUnstructuredData('feedback',feedback);
       psiTurk.recordUnstructuredData('sex',sex);
       psiTurk.recordUnstructuredData('age',age);
       that.finish();
   });
};


// --------------------------------------------------------------------

/*******************
 * Run Task
 ******************/

 $(document).ready(function() { 
    // Load the HTML for the trials
    psiTurk.showPage("trial.html");

    // Record various unstructured data
    psiTurk.recordUnstructuredData("condition", condition);
    psiTurk.recordUnstructuredData("counterbalance", counterbalance);
    //save the column names
    psiTurk.recordUnstructuredData("setupNames", $c.setupNames);
    psiTurk.recordUnstructuredData("timelineNames", $c.timelineNames);
    psiTurk.recordUnstructuredData("eventNames", $c.eventNames);

    // Start the experiment
    STATE = new State();
    // Begin the experiment phase
    if (STATE.instructions) {
        CURRENTVIEW = new Instructions();
    }
});
