#-*- coding:utf-8 -*-
import random
import string
import datetime
from urlhandler.models import *
from queryhandler.settings import QRCODE_URL
from django.db.models import F
from django.db import transaction

from userpage.safe_reverse import *
from queryhandler.weixin_reply_templates import *
from queryhandler.weixin_text_templates import *
from queryhandler.handler_check_templates import *
from queryhandler.weixin_msg import *
from weixinlib.settings import WEIXIN_EVENT_KEYS

def check_find_me(msg):
    print msg
    return handler_check_text(msg, ['找我']) or handler_check_event_click(msg, [WEIXIN_EVENT_KEYS['find_me']])

def response_find_me(msg):
    print 'find_me'
    fromuser = get_msg_from(msg)
    user = get_user(fromuser)
    if user is None:
        return get_reply_text_xml(msg, get_text_unbinded_exam_ticket(fromuser))
    return get_reply_single_news_xml(msg, get_item_dict(
        title='找我',
        description='找我功能简介',
        pic_url= 'http://www.pingjiata.com/uploadfiles/20140418/1397818902.jpg',
        url='http://wx7.igeek.asia/u/findme/' + fromuser
    ))

def check_find_you(msg):
    return handler_check_text(msg, ['找你']) or handler_check_event_click(msg, [WEIXIN_EVENT_KEYS['find_you']])

def response_find_you(msg):
    fromuser = get_msg_from(msg)
    user = get_user(fromuser)
    if user is None:
        return get_reply_text_xml(msg, get_text_unbinded_exam_ticket(fromuser))
    return get_reply_single_news_xml(msg, get_item_dict(
        title='找你',
        description='找你功能简介',
        pic_url= 'http://www.pingjiata.com/uploadfiles/20140418/1397818902.jpg',
        url=s_reverse_find_you(fromuser)
    ))

def check_get_info(msg):
    return handler_check_text(msg, ['讲座']) or handler_check_event_click(msg, [WEIXIN_EVENT_KEYS['info_lecture']])

def response_get_info(msg):
    return get_reply_single_news_xml(msg, get_item_dict(
        title='讲座名称',
        description='这是一条讲座',
        pic_url= 'http://images.china.cn/attachement/jpg/site1000/20101111/00016c42b2230e4616e14c.jpg',
        url='http://www.tsinghua.edu.cn/publish/xtw/4837/'
    ))

def get_user(openid):
    try:
        return User.objects.get(weixin_id=openid, status=1)
    except:
        return None


def get_reply_single_ticket(msg, ticket, now, ext_desc=''):
    return get_reply_single_news_xml(msg, get_item_dict(
        title=get_text_one_ticket_title(ticket, now),
        description=ext_desc + get_text_one_ticket_description(ticket, now),
        pic_url=get_text_ticket_pic(ticket),
        url=s_reverse_ticket_detail(ticket.unique_id)
    ))


#check user is authenticated or not
def is_authenticated(openid):
    return get_user(openid) is not None


#check help command
def check_help_or_subscribe(msg):
    return handler_check_text(msg, ['帮助', 'help']) or handler_check_event_click(msg, [
        WEIXIN_EVENT_KEYS['help']]) or handler_check_events(msg, ['scan', 'subscribe'])


#get help information
def response_help_or_subscribe_response(msg):
    return get_reply_single_news_xml(msg, get_item_dict(
        title=get_text_help_title(),
        description=get_text_help_description(is_authenticated(get_msg_from(msg))),
        url=s_reverse_help()
    ))


#check book command
def check_bookable_activities(msg):
    return handler_check_text(msg, ['抢啥']) or handler_check_event_click(msg, [WEIXIN_EVENT_KEYS['ticket_book_what']])


