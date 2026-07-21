from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import UserRegisterView, CurrentUserView, ProfileUpdateView, WeightLogListCreateView

urlpatterns = [
    path('register/', UserRegisterView.as_view(), name='register'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', CurrentUserView.as_view(), name='current_user'),
    path('profile/', ProfileUpdateView.as_view(), name='profile_update'),
    path('weight/', WeightLogListCreateView.as_view(), name='weight_log_list_create'),
]

