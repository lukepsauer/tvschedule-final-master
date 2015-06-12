;iOS = ( navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false );

function addElement(generateElementForm, generateElementRow, action_url) {
    return (function(e) {
        var parent_row = $(this).parent().parent();
        var new_element_form = generateElementForm();
        parent_row.before(new_element_form);

        new_element_form.find(".cancel-btn").click(function(e) {
            new_element_form.remove();
            e.preventDefault();
        });

        new_element_form.find(".save-btn").click(function(e) {
            $.ajax({
                type: "POST",
                url: action_url + '/create',
                data: new_element_form.find('form').serialize(),
                success: function(element_json) {
                    var new_element = $.parseJSON(element_json);
                    var new_element_row = generateElementRow(new_element);
                    new_element_form.replaceWith(new_element_row);
                    new_element_row.find(".edit-btn").click(editElement(generateElementForm, generateElementRow, action_url));
                    new_element_row.find(".delete-btn").click(deleteElement(action_url));
                }
            });
            e.preventDefault();
        });

        e.preventDefault();
    })
}

function editElement(generateElementForm, generateElementRow, action_url) {
    return (function(e) {
        var parent_row = $(this).parent().parent();
        var element = parent_row.data("json");
        var edit_element_form = generateElementForm(element);
        parent_row.before(edit_element_form);
        parent_row.detach();

        edit_element_form.find(".cancel-btn").click(function(e) {
            edit_element_form.replaceWith(parent_row);
            e.preventDefault();
        });

        edit_element_form.find(".save-btn").click(function(e) {
            $.ajax({
                type: "POST",
                url: action_url + "/" + element.id + "/update",
                data: edit_element_form.find('form').serialize(),
                success: function(element_json) {
                    var new_element = $.parseJSON(element_json);
                    var new_element_row = generateElementRow(new_element);
                    edit_element_form.replaceWith(new_element_row);
                    new_element_row.find(".edit-btn").click(editElement(generateElementForm, generateElementRow, action_url));
                    new_element_row.find(".delete-btn").click(deleteElement(action_url));
                }
            });
            e.preventDefault();
        });

        e.preventDefault();
    })
}

function deleteElement(action_url) {
    return (function(e) {
        if (confirm('Are you sure you want to delete this item?')) {
            var parent_row = $(this).parent().parent();
            console.log(parent_row);
            var element = parent_row.data("json");
            console.log(element);
            $.ajax({
                type: "POST",
                url: action_url + "/" + element.id + "/delete",
                success: function() {
                    parent_row.remove();
                }
            });
        }

        e.preventDefault();
    })
}

function generateScheduleForm(schedule) {
    var form_id = "form_" + Math.round(Math.random()*1000000 + 1000000);
    return $("<tr>" +
        "<td>" +
        "<input form='" + form_id + "' type='text' name='name' value='" + (schedule ? schedule.name : '') + "' class='form-control' placeholder='Schedule Name'>" +
        "</td>" +
        "<td><form id=" + form_id + " action='#' method='post'>" +
        "<a href='#' title='Save' class='btn btn-success save-btn'><i class='fa fa-check'></i></a> " +
        "<a href='#' title='Cancel' class='btn btn-danger cancel-btn'><i class='fa fa-times'></i></a>" +
        "</form></td>" +
        "</tr>")
}

function generateScheduleRow(schedule) {
    return $("<tr data-json='" + JSON.stringify(schedule) + "'>" +
        "<td>" + schedule.name + "</td>" +
        "<td class='fixed'>" +
        "<a href='/admin/schedule/" + schedule.id  + "/periods' title='Periods' class='btn btn-success'><i class='fa fa-bars'></i></a>&nbsp;" +
        "<a href='#' title='Edit' class='btn btn-info edit-btn'><i class='fa fa-pencil'></i></a>&nbsp;" +
        "<a href='#' title='Delete' class='btn btn-danger delete-btn'><i class='fa fa-trash-o'></i></a>" +
        "</td>" +
        "</tr>")
}

