from django.urls import path
from .views import ExerciseListCreateView, WorkoutListCreateView, WorkoutDetailView

urlpatterns = [
    path('exercises/', ExerciseListCreateView.as_view(), name='exercise_list_create'),
    path('', WorkoutListCreateView.as_view(), name='workout_list_create'),
    path('<int:pk>/', WorkoutDetailView.as_view(), name='workout_detail'),
]
