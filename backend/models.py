import uuid


from django.db import models


class Job(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=300)
    input_file = models.CharField(max_length=300)
    status = models.CharField(max_length=20, default='initialising')
    created_at = models.DateTimeField(auto_now_add=True)
