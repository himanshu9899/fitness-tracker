from django.urls import path
from .views import FoodItemListCreateView, MealListCreateView, MealDetailView

urlpatterns = [
    path('foods/', FoodItemListCreateView.as_view(), name='food_list_create'),
    path('', MealListCreateView.as_view(), name='meal_list_create'),
    path('<int:pk>/', MealDetailView.as_view(), name='meal_detail'),
]
