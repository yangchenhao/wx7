#-*- coding:utf-8 -*-

from django.http import HttpResponse, Http404
from django.template import RequestContext
from django.shortcuts import render_to_response
from urlhandler.models import User, Activity, Ticket, Seat
from urlhandler.settings import STATIC_URL
import urllib, urllib2
import datetime
from django.utils import timezone
import qrcode
from PIL import Image

def create_user():
    for i in range(3001):
        if (i < 10):
            User.objects.create(weixin_id='test000' + str(i), stu_id=0, status=1)
        elif (i < 100):
            User.objects.create(weixin_id='test00' + str(i), stu_id=0, status=1)
        elif (i < 1000):
            User.objects.create(weixin_id='test0' + str(i), stu_id=0, status=1)
        else:
            User.objects.create(weixin_id='test' + str(i), stu_id=0, status=1)

def get_qr_code(request, qrmsg, qrtype):
    if request.GET:
        return HttpResponse(request.GET.get('test', 'hello') + '\r\n' + qrmsg)
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=0
    )
    qr.add_data(qrmsg)
    qr.make(fit=True)
    img = qr.make_image()
    response = HttpResponse(content_type='image/png')
    if qrtype == 'wide':
        (x, y) = img.size
        newImg = Image.new('RGBA', (x * 7, x), (255, 255, 255))
        newImg.paste(img, (x * 3, 0))
        newImg.save(response, 'png')
    else:
        img.save(response, 'png')
    return response

def find_me(request, openid):
    variables=RequestContext(request,{'openid':openid})
    return render_to_response('m_findme.html', variables)
    
def find_you(request, openid):
    variables=RequestContext(request,{'openid':openid})
    return render_to_response('m_findyou.html', variables)

def home(request):
    return render_to_response('mobile_base.html')
    
###################### Validate ######################
# request.GET['openid'] must be provided.
def validate_view(request, openid):
    if User.objects.filter(weixin_id=openid, status=1).exists():
        isValidated = 1
    else:
        isValidated = 0
    studentid = ''
    if request.GET:
        studentid = request.GET.get('studentid', '')

    request_url = 'http://auth.igeek.asia/v1/time'
    res_data = urllib2.urlopen(request_url)
    res = res_data.read()

    return render_to_response('validation.html', {
        'openid': openid,
        'studentid': studentid,
        'isValidated': isValidated,
        'now': datetime.datetime.now() + datetime.timedelta(seconds=-5),
        'timestamp':res,
    }, context_instance=RequestContext(request))


# Validate Format:
# METHOD 1: learn.tsinghua
# url: https://learn.tsinghua.edu.cn/MultiLanguage/lesson/teacher/loginteacher.jsp
# form: { userid:2011013236, userpass:***, submit1: 登录 }
# success: check substring 'loginteacher_action.jsp'
# validate: userid is number
def validate_through_learn(userid, userpass):
    req_data = urllib.urlencode({'secret': userid, 'userpass': userpass, 'submit1': u'登录'.encode('gb2312')})
    request_url = 'https://learn.tsinghua.edu.cn/MultiLanguage/lesson/teacher/loginteacher.jsp'
    req = urllib2.Request(url=request_url, data=req_data)
    res_data = urllib2.urlopen(req)
    try:
        res = res_data.read()
    except:
        return 'Error'
    if 'loginteacher_action.jsp' in res:
        return 'Accepted'
    else:
        return 'Rejected'

def validate_through_DADI(encodeStr):
    req_data = urllib.urlencode({'secret':encodeStr})
    request_url = 'http://auth.igeek.asia/v1'
    req = urllib2.Request(url=request_url, data=req_data)
    res_data = urllib2.urlopen(req)
    try:
        res = res_data.read()
        print res
    except:
        return 'Error'
    if eval(res)['code'] == 0:
        return 'Accepted'
    else:
        return 'Rejected'

# METHOD 2 is not valid, because student.tsinghua has not linked to Internet
# METHOD 2: student.tsinghua
# url: http://student.tsinghua.edu.cn/checkUser.do?redirectURL=%2Fqingxiaotuan.do
# form: { username:2011013236, password:encryptedString(***) }
# success: response response is null / check response status code == 302
# validate: username is number
def validate_through_student(userid, userpass):
    return 'Error'


