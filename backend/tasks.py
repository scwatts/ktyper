import os
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
    run_dir = job.run_dir
    data_dir = decompress_data(run_dir, input_filetype)
    results_fp = run_dir / 'results.tsv'
    # Get command and execute
    command = get_classification_command(results_fp, data_dir)
    try:
        execute_command(command)
        job.status = 'completed'
    except ValueError:
        job.status = 'failed'
    finally:
        execute_command(f'rm -r {data_dir}')
        # Update record
        job.save()


def get_classification_command(results_fp, data_dir):
    # Set base command
    command = [
        'spectracl',
        f'--spectra_dir {data_dir}',
    ]
    # Check if a sample sheet was provided
    sample_sheet_fp = data_dir / 'sample_sheet.tsv'
    if sample_sheet_fp.exists():
        command.append(f'--sample_sheet_fp {sample_sheet_fp}')
    # Use spectracl data files if configured
    if hasattr(django.conf.settings, 'SPECTRACL_MODEL_FP'):
        model_fp = os.path.join(
            django.conf.settings.BASE_DIR,
            django.conf.settings.SPECTRACL_MODEL_FP
        )
        command.append(f'--model_fp {model_fp}')
    if hasattr(django.conf.settings, 'SPECTRACL_FEATURES_FP'):
        features_fp = os.path.join(
            django.conf.settings.BASE_DIR,
            django.conf.settings.SPECTRACL_FEATURES_FP
        )
        command.append(f'--features_fp {features_fp}')
    # Set redirect
    command.append(f'1>{results_fp}')
    return ' '.join(command)


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
        raise ValueError
    return result
