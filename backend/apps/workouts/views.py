from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import Exercise, Workout
from .serializers import ExerciseSerializer, WorkoutSerializer


class ExerciseListCreateView(generics.ListCreateAPIView):
    serializer_class = ExerciseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Return global exercises (created_by is null) OR custom exercises created by user
        return Exercise.objects.filter(
            Q(created_by__isnull=True) | Q(created_by=self.request.user)
        )


class WorkoutListCreateView(generics.ListCreateAPIView):
    serializer_class = WorkoutSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Workout.objects.filter(user=self.request.user)


class WorkoutDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = WorkoutSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Workout.objects.filter(user=self.request.user)