function generatePeriodForm(period) {
    console.log('period form' + iOS);
    var form_id = "form_" + Math.round(Math.random()*1000000 + 1000000);
    var form = $("<tr>" +
        "<td><input form='" + form_id + "' type='text' name='name' value='" + (period ? period.name : '') + "' class='form-control' placeholder='Period Name'></td>" +
        "<td><input form='" + form_id + "' type='" + (iOS ? 'time' : 'text') + "' name='start' class='form-control start-timepicker' placeholder='Start Time'></td>" +
        "<td><input form='" + form_id + "' type='" + (iOS ? 'time' : 'text') + "' name='end' class='form-control end-timepicker' placeholder='End Time'></td>" +
        "<td><input form='" + form_id + "' type='text' name='lunch_waves' value='" + (period ? period.lunch_waves : '') + "' class='form-control'></td>" +
        "<td><form id=" + form_id + " action='#' method='post'>" +
        "<a href='#' title='Save' class='btn btn-success save-btn'><i class='fa fa-check'></i></a>&nbsp;" +
        "<a href='#' title='Cancel' class='btn btn-danger cancel-btn'><i class='fa fa-times'></i></a>" +
        "</form></td>" +
        "</tr>");

    if (!iOS) {
        form.find('.start-timepicker').timepicker({
            defaultTime: period ? period.start_string : 'current',
            template: false,
            minuteStep: 1
        });

        form.find('.end-timepicker').timepicker({
            defaultTime: period ? period.end_string : 'current',
            template: false,
            minuteStep: 1
        });
    }

    return form
}

function generatePeriodRow(period) {
    return $("<tr data-json='" + JSON.stringify(period) + "'>" +
        "<td class='fixed'>" + period.name + "</td>" +
        "<td class='fixed'>" + period.start_string + "</td>" +
        "<td class='fixed'>" + period.end_string + "</td>" +
        "<td class='fixed'>" + period.lunch_waves + "</td>" +
        "<td class='fixed'>" +
        "<a href='#' title='Edit' class='btn btn-info edit-btn'><i class='fa fa-pencil'></i></a>&nbsp;" +
        "<a href='#' title='Delete' class='btn btn-danger delete-btn'><i class='fa fa-trash-o'></i></a>" +
        "</td>" +
        "</tr>")
}

function generateAnncForm(schedule) {
    var form_id = "form_" + Math.round(Math.random()*1000000 + 1000000);
    var form = $("<tr class='form-inline'>" +
        "<td class='fixed'><input form='" + form_id + "' type='text' name='title' value='" + (schedule ? schedule.title : '') + "' class='form-control' placeholder='Announcement Title'></td>" +
        "<td class='fixed'><input form='" + form_id + "' type='text' name='body' value='" + (schedule ? schedule.body : '') + "' class='form-control' placeholder='Announcement Body'></td>" +
        "<td class='fixed'> <input form='" + form_id + "' type='text' name='expires' value='" +(schedule ? schedule.expires[4]+schedule.expires[5]+'/'+ schedule.expires[6]+schedule.expires[7]+'/'+schedule.expires[0]+schedule.expires[1]+schedule.expires[2]+schedule.expires[3] : '')+"' class='form-control datepicker'></td>" +
        "<td class='actions'><form id=" + form_id + " action='#' method='post'>" +
        "<a href='#' title='Save' class='btn btn-success save-btn'><i class='fa fa-check'></i></a> " +
        "<a href='#' title='Cancel' class='btn btn-danger cancel-btn'><i class='fa fa-times'></i></a>" +
        "</form></td>" +
        "</tr>");
    form.find('.datepicker').datepicker();
    return form;
}

