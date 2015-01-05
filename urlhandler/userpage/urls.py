from django.conf.urls import patterns, url, include

urlpatterns = patterns('',
                       url(r'^$', 'userpage.views.home'),
					   url(r'^fit/(?P<qrmsg>\w+)/$', 'userpage.views.get_qr_code', {'qrtype': 'fit'}),
                       url(r'^validate/try/$', 'userpage.views.validate_post'),
                       url(r'^validate/(?P<openid>\S+)/$', 'userpage.views.validate_view'),
                       url(r'^activity/(?P<activityid>\d+)/$','userpage.views.details_view'),
					   url(r'^ticket/select/$', 'userpage.views.selection_view'),
                       url(r'^ticket/(?P<uid>\S+)/$','userpage.views.ticket_view'),
                       url(r'^help/$','userpage.views.help_view'),
                       url(r'^helpact/$','userpage.views.helpact_view'),
                       url(r'^helpclub/$','userpage.views.helpclub_view'),
                       url(r'^helplecture/$','userpage.views.helplecture_view'),
                       url(r'^activity/(?P<actid>\d+)/menu/$', 'userpage.views.activity_menu_view'),
					   url(r'^findme/(?P<openid>\S+)/$', 'userpage.views.find_me'),
					   url(r'^findyou/(?P<openid>\S+)/$', 'userpage.views.find_you'),
                       )