#get bookable activities
def response_bookable_activities(msg):
    now = datetime.datetime.fromtimestamp(get_msg_create_time(msg))
    activities_book_not_end = Activity.objects.filter(status=1, book_end__gte=now).order_by('book_start')
    activities_book_end = Activity.objects.filter(status=1, book_end__lt=now, end_time__gte=now)
    activities = list(activities_book_not_end) + list(activities_book_end)
    if len(activities) == 1:
        activity = activities[0]
        return get_reply_single_news_xml(msg, get_item_dict(
            title=get_text_activity_title_with_status(activity, now),
            description=get_text_activity_description(activity, 100),
            pic_url="http://wx7.igeek.asia/static1/"+str(activity.pic_name),
            url=s_reverse_activity_detail(activity.id)
        ))
    items = []
    for activity in activities:
        items.append(get_item_dict(
            title=get_text_activity_title_with_status(activity, now),
            pic_url="http://wx7.igeek.asia/static1/"+str(activity.pic_name),
            url=s_reverse_activity_detail(activity.id)
        ))
        if len(items) >= 10:
            break
    if len(items) != 0:
        return get_reply_news_xml(msg, items)
    else:
        return get_reply_text_xml(msg, get_text_no_bookable_activity())


def check_exam_tickets(msg):
    return handler_check_text(msg, ['查票']) or handler_check_event_click(msg, [WEIXIN_EVENT_KEYS['ticket_get']])


#get list of tickets
def response_exam_tickets(msg):
    fromuser = get_msg_from(msg)
    user = get_user(fromuser)
    if user is None:
        return get_reply_text_xml(msg, get_text_unbinded_exam_ticket(fromuser))

    now = datetime.datetime.fromtimestamp(get_msg_create_time(msg))
    activities = Activity.objects.filter(status=1, end_time__gte=now)
    all_tickets = []
    for activity in activities:
        tickets = Ticket.objects.filter(stu_id=user.stu_id, activity=activity, status=1)
        if tickets.exists():
            all_tickets.append(tickets[0])

    if len(all_tickets) == 0:
        return get_reply_text_xml(msg, get_text_no_ticket())
    else:
        return get_reply_text_xml(msg, get_text_exam_tickets(all_tickets, now))


def check_fetch_ticket(msg):
    return handler_check_text_header(msg, ['取票'])


#handle order message
def response_fetch_ticket(msg):
    fromuser = get_msg_from(msg)
    user = get_user(fromuser)
    if user is None:
        return get_reply_text_xml(msg, get_text_unbinded_fetch_ticket(fromuser))

    received_msg = get_msg_content(msg).split()
    if len(received_msg) > 1:
        key = received_msg[1]
    else:
        return get_reply_text_xml(msg, get_text_usage_fetch_ticket())

    now = datetime.datetime.fromtimestamp(get_msg_create_time(msg))
    activities = Activity.objects.filter(status=1, end_time__gt=now, book_start__lt=now, key=key)
    if not activities.exists():
        return get_reply_text_xml(msg, get_text_no_such_activity('取票'))
    else:
        activity = activities[0]
    return fetch_ticket(msg, user, activity, now)


def fetch_ticket(msg, user, activity, now):
    tickets = Ticket.objects.filter(stu_id=user.stu_id, activity=activity, status=1)
    if tickets.exists():
        ticket = tickets[0]
        return get_reply_single_ticket(msg, ticket, now)
    else:
        return get_reply_text_xml(msg, get_text_no_ticket_in_act(activity, now))


def check_book_ticket(msg):
    return handler_check_text_header(msg, ['抢票'])


def response_book_ticket(msg):
    fromuser = get_msg_from(msg)
    user = get_user(fromuser)
    if user is None:
        return get_reply_text_xml(msg, get_text_unbinded_book_ticket(fromuser))

    received_msg = get_msg_content(msg).split()
    if len(received_msg) > 1:
        key = received_msg[1]
    else:
        return get_reply_text_xml(msg, get_text_usage_book_ticket())
    now = datetime.datetime.fromtimestamp(get_msg_create_time(msg))
    activities = Activity.objects.filter(status=1, book_end__gte=now, book_start__lte=now, key=key)
    if not activities.exists():
        future_activities = Activity.objects.filter(status=1, book_start__gt=now, key=key)
        if future_activities.exists():
            return get_reply_text_xml(msg, get_text_book_ticket_future_with_hint(future_activities[0], now))
        return get_reply_text_xml(msg, get_text_no_such_activity('抢票'))
    else:
        tickets = Ticket.objects.filter(stu_id=user.stu_id, activity=activities[0], status__gt=0)
        if tickets.exists():
            return get_reply_text_xml(msg, get_text_existed_book_ticket(tickets[0]))
        ticket = book_ticket(user, key, now)
        
        if ticket is None:
            return get_reply_text_xml(msg, get_text_fail_book_ticket(activities[0], now))
        else:
            return get_reply_single_ticket(msg, ticket, now, get_text_success_book_ticket())