function generateAnncRow(annc) {
    return $("<tr data-json='" + JSON.stringify(annc) + "'>" +
        "<td class='fixed'>" + annc.title + ": </td><td class='fixed'>"+ annc.body + "</td><td class='fixed'>"+ annc.expires[4]+annc.expires[5]+'/'+ annc.expires[6]+annc.expires[7]+'/'+annc.expires[0]+annc.expires[1]+annc.expires[2]+annc.expires[3] + "</td>" +
        "<td class='actions'>" +
        "<a href='#' title='Edit' class='btn btn-info edit-btn'><i class='fa fa-pencil'></i></a>&nbsp;" +
        "<a href='#' title='Delete' class='btn btn-danger delete-btn'><i class='fa fa-trash-o'></i></a>" +
        "</td>" +
        "</tr>")
}

$(function (){
    var action_url = $('#elements').data('action-url');

    // Schedule
    $("#add_schedule_btn").click(addElement(generateScheduleForm, generateScheduleRow, action_url));
    $(".edit-schedule-btn").click(editElement(generateScheduleForm, generateScheduleRow, action_url));
    $(".delete-schedule-btn").click(deleteElement(action_url));

    // Period
    $("#add_period_btn").click(addElement(generatePeriodForm, generatePeriodRow, action_url));
    $(".edit-period-btn").click(editElement(generatePeriodForm, generatePeriodRow, action_url));
    $(".delete-period-btn").click(deleteElement(action_url));

    // Announcement
    $("#add_annc_btn").click(addElement(generateAnncForm, generateAnncRow, action_url));
    $(".edit-annc-btn").click(editElement(generateAnncForm, generateAnncRow, action_url));
    $(".delete-annc-btn").click(deleteElement(action_url));


    $.ajax({
        url: '/api/days',
        success: function(response) {
            // Get Days Async
            self.dayJSON = $.parseJSON(response);
            self.newDayJSON = {
                events: self.dayJSON,
                color: '#00CC00',
                textColor: 'white'
            };

            $.ajax({
                url: '/api/info',
                success: function(response) {
                    // Get Info Async (after days has returned)
                    self.eventJSON = $.parseJSON(response);
                    self.newEventJSON = {
                        events:self.eventJSON,
                        color:'',
                        textColor: 'white'
                    };

                    // Display calendar once days and info ahve returned
                    $('#calendar').fullCalendar({
                        eventSources: [
                            self.newDayJSON,
                            self.newEventJSON
                        ],
                        dayClick: function(date, allDay, jsEvent, view) {
                            if (allDay) {
                                date=new Date(date);

                                window.location = "/day/" + (date.getFullYear()*10000 + (date.getMonth()+1)*100 + date.getDate()).toString();
                            }
                        },
                        weekends: false
                    });
                }
            });
        }
    });

    // Remove disabled from submit buttons where submit is not initially available
    $('.changeEnter').change(function(){
        $('.changeSubmit').removeClass('disabled');
    });

    $('.infoEnter').focus(function(){
        $('.infoSubmit').removeClass('disabled');
    });

    $('#add_info_btn').click(function(){
        $('#add_info_form').removeClass('hidden');
    })

    // Lunches
    $( "#sortable1, #sortable2, #sortable3" ).sortable({
        connectWith: ".connectedSortable"
    }).disableSelection();

    $('#save_btn').click(function(){
        var lunchArray1 = '';
        var lunchArray1elements = $('#sortable1 .ui-state-default');

        lunchArray1elements.each(function(i, el) {
            lunchArray1+=$(el).text() + ',';
        });

        var lunchArray2 = '';
        var lunchArray2elements = $('#sortable2 .ui-state-default');
        lunchArray2elements.each(function(i, el) {
            lunchArray2+=$(el).text() + ',';
        });
        var lunchArray3 = '';
        var lunchArray3elements = $('#sortable3 .ui-state-default');
        lunchArray3elements.each(function(i, el) {
            lunchArray3+=$(el).text() + ',';
        });

        var lunchTotal={lunches : lunchArray1+'-'+lunchArray2+'-'+lunchArray3};

        $.ajax({
            type: "get",
            url: '/admin/lunches/update',
            data: lunchTotal,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function() {
                window.location = "/admin/lunch";
            }
        });
    });
});