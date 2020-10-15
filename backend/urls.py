from django.urls import path


from .views import JobData, SubmitJob, ResultData


urlpatterns = [
    path('api/v1/submit/', SubmitJob.as_view()),
    path('api/v1/jobdata/<int:pk>/', JobData.as_view()),
    path('api/v1/resultsdata/<int:pk>/', ResultData.as_view()),
]
