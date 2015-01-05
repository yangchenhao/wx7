/**
 * Created with PyCharm.
 * User: Epsirom
 * Date: 13-11-30
 * Time: 上午11:43
 */
/*
var datetimepicker_option = {
    format: "yyyy年mm月dd日 - hh:ii",
    autoclose: true,
    pickerPosition: "bottom-left",
    weekStart: 1,
    todayBtn:  1,
    autoclose: 1,
    todayHighlight: 1,
    startView: 2,
    forceParse: 0,
    showMeridian: 1,
    language: 'zh-CN'
};

$(".form_datetime").datetimepicker(datetimepicker_option);

function enableDatetimePicker(dom) {
    dom.datetimepicker(datetimepicker_option);
    dom.children('.input-group-addon').css('cursor', 'pointer').children().css('cursor', 'pointer');
}

function disableDatetimePicker(dom) {
    dom.datetimepicker('remove');
    dom.children('.input-group-addon').css('cursor', 'no-drop').children().css('cursor', 'no-drop');
}
*/
var dateInterfaceMap = {
    'year': 'getFullYear',
    'month': 'getMonth',
    'day': 'getDate',
    'hour': 'getHours',
    'minute': 'getMinutes'
}, actionMap = {
    'value': function(dom, value) {
        dom.val(value);
    },
    'text': function(dom, value) {
        dom.text(value);
    },
    'time': function(dom, value) {
        if (value instanceof Object) {
            var parts = dom.children(), i, len, part;
            for (i = 0, len = parts.length; i < len; ++i) {
                part = $(parts[i]).children();
                if (part.attr('date-part')) {
                    part.val(value[part.attr('date-part')]);
                }
            }
        }
    }
}, keyMap = {
    'name': 'value',
    'key': 'value',
    'description': 'value',
    'start_time': 'time',
    'end_time': 'time',
    'place': 'value',
    'book_start': 'time',
    'book_end': 'time',
    'pic_url': 'value',
    'total_tickets': 'value',
    'seat_status': 'value',
}, lockMap = {
    'value': function(dom, lock) {
        dom.prop('disabled', lock);
    },
    'text': function(dom, lock) {
        dom.prop('disabled', lock);
    },
    'time': function(dom, lock) {
        var parts = dom.children(), i, len, part;
        for (i = 0, len = parts.length; i < len; ++i) {
            part = $(parts[i]).children();
            if (part.attr('date-part')) {
                part.prop('disabled', lock);
            }
        }
        dom.prop('disabled', lock);
    },
};

var curstatus = 0;

function updateActivity(nact) {
    var key, key2, tdate;
    for (key in nact) {
        if (keyMap[key] == 'time') {
            activity[key] = {};
            tdate = new Date(nact[key])
            for (key2 in dateInterfaceMap) {
                activity[key][key2] = tdate[dateInterfaceMap[key2]]() + ((key2 == 'month') ? 1 : 0);
            }
        } else {
            activity[key] = nact[key];
        }
    }
}

function initializeForm(activity) {
    var key;
    for (key in keyMap) {
        actionMap[keyMap[key]]($('#input-' + key), activity[key]);
    }
    if (!activity.id) {
        $('#input-name').val('');
        //新增活动，自动生成年份
        var curyear = new Date().getFullYear();
        var curmonth = new Date().getMonth() + 1;
        $('#input-start-year').val(curyear);
        $('#input-end-year').val(curyear);
        $('#input-book-start-year').val(curyear);
        $('#input-book-end-year').val(curyear);
        $('#input-start-month').val(curmonth);
        $('#input-end-month').val(curmonth);
        $('#input-book-start-month').val(curmonth);
        $('#input-book-end-month').val(curmonth);
        $('#input-start-minute').val(0);
        $('#input-end-minute').val(0);
        $('#input-book-start-minute').val(0);
        $('#input-book-end-minute').val(0);
        $('#input-seat_status').val(0);
    }
    else{
        $("#input-pic").attr('src','http://wx7.igeek.asia/static1/'+activity.pic_url);
        $("#input-menu").attr('src','http://wx7.igeek.asia/static1/'+activity.menu_url);
        $("#image_area").css('display','block');
        $("#menu_area").css('display','block');
        $("#picpath").parent().css('display','none');
        $("#menupath").parent().css('display','none');
    }
    if (typeof activity.checked_tickets !== 'undefined') {
        initialProgress(activity.checked_tickets, activity.ordered_tickets, activity.total_tickets);
    }
    curstatus = activity.status;
    lockByStatus(curstatus, activity.book_start, activity.start_time, activity.end_time);
}

function check_percent(p) {
    if (p > 100.0) {
        return 100.0;
    } else {
        return p;
    }
}

