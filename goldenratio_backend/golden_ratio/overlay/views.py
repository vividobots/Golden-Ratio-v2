from django.contrib.admin.templatetags.admin_list import results
from django.shortcuts import render
from django.http import JsonResponse
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings

import os, sys, cv2, math, time
import numpy as np
import mediapipe as mp
import uuid
import io
import json

from math import sqrt

from django.shortcuts import get_object_or_404
from django.http import HttpResponse, JsonResponse
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Image as RLImage, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import Table, TableStyle
from django.contrib.sites.shortcuts import get_current_site
import matplotlib.pyplot as plt
from scipy.spatial import Delaunay

import tkinter as tk
from tkinter import filedialog

import base64

from overlay.models import ProcessedImage
from users.models import User
from . import analysis_logic
from . import landmarks as lm_data

PHI = (1 + sqrt(5)) / 2
mp_face_mesh = mp.solutions.face_mesh

SYMMETRIC_PAIRS_NAMED = [
    ((33, 263), "Eye Outer Corners"),
    ((133, 362), "Eye Inner Corners"),
    ((159, 386), "Upper Eyelids"),
    ((145, 374), "Lower Eyelids"),
    ((61, 291), "Mid Cheeks"),
    ((234, 454), "Face Width"),
    ((127, 356), "Lip Corners"),
    ((132, 361), "Mid Mouth Edge"),
    ((205, 425), "Lower Mouth Sides"),
    ((55, 285), "Chin Sides"),
    ((105, 335), "Jawline Curve"),
    ((10, 152), "Forehead–Chin"),
]

def detect_landmarks(img):
    mp_face_mesh = mp.solutions.face_mesh
    h, w = img.shape[:2]

    rgb_image = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    with mp_face_mesh.FaceMesh(static_image_mode=True, max_num_faces=1, refine_landmarks=True) as fm:
        results = fm.process(rgb_image)
    if not results.multi_face_landmarks:
        return None, w, h
    return results.multi_face_landmarks[0].landmark, w, h

def pixel_distance(a, b): return np.linalg.norm(np.array(a) - np.array(b))

def mirror_point_across_vertical_center(pt, cx): return (2*cx - pt[0], pt[1])

# Symmetry index

def compute_symmetry_index(landmarks_xy):
    """Compute normalized symmetry deviation scores for each symmetric pair (0..1)."""
    pts = np.array(landmarks_xy, dtype=np.float32)
    cx = float(np.mean(pts[:, 0]))
    deviations = {}
    for (li, ri), name in SYMMETRIC_PAIRS_NAMED:
        if li >= len(pts) or ri >= len(pts):
            deviations[(li, ri)] = 0.0
            continue
        L = pts[li]
        R = pts[ri]
        Lm = np.array([2*cx - L[0], L[1]])
        dev = float(np.linalg.norm(R - Lm))
        deviations[(li, ri)] = dev
    max_dev = max(deviations.values()) if deviations and max(deviations.values()) > 0 else 1.0
    for k in deviations:
        deviations[k] = float(deviations[k]) / float(max_dev)
    return deviations

