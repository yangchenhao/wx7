var xmlhttp = null;

function hideElem(id) {
    document.getElementById(id).setAttribute('style', 'display:none');
}

function showElem(id) {
    document.getElementById(id).setAttribute('style', 'display:block');
}

function clearHelp(groupid, helpid) {
    document.getElementById(groupid).setAttribute('class', 'form-group');
    //document.getElementById(helpid).setAttribute('hidden', 'hidden');
    //document.getElementById(helpid).setAttribute('style', 'display:none;');
    hideElem(helpid);
}

function clearAllHelps() {
    clearHelp('usernameGroup', 'helpUsername');
    clearHelp('passwordGroup', 'helpPassword');
    clearHelp('submitGroup', 'helpSubmit');
}

function showError(groupid, helpid, text) {
    var dom = document.getElementById(helpid);
    dom.innerText = text;
    //dom.removeAttribute('hidden');
    showElem(helpid);
    document.getElementById(groupid).setAttribute('class', 'form-group has-error');
}

function disableOne(id, flag) {
    var dom = document.getElementById(id);
    if (flag) {
        dom.setAttribute('disabled', 'disabled');
    } else {
        dom.removeAttribute('disabled');
    }
}

function disableAll(flag) {
    disableOne('area', flag);
    disableOne('col', flag);
    disableOne('row', flag);
}

function showLoading(flag) {
    //var dom = document.getElementById('helpLoading');
    if (flag) {
        //dom.removeAttribute('hidden');
        showElem('helpLoading');
    } else {
        //dom.setAttribute('hidden', 'hidden');
        hideElem('helpLoading');
    }
}

function readyStateChanged() {
    if (xmlhttp.readyState==4)
    {// 4 = "loaded"
        if (xmlhttp.status==200)
        {// 200 = OK
            var result = xmlhttp.responseText;
            switch (result)
            {
                case 'SUCCESS':
                    //document.getElementById('validationHolder').setAttribute('hidden', 'hidden');
                    hideElem('validationHolder');
                    //document.getElementById('successHolder').removeAttribute('hidden');
                    showElem('successHolder');
                    return;

                case 'REJECT':
                    showError('submitGroup', 'helpSubmit', '座位已被另一个基佬抢走啦！');
                    break;

                case 'Error':
                    showError('submitGroup', 'helpSubmit', '出现了奇怪的错误，我们已经记录下来了，请稍后重试。')
                    break;
            }
        }
        else
        {
            showError('submitGroup', 'helpSubmit', '服务器连接异常，请稍后重试。')
        }
        showLoading(false);
        disableAll(false);
    }
}

function submitSelection(act_id,  ticket_row, ticket_id){
	
	if (ticket_row == 0) {
		disableAll(true);
        showLoading(true);
		var form = document.getElementById('seatSelect'),
            elems = form.elements,
            url = form.action, //userpage.view.selection_post
            params = "uid=" + encodeURIComponent(ticket_id),
            i, len;
		
		for (i = 0, len = elems.length; i < len - 1; ++i) {
            params += '&' + elems[i].name + '=' + encodeURIComponent(elems[i].value);
        }
		params += '&' + 'act_id' + '=' + encodeURIComponent(act_id);
		xmlhttp = new XMLHttpRequest();
		xmlhttp.open('POST', url, true);
		xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xmlhttp.onreadystatechange = readyStateChanged;
		xmlhttp.send(params);	
		
	}
	return false;
}


window.setupWeixin({'optionMenu':false, 'toolbar':false});

clearAllHelps();

function showValidation(row) {
    if (row == 0) {
        document.getElementById('inputUsername').focus();
    } else {
        showElem('successHolder');
        hideElem('validationHolder');
    }
	
}