function checktime(){
    var actstart = new Date($('#input-start-year').val(), $('#input-start-month').val()-1, $('#input-start-day').val(), $('#input-start-hour').val(), $('#input-start-minute').val());
    var actend = new Date($('#input-end-year').val(), $('#input-end-month').val()-1, $('#input-end-day').val(), $('#input-end-hour').val(), $('#input-end-minute').val());
    var bookstart = new Date($('#input-book-start-year').val(), $('#input-book-start-month').val()-1, $('#input-book-start-day').val(), $('#input-book-start-hour').val(), $('#input-book-start-minute').val());
    var bookend = new Date($('#input-book-end-year').val(), $('#input-book-end-month').val()-1, $('#input-book-end-day').val(), $('#input-book-end-hour').val(), $('#input-book-end-minute').val());
    var now = new Date();
    if(curstatus == 0){
        if(bookstart < now){
            $('#input-book-start-year').popover({
                    html: true,
                    placement: 'top',
                    title:'',
                    content: '<span style="color:red;">“订票开始时间”应晚于“当前时间”</span>',
                    trigger: 'focus',
                    container: 'body'
            });
            $('#input-book-start-year').focus();
            return false;
        }

        if(bookend < bookstart){
            $('#input-book-end-year').popover({
                html: true,
                placement: 'top',
                title:'',
                content: '<span style="color:red;">“订票结束时间”应晚于“订票开始时间”</span>',
                trigger: 'focus',
                container: 'body'
            });
            $('#input-book-end-year').focus();
            return false;
        }
    }
    if(actstart < bookend){
        $('#input-start-year').popover({
                html: true,
                placement: 'top',
                title:'',
                content: '<span style="color:red;">“活动开始时间”应晚于“订票结束时间”</span>',
                trigger: 'focus',
                container: 'body'
        });
         $('#input-start-year').focus();
        return false;
    }
    if(actend < actstart){
        $('#input-end-year').popover({
            html: true,
            placement: 'top',
            title:'',
            content: '<span style="color:red;">“活动结束时间”应晚于“活动开始时间”</span>',
            trigger: 'focus',
            container: 'body'
        });
         $('#input-end-year').focus();
        return false;
    }
    return true;
}

function initialProgress(checked, ordered, total) {
    $('#tickets-checked').css('width', check_percent(100.0 * checked / total) + '%')
        .tooltip('destroy').tooltip({'title': '已检入：' + checked + '/' + ordered + '=' + (100.0 * checked / ordered).toFixed(2) + '%'});
    $('#tickets-ordered').css('width', check_percent(100.0 * (ordered - checked) / total) + '%')
        .tooltip('destroy').tooltip({'title': '订票总数：' + ordered + '/' + total + '=' + (100.0 * ordered / total).toFixed(2) + '%' + '，其中未检票：' + (ordered - checked) + '/' + ordered + '=' + (100.0 * (ordered - checked) / ordered).toFixed(2) + '%'});
    $('#tickets-remain').css('width', check_percent(100.0 * (total - ordered) / total) + '%')
        .tooltip('destroy').tooltip({'title': '余票：' + (total - ordered) + '/' + total + '=' + (100.0 * (total - ordered) / total).toFixed(2) + '%'});
}

function changeView(id) {
    var opt = ['noscript', 'form', 'processing', 'result'], len = opt.length, i;
    for (i = 0; i < len; ++i) {
        $('#detail-' + opt[i]).hide();
    }
    $('#detail-' + id).show();
}

function showForm() {
    changeView('form');
}

function showProcessing() {
    changeView('processing');
}

function showResult() {
    changeView('result');
}

function setResult(str) {
    $('#resultHolder').text(str);
}

function appendResult(str) {
    var dom = $('#resultHolder');
    dom.text(dom.text() + str + '\r\n');
}

function lockForm() {
    var key;
    for (key in keyMap) {
        lockMap[keyMap[key]]($('#input-' + key), true);
    }
    $('#publishBtn').hide();
    $('#saveBtn').hide();
    $('#resetBtn').hide();
}


function showPubTipsByStatus(status){
    if(status < 1){
        //$('#publishBtn').tooltip({'title': '发布后不能修改“活动名称”、“活动代称”和“订票开始时间”'});
        $('#saveBtn').tooltip({'title': '暂存后可以“继续修改”'});
    }
}