def warp_from_landmarks(src_img, src_landmarks, dst_landmarks):
    """Delaunay-based piecewise affine warp."""
    h, w = src_img.shape[:2]
    src_pts = np.array(src_landmarks, dtype=np.float32)
    dst_pts = np.array(dst_landmarks, dtype=np.float32)
    rect = (0, 0, w, h)

    subdiv = cv2.Subdiv2D(rect)
    for p in src_pts:
        try: subdiv.insert((float(p[0]), float(p[1])))
        except: pass

    triangles = subdiv.getTriangleList()
    output = np.zeros_like(src_img)

    def nearest_idx(pt):
        d = np.linalg.norm(src_pts - pt, axis=1)
        return int(np.argmin(d))

    for tri in triangles:
        tri = tri.reshape(3, 2)
        try: idxs = [nearest_idx((tri[i, 0], tri[i, 1])) for i in range(3)]
        except: continue

        src_t = np.float32([src_pts[i] for i in idxs])
        dst_t = np.float32([dst_pts[i] for i in idxs])

        r1 = cv2.boundingRect(src_t)
        r2 = cv2.boundingRect(dst_t)
        if r1[2] == 0 or r1[3] == 0 or r2[2] == 0 or r2[3] == 0: continue

        t1 = [(src_t[i][0] - r1[0], src_t[i][1] - r1[1]) for i in range(3)]
        t2 = [(dst_t[i][0] - r2[0], dst_t[i][1] - r2[1]) for i in range(3)]

        img1_rect = src_img[r1[1]:r1[1] + r1[3], r1[0]:r1[0] + r1[2]]
        if img1_rect.size == 0: continue

        try:
            M = cv2.getAffineTransform(np.float32(t1), np.float32(t2))
            warped = cv2.warpAffine(img1_rect, M, (r2[2], r2[3]), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT_101)
        except: continue

        mask = np.zeros((r2[3], r2[2]), dtype=np.uint8)
        cv2.fillConvexPoly(mask, np.int32(t2), 255)
        out_rect = output[r2[1]:r2[1] + r2[3], r2[0]:r2[0] + r2[2]]
        
        inv_mask = cv2.bitwise_not(mask)
        bg = cv2.bitwise_and(out_rect, out_rect, mask=inv_mask)
        fg = cv2.bitwise_and(warped, warped, mask=mask)
        output[r2[1]:r2[1] + r2[3], r2[0]:r2[0] + r2[2]] = cv2.add(bg, fg)

    blended = cv2.addWeighted(src_img, 0.5, output, 0.5, 0)
    return blended

# Symmetry index

def compute_symmetry_index(landmarks_xy):
    """Compute normalized symmetry deviation scores for each symmetric pair (0..1)."""
    pts = np.array(landmarks_xy, dtype=np.float32)
    cx = float(np.mean(pts[:, 0]))
    deviations = {}
    for (li, ri), name in SYMMETRIC_PAIRS_NAMED:
        if li >= len(pts) or ri >= len(pts):
            deviations[(li, ri)] = 0.0
            continue
        L = pts[li]
        R = pts[ri]
        Lm = np.array([2*cx - L[0], L[1]])
        dev = float(np.linalg.norm(R - Lm))
        deviations[(li, ri)] = dev
    max_dev = max(deviations.values()) if deviations and max(deviations.values()) > 0 else 1.0
    for k in deviations:
        deviations[k] = float(deviations[k]) / float(max_dev)
    return deviations

# Region-weighted shrink & bulge (uses computed symmetry)

