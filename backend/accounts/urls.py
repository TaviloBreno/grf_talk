from django.urls import path
from .views import SignInView, SignUpView, UserView, AvatarView

urlpatterns = [
    path('signin/', SignInView.as_view(), name='signin'),
    path('signup/', SignUpView.as_view(), name='signup'),
    path('me/', UserView.as_view(), name='user'),
    path('avatar/', AvatarView.as_view(), name='avatar'),
]