function lockByStatus(status, book_start, start_time, end_time) {
    // true means lock, that is true means disabled
    var statusLockMap = {
        // saved but not published
        '0': {
        },
        // published but not determined
        '1': {
            'name': true,
            'key': true,
            'place': function() {
                return (new Date() >= getDateByObj(start_time));
            },
            'book_start': true,
            'book_end': function() {
                return (new Date() >= getDateByObj(start_time));
            },
            'total_tickets': function() {
                return (new Date() >= getDateByObj(book_start));
            },
            'start_time': function() {
                return (new Date() >= getDateByObj(end_time));
            },
            'end_time': function() {
                return (new Date() >= getDateByObj(end_time));
            },
            'seat_status': function() {
                return (new Date() >= getDateByObj(book_start));
            }
        }
    }, key;
    for (key in keyMap) {
        var flag = !!statusLockMap[status][key];
        if (typeof statusLockMap[status][key] == 'function') {
            flag = statusLockMap[status][key]();
        }
        lockMap[keyMap[key]]($('#input-' + key), flag);
    }
    showProgressByStatus(status, book_start);
    if (status >= 1) {
        $('#saveBtn').hide();
    } else {
        $('#saveBtn').show();
    }
    showPublishByStatus(status, end_time);
    showPubTipsByStatus(status);
}

function showProgressByStatus(status, book_start) {
    if ((status >= 1) && (new Date() >= getDateByObj(book_start))) {
        $('#progress-tickets').show();
    } else {
        $('#progress-tickets').hide();
    }
}

function showPublishByStatus(status, linetime) {
    if ((status >= 1) && (new Date() >= getDateByObj(linetime))) {
        $('#publishBtn').hide();
        $('#resetBtn').hide();
    } else {
        $('#resetBtn').show();
        $('#publishBtn').show();
    }
}

function getDateString(tmpDate) {
    return tmpDate.year + '-' + tmpDate.month + '-' + tmpDate.day + ' ' + tmpDate.hour + ':' + tmpDate.minute + ':00';
}

function getDateByObj(obj) {
    return new Date(obj.year, obj.month - 1, obj.day, obj.hour, obj.minute);
}

function wrapDateString(dom, formData, name) {
    var parts = dom.children(), i, len, tmpDate = {}, part;
    for (i = 0, len = parts.length; i < len; ++i) {
        part = $(parts[i]).children();
        if (part.attr('date-part')) {
            if (part.val().length == 0) {
                return false;
            } else {
                tmpDate[part.attr('date-part')] = parseInt(part.val());
            }
        }
    }
    formData.push({
        name: name,
        required: false,
        type: 'string',
        value: getDateString(tmpDate)
    });
    return true;
}

function beforeSubmit(formData, jqForm, options) {
    var i, len, nameMap = {
        'name': '活动名称',
        'key': '活动代码',
        'place': '活动地点',
        'description': '活动简介',
        'start_time': '活动开始时间',
        'end_time': '活动结束时间',
        'total_tickets': '活动总票数',
        'pic_url': '活动配图',
        'book_start': '订票开始时间',
        'book_end': '订票结束时间',
        'seat_status': '座位分配设置'
    }, lackArray = [], dateArray = [
        'start_time', 'end_time', 'book_start', 'book_end'
    ];
    for (i = 0, len = formData.length; i < len; ++i) {
        if (!formData[i].value) {
            lackArray.push(nameMap[formData[i].name]);
        }
    }
    for (i = 0, len = dateArray.length; i < len; ++i) {
        if (!$('#input-' + dateArray[i]).prop('disabled')) {
            if (!wrapDateString($('#input-' + dateArray[i]), formData, dateArray[i])) {
                lackArray.push(nameMap[dateArray[i]]);
            }
        }
    }
    if (lackArray.length > 0) {
        setResult('以下字段是必须的，请补充完整后再提交：\r\n' + lackArray.join('、'));
        $('#continueBtn').click(function() {
            showForm();
        });
        showResult();
        return false;
    }
    if (activity.id) {
        formData.push({
            name: 'id',
            required: false,
            type: 'number',
            value: activity.id.toString()
        });
    }
    return true;
}

function beforePublish(formData, jqForm, options) {
    if (beforeSubmit(formData, jqForm, options)) {
        showProcessing();
        if (activity.id) {
            formData.push({
                name: 'id',
                required: false,
                type: 'number',
                value: activity.id.toString()
            });
        }
        formData.push({
            name: 'publish',
            required: false,
            type: 'number',
            value: '1'
        });
        return true;
    } else {
        return false;
    }
}

function submitResponse(data) {
    if (!data.error) {
        updateActivity(data.activity);
        initializeForm(activity);
        appendResult('成功');
    } else {
        appendResult('错误：' + data.error);
    }
    if (data.warning) {
        appendResult('警告：' + data.warning);
    }
    if (data.updateUrl) {
        $('#continueBtn').click(function() {
            window.location.href = data.updateUrl;
        });
    } else {
        $('#continueBtn').click(function() {
            showForm();
        });
    }

}

function submitError(xhr) {
    setResult('ERROR!\r\nStatus:' + xhr.status + ' ' + xhr.statusText + '\r\n\r\nResponseText:\r\n' + (xhr.responseText || '<null>'));
    $('#continueBtn').click(function() {
        showForm();
    });
}