def make_shrink_and_bulge_maps(img, landmarks_xy):
    """Generates shrink/bulge maps based on asymmetry."""
    h, w = img.shape[:2]
    pts = np.array(landmarks_xy, dtype=np.float32)
    cx = float(np.mean(pts[:, 0]))
    cy = float(np.mean(pts[:, 1]))

    xs = pts[:, 0]; face_width = float(xs.max() - xs.min())
    symmetry_dev = compute_symmetry_index(pts)

    shrink_pts = pts.copy()
    bulge_pts = pts.copy()
    asym_mask = np.zeros((h, w, 3), dtype=np.uint8)

    base_shrink_strength = 0.9
    base_bulge_strength = 1.2

    for (li, ri), name in SYMMETRIC_PAIRS_NAMED:
        if li >= len(pts) or ri >= len(pts): continue
        L = pts[li].copy(); R = pts[ri].copy()
        deviation = float(symmetry_dev.get((li, ri), 0.0))

        dynamic_scale = 0.4 + 1.6 * deviation
        vec_L_to_mid = np.array([cx - L[0], 0.0])
        vec_R_to_mid = np.array([R[0] - cx, 0.0])
        scale_px = (face_width / 200.0)
        shrink_strength = base_shrink_strength * dynamic_scale * scale_px * 0.08
        bulge_strength = base_bulge_strength * dynamic_scale * scale_px * 0.10

        shrink_pts[li] = L + vec_L_to_mid * shrink_strength
        shrink_pts[ri] = R - vec_R_to_mid * shrink_strength
        bulge_pts[li] = L - vec_L_to_mid * bulge_strength
        bulge_pts[ri] = R + vec_R_to_mid * bulge_strength

        col_val = int(np.clip(255 * deviation, 0, 255))
        Lp = (int(round(L[0])), int(round(L[1])))
        Rp = (int(round(R[0])), int(round(R[1])))
        cv2.circle(asym_mask, Lp, 4, (col_val, 0, 0), -1)
        cv2.circle(asym_mask, Rp, 4, (0, 0, col_val), -1)

    Y = pts[:, 1]
    falloff = np.exp(-((Y - cy) ** 2) / (0.22 * h) ** 2)
    for i in range(len(pts)):
        shrink_pts[i] = pts[i] + (shrink_pts[i] - pts[i]) * falloff[i]
        bulge_pts[i] = pts[i] + (bulge_pts[i] - pts[i]) * falloff[i]

    shrink_pts = np.nan_to_num(shrink_pts)
    bulge_pts = np.nan_to_num(bulge_pts)

    shrink_img = warp_from_landmarks(img, pts.tolist(), shrink_pts.tolist())
    bulge_img = warp_from_landmarks(img, pts.tolist(), bulge_pts.tolist())
    asym_mask = cv2.GaussianBlur(asym_mask, (15, 15), 6)

    return shrink_img, bulge_img, asym_mask

# -------------------

def apply_region_weighted_deformation(img, landmarks_xy, mode="shrink", strength=0.15):
    """
    Apply region-weighted deformation (realistic shrink/bulge).
    mode: 'shrink' or 'bulge'
    strength: deformation intensity (0.1–0.3 recommended)
    """
    h, w = img.shape[:2]
    pts = np.array(landmarks_xy, dtype=np.float32)
    cx = np.mean(pts[:, 0])

    # build dense displacement field
    grid_x, grid_y = np.meshgrid(np.arange(w), np.arange(h))
    dx = np.zeros_like(grid_x, dtype=np.float32)
    dy = np.zeros_like(grid_y, dtype=np.float32)

    # smooth radial weight based on distance from center
    dist_x = (grid_x - cx) / w
    dist_r = np.abs(dist_x)
    weight = np.exp(-dist_r * 8.0)  # decay from centerline outward

    # determine direction
    direction = -1 if mode == "shrink" else 1
    dx = direction * strength * weight * (grid_x - cx)

    # vertical falloff (less warp near forehead/chin)
    cy = np.mean(pts[:, 1])
    dist_y = np.abs((grid_y - cy) / h)
    falloff_y = np.exp(-dist_y * 5.0)
    dx *= falloff_y

    # remap coordinates
    map_x = np.clip(grid_x - dx, 0, w - 1).astype(np.float32)
    map_y = grid_y.astype(np.float32)

    warped = cv2.remap(img, map_x, map_y, cv2.INTER_LINEAR)
    return warped

# Overlay & grid helpers

def blend_overlay_maps(base, shrink, bulge, alpha=0.40):
    diff_map = cv2.addWeighted(shrink, 0.5, bulge, 0.5, 0)
    overlay = cv2.addWeighted(base, 1.0 - alpha, diff_map, alpha, 0)
    return overlay

def generate_grid_overlay(img, spacing=40, color=(0, 255, 0), thickness=1):
    grid = np.zeros_like(img)
    h, w = img.shape[:2]
    for x in range(0, w, spacing):
        cv2.line(grid, (x, 0), (x, h), color, thickness)
    for y in range(0, h, spacing):
        cv2.line(grid, (0, y), (w, y), color, thickness)
    return cv2.addWeighted(img, 0.85, grid, 0.15, 0)

