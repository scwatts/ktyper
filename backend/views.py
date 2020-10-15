import django.conf


import rest_framework
import rest_framework.views
import rest_framework.parsers
import rest_framework.response


import backend.models
import backend.serialisers


class SubmitJob(rest_framework.views.APIView):

    parser_classes = (
        rest_framework.parsers.MultiPartParser,
        rest_framework.parsers.FormParser
    )

    def post(self, request, format=None):
        serialiser = backend.serialisers.JobSerialiser(
            data=request.data,
            context={**request.data, 'file_validation': True}
        )
        if serialiser.is_valid():
            # Write file
            output_fp = f'{django.conf.settings.MEDIA_ROOT}/output.txt'
            with open(output_fp, 'wb') as fh:
                for chunk in request.data['file'].chunks():
                    fh.write(chunk)
            # Save record
            serialiser.save()
            return rest_framework.response.Response(
                    serialiser.data,
                    status=rest_framework.status.HTTP_201_CREATED
            )
        return rest_framework.response.Response(
                serialiser.errors,
                status=rest_framework.status.HTTP_400_BAD_REQUEST
        )


class JobData(rest_framework.views.APIView):

    def get(self, request, pk, format=None):
        try:
            job_entry = backend.models.Job.objects.get(pk=pk)
        except backend.models.Job.DoesNotExist:
            job_entry = None
        if not job_entry:
            return rest_framework.response.Response(
                    {'token': 'Token does not exist'},
                    status=rest_framework.status.HTTP_400_BAD_REQUEST
            )
        else:
            serialiser = backend.serialisers.JobSerialiser(job_entry)
            return rest_framework.response.Response(
                    serialiser.data,
            )


class ResultData(rest_framework.views.APIView):

    def get(self, request, pk, format=None):
        # Get output directory
        try:
            job_entry = backend.models.Job.objects.get(pk=pk)
        except backend.models.Job.DoesNotExist:
            job_entry = None
        if not job_entry:
            return rest_framework.response.Response(
                    {'token': 'Token does not exist'},
                    status=rest_framework.status.HTTP_400_BAD_REQUEST
            )
        # Read result data
        # TEMP: returning job data record for now; must implement result creation first
        serialiser = backend.serialisers.JobSerialiser(job_entry)
        return rest_framework.response.Response(
                serialiser.data,
        )