function submitComplete(xhr) {
    showResult();
}


function publishActivity() {
    if(!$('#activity-form')[0].checkValidity || $('#activity-form')[0].checkValidity()){
        if(!checktime())
            return false;
        showProcessing();
        setResult('');
        var options = {
            dataType: 'json',
            beforeSubmit: beforePublish,
            success: submitResponse,
            error: submitError,
            complete: submitComplete
        };
        $('#activity-form').ajaxSubmit(options);
        return false;
    } else {
        $('#saveBtn').click();
    }
    return false;
}

//在网页中添加一个座位
function appendTxt(area, i, j, toppx, leftpx){
    var txt = '<li id="s'+area+'_'+i+'_'+j+'" title="'+i+'排'+j+'号" class="af" style="top:'+toppx+'px;left:'+leftpx+'px;">'+j+'</li>'
    $("#seatMapData_ul").append(txt);
}

function clickSelect(){//添加座位图
        var x=document.getElementById("selectArea")
        if(x.selectedIndex == "0"){//池座座位图
            $("#seat-distribution-input").val("");
            $("#input-total_tickets").val(0);
            $("li").remove();
            $(".anum").remove();
            for(var i=1; i<=19; i++){//添加每排座位
                var toppx = 15*(i-1);
                var txt1 = '<p class="anum" style="top:'+toppx+'px;left:20px;">'+i+'</p>'
                var txt2 = '<p class="anum" style="top:'+toppx+'px;left:725px;">'+i+'</p>'
                $("#seatMapData").append(txt1,txt2);
                if(i==1){
                    for(var j=1; j<=31; j++){
                        var toppx = 15*(i-1);
                        if(j<=5) var leftpx = 65+15*(j+3);
                        else if(j<=26) var leftpx = 65+15*(j+4);
                        else var leftpx = 65+15*(j+6);
                        appendTxt(1, i, j, toppx, leftpx);
                    }
                }
                else if(i==18){
                    for(var j=1; j<=32; j++){
                        var toppx = 15*(i-1);
                        if(j<=5) var leftpx = 65+15*(j+3);
                        else if(j<=27) var leftpx = 65+15*(j+4);
                        else var leftpx = 65+15*(j+5);
                        appendTxt(1, i, j, toppx, leftpx);
                    }
                }
                else if(i==2){
                    for(var j=1; j<=34; j++){
                        var toppx = 15*(i-1);
                        if(j<=6) var leftpx = 65+15*(j+2);
                        else if(j<=28) var leftpx = 65+15*(j+3);
                        else var leftpx = 65+15*(j+4);
                        appendTxt(1, i, j, toppx, leftpx);
                    }
                }
                else if(i==17||i==3){
                    for(var j=1; j<=35; j++){
                        var toppx = 15*(i-1);
                        if(j<=7) var leftpx = 65+15*(j+1);
                        else if(j<=28) var leftpx = 65+15*(j+2);
                        else var leftpx = 65+15*(j+4);
                        appendTxt(1, i, j, toppx, leftpx);
                    }
                }
                else if(i==16||i==4){
                    for(var j=1; j<=38; j++){
                        var toppx = 15*(i-1);
                        if(j<=8) var leftpx = 65+15*(j);
                        else if(j<=30) var leftpx = 65+15*(j+1);
                        else var leftpx = 65+15*(j+2);
                        appendTxt(1, i, j, toppx, leftpx);
                    }
                }
                else if(i==5||i==7||i==9||i==11||i==13||i==15){
                    for(var j=1; j<=39; j++){
                        var toppx = 15*(i-1);
                        if(j<=9) var leftpx = 65+15*(j-1);
                        else if(j<=30) var leftpx = 65+15*(j);
                        else var leftpx = 65+15*(j+2);
                        appendTxt(1, i, j, toppx, leftpx);
                    }
                }
                else if(i==19){
                    for(var j=1; j<=21; j++){
                        var toppx = 15*(i-1);
                        var leftpx = 65+15*(j+9);
                        appendTxt(1, i, j, toppx, leftpx);
                    }
                }
                else{
                    for(var j=1; j<=40; j++){
                        var toppx = 15*(i-1);
                        if(j<=9) var leftpx = 65+15*(j-1);
                        else if(j<=31) var leftpx = 65+15*(j);
                        else var leftpx = 65+15*(j+1);
                        appendTxt(1, i, j, toppx, leftpx);
                    }
                }
            }
        }
        else if(x.selectedIndex == "1"){//一层座位图
            $("#seat-distribution-input").val("");
            $("#input-total_tickets").val(0);
            $("li").remove();
            $(".anum").remove();
            for(var i=1; i<=22; i++){//添加每排座位
                if(i<=16){
                    var toppx = 15*(i-1);
                }
                else{
                    var toppx = 15*(i);
                }
                var txt1 = '<p class="anum" style="top:'+toppx+'px;left:20px;">'+i+'</p>'
                var txt2 = '<p class="anum" style="top:'+toppx+'px;left:1025px;">'+i+'</p>'
                $("#seatMapData").append(txt1,txt2);
                if(i==1){
                    var txt1 = '<li id="s2_1_1" title="1排1号" class="af" style="top:0px;left:125px;">1</li>'
                    var txt2 = '<li id="s2_1_2" title="1排2号" class="af" style="top:0px;left:920px;">2</li>'
                    $("#seatMapData_ul").append(txt1,txt2);
                }
                else if(i==2){
                    var txt1 = '<li id="s2_2_2" title="2排2号" class="af" style="top:15px;left:125px;">2</li>'
                    var txt2 = '<li id="s2_2_3" title="2排3号" class="af" style="top:15px;left:920px;">3</li>'
                    var txt3 = '<li id="s2_2_1" title="2排1号" class="af" style="top:15px;left:110px;">1</li>'
                    var txt4 = '<li id="s2_2_4" title="2排4号" class="af" style="top:15px;left:935px;">4</li>'
                    $("#seatMapData_ul").append(txt1,txt2,txt3,txt4);
                }
                else if(i==17||i==20){
                    for(var j=1; j<=50; j++){
                        var toppx = 15*(i);
                        if(j<=14) var leftpx = 65+15*(j+4);
                        else if(j<=36) var leftpx = 65+15*(j+5);
                        else var leftpx = 65+15*(j+6);
                        appendTxt(2, i, j, toppx, leftpx);
                    }
                }
                else if(i==18){
                    for(var j=1; j<=56; j++){
                        var toppx = 15*(i);
                        if(j<=17) var leftpx = 65+15*(j+1);
                        else if(j<=39) var leftpx = 65+15*(j+2);
                        else var leftpx = 65+15*(j+3);
                        appendTxt(2, i, j, toppx, leftpx);
                    }
                }
                else if(i==19){
                    for(var j=1; j<=60; j++){
                        var toppx = 15*(i);
                        if(j<=19) var leftpx = 65+15*(j-1);
                        else if(j<=41) var leftpx = 65+15*(j);
                        else var leftpx = 65+15*(j+1);
                        appendTxt(2, i, j, toppx, leftpx);
                    }
                }
                else if(i==21){
                    for(var j=1; j<=42; j++){
                        var toppx = 15*(i);
                        if(j<=10) var leftpx = 65+15*(j+8);
                        else if(j<=32) var leftpx = 65+15*(j+9);
                        else var leftpx = 65+15*(j+10);
                        appendTxt(2, i, j, toppx, leftpx);
                    }
                }
                else if(i==22){
                    for(var j=1; j<=26; j++){
                        var toppx = 15*(i);
                        if(j<=4) var leftpx = 65+15*(j+14);
                        else if(j<=22) var leftpx = 65+15*(j+17);
                        else var leftpx = 65+15*(j+20);
                        appendTxt(2, i, j, toppx, leftpx);
                    }
                }
                else{
                    for(var j=1; j<=6; j++){
                        var toppx = 15*(i-1);
                        if(j<=3) var leftpx = 65+15*(j+1);
                        else var leftpx = 65+15*(j+53);
                        appendTxt(2, i, j, toppx, leftpx);
                    }
                }
            }
        }
        else if(x.selectedIndex == "2"){//二层座位图
            $("#seat-distribution-input").val("");
            $("#input-total_tickets").val(0);
            $("li").remove();
            $(".anum").remove();
            for(var i=1; i<=23; i++){//添加每排座位
                var toppx = 15*(i-1);
                var txt1 = '<p class="anum" style="top:'+toppx+'px;left:20px;">'+i+'</p>'
                var txt2 = '<p class="anum" style="top:'+toppx+'px;left:1145px;">'+i+'</p>'
                $("#seatMapData").append(txt1,txt2);
                if(i==1){
                    var txt1 = '<li id="s3_1_1" title="1排1号" class="af" style="top:0px;left:95px;">1</li>'
                    var txt2 = '<li id="s3_1_2" title="1排2号" class="af" style="top:0px;left:1070px;">2</li>'
                    $("#seatMapData_ul").append(txt1,txt2);
                }
                else if(i==2){
                    var txt1 = '<li id="s3_2_2" title="2排2号" class="af" style="top:15px;left:95px;">2</li>'
                    var txt2 = '<li id="s3_2_3" title="2排3号" class="af" style="top:15px;left:1070px;">3</li>'
                    var txt3 = '<li id="s3_2_1" title="2排1号" class="af" style="top:15px;left:80px;">1</li>'
                    var txt4 = '<li id="s3_2_4" title="2排4号" class="af" style="top:15px;left:1085px;">4</li>'
                    $("#seatMapData_ul").append(txt1,txt2,txt3,txt4);
                }
                else if(i==16){
                    for(var j=1; j<=58; j++){
                        var toppx = 15*(i-1);
                        if(j<=3) var leftpx = 65+15*(j-1);
                        else if(j<=19) var leftpx = 65+15*(j+4);
                        else if(j<=39) var leftpx = 65+15*(j+5);
                        else if(j<=55) var leftpx = 65+15*(j+6);
                        else var leftpx = 65+15*(j+11);
                        appendTxt(3, i, j, toppx, leftpx);
                    }
                }
                else if(i==17){
                    for(var j=1; j<=56; j++){
                        var toppx = 15*(i-1);
                        if(j<=18) var leftpx = 65+15*(j+5);
                        else if(j<=38) var leftpx = 65+15*(j+6);
                        else var leftpx = 65+15*(j+7);
                        appendTxt(3, i, j, toppx, leftpx);
                    }
                }
                else if(i==18){
                    for(var j=1; j<=58; j++){
                        var toppx = 15*(i-1);
                        if(j<=19) var leftpx = 65+15*(j+4);
                        else if(j<=39) var leftpx = 65+15*(j+5);
                        else var leftpx = 65+15*(j+6);
                        appendTxt(3, i, j, toppx, leftpx);
                    }
                }
                else if(i==19){
                    for(var j=1; j<=54; j++){
                        var toppx = 15*(i-1);
                        if(j<=17) var leftpx = 65+15*(j+6);
                        else if(j<=37) var leftpx = 65+15*(j+7);
                        else var leftpx = 65+15*(j+8);
                        appendTxt(3, i, j, toppx, leftpx);
                    }
                }
                else if(i==20){
                    for(var j=1; j<=44; j++){
                        var toppx = 15*(i-1);
                        if(j<=12) var leftpx = 65+15*(j+11);
                        else if(j<=32) var leftpx = 65+15*(j+12);
                        else var leftpx = 65+15*(j+13);
                        appendTxt(3, i, j, toppx, leftpx);
                    }
                }
                else if(i==21){
                    for(var j=1; j<=36; j++){
                        var toppx = 15*(i-1);
                        if(j<=8) var leftpx = 65+15*(j+15);
                        else if(j<=28) var leftpx = 65+15*(j+16);
                        else var leftpx = 65+15*(j+17);
                        appendTxt(3, i, j, toppx, leftpx);
                    }
                }
                else if(i==22){
                    for(var j=1; j<=28; j++){
                        var toppx = 15*(i-1);
                        if(j<=4) var leftpx = 65+15*(j+19);
                        else if(j<=24) var leftpx = 65+15*(j+20);
                        else var leftpx = 65+15*(j+21);
                        appendTxt(3, i, j, toppx, leftpx);
                    }
                }
                else if(i==23){
                    for(var j=1; j<=12; j++){
                        var toppx = 15*(i-1);
                        var leftpx = 65+15*(j+28);
                        appendTxt(3, i, j, toppx, leftpx);
                    }
                }
                else{
                    for(var j=1; j<=6; j++){
                        var toppx = 15*(i-1);
                        if(j<=3) var leftpx = 65+15*(j-1);
                        else var leftpx = 65+15*(j+63);
                        appendTxt(3, i, j, toppx, leftpx);
                    }
                }
            }
        }
        else{//三层座位图
            $("#seat-distribution-input").val("");
            $("#input-total_tickets").val(0);
            $("li").remove();
            $(".anum").remove();
            for(var i=1; i<=22; i++){//添加每排座位
                var toppx = 15*(i-1);
                var txt1 = '<p class="anum" style="top:'+toppx+'px;left:20px;">'+i+'</p>'
                var txt2 = '<p class="anum" style="top:'+toppx+'px;left:1115px;">'+i+'</p>'
                $("#seatMapData").append(txt1,txt2);
                if(i>=1 && i<=3){
                    var toppx = 15*(i-1);
                    var leftpx1 = 65+15*2;
                    var leftpx2 = 65+15*65;
                    var txt1 = '<li id="s4_'+i+'_1" title="'+i+'排1号" class="af" style="top:'+toppx+'px;left:'+leftpx1+'px;">1</li>'
                    var txt2 = '<li id="s4_'+i+'_2" title="'+i+'排2号" class="af" style="top:'+toppx+'px;left:'+leftpx2+'px;">2</li>'
                    $("#seatMapData_ul").append(txt1,txt2);
                }
                else if(i>=4 && i<=6){
                    var toppx = 15*(i-1);
                    var leftpx1 = 65+15*2;
                    var leftpx2 = 65+15*65;
                    var leftpx3 = 65;
                    var leftpx4 = 65+15*67;
                    var txt1 = '<li id="s4_'+i+'_2" title="'+i+'排2号" class="af" style="top:'+toppx+'px;left:'+leftpx1+'px;">2</li>'
                    var txt2 = '<li id="s4_'+i+'_3" title="'+i+'排3号" class="af" style="top:'+toppx+'px;left:'+leftpx2+'px;">3</li>'
                    var txt3 = '<li id="s4_'+i+'_1" title="'+i+'排1号" class="af" style="top:'+toppx+'px;left:'+leftpx3+'px;">1</li>'
                    var txt4 = '<li id="s4_'+i+'_4" title="'+i+'排4号" class="af" style="top:'+toppx+'px;left:'+leftpx4+'px;">4</li>'
                    $("#seatMapData_ul").append(txt1,txt2,txt3,txt4);
                }
                else if(i==16){
                    for(var j=1; j<=52; j++){
                        var toppx = 15*(i-1);
                        if(j<=3) var leftpx = 65+15*(j-1);
                        else if(j<=16) var leftpx = 65+15*(j+6);
                        else if(j<=36) var leftpx = 65+15*(j+7);
                        else if(j<=49) var leftpx = 65+15*(j+8);
                        else var leftpx = 65+15*(j+15);
                        appendTxt(4, i, j, toppx, leftpx);
                    }
                }
                else if(i==17){
                    for(var j=1; j<=50; j++){
                        var toppx = 15*(i-1);
                        if(j<=15) var leftpx = 65+15*(j+7);
                        else if(j<=35) var leftpx = 65+15*(j+8);
                        else var leftpx = 65+15*(j+9);
                        appendTxt(4, i, j, toppx, leftpx);
                    }
                }
                else if(i==18||i==19){
                    for(var j=1; j<=54; j++){
                        var toppx = 15*(i-1);
                        if(j<=17) var leftpx = 65+15*(j+5);
                        else if(j<=37) var leftpx = 65+15*(j+6);
                        else var leftpx = 65+15*(j+7);
                        appendTxt(4, i, j, toppx, leftpx);
                    }
                }
                else if(i==20){
                    for(var j=1; j<=42; j++){
                        var toppx = 15*(i-1);
                        if(j<=11) var leftpx = 65+15*(j+11);
                        else if(j<=31) var leftpx = 65+15*(j+12);
                        else var leftpx = 65+15*(j+13);
                        appendTxt(4, i, j, toppx, leftpx);
                    }
                }
                else if(i==21){
                    for(var j=1; j<=36; j++){
                        var toppx = 15*(i-1);
                        if(j<=8) var leftpx = 65+15*(j+14);
                        else if(j<=28) var leftpx = 65+15*(j+15);
                        else var leftpx = 65+15*(j+16);
                        appendTxt(4, i, j, toppx, leftpx);
                    }
                }
                else if(i==22){
                    for(var j=1; j<=28; j++){
                        var toppx = 15*(i-1);
                        if(j<=4) var leftpx = 65+15*(j+18);
                        else if(j<=24) var leftpx = 65+15*(j+19);
                        else var leftpx = 65+15*(j+20);
                        appendTxt(4, i, j, toppx, leftpx);
                    }
                }
                else{
                    for(var j=1; j<=6; j++){
                        var toppx = 15*(i-1);
                        if(j<=3) var leftpx = 65+15*(j-1);
                        else var leftpx = 65+15*(j+61);
                        appendTxt(4, i, j, toppx, leftpx);
                    }
                }
            }
        }
        $("li").click(function(){//单击座位后变色表示选中
            var id = $(this).attr("id");
            if($(this).attr("class")=="af"){
                document.getElementById(id).className="as";
                $("#seat-distribution-input").val($("#seat-distribution-input").val()+id);
            }
            else{
                document.getElementById(id).className="af";
                $("#seat-distribution-input").val($("#seat-distribution-input").val().replace(id,""));
            }
            var as = $(".as");                        
            $("#input-total_tickets").val(as.length);
        });
        $(".anum").click(function(){//单击排号整排变色表示选中整排
            var row = this.innerHTML;
            var seats = document.getElementById("seatMapData").children[0].children;
            for(var i = 0; i < seats.length; i++){
                if(seats[i].id.match("_"+row+"_") != null){
                    seats[i].click();
                }
            }
        });
}