def book_ticket(user, key, now):
    with transaction.atomic():
        activities = Activity.objects.select_for_update().filter(status=1, book_end__gte=now, book_start__lte=now, key=key)

        if not activities.exists():
            return None
        else:
            activity = activities[0]

        if activity.remain_tickets <= 0:
            return None

        random_string = ''.join([random.choice(string.ascii_letters + string.digits) for n in xrange(32)])
        while Ticket.objects.filter(unique_id=random_string).exists():
            random_string = ''.join([random.choice(string.ascii_letters + string.digits) for n in xrange(32)])

        tickets = Ticket.objects.select_for_update().filter(stu_id=user.stu_id, activity=activity)
        if tickets.exists() and tickets[0].status != 0:
            return None
        
        next_seat = ''
        if activity.seat_status == 1 or activity.seat_status == 2:
            if not tickets.exists():
                Activity.objects.filter(id=activity.id).update(remain_tickets=F('remain_tickets')-1)
                ticket = Ticket.objects.create(
                    stu_id=user.stu_id,
                    activity=activity,
                    unique_id=random_string,
                    m_status=0,
                    status=1,
                    seat=next_seat,
                    row=0,
                    col=0
                )
            else:
                ticket = tickets[0]
                ticket.status = 1
                ticket.m_status=0
                ticket.seat = next_seat
                ticket.save()
                print ticket.status
            return ticket
        elif activity.seat_status == 0 and tickets.exists():
            Activity.objects.filter(id=activity.id).update(remain_tickets=F('remain_tickets')-1)
            ticket = tickets[0]
            ticket.status = 1
            ticket.m_status=0
            ticket.seat = next_seat
            ticket.save()
            return ticket
        elif not tickets.exists():
            Activity.objects.filter(id=activity.id).update(remain_tickets=F('remain_tickets')-1) 
            ticket = Ticket.objects.create(
                    stu_id=user.stu_id,
                    activity=activity,
                    unique_id=random_string,
                    m_status=0,
                    status=1,
                    seat=next_seat,
                    row=0,
                    col=0
                )
            return ticket
        else:
            return None


def check_cancel_ticket(msg):
    return handler_check_text_header(msg, ['退票'])


def response_cancel_ticket(msg):
    fromuser = get_msg_from(msg)
    user = get_user(fromuser)
    if user is None:
        return get_reply_text_xml(msg, get_text_unbinded_cancel_ticket(fromuser))

    received_msg = get_msg_content(msg).split()
    if len(received_msg) > 1:
        key = received_msg[1]
    else:
        return get_reply_text_xml(msg, get_text_usage_cancel_ticket())

    now = datetime.datetime.fromtimestamp(get_msg_create_time(msg))
    activities = Activity.objects.filter(status=1, end_time__gt=now, book_start__lt=now, key=key)
    if not activities.exists():
        return get_reply_text_xml(msg, get_text_no_such_activity('退票'))
    else:
        activity = activities[0]
        if activity.book_end >= now:
            tickets = Ticket.objects.filter(stu_id=user.stu_id, activity=activity, status=1)
            if tickets.exists():   # user has already booked the activity
                if (activity.seat_status == 2 and activity.stage == 0):
                    tickets.delete()
                    Activity.objects.filter(id=activity.id).update(remain_tickets=F('remain_tickets')+1)
                elif (activity.seat_status == 2 and activity.stage == 1):
                    return get_reply_text_xml(msg, '抽签已结束，无法退票')
                else:
                    ticket = tickets[0]
                    ticket.status = 0
                    ticket.row=0
                    ticket.col=0
                    ticket.save()
                    Activity.objects.filter(id=activity.id).update(remain_tickets=F('remain_tickets')+1)
                    seats = Seat.objects.filter(area=ticket.seat, row=ticket.row, col=ticket.col, activity_id=ticket.activity.id)
                    if seats.exists():
                        seats.update(status=1)
                return get_reply_text_xml(msg, get_text_success_cancel_ticket())
            else:
                return get_reply_text_xml(msg, get_text_fail_cancel_ticket())
        else:
            return get_reply_text_xml(msg, get_text_timeout_cancel_ticket())


