from django.urls import include, path
from rest_framework.routers import DefaultRouter
# from .views import fileUploadView, golden_ratio, input_as_reference, phi_matrix,sym_assym, GR_retrive,GR_pdf, INPTasREF_retrive,INPTasREF_pdf, PHI_retrive, PHI_pdf, SYM_retrive, SYM_report,Shrin_Bulge

from overlay.views import (
    upload_image,
    GoldenRatioJSON,
    InputAsReferenceJSON,
    PhiMatrixJSON,
    SymmetryJSON,
    placeholder_pdf
)

# router = DefaultRouter()
# router.register(r'Uploadfile', fileUploadView)


urlpatterns = [  
    # path('', include(router.urls)),

    path('Uploadfile/', upload_image, name="upload_file_legacy"),

    # --- JSON DATA ENDPOINTS (The ones causing Error 500) ---
    # We map these to the NEW Class-Based Views in 'overlay/views.py'
    path("gr_json/<str:ids>/", GoldenRatioJSON.as_view(), name="gr_json"),
    path("inpt_json/<str:ids>/", InputAsReferenceJSON.as_view(), name="inpt_json"),
    path("phi_json/<str:ids>/", PhiMatrixJSON.as_view(), name="phi_json"),
    path("sym_json/<str:ids>/", SymmetryJSON.as_view(), name="sym_json"),

    # --- PDF DOWNLOAD ENDPOINTS (Placeholders) ---
    path("gr_pdf/<str:ids>/", placeholder_pdf, name="gr_pdf"),
    path("inpt_pdf/<str:ids>/", placeholder_pdf, name="inpt_pdf"),
    path("phi_pdf/<str:ids>/", placeholder_pdf, name="phi_pdf"),
    path("sym_pdf/<str:ids>/", placeholder_pdf, name="sym_pdf"),
    # path("golden_ratio/<ids>/", golden_ratio.as_view(),name="golden_ratio"),
    # path("input_as_reference/<ids>/", input_as_reference.as_view(),name="input_as_reference"),
    # path("phi_matrix/<ids>/", phi_matrix.as_view(),name="phi_matrix"),
    # path("sym/<ids>/", sym_assym.as_view(),name="sym"),
    # path("gr_json/<ids>/", GR_retrive.as_view(),name="gr_json"),
    # path("gr_pdf/<ids>/", GR_pdf.as_view(),name="gr_pdf"),
    # path("inpt_json/<ids>/", INPTasREF_retrive.as_view(),name="inpt_json"),
    # path("inpt_pdf/<ids>/", INPTasREF_pdf.as_view(),name="inpt_pdf"),
    # path("phi_json/<ids>/", PHI_retrive.as_view(),name="phi_json"),
    # path("phi_pdf/<ids>/", PHI_pdf.as_view(),name="phi_pdf"),
    # path("sym_json/<ids>/", SYM_retrive.as_view(),name="sym_json"),
    # path("sym_pdf/<ids>/", SYM_report.as_view(),name="sym_pdf"),
    # path("strink_bulge/<ids>/", Shrin_Bulge.as_view(),name="strink_bulge"),
    
]