def warp_from_landmarks_with_grid(src_img, src_landmarks, dst_landmarks):
    """Delaunay warp + produce warped grid for visualization."""
    h, w = src_img.shape[:2]
    src_pts = np.array(src_landmarks, dtype=np.float32)
    dst_pts = np.array(dst_landmarks, dtype=np.float32)

    # Delaunay on dst so triangles are inside final positions
    try:
        tri = Delaunay(dst_pts)
        simplices = tri.simplices
    except Exception:
        # fallback: no triangulation
        return warp_from_landmarks(src_img, src_pts, dst_pts), generate_grid_overlay(src_img)

    warped = np.zeros_like(src_img)
    grid_overlay = generate_grid_overlay(src_img)
    warped_grid = np.zeros_like(src_img)

    for simplex in simplices:
        # simplex are indices into points array
        idx = simplex.tolist()
        if max(idx) >= len(src_pts): 
            continue
        src_tri = np.float32([src_pts[i] for i in idx])
        dst_tri = np.float32([dst_pts[i] for i in idx])

        # compute affine mapping from src_tri to dst_tri over full image
        try:
            M = cv2.getAffineTransform(src_tri, dst_tri)
        except Exception:
            continue

        mask = np.zeros((h, w), dtype=np.uint8)
        cv2.fillConvexPoly(mask, np.int32(dst_tri), 255)

        warped_triangle = cv2.warpAffine(src_img, M, (w, h))
        warped[mask == 255] = warped_triangle[mask == 255]

        warped_grid_triangle = cv2.warpAffine(grid_overlay, M, (w, h))
        warped_grid[mask == 255] = warped_grid_triangle[mask == 255]

    # blend small uncovered with original for smoothness
    warped = cv2.addWeighted(src_img, 0.25, warped, 0.75, 0)
    warped_grid = cv2.addWeighted(src_img, 0.25, warped_grid, 0.75, 0)
    return warped, warped_grid

# API Views

@require_POST
def detect_landmarks_view(request):
    if not request.FILES.get('image'):
        return JsonResponse({"error": "no image"}, status=400)
    f = request.FILES['image']
    file_bytes = np.asarray(bytearray(f.read()), dtype=np.uint8)
    img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
    landmarks, w, h = detect_landmarks(img)
    if landmarks is None:
        return JsonResponse({"error": "no face"}, status=400)
    pts = [(lm.x * w, lm.y * h) for lm in landmarks]
    return JsonResponse({"landmarks": pts})

def get_processed_image(request, image_id):
    # This view handles UUIDs correctly
    entry = get_object_or_404(ProcessedImage, id=image_id)
    
    # Return the original image data (or redirect to the url)
    # Redirecting is better:
    return HttpResponse(status=302, headers={'Location': entry.original_image.url})

