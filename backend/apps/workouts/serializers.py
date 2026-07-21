from rest_framework import serializers
from .models import Exercise, Workout, WorkoutExercise, ExerciseSet


class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = ['id', 'name', 'category', 'description', 'created_by']
        read_only_fields = ['created_by']

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['created_by'] = user
        return super().create(validated_data)


class ExerciseSetSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False) # Include ID for updates

    class Meta:
        model = ExerciseSet
        fields = ['id', 'set_number', 'reps', 'weight', 'duration', 'distance', 'completed']


class WorkoutExerciseSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)
    exercise_name = serializers.CharField(source='exercise.name', read_only=True)
    exercise_category = serializers.CharField(source='exercise.category', read_only=True)
    sets = ExerciseSetSerializer(many=True)

    class Meta:
        model = WorkoutExercise
        fields = ['id', 'exercise', 'exercise_name', 'exercise_category', 'notes', 'sets']


class WorkoutSerializer(serializers.ModelSerializer):
    exercises = WorkoutExerciseSerializer(many=True)

    class Meta:
        model = Workout
        fields = ['id', 'name', 'date', 'duration', 'notes', 'exercises']

    def create(self, validated_data):
        exercises_data = validated_data.pop('exercises', [])
        user = self.context['request'].user
        workout = Workout.objects.create(user=user, **validated_data)

        for exercise_data in exercises_data:
            sets_data = exercise_data.pop('sets', [])
            exercise_obj = exercise_data.pop('exercise')
            workout_exercise = WorkoutExercise.objects.create(
                workout=workout, 
                exercise=exercise_obj, 
                **exercise_data
            )
            for set_data in sets_data:
                ExerciseSet.objects.create(workout_exercise=workout_exercise, **set_data)
        
        return workout

    def update(self, instance, validated_data):
        exercises_data = validated_data.pop('exercises', None)
        
        # Update workout fields
        instance.name = validated_data.get('name', instance.name)
        instance.date = validated_data.get('date', instance.date)
        instance.duration = validated_data.get('duration', instance.duration)
        instance.notes = validated_data.get('notes', instance.notes)
        instance.save()

        if exercises_data is not None:
            # Simple approach: clear and re-create exercises to avoid complex tracking logic
            instance.exercises.all().delete()
            for exercise_data in exercises_data:
                sets_data = exercise_data.pop('sets', [])
                exercise_obj = exercise_data.pop('exercise')
                workout_exercise = WorkoutExercise.objects.create(
                    workout=instance, 
                    exercise=exercise_obj, 
                    **exercise_data
                )
                for set_data in sets_data:
                    # Strip id if it exists in set_data since we are recreating
                    set_data.pop('id', None)
                    ExerciseSet.objects.create(workout_exercise=workout_exercise, **set_data)

        return instance
