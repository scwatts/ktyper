from django.urls import path


from .views import JobData, SubmitJob, ResultData, DownloadResult


urlpatterns = [
    path('api/v1/submit/', SubmitJob.as_view()),
    path('api/v1/jobdata/<slug:uuid>/', JobData.as_view()),
    path('api/v1/resultdata/<slug:uuid>/', ResultData.as_view()),
    path('api/v1/downloadresult/<slug:uuid>/', DownloadResult.as_view()),
]
