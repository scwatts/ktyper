from django.urls import include, path


urlpatterns = [
    path('', include('backend.urls')),
    path('', include('frontend.urls')),
]