#check book event
def check_book_event(msg):
    if msg['MsgType'] == 'event' and msg['Event']=='CLICK':
        cmd_list = msg['EventKey'].split('_')
        if len(cmd_list) == 3:
            if cmd_list[0] == 'TSINGHUA' and cmd_list[1] == 'BOOK' and cmd_list[2].isdigit():
                return True
    return False


def response_book_event(msg):
    fromuser = get_msg_from(msg)
    user = get_user(fromuser)

    if user is None:
        return get_reply_text_xml(msg, get_text_unbinded_book_ticket(fromuser))

    now = datetime.datetime.fromtimestamp(get_msg_create_time(msg))
    print msg
    cmd_list = get_msg_event_key(msg).split('_')
    activity_id = int(cmd_list[2])
    activities = Activity.objects.filter(id=activity_id, status=1, end_time__gt=now)

    if activities.exists():
        activity = activities[0]
    else:
        return get_reply_text_xml(msg, get_text_no_such_activity())

    if activity.book_start > now:
        return get_reply_text_xml(msg, get_text_book_ticket_future(activity, now))

    tickets = Ticket.objects.filter(stu_id=user.stu_id, activity=activity, status__gt=0)
 
    if tickets.exists():
        return get_reply_single_ticket(msg, tickets[0], now, get_text_existed_book_event())
    if activity.book_end < now:
        return get_reply_text_xml(msg, get_text_timeout_book_event())

    ticket = book_ticket(user, activity.key, now)

    if ticket is None:
        return get_reply_text_xml(msg, get_text_fail_book_ticket(activities[0], now))
    else:
        return get_reply_single_ticket(msg, ticket, now, get_text_success_book_ticket())


#check unsubscribe event
def check_unsubscribe_or_unbind(msg):
    return handler_check_text(msg, ['解绑']) or handler_check_events(msg, ['unsubscribe'])


#handle unsubscribe event
def response_unsubscribe_or_unbind(msg):
    fromuser = get_msg_from(msg)
    User.objects.filter(weixin_id=fromuser, status=1).update(status=0)
    return get_reply_text_xml(msg, get_text_unbind_success(fromuser))


#check bind event
def check_bind_account(msg):
    return handler_check_text(msg, ['绑定']) or handler_check_event_click(msg, [WEIXIN_EVENT_KEYS['account_bind']])


#handle bind event
def response_bind_account(msg):
    fromuser = get_msg_from(msg)
    user = get_user(fromuser)
    if user is None:
        return get_reply_text_xml(msg, get_text_to_bind_account(fromuser))
    else:
        return get_reply_text_xml(msg, get_text_binded_account(user.stu_id))


def check_no_book_acts_event(msg):
    return handler_check_event_click(msg, [WEIXIN_EVENT_KEYS['ticket_no_book_recommand']])


def response_no_book_acts(msg):
    return get_reply_text_xml(msg, get_text_hint_no_book_acts())


def check_get_activity_menu(msg):
    return handler_check_text_header(msg, ['节目单'])


def response_get_activity_menu(msg):
    received_msg = get_msg_content(msg).split()
    if len(received_msg) > 1:
        key = received_msg[1]
    else:
        return get_reply_text_xml(msg, get_text_usage_get_activity_menu())

    now = datetime.datetime.fromtimestamp(get_msg_create_time(msg))
    activities = Activity.objects.filter(status=1, end_time__gt=now, key=key)
    if not activities.exists():
        return get_reply_text_xml(msg, get_text_no_such_activity())
    else:
        activity = activities[0]
    if not activity.menu_url:
        return get_reply_text_xml(msg, get_text_no_activity_menu())
    if activity.start_time > now:
        return get_reply_text_xml(msg, get_text_fail_get_activity_menu(activity, now))
    return get_reply_single_news_xml(msg, get_item_dict(
        title=get_text_title_activity_menu(activity),
        description=get_text_desc_activity_menu(activity),
        pic_url="http://wx7.igeek.asia/static1/"+str(activity.pic_name),
        url=s_reverse_activity_menu(activity.id)
    ))


def check_xnlhwh(msg):
    return handler_check_text(msg, ['xnlhwh'])


def response_xnlhwh(msg):
    msg['Content'] = '节目单 新年联欢晚会'
    return response_get_activity_menu(msg)