function setInputNum()//根据选座情况计算总票数
{
    var x=document.getElementById("input-seat_status")
    if(x.selectedIndex == "1"){
        var as = $(".as");                        
        $("#input-total_tickets").val(as.length);
    }
    else if(x.selectedIndex == "2"){
        $("#input-total_tickets").val(parseInt($("#a").val())+parseInt($("#b").val())+parseInt($("#c").val())+parseInt($("#d").val())+parseInt($("#e").val()));
    }
    else{}
}

function getSeatDistribution()//根据作为分配选项进行相关初始化
{
    var x=document.getElementById("input-seat_status")
    if(x.selectedIndex == "1"){
        clickSelect();
        document.getElementById("seat-distribution").setAttribute('style', 'display:block');
        document.getElementById("seat-distribution2").setAttribute('style', 'display:none');
        $("#input-total_tickets").val(0);
        $("#seat-distribution-input").val("");
        $("#a").val("");
        $("#b").val("");
        $("#c").val("");
        $("#d").val("");
        $("#e").val("");
        while(document.getElementsByClassName("as").length){
            document.getElementsByClassName("as")[0].className="af";
        }
    }
    else if(x.selectedIndex == "2"){
        document.getElementById("seat-distribution2").setAttribute('style', 'display:block');
        document.getElementById("seat-distribution").setAttribute('style', 'display:none');
        $("#input-total_tickets").val(0);
        $("#seat-distribution-input").val("");
        $("#a").val("");
        $("#b").val("");
        $("#c").val("");
        $("#d").val("");
        $("#e").val("");
        while(document.getElementsByClassName("as").length){
            document.getElementsByClassName("as")[0].className="af";
        }
    }
    else{
        document.getElementById("seat-distribution").setAttribute('style', 'display:none'); 
        document.getElementById("seat-distribution2").setAttribute('style', 'display:none');
        $("#seat-distribution-input").val("a");
        $("#a").val("");
        $("#b").val("");
        $("#c").val("");
        $("#d").val("");
        $("#e").val("");
        while(document.getElementsByClassName("as").length){
            document.getElementsByClassName("as")[0].className="af";
        }
    }
}

