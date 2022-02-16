import pathlib
import shutil
import uuid

import django.conf
from django.db import models


class Job(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=300)
    input_file = models.CharField(max_length=300)
    status = models.CharField(max_length=20, default='initialising')
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def run_dir(self):
        return pathlib.Path(django.conf.settings.MEDIA_ROOT, str(self.uuid))

    def delete(self, *args, **kwargs):
        try:
            shutil.rmtree(self.run_dir)
        except OSError as e:
            print("Error: %s - %s." % (e.filename, e.strerror))
        return super().delete(*args, **kwargs)
