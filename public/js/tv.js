// Block of time in schedule
//TODO add infos
function Block(name, start_seconds, end_seconds,info, is_lunch, progressFormat) {
    var self = this;
    self.name = name;
    self.start_seconds = start_seconds;
    self.end_seconds = end_seconds;
    self.is_lunch = is_lunch || false;
    self.infos=info;
    self.info = function() {
        return info;
    }
    self.startTime = function() {
        return Math.floor(self.start_seconds/3600) + ":" + Math.floor((self.start_seconds%3600)/60).toString().lpad('0', 2)
    };

    self.endTime = function() {
        return Math.floor(self.end_seconds/3600) + ":" + Math.floor((self.end_seconds%3600)/60).toString().lpad('0', 2)
    };
    self.pct = function(remoteSecs){


        return Math.floor(((remoteSecs-self.start_seconds)*100/(self.end_seconds-self.start_seconds))).toString()+"%";
    }

    self.progressInfo = function(remoteSecs) {

        var minsIn = Math.floor((remoteSecs - self.start_seconds)/60.0)+":"+Math.floor((remoteSecs - self.start_seconds)%60).toString().lpad('0', 2);
        var progressInfo = progressFormat || '%i'; // %i - in, %l - left

        return progressInfo.replace('%i', minsIn);

    };
    self.progressInfo2 = function(remoteSecs) {

        var minsLeft = Math.floor((self.end_seconds - remoteSecs)/60)+":"+Math.floor((self.end_seconds - remoteSecs)%60).toString().lpad('0', 2);;
        var progressInfo = progressFormat || '%l'; // %i - in, %l - left
        return progressInfo.replace('%l', minsLeft);
    };

    self.is_current = function(remoteSecs) {
        return self.start_seconds <= remoteSecs && self.end_seconds >= remoteSecs;
    };

}
function Marquee(element){
    var self = this;

    self.updateFromServer = function() {

        // Update local copy of the announcements
        $.ajax({
            url: '/api/announcement/today',
            success: function(response) {

                self.announcementJSON = $.parseJSON(response);
                self.updateAnnouncements();
                $('.announcement').marquee({
                    //speed in milliseconds of the marquee
                    duration: 10000,
                    //gap in pixels between the tickers
                    gap: 0,
                    //time in milliseconds before the marquee will start animating
                    delayBeforeStart: 0,
                    //'left' or 'right'
                    direction: 'left',
                    //true or false - should the marquee be duplicated to show an effect of continues flow
                    duplicated: true
                });
                // Setup new client announcements refresh interval
            }
        });

    };
    self.i = 0;
    self.updateAnnouncements = function() {
        announcementElements = [];
        if(self.announcementJSON && !$.isEmptyObject(self.announcementJSON)) {
            //make an array of element class names
            for(var j=0; j < self.announcementJSON.length; j++) {
                announcementElements.push('annc'+ j.toString());
            }
            var elementStringHTML='';
            var responsiveListHTML='';
            //concatenates array into html string
            for(var k=0; k < announcementElements.length; k++) {
                responsiveListHTML+='<li><b>'+self.announcementJSON[k].title+'</b>: '+self.announcementJSON[k].body+ '</li>';
                elementStringHTML+=' <b class="annc-mini">'+self.announcementJSON[k].title+'</b>: '+self.announcementJSON[k].body+ ' ';
            }
            $('.announcement').html(elementStringHTML);
            $('.announcement-data').html(responsiveListHTML);

        }
    };





    self.updateFromServer();
    setInterval(self.updateFromServer, 3600*1000);


}