def get_data_for_analysis(image_id):
    try:
        entry = get_object_or_404(ProcessedImage, id=image_id)
    except ProcessedImage.DoesNotExist:
        return None, None, None
    
    # Read Image
    try:
        file_bytes = entry.original_image.read()
        nparr = np.frombuffer(file_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    except Exception:
        # print(f"Error reading image: {e}")
        return None, None, None
    
    # Get Landmarks (using your existing detect_landmarks or recalculating)
    # We assume standard mediapipe mesh here for consistency with logic
    import mediapipe as mp
    mp_face_mesh = mp.solutions.face_mesh
    with mp_face_mesh.FaceMesh(static_image_mode=True, refine_landmarks=True, max_num_faces=1) as fm:
        results = fm.process(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
        
    if not results.multi_face_landmarks:
        return None, None, None
    
    h, w, _ = img.shape
    landmarks = [(int(l.x * w), int(l.y * h)) for l in results.multi_face_landmarks[0].landmark]

    # Get Landmarks 
    landmarks_raw, w, h = detect_landmarks(img)

    if not landmarks_raw:
        return entry, img, None

    # Convert normalized landmarks to pixel coordinates
    landmarks = [(int(l.x * w), int(l.y * h)) for l in landmarks_raw]
    
    return entry, img, landmarks

# --- API VIEWS ---

class GoldenRatioJSON(APIView):
    def get(self, request, ids):
        entry, img, landmarks = get_data_for_analysis(ids)
        if img is None or landmarks is None: 
            return JsonResponse({'error': 'No face detected or image found'}, status=400)

        processed_img, ratios, avg = analysis_logic.calculate_golden_ratio_data(img.copy(), landmarks)
        
        # Save Result
        _, buf = cv2.imencode('.jpg', processed_img)
        file_path = default_storage.save(f"processed/gr_{ids}.jpg", ContentFile(buf.tobytes()))
        # Convert to full URL
        output_url = request.build_absolute_uri(default_storage.url(file_path))

        return Response([
            ratios,
            [{"average": f"{avg:.3f}"}],
            [{"output_image": output_url}] 
        ])

class InputAsReferenceJSON(APIView):
    def get(self, request, ids):
        entry, img, landmarks = get_data_for_analysis(ids)
        if img is None or landmarks is None: 
            return JsonResponse({'error': 'No face detected'}, status=400)

        processed_img, ratios, avg = analysis_logic.calculate_input_as_reference(img.copy(), landmarks)
        
        _, buf = cv2.imencode('.jpg', processed_img)
        file_path = default_storage.save(f"processed/inpt_{ids}.jpg", ContentFile(buf.tobytes()))
        output_url = request.scheme + "://" + request.get_host() + default_storage.url(file_path)
        
        return Response([
            ratios,
            [{"average1": f"{avg:.3f}"}],
            [{"output_image": output_url}]
        ])

class PhiMatrixJSON(APIView):
    def get(self, request, ids):
        entry, img, landmarks = get_data_for_analysis(ids)
        if img is None or landmarks is None: 
            return JsonResponse({'error': 'No face detected'}, status=400)

        processed_img, ratios, avg = analysis_logic.calculate_phi_matrix(img.copy(), landmarks)
        
        _, buf = cv2.imencode('.jpg', processed_img)
        file_path = default_storage.save(f"processed/phi_{ids}.jpg", ContentFile(buf.tobytes()))
        output_url = request.scheme + "://" + request.get_host() + default_storage.url(file_path)
        
        return Response([
            ratios,
            [{"average2": f"{avg:.3f}"}],
            [{"output_image": output_url}]
        ])

class SymmetryJSON(APIView):
    def get(self, request, ids):
        entry, img, landmarks = get_data_for_analysis(ids)
        if img is None or landmarks is None: 
            return JsonResponse({'error': 'No face detected'}, status=400)

        img1, img2, img3, ratios = analysis_logic.calculate_symmetry(img.copy(), landmarks)
        
        def save_and_get_url(im, suffix):
            _, buf = cv2.imencode('.jpg', im)
            path = default_storage.save(f"processed/sym_{suffix}_{ids}.jpg", ContentFile(buf.tobytes()))
            # return request.scheme + "://" + request.get_host() + default_storage.url(path)
            return request.build_absolute_uri(default_storage.url(path))

        url1 = save_and_get_url(img1, "prop")
        url2 = save_and_get_url(img2, "uni")
        url3 = save_and_get_url(img3, "line")

        return Response([
            ratios,
            [{"output_image": url1}],
            [{"output_image1": url2}],
            [{"output_image2": url3}]
        ])

@csrf_exempt
def upload_image(request):
    if request.method == 'POST' and request.FILES.get('image'):
        try:
            image_file = request.FILES['image']
            
            # 1. Read and decode the image
            file_bytes = np.asarray(bytearray(image_file.read()), dtype=np.uint8)
            img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

            # 2a. Get Landmarks
            landmarks_raw, w, h = detect_landmarks(img)
            if landmarks_raw is None:
                return JsonResponse({'error': 'No face detected'}, status=400)
            
            # pts = [(lm.x * w, lm.y * h) for lm in landmarks]
            # shrink, bulge, asym_mask = make_shrink_and_bulge_maps(img, pts)

            # Convert landmarks to pixel coordinates for processing
            landmarks_pixels = [(int(l.x * w), int(l.y * h)) for l in landmarks_raw]

            # Call our new logic from analysis_logic
            shrink_img_cv, bulge_img_cv = analysis_logic.generate_shrink_bulge_maps(img, landmarks_pixels)
            
            # 3. Create Unique ID
            file_id = str(uuid.uuid4())

            # 4a. Get User
            user_id = request.POST.get('user')
            current_user = None
            if user_id:
                try:
                    # Handle "User:1" format if passing from GraphQL Relay
                    if ":" in str(user_id):
                        import base64
                        decoded = base64.b64decode(user_id).decode('utf-8') 
                        user_id = decoded.split(':')[1]
                    current_user = User.objects.get(id=user_id)
                except Exception:
                    pass # Continue without user if not found

            # 5. Save Images to Storage
            def save_cv2(cv_img, prefix):
                _, buf = cv2.imencode('.jpg', cv_img)
                content = ContentFile(buf.tobytes())
                # Saves to media/processed/prefix_uuid.jpg
                return default_storage.save(f"processed/{prefix}_{file_id}.jpg", content)

            shrink_path = save_cv2(shrink_img_cv, "shrink")
            bulge_path = save_cv2(bulge_img_cv, "bulge")

            # 6. Save to ProcessedImage Model (The CORRECT Model)
            # Reset original file pointer
            image_file.seek(0)
            processed_entry = ProcessedImage(
                id=file_id,
                user=current_user, # Link the user!
                shrink_image=shrink_path,
                bulge_image=bulge_path,
            )
            
            # Save the images using the model fields (This handles storage automatically)
            processed_entry.original_image.save(f"original_{file_id}.jpg", image_file)
            
            # Commit to DB
            processed_entry.save()

            # 7. Construct URLs
            origin = f"{request.scheme}://{request.get_host()}"
            media_url = settings.MEDIA_URL # usually '/media/'

            # We explicitly build: http://localhost:8000 + /media/ + processed/file.jpg
            # We strip any leading slashes from the path to avoid double slashes //
            
            def build_url(path):
                if not path: return ""
                clean_path = path.lstrip('/') 
                return f"{origin}{media_url}{clean_path}"
            
            return JsonResponse({
                "status": "success",
                "id": processed_entry.id,
                "original_url": build_url(processed_entry.original_image.name),
                "shrink_url": build_url(shrink_path),
                "bulge_url": build_url(bulge_path),
            })

        except Exception as e:
            print("Error:", e)
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request'}, status=400)

class GeneratePDF(APIView):
    def get(self, request, image_id):
        try:
            # 1. Get Data
            entry, img, landmarks = get_data_for_analysis(image_id)
            if img is None:
                return JsonResponse({'error': 'Image not found'}, status=404)

            # 2. Re-run Calculations to get scores
            # (We run them here to ensure the PDF is always up to date)
            _, _, avg_gr = analysis_logic.calculate_golden_ratio_data(img.copy(), landmarks)
            _, _, avg_input = analysis_logic.calculate_input_as_reference(img.copy(), landmarks)
            _, _, avg_phi = analysis_logic.calculate_phi_matrix(img.copy(), landmarks)

            # 3. Create PDF Buffer
            buffer = io.BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=A4)
            elements = []
            styles = getSampleStyleSheet()

            # --- HEADER ---
            elements.append(Paragraph("Aureus Lens Report", styles['Title']))
            elements.append(Paragraph("by Vividobots", styles['Heading3']))
            elements.append(Spacer(1, 0.5 * inch))

            # --- SCORES TABLE ---
            data = [
                ['Analysis Method', 'Score (%)'],
                ['Golden Ratio', f"{avg_gr:.3f}%"],
                ['Input as Reference', f"{avg_input:.3f}%"],
                ['Phi Matrix', f"{avg_phi:.3f}%"],
            ]

            t = Table(data, colWidths=[3*inch, 2*inch])
            t.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ]))
            elements.append(t)
            elements.append(Spacer(1, 0.5 * inch))

            # --- IMAGE (Optional) ---
            # Save current opencv image to temp buffer to put in PDF

            # img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            # _, img_encoded = cv2.imencode('.jpg', img_rgb)

            _, img_encoded = cv2.imencode('.jpg', img)
            img_bytes = io.BytesIO(img_encoded.tobytes())
            
            # Limit image height to avoid page overflow
            elements.append(RLImage(img_bytes, width=4*inch, height=5*inch, kind='proportional'))

            # --- BUILD ---
            doc.build(elements)
            buffer.seek(0)
            
            # Return PDF File
            return HttpResponse(buffer, content_type='application/pdf')

        except Exception as e:
            print("PDF Error:", e)
            return JsonResponse({'error': str(e)}, status=500)

