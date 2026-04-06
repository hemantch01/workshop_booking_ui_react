from django.urls import path
from . import api_views

urlpatterns = [
    path('auth/me/', api_views.me_view, name='api_me'),
    path('auth/login/', api_views.login_view, name='api_login'),
    path('auth/logout/', api_views.logout_view, name='api_logout'),
    path('auth/register/', api_views.register_view, name='api_register'),
    path('auth/activate/<str:key>/', api_views.activate_view, name='api_activate'),
    path('auth/change-password/', api_views.change_password, name='api_change_password'),

    path('workshops/', api_views.workshops_list, name='api_workshops'),
    path('workshops/propose/', api_views.workshop_propose, name='api_propose'),
    path('workshops/<int:pk>/', api_views.workshop_detail, name='api_workshop_detail'),
    path('workshops/<int:pk>/accept/', api_views.workshop_accept, name='api_workshop_accept'),
    path('workshops/<int:pk>/change-date/', api_views.workshop_change_date, name='api_workshop_change_date'),
    path('workshops/<int:pk>/comments/', api_views.workshop_comments, name='api_workshop_comments'),

    path('workshop-types/', api_views.workshop_types_list, name='api_workshop_types'),
    path('workshop-types/<int:pk>/', api_views.workshop_type_detail, name='api_workshop_type_detail'),
    path('workshop-types/<int:pk>/tnc/', api_views.workshop_type_tnc, name='api_workshop_type_tnc'),

    path('profile/', api_views.profile_view, name='api_profile'),
    path('profile/<int:user_id>/', api_views.profile_detail, name='api_profile_detail'),

    path('statistics/public/', api_views.public_stats, name='api_public_stats'),
    path('statistics/team/', api_views.team_stats, name='api_team_stats'),
]