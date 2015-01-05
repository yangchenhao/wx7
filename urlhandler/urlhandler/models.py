#-*- coding: UTF-8 -*-
from django.db import models
import uuid


class User(models.Model):
    weixin_id = models.CharField(max_length=255)
    stu_id = models.CharField(max_length=255)
    status = models.IntegerField()
    seed = models.FloatField(default=1024)

class Activity(models.Model):
    name = models.CharField(max_length=255)
    key = models.CharField(max_length=255)
    description = models.TextField()
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    place = models.CharField(max_length=255)
    book_start = models.DateTimeField()
    book_end = models.DateTimeField()
    seat_status = models.IntegerField(default=0)
    total_tickets = models.IntegerField()
    status = models.IntegerField()
    pic_img = models.ImageField(upload_to = 'pic_folder/', default = 'pic_folder/None/no-img.jpg')
    remain_tickets = models.IntegerField()
    menu_img = models.ImageField(upload_to = 'pic_folder/', default = 'pic_folder/None/no-img.jpg')
    stage = models.IntegerField(default=0)
    pic_name = models.CharField(max_length=255)
    menu_name = models.CharField(max_length=255)
    # Something about status:
    # -1: deleted
    # 0: saved but not published
    # 1: published
    # Something about seat_status:
    # 0: no seat
    # 1: seat B and seat C

class Ticket(models.Model):
    stu_id = models.CharField(max_length=255)
    unique_id = models.CharField(max_length=255)
    activity = models.ForeignKey(Activity)
    status = models.IntegerField()
    m_status = models.IntegerField()
    seat = models.CharField(max_length=255)
    row = models.IntegerField(default=0, null=True)
    col = models.IntegerField(default=0,  null=True)
    wish1 = models.CharField(max_length=255, default='Z')
    wish2 = models.CharField(max_length=255, default='Z')
    wish3 = models.CharField(max_length=255, default='Z')
    # Something about isUsed
    # 0: ticket order is cancelled
    # 1: ticket order is valid
    # 2: ticket is used	

class Seat(models.Model):
    seat_id = models.CharField(max_length=255)  #area_row_col
    row = models.IntegerField()
    col = models.IntegerField()
    activity = models.ForeignKey(Activity)
    area = models.CharField(max_length=255)
    status = models.IntegerField() #0:seat is inavailable  1:seat is available
	
	
	
'''
class UserSession(models.Model):
    stu_id = models.CharField(max_length=255)
    session_key = models.CharField(max_length=255)
    session_status = models.IntegerField(1)

    def generate_session(self,stu_id):
        try:
            stu = User.objects.get(stu_id=stu_id)
            sessions = UserSession.objects.filter(stu_id = stu_id)
            if sessions:
                for session in sessions:
                    session.delete()
            s = UserSession(stu_id=stu_id,session_key=uuid.uuid4(),session_status = 0)
            s.save()
            return True
        except:
            return False

    def is_session_valid(self,stu_id,session_key):
        try:
            s = UserSession.objects.get(stu_id=stu_id,session_key=session_key)
            if(s.session_status == 0):
                s.session_status = 1
                s.save()
                return True
            else:
                s.delete()
                return False
        except:
            return False

    def can_print(self,stu_id,session_key):
        try:
            s = UserSession.objects.get(stu_id=stu_id,session_key=session_key)
            return True
        except:
            return False
'''
