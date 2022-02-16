import pathlib
import gzip


import numpy as np


import django.conf
import django.http


import rest_framework
import rest_framework.views
import rest_framework.parsers
import rest_framework.response


import backend.models
import backend.serialisers
import backend.tasks


# TODO: move this elsewhere
def get_filetype(fh):
    file_sigs = {
        'gzip': (
            (0, '1f8b'),
        ),
        'tar': (
            (0x101, '7573746172003030'), # ustar.00 iso
            (0x101, '7573746172202000'), # ustar . iso
        ),
        'zip': (
            (0, '504b0304'),
            (0, '504b0506'), # empty
            (0, '504b0708'), # spanned
        ),
    }
    # Get base filetype
    filebytes = fh.read(512)
    for filetype, sigs in file_sigs.items():
        if is_filetype(sigs, filebytes):
            break
    else:
        filetype = None
    # Check for compressed tarball
    if filetype == 'gzip':
        fh.seek(0)
        dcmpbytes = gzip.open(fh, 'rb').read(512)
        if is_filetype(file_sigs['tar'], dcmpbytes):
            filetype = 'tar.gz'
    # Seek back to start
    fh.seek(0)
    return filetype


def is_filetype(sigs, filebytes):
    for offset, sig in sigs:
        bound_upper = offset + len(sig) // 2
        fs = filebytes[offset:bound_upper].hex()
        if sig == filebytes[offset:bound_upper].hex():
            return True
    return False


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
            # Get filetype
            filetype = get_filetype(request.data['file'])
            if not filetype:
                return rest_framework.response.Response(
                        {'file': 'File must be .tar.gz or .gzip format'},
                        status=rest_framework.status.HTTP_400_BAD_REQUEST
                )
            # Create task directory
            job = serialiser.save()
            input_filename = pathlib.Path(job.input_file)
            output_dir = pathlib.Path(django.conf.settings.MEDIA_ROOT, str(job.uuid))
            output_dir.mkdir(mode=0o750, parents=True)
            # Write file
            output_fp = output_dir / f'spectra_file.{filetype}'
            with open(output_fp, 'wb') as fh:
                for chunk in request.data['file'].chunks():
                    fh.write(chunk)
            # Enqueue task, update status
            backend.tasks.run_classification(job.id, filetype)
            job.status = serialiser.data.status = 'queued'
            job.save()
            return rest_framework.response.Response(
                    serialiser.data,
                    status=rest_framework.status.HTTP_201_CREATED
            )
        return rest_framework.response.Response(
                serialiser.errors,
                status=rest_framework.status.HTTP_400_BAD_REQUEST
        )


class JobData(rest_framework.views.APIView):

    def get(self, request, uuid, format=None):
        try:
            job_entry = backend.models.Job.objects.get(uuid=uuid)
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

    def get(self, request, uuid, format=None):
        # Get job data
        try:
            job = backend.models.Job.objects.get(uuid=uuid)
        except backend.models.Job.DoesNotExist:
            return rest_framework.response.Response(
                    {'token': 'Token does not exist'},
                    status=rest_framework.status.HTTP_400_BAD_REQUEST
            )
        # Retrieve results
        output_dir = pathlib.Path(django.conf.settings.MEDIA_ROOT, str(job.uuid))
        results_fp = output_dir / 'results.tsv'
        if job.status != 'completed':
            return rest_framework.response.Response(
                    {'info': 'Job incomplete'},
                    status=rest_framework.status.HTTP_400_BAD_REQUEST
            )
        elif not results_fp.exists():
            return rest_framework.response.Response(
                    {'info': 'Results file not found'},
                    status=rest_framework.status.HTTP_400_BAD_REQUEST
            )
        else:
            with results_fp.open('r') as fh:
                line_token_gen = (line.rstrip().split('\t') for line in fh)
                result_data = list()
                for sid, sp, spp in line_token_gen:
                    result_data.append({
                        'spectra_id': sid,
                        'species': sp,
                        'score': spp
                    })
            return rest_framework.response.Response(
                    {'results': result_data},
                    status=rest_framework.status.HTTP_200_OK
            )


# TODO: code below is a heavy repeat of ResultData.get, fix
class DownloadResult(rest_framework.views.APIView):

    def get(self, request, uuid, format=None):
        # Get job data
        try:
            job = backend.models.Job.objects.get(uuid=uuid)
        except backend.models.Job.DoesNotExist:
            return rest_framework.response.Response(
                    {'token': 'Token does not exist'},
                    status=rest_framework.status.HTTP_400_BAD_REQUEST
            )
        # Retrieve results
        output_dir = pathlib.Path(django.conf.settings.MEDIA_ROOT, str(job.uuid))
        results_fp = output_dir / 'results.tsv'
        if job.status != 'completed':
            return rest_framework.response.Response(
                    {'info': 'Job incomplete'},
                    status=rest_framework.status.HTTP_400_BAD_REQUEST
            )
        elif not results_fp.exists():
            return rest_framework.response.Response(
                    {'info': 'Results file not found'},
                    status=rest_framework.status.HTTP_400_BAD_REQUEST
            )
        else:
            return django.http.FileResponse(results_fp.open('rb'))


class DeleteJob(rest_framework.views.APIView):

    def post(self, request, uuid, format=None):
        try:
            job = backend.models.Job.objects.get(uuid=uuid)
            job.delete()
            return rest_framework.response.Response(
                {'info': 'Job and data removed'},
                status=rest_framework.status.HTTP_202_ACCEPTED
            )
        except backend.models.Job.DoesNotExist:
            return rest_framework.response.Response(
                {'token': 'Token does not exist'},
                status=rest_framework.status.HTTP_400_BAD_REQUEST
            )
