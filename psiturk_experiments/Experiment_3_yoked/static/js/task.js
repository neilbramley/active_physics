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
var score = 0;

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

    console.log("counterbalance3", $c.counterbalance)
};

 var Instructions2 = function() {

    $(".slide").hide();
    var slide = $("#instructions2");
    slide.fadeIn($c.fade);
    if ($c.counterbalance == 0){
        //this.trialinfo.origCounterbalance==0
        $('.screenshot_response').attr('src', 'static/images/questions_screenshot1.png');   
    }else{
        $('.screenshot_response').attr('src', 'static/images/questions_screenshot2.png');   
    }
     
    slide.find('.next').click(function () {
        // CURRENTVIEW = new TestPhase();
        CURRENTVIEW = new Comprehension();
    });
};

/*****************
 *  COMPREHENSION CHECK*
 *****************/
var Comprehension = function(){
// Show the slide
$(".slide").hide();
$("#comprehension_check").fadeIn($c.fade);

    //disable button initially
    $('#comprehension').prop('disabled', true);//true

    //checks whether all questions were answered
    $('.comprehensionQ').change(function () {
       if ($('input[name=q1]:checked').length > 0 &&
        $('input[name=q2]:checked').length > 0 &&
        $('input[name=q3]:checked').length > 0 &&
        $('input[name=q4]:checked').length > 0 &&
        $('input[name=q5]:checked').length > 0)
       {
        $('#comprehension').prop('disabled', false)
    }else{
        $('#comprehension').prop('disabled', true)
    }})

$('#comprehension').click(function () {

    //CURRENTVIEW = new TestPhase();  //NB Bypasses test questions    
    
       var q1 = $('input[name=q1]:checked').val();
       var q2 = $('input[name=q2]:checked').val();
       var q3 = $('input[name=q3]:checked').val();
       var q4 = $('input[name=q4]:checked').val();
       var q5 = $('input[name=q5]:checked').val();

       // correct answers 
        answers = ["correct","false","false","correct","correct"];

       if(q1 == answers[0] && q2 == answers[1] && q3 == answers[2] && q4 == answers[3] && q5 == answers[4]){
            CURRENTVIEW = new TestPhase();
       }else{
            $('input[name=q1]').prop('checked', false);
            $('input[name=q2]').prop('checked', false);
            $('input[name=q3]').prop('checked', false);
            $('input[name=q4]').prop('checked', false);
            $('input[name=q5]').prop('checked', false);
            CURRENTVIEW = new ComprehensionCheckFail();
       }
   });
}

/*****************
 *  COMPREHENSION FAIL SCREEN*
 *****************/