def validate_post(request):
    #if (not request.POST) or (not 'openid' in request.POST) or \
            #(not 'username' in request.POST) or (not 'encodeStr' in request.POST):
        #raise Http404
    encodeStr = request.POST['encodeStr']
    userid = request.POST['username']
    if not userid.isdigit():
        raise Http404
    #userpass = request.POST['password'].encode('gb2312')
    validate_result = validate_through_DADI(encodeStr)
    #validate_result = validate_through_learn(userid, userpass)
    if validate_result == 'Accepted':
        openid = request.POST['openid']
        try:
            User.objects.filter(stu_id=userid).update(status=0)
            User.objects.filter(weixin_id=openid).update(status=0)
        except: 
            return HttpResponse('Error')
        try:
            currentUser = User.objects.get(stu_id=userid)
            currentUser.weixin_id = openid
            currentUser.status = 1
            try:
                currentUser.save()
            except:
                return HttpResponse('Error')
        except:
            try:
                newuser = User.objects.create(weixin_id=openid, stu_id=userid, status=1)
                newuser.save()
            except:
                return HttpResponse('Error')
    return HttpResponse(validate_result)

###################### Activity Detail ######################

def details_view(request, activityid):
    activity = Activity.objects.filter(id=activityid)
    if not activity.exists():
        raise Http404  #current activity is invalid
    act_name = activity[0].name
    act_key = activity[0].key
    act_place = activity[0].place
    act_bookstart = activity[0].book_start
    act_bookend = activity[0].book_end
    act_begintime = activity[0].start_time
    act_endtime = activity[0].end_time
    act_totaltickets = activity[0].total_tickets
    act_text = activity[0].description
    act_ticket_remian = activity[0].remain_tickets
    act_abstract = act_text
    MAX_LEN = 256
    act_text_status = 0
    if len(act_text) > MAX_LEN:
        act_text_status = 1
        act_abstract = act_text[0:MAX_LEN]+u'...'
    act_photo = activity[0].pic_name
    cur_time = timezone.now() # use the setting UTC
    act_seconds = 0
    if act_bookstart <= cur_time <= act_bookend:
        act_delta = act_bookend - cur_time
        act_seconds = act_delta.total_seconds()
        act_status = 0 # during book time
    elif cur_time < act_bookstart:
        act_delta = act_bookstart - cur_time
        act_seconds = act_delta.total_seconds()
        act_status = 1 # before book time
    else:
        act_status = 2 # after book time
    variables=RequestContext(request,{'act_name':act_name,'act_text':act_text, 'act_photo':act_photo,
                                      'act_bookstart':act_bookstart,'act_bookend':act_bookend,'act_begintime':act_begintime,
                                      'act_endtime':act_endtime,'act_totaltickets':act_totaltickets,'act_key':act_key,
                                      'act_place':act_place, 'act_status':act_status, 'act_seconds':act_seconds,'cur_time':cur_time,
                                      'act_abstract':act_abstract, 'act_text_status':act_text_status,'act_ticket_remian':act_ticket_remian})
    return render_to_response('activitydetails.html', variables)


