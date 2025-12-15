from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from django.views.decorators.csrf import csrf_exempt
from graphene_django.views import GraphQLView

from overlay.views import upload_image, detect_landmarks_view, get_processed_image, GoldenRatioJSON, InputAsReferenceJSON, PhiMatrixJSON, SymmetryJSON, placeholder_pdf, GeneratePDF

urlpatterns = [
    path('admin/', admin.site.urls),
    path("graphql/", csrf_exempt(GraphQLView.as_view(graphiql=True))),
    path('uploadfile/', include('users.APIs.urls')),
    path('api/process_image/', csrf_exempt(upload_image), name="process_image"),
    path('uploadfile/pdf/<str:image_id>/', GeneratePDF.as_view(), name='generate_pdf'),
]

if settings.DEBUG:
        urlpatterns += static(settings.MEDIA_URL,document_root=settings.MEDIA_ROOT)