var ComprehensionCheckFail = function(){
// Show the slide
$(".slide").hide();
$("#comprehension_check_fail").fadeIn($c.fade);

//unbind previous function calls 
$('#comprehension').unbind();
$("#instructions1").find('.next').unbind();
$("#instructions2").find('.next').unbind();

$('#comprehension_fail').click(function () {           
    $('#comprehension_fail').unbind();
    CURRENTVIEW = new Instructions();
   });
}

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
        // if (STATE.index >= 1) { //change here for debugging
            this.finish();
            return false;
        }

        // Load the new trialinfo
        this.trialinfo = $c.trials[STATE.index];
        this.replay = $c.replays[STATE.index];

        //console.log('in init_trial', $c, $c.replays[STATE.index]);
        
        // debugger
        // Update progress bar
        update_progress(STATE.index, $c.trials.length);

        return true;
    }; 


    clipFinished = false;

    
    //Function that is called at the end of the replay clip
    ReplayFinished = function(){
        
        $('.buttons_wrap').show();
        $('.sliders_wrap').show();

        var iframe = document.getElementById("game-frame");
        if (iframe) {
        var iframeContent = (iframe.contentWindow || iframe.contentDocument);
        zoomConstant = iframeContent.zoomConstant;
        }
        clipFinished = true;
        EnableContinue();
    }



    this.display_stim = function (that) {

        if (that.init_trial()) {
            $('#start.next').prop('disabled', false);

            $('#prompt-text').html("<p>" + $c.prompt + "</p><br>");

            //Only embed world on first trial
            if (STATE.index == 0){
                //Embed the physics world
                html = '<iframe src="replay_world.html" width=600 height=400 id="game-frame"></iframe>'; 
                $('.physics_world').html(html);
            } else{
                //Otherwise just remove the curtain
                var iframe = document.getElementById("game-frame");
                if (iframe) {
                    var iframeContent = (iframe.contentWindow || iframe.contentDocument);
                    iframeContent.RemoveCurtain();
                }
            }
            
            ////////////////
            //Start function
            ////////////////
            
            $('#start.next').click(function () {

                //make button invisible 
                $('#start.next').prop('disabled', true);
                

                //Stuff needed by the replay_world file
                cond=[that.trialinfo.hues, STATE.index];
                tl_data = that.replay;


                console.log('\n\n\nTrial:', (STATE.index + 1),
                   '\nTrial details:',  that.trialinfo, '\ntl_data length', tl_data["object1.x"].length);

                
                //Start the clip
                var iframe = document.getElementById("game-frame");
                if (iframe) {
                    var iframeContent = (iframe.contentWindow || iframe.contentDocument);
                    iframeContent.Start();
                }
            });
            
            $('#trial_next').prop('disabled', true);

            //console.log('$c.questions', $c.questions);

            //response buttons
            var html = "" ; 
            for (var i=0; i<$c.questions.length; i++) {
                
                //flips the order of questions 
                var k = i 
                if ($c.counterbalance == 1){
                    // console.log('this.trialinfo.origCounterbalance in the right place', this.trialinfo.origCounterbalance);
                    k = ($c.questions.length-1)-i
                }
                var q1 = $c.questions[k].q1;
                var q2 = $c.questions[k].q2;
                var q3 = $c.questions[k].q3;

                html += q1 + String.fromCharCode(65+2*STATE.index) +
                q2 + String.fromCharCode(66+2*STATE.index) +
                q3 + '<br>';


                for (var j=0; j<$c.questions[k].l.length;j++){
                    //console.log('inside loop', k, j, $c.questions[k].l[j])
                    var ans = $c.questions[k].l[j];
                    
                    //A workaround for updating the letters on the balls in the answers for mass q for each problem
                    if (k==1 && j==0){ ans = String.fromCharCode(65+2*STATE.index) + ans;}
                    if (k==1 && j==2){ ans = String.fromCharCode(66+2*STATE.index) + ans;}

                    html += '<input type = "radio" name = "' + $c.questions[k].type +
                     '" value = "' + $c.questions[k].v[j] +
                      '" class = "answer_buttons ' + $c.questions[k].type + '" >' +
                       ans + '&nbsp;&nbsp;&nbsp;';    
                }
                if (i == 0){
                    html += '<br><br><br><br><br>'
                }
            }
            $('.buttons_wrap').html(html) ;
            
            //disable buttons 
            //$(".answer_buttons").prop('disabled',true);
            //$(".slider").prop('disabled', true);
            $('.buttons_wrap').hide();
            $('.sliders_wrap').hide();

            //check that all buttons were clicked 
            $(".answer_buttons").click(function()
            { 
                EnableContinue();
            });            

            //confidence sliders
            var html = "" ; 
            for (var i=0; i<$c.sliders.length; i++) {
                //flips the order of questions 
                var k = i 
                if ($c.counterbalance == 1){
                    k = ($c.sliders.length-1)-i
                }
                var q = $c.sliders[k].q;
                html += q + '<div class="slider s-'+k+'"></div><div class="l-'+i+'"></div>' ;
                if (i == 0){
                    html += '<br><br>'
                }else{
                    html += '<br>'
                }
            }
            $('.sliders_wrap').html(html) ;
            
            for (var i=0; i<$c.sliders.length; i++) {
                // Create the sliders
                $('.s-'+i).slider().on("slidestart", function( event, ui ) {
                // Show the handle
                $(this).find('.ui-slider-handle').show() ;
                });
                                       
                // Put labels on the sliders
                $('.l-'+i).append("<label style='width: 33%'>"+ $c.sliders[i].l[0] +"</label>") ; 
                $('.l-'+i).append("<label style='width: 33%'>"+ $c.sliders[i].l[1] +"</label>") ; 
                $('.l-'+i).append("<label style='width: 33%'>"+ $c.sliders[i].l[2] +"</label>");
            }

            // Hide all the slider handles 
            $('.ui-slider-handle').hide() ;

            //check that all buttons were clicked 
            $(".slider").click(function()
            { 
                EnableContinue();
            });           

            //check whether all conditions for enabling the continue button are met
            EnableContinue = function(){
                

                $(".answer_buttons").prop('disabled',false) //enable buttons
                
                //check for button presses 
                var sum = 0;
                for (var j=0; j<$c.questions.length; j++) {
                    if ($('.' + $c.questions[j].type).is(':checked')){
                        sum++;
                    }
                }

                //check for slider clicks 
                var sum1 = 0 ;
                for (var j=0; j<$c.sliders.length; j++) {
                    if ($('.s-'+j).find('.ui-slider-handle').is(":visible")) {
                        sum1++ ;
                    }
                }

                if (sum == $c.questions.length & sum1 == $c.sliders.length & clipFinished==true) {
                    $('#trial_next').prop('disabled', false) ;
                    clipFinished = false;
                } 
                //console.log('clipFinished', clipFinished, 'sum', sum, '$c.questions.length', $c.questions.length)
            }
        }       
    };

    this.record_response = function() {      
         
        var buttons = [];
        for (var i=0; i<$c.questions.length; i++) {
            buttons.push($c.questions[i].type, $('.' + $c.questions[i].type  + ':checked').val())
        } 

        var sliders = [];
        for (var i=0; i<$c.questions.length; i++) {
            sliders.push($c.sliders[i].type, $('.s-'+i).slider('value')) ;
        } 

        psiTurk.recordTrialData([
            "ID", this.trialinfo.worldId, 
            "tM", this.trialinfo.tM,
            "tR", this.trialinfo.tR,
            "buttons", buttons,
            "sliders", sliders,
            "zoomConstant", zoomConstant,
            "yoker", $c.yoker]);
        
        //unbind start function to avoid multiple function calls 
        $('#start.next').unbind( "click" );

        STATE.set_index(STATE.index + 1);

        if (buttons[1]==that.trialinfo.tR)
        {
            console.log('1 point buttons[1]');
            score++
        }; //Why 1 and 3?

        if (buttons[3]==that.trialinfo.tM)
        {
            console.log('1 point buttons[2]');
            score++
        };


        console.log("Score here: buttons", buttons, "accumulated score", score,
            "sliders", sliders, that.trialinfo);


        // Update the page with the current phase/trial
        this.display_stim(this);
    };

    this.finish = function() {
        // CURRENTVIEW = new Demographics();
        CURRENTVIEW = new PerformanceFeedback();
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
 *  PERFORMANCE FEEDBACK*
 *****************/

var PerformanceFeedback = function(){
// Show the slide
$(".slide").hide();
$("#performance_feedback").fadeIn($c.fade);
 html = "<p>You've answered " + String(score) + " out of 22 questions correctly.</p><p>You're bonus is <b>" + score*5 + " cents</b>.</p>";

$('.feedback_text').html(html) ;

//5 cents per correct answer
psiTurk.recordUnstructuredData("winnings", score*5); //task bonus

$('#feedback').click(function () {           
  CURRENTVIEW = new Demographics();
   });
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
    psiTurk.recordUnstructuredData("counterbalance", counterbalance);//this.trialinfo.origCounterbalance);

    // Start the experiment
    STATE = new State();
    // Begin the experiment phase
    if (STATE.instructions) {
        CURRENTVIEW = new Instructions();
    }
});