def ticket_view(request, uid):
    ticket = Ticket.objects.filter(unique_id=uid)
    if not ticket.exists():
        raise Http404  #current activity is invalid
    row = ticket[0].row
    activity = Activity.objects.filter(id=ticket[0].activity_id)
    act_id = activity[0].id
    act_name = activity[0].name
    act_key = activity[0].key
    act_begintime = activity[0].start_time
    act_endtime = activity[0].end_time
    act_place = activity[0].place
    act_menu = activity[0].menu_name
    act_seat_status = activity[0].seat_status
    ticket_status = ticket[0].status
    m_status = ticket[0].m_status
    now = datetime.datetime.now()
    if act_endtime < now:#表示活动已经结束
        ticket_status = 3
    act_book_endtime =  activity[0].book_end
    act_status = activity[0].stage
    sel_status = 0
    tic_status = 0
    m_seat = ''
    seat1 = ''
    seat2 = ''
    seat3 = ''
    m_ticket_area=''
    m_ticket_row = ''
    m_ticket_col = ''
    if(act_seat_status == 1):
           m_ticket_area=ticket[0].seat
           m_ticket_row = ticket[0].row
           m_ticket_col = ticket[0].col
    if(act_status == 0 and  act_book_endtime < now):
          act_status = 2
    if(act_status == 0 and ticket[0].wish1 != 'Z'):
           sel_status  = 1
           seat1 = ticket[0].wish1
           seat2 = ticket[0].wish2
           seat3 = ticket[0].wish3
    if(ticket_status == 1 and act_status == 1 and  m_status  == 1):
           tic_status = 1
           m_seat = ticket[0].seat
    ticket_seat = ticket[0].seat
    act_photo = "http://wx7.igeek.asia/q/fit/"+uid+"/"
    data = {'m_ticket_area':m_ticket_area, 'm_ticket_row':m_ticket_row, 'm_ticket_col':m_ticket_col, 'seat1' : seat1, 'seat2' : seat2, 'seat3' : seat3,'m_seat' : m_seat, 'selection_status':sel_status, 'new_ticket_status':tic_status, 'activity_status':act_status, 'act_id':act_id, 'act_name':act_name,'act_place':act_place, 'act_begintime':act_begintime, 
            'act_endtime':act_endtime,'act_photo':act_photo, 'ticket_status':ticket_status,'ticket_seat':ticket_seat,
            'ticket_row':row,'ticket_id':uid,'act_key':act_key, 'act_menu':act_menu, 'seat_status':act_seat_status}
    
    if (act_seat_status == 1):
        seats = Seat.objects.filter(status = 1, activity_id=act_id)
        data['seat_number'] = seats.count()
        data['seat'] = ''
        for seat in seats:
            data['seat'] += 's' + seat.seat_id
        data['seat'] += 's'
    elif (act_seat_status == 2):
        seats = Seat.objects.filter(activity_id=act_id)
        data['seat_number'] = seats.count()
        data['seat'] = ''
        for seat in seats:
            data['seat'] += 's' + seat.area+'_'+ str(seat.status)
        data['seat'] += 's'

    variables=RequestContext(request, data)
    #return render_to_response('activityticket.html', variables)
    return render_to_response('m_activityticket.html', variables)

def help_view(request):
    #create_user();
    variables=RequestContext(request,{'name':u'“紫荆之声”'})
    return render_to_response('help.html', variables)


def activity_menu_view(request, actid):
    activity = Activity.objects.get(id=actid)
    return render_to_response('activitymenu.html', {'activity': activity})

def helpact_view(request):
    variables=RequestContext(request,{})
    return render_to_response('help_activity.html', variables)

def helpclub_view(request):
    variables=RequestContext(request,{})
    return render_to_response('help_club.html', variables)

def helplecture_view(request):
    variables=RequestContext(request,{})
    return render_to_response('help_lecture.html', variables)
    
    
def selection_view(request): 
    uid = request.POST['uid']
    area = request.POST['area']
    row = request.POST['row']
    col = request.POST['col']
    act_id = request.POST['act_id']
    activity = Activity.objects.filter(id = act_id)
    if (activity[0].seat_status == 0):
        return HttpResponse('ERROR')
    elif (activity[0].seat_status == 1):
        if (row == str(-1)):
            try:
                seats = Seat.objects.filter(activity_id = activity[0].id, status = 1)
                seat = seats[0]
                seat.status = 0
                seat.save()
                ticket = Ticket.objects.filter(unique_id = uid)
                ticket.update(row=seat.row, col=seat.col,seat=seat.area, activity=activity[0])
                return HttpResponse('SUCCESS')
            except:
                return HttpResponse('ERROR')
        try:
            seats = Seat.objects.filter(area = area, row = row, col = col, activity_id = activity[0].id, status = 1)    
            if seats.exists():
                seats.update(status = 0)
                ticket = Ticket.objects.filter(unique_id = uid)
                ticket.update(row = row, col = col,seat = area, activity=activity[0])
                return HttpResponse('SUCCESS')
            return HttpResponse('REJECT')
        except:
            return HttpResponse('ERROR')
    elif (activity[0].seat_status == 2):
        tickets =  Ticket.objects.filter(unique_id=uid)
        tickets.update(wish1 = str(area), wish2 = str(row), wish3=str(col))
        return HttpResponse('SUCCESS')
    