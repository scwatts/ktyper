from datetime import date

from django.core.management import BaseCommand
from django.utils import timezone

from backend import models


class Command(BaseCommand):
    help = "a command purge old jobs"

    def add_arguments(self, parser):
        parser.add_argument(
            '--max-days',
            dest='max_days',
            type=int,
            default=60,
            help='Delete job older than max-days of age',
        )

    def handle(self, *args, **kwargs):
        assert kwargs['max_days'] > 0
        jobs = models.Job.objects.filter(created_at__lt=timezone.now() - timezone.timedelta(days=kwargs['max_days']))
        print(f"{jobs.count()} jobs are old enough")
        for job in jobs:
            print(f"Removing {job.uuid} created at {job.created_at}")
            job.delete()