function Scheduler() {
    var self = this;
    self.currentPeriod = null;
    $('#period-info').hide();
    $('#passing-info').show();
    self.localMins = function(localDate) {
        return localDate.getHours()*60 + localDate.getMinutes() + localDate.getSeconds()/60;
    };

    self.remoteMins = function(localDate) {
        return self.localMins(localDate) + self.minOffset;
    };
    count=1;
    self.updateClientSchedule = function() {
        var localDate = new Date();

        // Update current time
        var remoteTime = (self.remoteMins(localDate) < 13*60 ? Math.floor(self.remoteMins(localDate)/60) : Math.floor(self.remoteMins(localDate)/60)-12) + ':' +
            Math.floor(self.remoteMins(localDate)%60).toString().lpad('0', 2) +
            '<b>' + (self.remoteMins(localDate) < 12*60 ? 'AM' : 'PM') + '</b>';
        $('.tv-time .time').html(remoteTime);

        // Update current date
        var daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        var weekDay = daysOfWeek[localDate.getDay()];
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        $('.tv-date .date').html(( weekDay+", " +months[(localDate.getMonth())] + " " + localDate.getDate()));


        // Update the Time In/Time Left
        var lunch_wave;
        self.schedule.forEach(function(block) {
            var remoteSecs = self.remoteMins(localDate)*60;
            if (block.is_current(remoteSecs)) {
                $('.clockbox-in').html(block.progressInfo(remoteSecs).replace('%l','PASS'));
                $('.clockbox-left').html(block.progressInfo2(remoteSecs));
                $('.tv-bar').width(block.pct(remoteSecs));
                $('#class1').html(block.info());
                if (block.is_lunch)
                    lunch_wave = block.name;


                if (block.name.indexOf("Passing") == -1){
                    $('#period-info').show();
                    $('#passing-info').hide();
                    console.log(block);

                }
                else {
                    $('#period-info').hide();
                    $('#passing-info').show();
                    console.log("NOOOOOO");
                }
            }

        });
        // Update the period info
//        if(self.remoteMins(localDate)>975) {
//            $('.clockbox-left').fadeOut();
//            $('.clockbox-in').fadeOut();
//            $('.time-label').fadeOut();
//            $('.time-label2').fadeOut();
//            window.setTimeout($('.period-description').animate({width: "520px"}, 500),10000)
//        }


        // Update the Period Listing
        var periodNames = [];
        self.periods.forEach(function(period) {

            var remoteSecs = self.remoteMins(localDate)*60;
            if(lunch_wave==undefined){
                lunch_wave='P';
            }
            if (period.is_current(remoteSecs)) {
                if (self.infoJSON){
                    var lunchClassesLeft='';
                    var classes=[];
                    var lunchClassesRight='';
                    var numOfClasses=0;
                    var periodAnnouncements='';
                    for (var j=0; j < self.infoJSON.length; j++) {

                        if(self.infoJSON[j].type==lunch_wave){
                            numOfClasses+=1;
                            classes=self.infoJSON[j].text.split(',');
                            for (var i=0; i < classes.length; i++) {
                                if(i<4)
                                    lunchClassesLeft+=('<li>'+classes[i]+'</li>');
                                else
                                    lunchClassesRight+=('<li>'+classes[i]+'</li>');
                            }
                        }

                        else if(self.infoJSON[j].type==''){
                            periodAnnouncements+=('<li>'+self.infoJSON[j].text+'</li>');
                        }

                    }
                    if(periodAnnouncements=='')
                        periodAnnouncements='<li>None for this period.</li>';
                    if(!period.is_lunch || (lunch_wave=='P')){

                        $('.lunch-only').hide();

                    }
                    else{

                        $('.lunch-only').show();
                    }


                    $('.period-classes-info-split-left').html(lunchClassesLeft);
                    $('.period-classes-info-split-right').html(lunchClassesRight);
                    $('#period-anncmt-info').html(periodAnnouncements);

                }
                if (self.periods[0]==period){
                    if (period.is_lunch)
                        periodNames.push("<div class='current first lunch'>" + period.name + "<div>" + lunch_wave + "</div>" + "<div class='period-time-info'>" + (period.startTime().split(':')[0] < 13 ? period.startTime() : period.startTime().split(':')[0]-12+":"+period.startTime().split(':')[1])+ " - " +(period.endTime().split(':')[0] < 13 ? period.endTime() : period.endTime().split(':')[0]-12+":"+period.endTime().split(':')[1])  + "</div>" + "</div>");
                    else
                        periodNames.push("<div class='current first'>" + period.name + "<div class='period-time-info'>" + (period.startTime().split(':')[0] < 13 ? period.startTime() : period.startTime().split(':')[0]-12+":"+period.startTime().split(':')[1])+ " - " +(period.endTime().split(':')[0] < 13 ? period.endTime() : period.endTime().split(':')[0]-12+":"+period.endTime().split(':')[1])  + "</div>" + "</div>");
                }
                else{
                    if (period.is_lunch)
                        periodNames.push("<div class='current lunch'>" + period.name + "<div class='sub'>" + lunch_wave + "</div>" + "<div class='period-time-info lunch-info'>" + (period.startTime().split(':')[0] < 13 ? period.startTime() : period.startTime().split(':')[0]-12+":"+period.startTime().split(':')[1])+ " - " +(period.endTime().split(':')[0] < 13 ? period.endTime() : period.endTime().split(':')[0]-12+":"+period.endTime().split(':')[1])  + "</div>" + "</div>");
                    else
                        periodNames.push("<div class='current'>" + period.name + "<div class='period-time-info'>" + (period.startTime().split(':')[0] < 13 ? period.startTime() : period.startTime().split(':')[0]-12+":"+period.startTime().split(':')[1])+ " - " +(period.endTime().split(':')[0] < 13 ? period.endTime() : period.endTime().split(':')[0]-12+":"+period.endTime().split(':')[1])  + "</div>" + "</div>");
                }
            } else if ($('.panel-body').has('.tv-schedule').length) {
                if (period.is_lunch)
                    periodNames.push("<div class='lunch'>" + period.name + "<div class='sub'>L</div>" + "<div class='period-time-info responsive-info'>" + (period.startTime().split(':')[0] < 13 ? period.startTime() : period.startTime().split(':')[0]-12+":"+period.startTime().split(':')[1])+ " - " +(period.endTime().split(':')[0] < 13 ? period.endTime() : period.endTime().split(':')[0]-12+":"+period.endTime().split(':')[1])  + "</div>" + "</div>");
                else
                    periodNames.push("<div>" + period.name + "<div class='period-time-info responsive-info'>" + (period.startTime().split(':')[0] < 13 ? period.startTime() : period.startTime().split(':')[0]-12+":"+period.startTime().split(':')[1])+ " - " +(period.endTime().split(':')[0] < 13 ? period.endTime() : period.endTime().split(':')[0]-12+":"+period.endTime().split(':')[1])  + "</div>" + "</div>");
            }
            else{
                if (period.is_lunch)
                    periodNames.push("<div class='lunch'>" + period.name + "<div>L</div>" + "</div>");
                else
                    periodNames.push("<div>" + period.name + "</div>");
            }

        });
        // Update number of Periods
        switch(self.periods.length){
            case 1:
                $('.tv-schedule').html("<div class='periods onetofive'> </div>");
                break;
            case 2:
                $('.tv-schedule').html("<div class='periods onetofive'> </div>");
                break;
            case 3:
                $('.tv-schedule').html("<div class='periods onetofive'> </div>");
                break;
            case 4:
                $('.tv-schedule').html("<div class='periods onetofive'> </div>");
                break;
            case 5:
                $('.tv-schedule').html("<div class='periods onetofive'> </div>");
                break;
            case 6:
                $('.tv-schedule').html("<div class='periods six'> </div>");
                break;
            case 7:
                $('.tv-schedule').html("<div class='periods seven'> </div>");
                break;
            case 8:
                $('.tv-schedule').html("<div class='periods eight'> </div>");
                break;
            case 9:
                $('.tv-schedule').html("<div class='periods nine'> </div>");
                break;
            default:
                $('.tv-schedule').html("<div class='periods eight'> </div>");
                break;
        }
        $('.periods').html(periodNames.join(''));

    };


    self.updateFromServer = function() {
        // Update local time offset from server
        $.ajax({
            url: '/api/time/now',
            success: function(response) {
                var localDate = new Date();
                var remoteDateJSON = $.parseJSON(response);
                var remoteMins = (remoteDateJSON.hours * 60) + remoteDateJSON.mins + (remoteDateJSON.secs/60);
                var localMins = (localDate.getHours() * 60) + localDate.getMinutes() + (localDate.getSeconds()/60);
                self.minOffset = remoteMins - localMins;

                // Update local copy of current day's schedule
                $.ajax({
                    url: '/api/schedule/today',
                    success: function(response) {
                        var scheduleJSON = $.parseJSON(response);

                        self.schedule = [];
                        self.periods = [];
                        $.ajax({
                            url: '/api/info/today',
                            success: function(response) {
                                self.infoJSON = $.parseJSON(response);
                                // Setup new client announcements refresh interval
                            }
                        });
                        // Add Starting
                        var startOfSchool = scheduleJSON[0].start_seconds;
                        self.schedule.push(new Block('Start Passing', startOfSchool - 10*60, startOfSchool, false, '%l')); // School Starting Block

                        // Add Periods w/ Passing
                        for(var i=0; i < scheduleJSON.length; i++) {

                            if (scheduleJSON[i].lunch.length === 0) {

                                self.schedule.push(new Block(scheduleJSON[i].name, scheduleJSON[i].start_seconds, scheduleJSON[i].end_seconds,scheduleJSON[i].infoJSON)); // Normal Block
                                self.periods.push(new Block(scheduleJSON[i].name, scheduleJSON[i].start_seconds, scheduleJSON[i].end_seconds,scheduleJSON[i].infoJSON)); // Normal Period

                            }
                            else {
                                self.periods.push(new Block(scheduleJSON[i].name, scheduleJSON[i].start_seconds, scheduleJSON[i].end_seconds,self.infoJSON, true)); // Lunch Period
                                for(var j=0; j < scheduleJSON[i].lunch.length; j++) {
                                    self.schedule.push(new Block(scheduleJSON[i].lunch[j].name, scheduleJSON[i].lunch[j].start_seconds, scheduleJSON[i].lunch[j].end_seconds,self.infoJSON, true)); // Lunch Block
                                    if (j+1 < scheduleJSON[i].lunch.length)
                                        self.schedule.push(new Block('Lunch Passing', scheduleJSON[i].lunch[j].end_seconds, scheduleJSON[i].lunch[j+1].start_seconds,self.infoJSON, false, '%l')); // Lunch Passing Block
                                }
                            }

                            if (i+1 < scheduleJSON.length)
                                self.schedule.push(new Block('Passing', scheduleJSON[i].end_seconds, scheduleJSON[i+1].start_seconds,self.infoJSON, false, '%l')); // Passing Block
                        }

                        // Add Ending
                        var endOfSchool = scheduleJSON[scheduleJSON.length-1].end_seconds;
                        self.schedule.push(new Block('Bus Passing', endOfSchool, endOfSchool + 10*60, false, '%l'));  // Buses Leaving Block

                        // Setup new client schedule refresh interval
                        if (self.clientscheduleupdateinterval)
                            clearInterval(self.clientscheduleupdateinterval);
                        self.updateClientSchedule();
                        self.clientscheduleupdateinterval = setInterval(self.updateClientSchedule, 1000);
                        for (var j=0; j < self.periods; j++) {

                        }
                    }
                });

                // Update local copy of the announcements
                $.ajax({
                    url: '/api/announcement/today',
                    success: function(response) {
                        announcements=[];

                        self.announcementJSON = $.parseJSON(response);

                        announcements.push(self.announcementJSON);
                        // Setup new client announcements refresh interval
                    }
                });

            }
        });
    };
    self.updateFromServer();
    setInterval(self.updateFromServer, 3600*1000);

}

$(function() {
    new Scheduler();
    new Marquee('.lip-bar');


});