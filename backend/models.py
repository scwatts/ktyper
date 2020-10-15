from django.db import models


class Job(models.Model):
    name = models.CharField(max_length=300)
    status = models.CharField(max_length=20, default='initialising')
    input_file = models.CharField(max_length=300)
    created_at = models.DateTimeField(auto_now_add=True)


class Result(models.Model):
    name = models.CharField(max_length=300)
    created_at = models.DateTimeField(auto_now_add=True)