function checkSeatNum(a)//检查选区模式下座位数是否超标
{
    document.getElementById("warningMessage"+a.id).setAttribute('style', 'display:none');
    if(parseInt(a.value)>400){
        a.value = "";
        document.getElementById("warningMessage"+a.id).setAttribute('style', 'display:block');
    }
}
function confirmMessage()//选区模式下座位数提交
{
    if($("#a").val()!="" && $("#b").val()!="" && $("#c").val()!="" && $("#d").val()!="" && $("#e").val()!=""){
        document.getElementById("warningMessage").setAttribute('style', 'display:none'); 
        $("#seat-distribution-input").val("sA_"+$("#a").val()+"sB_"+$("#b").val()+"sC_"+$("#c").val()+"sD_"+$("#d").val()+"sE_"+$("#e").val());
        $("#input-total_tickets").val(parseInt($("#a").val())+parseInt($("#b").val())+parseInt($("#c").val())+parseInt($("#d").val())+parseInt($("#e").val()));
        document.getElementById("successMessage").setAttribute('style', 'display:block'); 
    }
    else{
        document.getElementById("successMessage").setAttribute('style', 'display:none'); 
        document.getElementById("warningMessage").setAttribute('style', 'display:block'); 
    }
}

initializeForm(activity);
showForm();

