import pathlib
import subprocess
import sys


import django.conf


import huey.contrib.djhuey


import backend.models


@huey.contrib.djhuey.db_task()
def run_classification(job_pk, input_filetype):
    # Get Job model instance and update status
    job = backend.models.Job.objects.get(pk=job_pk)
    job.status = 'running'
    job.save()
    # Decompress data
    run_dir = pathlib.Path(django.conf.settings.MEDIA_ROOT, str(job.uuid))
    data_dir = decompress_data(run_dir, input_filetype)
    results_fp = run_dir / 'results.tsv'
    # Run spectracl then delete uncompressed data
    execute_command(f'spectracl --spectra_dir {data_dir} > {results_fp}')
    execute_command(f'rm -r {data_dir}')
    # Update record
    job.status = 'completed'
    job.save()


def decompress_data(run_dir, filetype):
    input_fp = run_dir / f'spectra_file.{filetype}'
    output_dir = run_dir / 'temp'
    execute_command(f'mkdir -p {output_dir}')
    if filetype == 'zip':
        execute_command(f'unzip {input_fp} -d {output_dir}')
    elif filetype == 'tar.gz':
        execute_command(f'tar -xvf {input_fp} -C {output_dir}')
    return output_dir


def execute_command(command):
    result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True, encoding='utf-8')
    if result.returncode != 0:
        print('Failed to run command:', result.args, file=sys.stderr)
        print('stdout:', result.stdout, file=sys.stderr)
        print('stderr:', result.stderr, file=sys.stderr)
        sys.exit(1)
    return result