# Placeholder for PDFs
def placeholder_pdf(request, ids):
    return HttpResponse("PDF Download Not Configured Yet", content_type="text/plain")

# Main interactive viewer

def run_interactive_view(img):
    landmarks, w, h = detect_landmarks(img)
    if landmarks is None:
        print("❌ No face detected.")
        return

    pts = [(lm.x * w, lm.y * h) for lm in landmarks]
    shrink, bulge, asym_mask, src_pts, shrink_pts, bulge_pts = make_shrink_and_bulge_maps(img, pts)
    overlay = blend_overlay_maps(img, shrink, bulge)

    # build warped grid for the blended morph (use shrink_pts as representative destination)
    # warp the overlay itself using shrink_pts -> blended warp (we also compute warped grid for better visual)
    warped_morph, warped_grid = warp_from_landmarks_with_grid(img, src_pts, shrink_pts)
    
    realistic_shrink = apply_region_weighted_deformation(img, pts, mode="shrink", strength=0.20)
    realistic_bulge = apply_region_weighted_deformation(img, pts, mode="bulge", strength=0.20)

    # windows
    cv2.namedWindow("Original", cv2.WINDOW_NORMAL)
    cv2.namedWindow("Shrink Map", cv2.WINDOW_NORMAL)
    cv2.namedWindow("Bulge Map", cv2.WINDOW_NORMAL)
    cv2.namedWindow("Asymmetry Mask", cv2.WINDOW_NORMAL)
    cv2.namedWindow("Overlay Blended (Geometric Morph)", cv2.WINDOW_NORMAL)
    cv2.namedWindow("Morph Visualization (Grid Toggle)", cv2.WINDOW_NORMAL)

    cv2.imshow("Original", img)
    cv2.imshow("Shrink Map", shrink)
    cv2.imshow("Bulge Map", bulge)
    cv2.imshow("Asymmetry Mask", asym_mask)
    cv2.imshow("Overlay Blended (Geometric Morph)", overlay)
    cv2.imshow("Realistic Shrink", realistic_shrink)
    cv2.imshow("Realistic Bulge", realistic_bulge)

    show_grid = True
    print("🔄 Morph viewer controls: 'G' toggle grid | 'ESC' or 'Q' to quit")

    while True:
        # display morph with/without warped grid
        if show_grid:
            cv2.imshow("Morph Visualization (Grid Toggle)", warped_grid)
        else:
            cv2.imshow("Morph Visualization (Grid Toggle)", warped_morph)

        key = cv2.waitKey(50) & 0xFF
        if key in [27, ord('q')]:
            break
        elif key in [ord('g'), ord('G')]:
            show_grid = not show_grid 

    cv2.destroyAllWindows()