$('#activity-form').submit(function() {
    showProcessing();
    setResult('');
    var options = {
        dataType: 'json',
        beforeSubmit: beforeSubmit,
        success: submitResponse,
        error: submitError,
        complete: submitComplete
    };
    $(this).ajaxSubmit(options);
    return false;
}).on('reset', function() {
    initializeForm(activity);
    return false;
});
$(document).ready(function () {//图片上传相关操作
                    $("#picpath").change(function(){
                        // document.form1.picpath.value=this.value;
                        previewImage(this);
						document.getElementById("image_area").setAttribute('style', 'display:block;text-align:center;');
					
                    });
                    $("#uploadPic").click(function(){
                        document.form1.picpath.click();
                    });
					$("#menupath").change(function(){
                        // document.form1.menupath.value=this.value;
                        previewImage2(this);
						document.getElementById("menu_area").setAttribute('style', 'display:block;text-align:center;');
					
                    });
                    $("#uploadMenu").click(function(){
                        document.form1.menupath.click();
                    });

                });
                function previewImage(file)//预览活动图片
                {
                    var porImg  = $('#input-pic');
                    var reader = new FileReader();
                        reader.onload = function(evt){
                            porImg.attr({src : evt.target.result});
                        }
                        reader.readAsDataURL(file.files[0]);
                    
                }
				function previewImage2(file)//预览节目单
                {
                    var porImg  = $('#input-menu');
                    var reader = new FileReader();
                        reader.onload = function(evt){
                            porImg.attr({src : evt.target.result});
                        }
                        reader.readAsDataURL(file.files[0]);
                    
                }
$('.form-control').on('focus', function() {var me = $(this); setTimeout(function(){me.select();}, 100)});