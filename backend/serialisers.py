import django.contrib.auth.models
import rest_framework.serializers


import backend.models


class JobSerialiser(rest_framework.serializers.ModelSerializer):

    class Meta:
        model = backend.models.Job
        fields = '__all__'

    def validate(self, data):
        # Ensure that we have file data before attempting to write file data to disk
        if self.context.get('file_validation', True) and not self.context.get('file', False):
            raise rest_framework.serializers.ValidationError({'file': 'A file is required'})
        return data
